package models

import "time"

type Booking struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id"`
	PropertyID int       `json:"property_id"`
	StartDate  string    `json:"start_date"`
	EndDate    string    `json:"end_date"`
	Guests     int       `json:"guests"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}
