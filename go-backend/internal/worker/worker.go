package worker

import (
	"context"
	"log"
	"sync"
	"time"

	"go-backend/internal/database"
)

// Worker interface for all background workers
type Worker interface {
	Name() string
	Start(ctx context.Context)
}

// Manager manages all background workers
type Manager struct {
	db      *database.DB
	workers []Worker
	wg      sync.WaitGroup
	cancel  context.CancelFunc
	ctx     context.Context
}

// NewManager creates a new worker manager
func NewManager(db *database.DB) *Manager {
	ctx, cancel := context.WithCancel(context.Background())
	return &Manager{
		db:      db,
		workers: make([]Worker, 0),
		cancel:  cancel,
		ctx:     ctx,
	}
}

// Register adds a worker to the manager
func (m *Manager) Register(w Worker) {
	m.workers = append(m.workers, w)
}

// Start starts all registered workers
func (m *Manager) Start() {
	for _, w := range m.workers {
		m.wg.Add(1)
		go func(worker Worker) {
			defer m.wg.Done()
			log.Printf("[WorkerManager] Starting worker: %s", worker.Name())
			worker.Start(m.ctx)
			log.Printf("[WorkerManager] Worker stopped: %s", worker.Name())
		}(w)
	}
	log.Printf("[WorkerManager] Started %d workers", len(m.workers))
}

// Shutdown gracefully stops all workers
func (m *Manager) Shutdown(timeout time.Duration) error {
	log.Println("[WorkerManager] Initiating shutdown...")

	// Signal all workers to stop
	m.cancel()

	// Wait with timeout
	done := make(chan struct{})
	go func() {
		m.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		log.Println("[WorkerManager] All workers stopped gracefully")
		return nil
	case <-time.After(timeout):
		log.Println("[WorkerManager] Shutdown timed out, some workers may not have stopped")
		return context.DeadlineExceeded
	}
}
