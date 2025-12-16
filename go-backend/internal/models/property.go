package models

import "time"

type Property struct {
	ID            int       `json:"id"`
	Title         string    `json:"title"`
	Location      string    `json:"location"`
	PricePerNight float64   `json:"price"`
	Rating        float64   `json:"rating"`
	Reviews       int       `json:"reviews"`
	Guests        int       `json:"guests"`
	Bedrooms      int       `json:"bedrooms"`
	Bathrooms     int       `json:"bathrooms"`
	Type          string    `json:"type"`
	Amenities     []string  `json:"amenities"`
	Image         string    `json:"image"`
	OwnerID       *int      `json:"owner_id,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}
