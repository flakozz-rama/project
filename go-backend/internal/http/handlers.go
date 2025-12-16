package httpapi

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"go-backend/internal/models"
)

type Server struct {
	mux           *http.ServeMux
	users         []models.User
	properties    []models.Property
	favourites    map[int][]int
	bookings      []models.Booking
	conversations []models.Conversation
}

func NewServer() *Server {
	s := &Server{
		mux:        http.NewServeMux(),
		favourites: make(map[int][]int),
	}
	s.seedData()
	s.registerRoutes()
	return s
}

func (s *Server) Router() http.Handler {
	return withCORS(s.mux)
}

// -------- seed data --------

func (s *Server) seedData() {
	s.users = []models.User{
		{ID: 1, Email: "demo@gorent.com", Name: "Demo User"},
	}

	s.properties = []models.Property{
		{
			ID:            1,
			Title:         "Modern Downtown Apartment",
			Location:      "San Francisco, CA",
			PricePerNight: 180,
			Rating:        4.8,
			Reviews:       124,
			Guests:        4,
			Bedrooms:      2,
			Bathrooms:     2,
			Type:          "apartment",
			Amenities:     []string{"wifi", "parking", "ac", "kitchen"},
			Image:         "https://images.unsplash.com/photo-1594873604892-b599f847e859",
		},
		{
			ID:            2,
			Title:         "Luxury Villa with Ocean View",
			Location:      "Miami Beach, FL",
			PricePerNight: 450,
			Rating:        4.9,
			Reviews:       89,
			Guests:        8,
			Bedrooms:      4,
			Bathrooms:     3,
			Type:          "villa",
			Amenities:     []string{"wifi", "pool", "ac", "kitchen", "gym"},
			Image:         "https://images.unsplash.com/photo-1706808849780-7a04fbac83ef",
		},
	}

	s.favourites[1] = []int{1}

	s.bookings = []models.Booking{
		{
			ID:         1,
			UserID:     1,
			PropertyID: 1,
			StartDate:  "2025-01-10",
			EndDate:    "2025-01-15",
			Guests:     2,
			Status:     "confirmed",
			CreatedAt:  time.Now().AddDate(0, -1, 0),
		},
	}

	s.conversations = []models.Conversation{
		{
			ID:          1,
			ContactName: "Sarah Johnson",
			ContactType: "host",
			Property:    "Modern Downtown Apartment",
			Messages: []models.Message{
				{
					ID:             1,
					ConversationID: 1,
					SenderID:       2,
					Text:           "Hi! I have a booking at your property next week. Just wanted to confirm the check-in time.",
					CreatedAt:      time.Now().Add(-2 * time.Hour),
					Read:           true,
				},
				{
					ID:             2,
					ConversationID: 1,
					SenderID:       1,
					Text:           "Check-in is from 3 PM to 8 PM. I'll send you the door code a day before arrival.",
					CreatedAt:      time.Now().Add(-90 * time.Minute),
					Read:           true,
				},
			},
		},
	}
}


func (s *Server) registerRoutes() {
	s.mux.HandleFunc("/api/health", s.handleHealth)
	s.mux.HandleFunc("/api/auth/signin", s.handleSignIn)
	s.mux.HandleFunc("/api/properties", s.handleProperties)
	s.mux.HandleFunc("/api/properties/", s.handlePropertyByID)
	s.mux.HandleFunc("/api/favourites", s.handleFavourites)
	s.mux.HandleFunc("/api/bookings", s.handleBookings)
	s.mux.HandleFunc("/api/conversations", s.handleConversations)
	s.mux.HandleFunc("/api/messages", s.handleMessages)
}


func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func parseIDFromPath(path string) (int, bool) {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) < 3 {
		return 0, false
	}
	id, err := strconv.Atoi(parts[2])
	if err != nil {
		return 0, false
	}
	return id, true
}

// -------- handlers --------

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleSignIn(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	type req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var body req
	_ = json.NewDecoder(r.Body).Decode(&body)

	writeJSON(w, http.StatusOK, map[string]any{
		"token": "demo-token",
		"user":  s.users[0],
	})
}

func (s *Server) handleProperties(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	location := strings.ToLower(r.URL.Query().Get("location"))
	propType := r.URL.Query().Get("type")

	res := make([]models.Property, 0, len(s.properties))
	for _, p := range s.properties {
		if location != "" && !strings.Contains(strings.ToLower(p.Location), location) {
			continue
		}
		if propType != "" && p.Type != propType {
			continue
		}
		res = append(res, p)
	}
	writeJSON(w, http.StatusOK, res)
}

