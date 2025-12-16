package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"go-backend/internal/database"
	"go-backend/internal/models"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

type Server struct {
	mux *http.ServeMux
	db  *database.DB
}

func NewServer(db *database.DB) *Server {
	s := &Server{
		mux: http.NewServeMux(),
		db:  db,
	}
	s.registerRoutes()
	return s
}

func (s *Server) Router() http.Handler {
	return withCORS(s.mux)
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

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
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
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	var user models.User
	err := s.db.Pool.QueryRow(r.Context(),
		`SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1`,
		body.Email,
	).Scan(&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.CreatedAt)

	if err == pgx.ErrNoRows {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(body.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	// TODO: implement proper JWT token generation
	writeJSON(w, http.StatusOK, map[string]any{
		"token": "demo-token",
		"user":  user,
	})
}

func (s *Server) handleProperties(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	location := strings.ToLower(r.URL.Query().Get("location"))
	propType := r.URL.Query().Get("type")

	query := `SELECT id, title, location, price_per_night, rating, reviews,
	          guests, bedrooms, bathrooms, type, amenities, COALESCE(image, ''), owner_id, created_at
	          FROM properties WHERE 1=1`
	args := []any{}
	argNum := 1

	if location != "" {
		query += ` AND LOWER(location) LIKE $` + strconv.Itoa(argNum)
		args = append(args, "%"+location+"%")
		argNum++
	}
	if propType != "" {
		query += ` AND type = $` + strconv.Itoa(argNum)
		args = append(args, propType)
		argNum++
	}

	query += ` ORDER BY created_at DESC`

	rows, err := s.db.Pool.Query(r.Context(), query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}
	defer rows.Close()

	properties := []models.Property{}
	for rows.Next() {
		var p models.Property
		err := rows.Scan(&p.ID, &p.Title, &p.Location, &p.PricePerNight, &p.Rating,
			&p.Reviews, &p.Guests, &p.Bedrooms, &p.Bathrooms, &p.Type,
			&p.Amenities, &p.Image, &p.OwnerID, &p.CreatedAt)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "scan error")
			return
		}
		properties = append(properties, p)
	}

	writeJSON(w, http.StatusOK, properties)
}

func (s *Server) handlePropertyByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	id, ok := parseIDFromPath(r.URL.Path)
	if !ok {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	var p models.Property
	err := s.db.Pool.QueryRow(r.Context(),
		`SELECT id, title, location, price_per_night, rating, reviews,
		 guests, bedrooms, bathrooms, type, amenities, COALESCE(image, ''), owner_id, created_at
		 FROM properties WHERE id = $1`, id,
	).Scan(&p.ID, &p.Title, &p.Location, &p.PricePerNight, &p.Rating,
		&p.Reviews, &p.Guests, &p.Bedrooms, &p.Bathrooms, &p.Type,
		&p.Amenities, &p.Image, &p.OwnerID, &p.CreatedAt)

	if err == pgx.ErrNoRows {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	writeJSON(w, http.StatusOK, p)
}

func (s *Server) handleFavourites(w http.ResponseWriter, r *http.Request) {
	userID := 1 // TODO: get from JWT token

	switch r.Method {
	case http.MethodGet:
		rows, err := s.db.Pool.Query(r.Context(),
			`SELECT p.id, p.title, p.location, p.price_per_night, p.rating, p.reviews,
			 p.guests, p.bedrooms, p.bathrooms, p.type, p.amenities, COALESCE(p.image, ''), p.owner_id, p.created_at
			 FROM properties p
			 INNER JOIN favourites f ON f.property_id = p.id
			 WHERE f.user_id = $1
			 ORDER BY f.created_at DESC`, userID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}
		defer rows.Close()

		properties := []models.Property{}
		for rows.Next() {
			var p models.Property
			err := rows.Scan(&p.ID, &p.Title, &p.Location, &p.PricePerNight, &p.Rating,
				&p.Reviews, &p.Guests, &p.Bedrooms, &p.Bathrooms, &p.Type,
				&p.Amenities, &p.Image, &p.OwnerID, &p.CreatedAt)
			if err != nil {
				writeError(w, http.StatusInternalServerError, "scan error")
				return
			}
			properties = append(properties, p)
		}
		writeJSON(w, http.StatusOK, properties)

	case http.MethodPost:
		type req struct {
			PropertyID int `json:"property_id"`
		}
		var body req
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}

		// Check if already favourite
		var exists bool
		err := s.db.Pool.QueryRow(r.Context(),
			`SELECT EXISTS(SELECT 1 FROM favourites WHERE user_id = $1 AND property_id = $2)`,
			userID, body.PropertyID,
		).Scan(&exists)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		if exists {
			// Remove from favourites
			_, err = s.db.Pool.Exec(r.Context(),
				`DELETE FROM favourites WHERE user_id = $1 AND property_id = $2`,
				userID, body.PropertyID)
			if err != nil {
				writeError(w, http.StatusInternalServerError, "database error")
				return
			}
			writeJSON(w, http.StatusOK, map[string]bool{"favourite": false})
		} else {
			// Add to favourites
			_, err = s.db.Pool.Exec(r.Context(),
				`INSERT INTO favourites (user_id, property_id) VALUES ($1, $2)`,
				userID, body.PropertyID)
			if err != nil {
				writeError(w, http.StatusInternalServerError, "database error")
				return
			}
			writeJSON(w, http.StatusOK, map[string]bool{"favourite": true})
		}

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *Server) handleBookings(w http.ResponseWriter, r *http.Request) {
	userID := 1 // TODO: get from JWT token

	switch r.Method {
	case http.MethodGet:
		rows, err := s.db.Pool.Query(r.Context(),
			`SELECT id, user_id, property_id, start_date, end_date, guests, status, created_at
			 FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`, userID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}
		defer rows.Close()

		bookings := []models.Booking{}
		for rows.Next() {
			var b models.Booking
			err := rows.Scan(&b.ID, &b.UserID, &b.PropertyID, &b.StartDate, &b.EndDate,
				&b.Guests, &b.Status, &b.CreatedAt)
			if err != nil {
				writeError(w, http.StatusInternalServerError, "scan error")
				return
			}
			bookings = append(bookings, b)
		}
		writeJSON(w, http.StatusOK, bookings)

	case http.MethodPost:
		type req struct {
			PropertyID int    `json:"property_id"`
			StartDate  string `json:"start_date"`
			EndDate    string `json:"end_date"`
			Guests     int    `json:"guests"`
		}
		var body req
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}

		var b models.Booking
		err := s.db.Pool.QueryRow(r.Context(),
			`INSERT INTO bookings (user_id, property_id, start_date, end_date, guests, status)
			 VALUES ($1, $2, $3, $4, $5, 'confirmed')
			 RETURNING id, user_id, property_id, start_date, end_date, guests, status, created_at`,
			userID, body.PropertyID, body.StartDate, body.EndDate, body.Guests,
		).Scan(&b.ID, &b.UserID, &b.PropertyID, &b.StartDate, &b.EndDate,
			&b.Guests, &b.Status, &b.CreatedAt)

		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

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

	userID := 1 // TODO: get from JWT token

	type convoSummary struct {
		ID          int    `json:"id"`
		ContactName string `json:"contact_name"`
		ContactType string `json:"contact_type"`
		Property    string `json:"property_name"`
		LastMessage string `json:"last_message"`
	}

	rows, err := s.db.Pool.Query(r.Context(),
		`SELECT c.id, c.contact_name, c.contact_type, COALESCE(c.property_name, ''),
		 COALESCE((SELECT text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1), '')
		 FROM conversations c WHERE c.user_id = $1 ORDER BY c.created_at DESC`, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}
	defer rows.Close()

	conversations := []convoSummary{}
	for rows.Next() {
		var c convoSummary
		err := rows.Scan(&c.ID, &c.ContactName, &c.ContactType, &c.Property, &c.LastMessage)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "scan error")
			return
		}
		conversations = append(conversations, c)
	}

	writeJSON(w, http.StatusOK, conversations)
}

