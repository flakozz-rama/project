package models

import "time"

type Message struct {
	ID             int       `json:"id"`
	ConversationID int       `json:"conversation_id"`
	SenderID       int       `json:"sender_id"`
	Text           string    `json:"text"`
	CreatedAt      time.Time `json:"created_at"`
	Read           bool      `json:"read"`
}

type Conversation struct {
	ID          int       `json:"id"`
	ContactName string    `json:"contact_name"`
	ContactType string    `json:"contact_type"` // host | guest | support
	Property    string    `json:"property_name"`
	Messages    []Message `json:"messages"`
}
