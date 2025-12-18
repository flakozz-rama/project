package worker

import (
	"context"
	"log"
	"time"

	"go-backend/internal/database"
)

// BookingChecker checks for expired pending bookings and updates their status
type BookingChecker struct {
	db       *database.DB
	interval time.Duration

	// Channel for manual trigger (useful for testing)
	triggerCh chan struct{}

	// Channel for results (for monitoring)
	resultsCh chan BookingCheckResult
}

// BookingCheckResult contains the result of a booking check cycle
type BookingCheckResult struct {
	ExpiredCount int
	Error        error
	Timestamp    time.Time
}

// NewBookingChecker creates a new booking checker worker
func NewBookingChecker(db *database.DB, interval time.Duration) *BookingChecker {
	return &BookingChecker{
		db:        db,
		interval:  interval,
		triggerCh: make(chan struct{}, 1),
		resultsCh: make(chan BookingCheckResult, 10),
	}
}

// Name returns the worker name
func (bc *BookingChecker) Name() string {
	return "BookingChecker"
}

// TriggerCheck allows manual triggering of a check
func (bc *BookingChecker) TriggerCheck() {
	select {
	case bc.triggerCh <- struct{}{}:
	default:
		// Channel full, check already pending
	}
}

// Results returns the results channel for monitoring
func (bc *BookingChecker) Results() <-chan BookingCheckResult {
	return bc.resultsCh
}

// Start begins the booking checker loop
func (bc *BookingChecker) Start(ctx context.Context) {
	ticker := time.NewTicker(bc.interval)
	defer ticker.Stop()

	// Run immediately on start
	bc.checkExpiredBookings(ctx)

	for {
		select {
		case <-ctx.Done():
			log.Printf("[%s] Context cancelled, stopping", bc.Name())
			return

		case <-ticker.C:
			bc.checkExpiredBookings(ctx)

		case <-bc.triggerCh:
			log.Printf("[%s] Manual trigger received", bc.Name())
			bc.checkExpiredBookings(ctx)
		}
	}
}

// checkExpiredBookings marks pending bookings as expired if their start date has passed
func (bc *BookingChecker) checkExpiredBookings(ctx context.Context) {
	result := BookingCheckResult{
		Timestamp: time.Now(),
	}

	// Use context with timeout for the database query
	queryCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Update pending bookings where start_date has passed
	// A booking is considered expired if:
	// 1. Status is 'pending'
	// 2. Start date has passed (booking wasn't confirmed in time)
	query := `
		UPDATE bookings
		SET status = 'expired'
		WHERE status = 'pending'
		  AND start_date < CURRENT_DATE
		RETURNING id
	`

	rows, err := bc.db.Pool.Query(queryCtx, query)
	if err != nil {
		log.Printf("[%s] Error checking expired bookings: %v", bc.Name(), err)
		result.Error = err
		bc.sendResult(result)
		return
	}
	defer rows.Close()

	expiredIDs := make([]int, 0)
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			log.Printf("[%s] Error scanning row: %v", bc.Name(), err)
			continue
		}
		expiredIDs = append(expiredIDs, id)
	}

	if err := rows.Err(); err != nil {
		log.Printf("[%s] Error iterating rows: %v", bc.Name(), err)
		result.Error = err
	}

	result.ExpiredCount = len(expiredIDs)

	if result.ExpiredCount > 0 {
		log.Printf("[%s] Marked %d bookings as expired: %v", bc.Name(), result.ExpiredCount, expiredIDs)
	} else {
		log.Printf("[%s] No expired bookings found", bc.Name())
	}

	bc.sendResult(result)
}

// sendResult sends a result to the results channel (non-blocking)
func (bc *BookingChecker) sendResult(result BookingCheckResult) {
	select {
	case bc.resultsCh <- result:
	default:
		// Channel full, discard old result
	}
}