func (s *Server) handleMessages(w http.ResponseWriter, r *http.Request) {
	userID := 1 // TODO: get from JWT token

	switch r.Method {
	case http.MethodGet:
		cidStr := r.URL.Query().Get("conversationId")
		cid, err := strconv.Atoi(cidStr)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid conversationId")
			return
		}

		// Verify conversation belongs to user
		var ownerID int
		err = s.db.Pool.QueryRow(r.Context(),
			`SELECT user_id FROM conversations WHERE id = $1`, cid,
		).Scan(&ownerID)
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "conversation not found")
			return
		}
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}
		if ownerID != userID {
			writeError(w, http.StatusForbidden, "access denied")
			return
		}

		rows, err := s.db.Pool.Query(r.Context(),
			`SELECT id, conversation_id, sender_id, text, created_at, read
			 FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`, cid)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}
		defer rows.Close()

		messages := []models.Message{}
		for rows.Next() {
			var m models.Message
			var senderID *int
			err := rows.Scan(&m.ID, &m.ConversationID, &senderID, &m.Text, &m.CreatedAt, &m.Read)
			if err != nil {
				writeError(w, http.StatusInternalServerError, "scan error")
				return
			}
			if senderID != nil {
				m.SenderID = *senderID
			}
			messages = append(messages, m)
		}
		writeJSON(w, http.StatusOK, messages)

	case http.MethodPost:
		type req struct {
			ConversationID int    `json:"conversation_id"`
			Text           string `json:"text"`
		}
		var body req
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}

		// Verify conversation belongs to user
		var ownerID int
		err := s.db.Pool.QueryRow(r.Context(),
			`SELECT user_id FROM conversations WHERE id = $1`, body.ConversationID,
		).Scan(&ownerID)
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "conversation not found")
			return
		}
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}
		if ownerID != userID {
			writeError(w, http.StatusForbidden, "access denied")
			return
		}

		var m models.Message
		err = s.db.Pool.QueryRow(r.Context(),
			`INSERT INTO messages (conversation_id, sender_id, text, read)
			 VALUES ($1, $2, $3, true)
			 RETURNING id, conversation_id, sender_id, text, created_at, read`,
			body.ConversationID, userID, body.Text,
		).Scan(&m.ID, &m.ConversationID, &m.SenderID, &m.Text, &m.CreatedAt, &m.Read)

		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		writeJSON(w, http.StatusCreated, m)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// Helper function for context (can be used later for request-scoped values)
func contextWithUserID(ctx context.Context, userID int) context.Context {
	return context.WithValue(ctx, "userID", userID)
}