func (s *Server) handlePropertyByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	id, ok := parseIDFromPath(r.URL.Path)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}
	for _, p := range s.properties {
		if p.ID == id {
			writeJSON(w, http.StatusOK, p)
			return
		}
	}
	writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
}

func (s *Server) handleFavourites(w http.ResponseWriter, r *http.Request) {
	userID := 1 // пока всегда демо‑пользователь

	switch r.Method {
	case http.MethodGet:
		ids := s.favourites[userID]
		res := make([]models.Property, 0, len(ids))
		for _, id := range ids {
			for _, p := range s.properties {
				if p.ID == id {
					res = append(res, p)
				}
			}
		}
				writeJSON(w, http.StatusOK, res)

	case http.MethodPost:
		// toggle избранного
		type req struct {
			PropertyID int `json:"property_id"`
		}
		var body req
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
			return
		}

		ids := s.favourites[userID]
		for i, pid := range ids {
			if pid == body.PropertyID {
				// удалить из избранного
				s.favourites[userID] = append(ids[:i], ids[i+1:]...)
				writeJSON(w, http.StatusOK, map[string]bool{"favourite": false})
				return
			}
		}

		s.favourites[userID] = append(ids, body.PropertyID)
		writeJSON(w, http.StatusOK, map[string]bool{"favourite": true})

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *Server) handleBookings(w http.ResponseWriter, r *http.Request) {
	userID := 1 // демо‑пользователь

	switch r.Method {
	case http.MethodGet:
		res := make([]models.Booking, 0)
		for _, b := range s.bookings {
			if b.UserID == userID {
				res = append(res, b)
			}
		}
		writeJSON(w, http.StatusOK, res)

	case http.MethodPost:
		type req struct {
			PropertyID int    `json:"property_id"`
			StartDate  string `json:"start_date"`
			EndDate    string `json:"end_date"`
			Guests     int    `json:"guests"`
		}
		var body req
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
			return
		}

		id := rand.Intn(1_000_000)
		b := models.Booking{
			ID:         id,
			UserID:     userID,
			PropertyID: body.PropertyID,
			StartDate:  body.StartDate,
			EndDate:    body.EndDate,
			Guests:     body.Guests,
			Status:     "confirmed",
			CreatedAt:  time.Now(),
		}
		s.bookings = append(s.bookings, b)
		writeJSON(w, http.StatusCreated, b)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *Server) handleConversations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	// возвращаем список диалогов без вложенных сообщений (для списка)
	type convoSummary struct {
		ID          int    `json:"id"`
		ContactName string `json:"contact_name"`
		ContactType string `json:"contact_type"`
		Property    string `json:"property_name"`
		LastMessage string `json:"last_message"`
	}
	res := make([]convoSummary, 0, len(s.conversations))
	for _, c := range s.conversations {
		last := ""
		if len(c.Messages) > 0 {
			last = c.Messages[len(c.Messages)-1].Text
		}
		res = append(res, convoSummary{
			ID:          c.ID,
			ContactName: c.ContactName,
			ContactType: c.ContactType,
			Property:    c.Property,
			LastMessage: last,
		})
	}
	writeJSON(w, http.StatusOK, res)
}

func (s *Server) handleMessages(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// /api/messages?conversationId=1
		cidStr := r.URL.Query().Get("conversationId")
		cid, err := strconv.Atoi(cidStr)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid conversationId"})
			return
		}
		for _, c := range s.conversations {
			if c.ID == cid {
				writeJSON(w, http.StatusOK, c.Messages)
				return
			}
		}
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "conversation not found"})

	case http.MethodPost:
		// добавить сообщение в диалог
		type req struct {
			ConversationID int    `json:"conversation_id"`
			Text           string `json:"text"`
		}
		var body req
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
			return
		}

		for i, c := range s.conversations {
			if c.ID == body.ConversationID {
				id := rand.Intn(1_000_000)
				msg := models.Message{
					ID:             id,
					ConversationID: c.ID,
					SenderID:       1, // текущий пользователь (демо)
					Text:           body.Text,
					CreatedAt:      time.Now(),
					Read:           true,
				}
				s.conversations[i].Messages = append(s.conversations[i].Messages, msg)
				writeJSON(w, http.StatusCreated, msg)
				return
			}
		}
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "conversation not found"})

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

