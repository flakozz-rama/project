package httpapi

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"go-backend/internal/auth"
	"go-backend/internal/database"
	"go-backend/internal/models"

	"github.com/jackc/pgx/v5"
)

type Server struct {
	mux            *http.ServeMux
	db             *database.DB
	authService    *auth.Service
	authMiddleware *auth.Middleware
}

func NewServer(db *database.DB, authService *auth.Service) *Server {
	s := &Server{
		mux:            http.NewServeMux(),
		db:             db,
		authService:    authService,
		authMiddleware: auth.NewMiddleware(authService),
	}
	s.registerRoutes()
	return s
}

func (s *Server) Router() http.Handler {
	return withCORS(s.mux)
}

func (s *Server) registerRoutes() {
	// Public routes
	s.mux.HandleFunc("/api/health", s.handleHealth)
	s.mux.HandleFunc("/api/auth/register", s.handleRegister)
	s.mux.HandleFunc("/api/auth/signin", s.handleSignIn)
	s.mux.HandleFunc("/api/properties", s.handleProperties)
	s.mux.HandleFunc("/api/properties/", s.handlePropertyByID)

	// Protected routes (require authentication)
	s.mux.Handle("/api/favourites", s.authMiddleware.Authenticate(
		http.HandlerFunc(s.handleFavourites)))
	s.mux.Handle("/api/bookings", s.authMiddleware.Authenticate(
		http.HandlerFunc(s.handleBookings)))
	s.mux.Handle("/api/bookings/", s.authMiddleware.Authenticate(
		http.HandlerFunc(s.handleBookingByID)))
	s.mux.Handle("/api/conversations", s.authMiddleware.Authenticate(
		http.HandlerFunc(s.handleConversations)))
	s.mux.Handle("/api/messages", s.authMiddleware.Authenticate(
		http.HandlerFunc(s.handleMessages)))

	// Admin routes
	s.mux.Handle("/api/admin/users", s.authMiddleware.Authenticate(
		s.authMiddleware.RequireRole(auth.RoleAdmin)(
			http.HandlerFunc(s.handleAdminUsers))))
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

// Email validation helper
func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// -------- handlers --------

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	type req struct {
		Email    string `json:"email"`
		Name     string `json:"name"`
		Password string `json:"password"`
	}
	var body req
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	// Validate email format
	if !isValidEmail(body.Email) {
		writeError(w, http.StatusBadRequest, "invalid email format")
		return
	}

	// Validate name
	if len(strings.TrimSpace(body.Name)) < 2 {
		writeError(w, http.StatusBadRequest, "name must be at least 2 characters")
		return
	}

	// Validate password
	if err := auth.ValidatePassword(body.Password); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Check if email already exists
	var exists bool
	err := s.db.Pool.QueryRow(r.Context(),
		`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`,
		body.Email,
	).Scan(&exists)
	if err != nil {
		log.Printf("[Register] Database error checking email: %v", err)
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}
	if exists {
		writeError(w, http.StatusConflict, "email already registered")
		return
	}

	// Hash password
	hash, err := auth.HashPassword(body.Password)
	if err != nil {
		log.Printf("[Register] Error hashing password: %v", err)
		writeError(w, http.StatusInternalServerError, "could not hash password")
		return
	}

	// Insert user with default role "user"
	var user models.User
	err = s.db.Pool.QueryRow(r.Context(),
		`INSERT INTO users (email, name, password_hash, role)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, email, name, role, created_at`,
		body.Email, body.Name, hash, auth.RoleUser,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Role, &user.CreatedAt)

	if err != nil {
		log.Printf("[Register] Error creating user: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create user")
		return
	}

	// Generate token
	token, err := s.authService.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		log.Printf("[Register] Error generating token: %v", err)
		writeError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	log.Printf("[Register] User registered: id=%d, email=%s", user.ID, user.Email)

	writeJSON(w, http.StatusCreated, map[string]any{
		"token": token,
		"user":  user.ToResponse(),
	})
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
		`SELECT id, email, name, password_hash, role, created_at FROM users WHERE email = $1`,
		body.Email,
	).Scan(&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.Role, &user.CreatedAt)

	if err == pgx.ErrNoRows {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err != nil {
		log.Printf("[SignIn] Database error: %v", err)
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	if !auth.CheckPassword(body.Password, user.PasswordHash) {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	// Generate JWT token
	token, err := s.authService.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		log.Printf("[SignIn] Error generating token: %v", err)
		writeError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	log.Printf("[SignIn] User logged in: id=%d, email=%s", user.ID, user.Email)

	writeJSON(w, http.StatusOK, map[string]any{
		"token": token,
		"user":  user.ToResponse(),
	})
}

func (s *Server) handleProperties(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.getProperties(w, r)
	case http.MethodPost:
		s.createProperty(w, r)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *Server) getProperties(w http.ResponseWriter, r *http.Request) {
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
		log.Printf("[Properties] Database error: %v", err)
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
			log.Printf("[Properties] Scan error: %v", err)
			writeError(w, http.StatusInternalServerError, "scan error")
			return
		}
		properties = append(properties, p)
	}

	writeJSON(w, http.StatusOK, properties)
}

func (s *Server) createProperty(w http.ResponseWriter, r *http.Request) {
	// Check if user is authenticated (optional - can create without auth or require it)
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	type req struct {
		Title         string   `json:"title"`
		Location      string   `json:"location"`
		PricePerNight float64  `json:"price_per_night"`
		Guests        int      `json:"guests"`
		Bedrooms      int      `json:"bedrooms"`
		Bathrooms     int      `json:"bathrooms"`
		Type          string   `json:"type"`
		Amenities     []string `json:"amenities"`
		Image         string   `json:"image"`
	}
	var body req
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	// Validate required fields
	if body.Title == "" || body.Location == "" || body.PricePerNight <= 0 {
		writeError(w, http.StatusBadRequest, "title, location, and price_per_night are required")
		return
	}

	var p models.Property
	err = s.db.Pool.QueryRow(r.Context(),
		`INSERT INTO properties (title, location, price_per_night, guests, bedrooms, bathrooms, type, amenities, image, owner_id)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		 RETURNING id, title, location, price_per_night, rating, reviews, guests, bedrooms, bathrooms, type, amenities, COALESCE(image, ''), owner_id, created_at`,
		body.Title, body.Location, body.PricePerNight, body.Guests, body.Bedrooms, body.Bathrooms, body.Type, body.Amenities, body.Image, user.UserID,
	).Scan(&p.ID, &p.Title, &p.Location, &p.PricePerNight, &p.Rating, &p.Reviews, &p.Guests, &p.Bedrooms, &p.Bathrooms, &p.Type, &p.Amenities, &p.Image, &p.OwnerID, &p.CreatedAt)

	if err != nil {
		log.Printf("[CreateProperty] Database error: %v", err)
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	log.Printf("[CreateProperty] Property created: id=%d by user=%d", p.ID, user.UserID)
	writeJSON(w, http.StatusCreated, p)
}

func (s *Server) handlePropertyByID(w http.ResponseWriter, r *http.Request) {
	id, ok := parseIDFromPath(r.URL.Path)
	if !ok {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	switch r.Method {
	case http.MethodGet:
		s.getPropertyByID(w, r, id)
	case http.MethodPut:
		s.updateProperty(w, r, id)
	case http.MethodDelete:
		s.deleteProperty(w, r, id)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *Server) getPropertyByID(w http.ResponseWriter, r *http.Request, id int) {
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
		log.Printf("[GetProperty] Database error: %v", err)
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	writeJSON(w, http.StatusOK, p)
}

func (s *Server) updateProperty(w http.ResponseWriter, r *http.Request, id int) {
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	// Check if property exists and user is owner or admin
	var ownerID *int
	err = s.db.Pool.QueryRow(r.Context(), `SELECT owner_id FROM properties WHERE id = $1`, id).Scan(&ownerID)
	if err == pgx.ErrNoRows {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	if user.Role != auth.RoleAdmin && (ownerID == nil || *ownerID != user.UserID) {
		writeError(w, http.StatusForbidden, "you can only update your own properties")
		return
	}

	type req struct {
		Title         string   `json:"title"`
		Location      string   `json:"location"`
		PricePerNight float64  `json:"price_per_night"`
		Guests        int      `json:"guests"`
		Bedrooms      int      `json:"bedrooms"`
		Bathrooms     int      `json:"bathrooms"`
		Type          string   `json:"type"`
		Amenities     []string `json:"amenities"`
		Image         string   `json:"image"`
	}
	var body req
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	var p models.Property
	err = s.db.Pool.QueryRow(r.Context(),
		`UPDATE properties SET title = $1, location = $2, price_per_night = $3, guests = $4,
		 bedrooms = $5, bathrooms = $6, type = $7, amenities = $8, image = $9
		 WHERE id = $10
		 RETURNING id, title, location, price_per_night, rating, reviews, guests, bedrooms, bathrooms, type, amenities, COALESCE(image, ''), owner_id, created_at`,
		body.Title, body.Location, body.PricePerNight, body.Guests, body.Bedrooms, body.Bathrooms, body.Type, body.Amenities, body.Image, id,
	).Scan(&p.ID, &p.Title, &p.Location, &p.PricePerNight, &p.Rating, &p.Reviews, &p.Guests, &p.Bedrooms, &p.Bathrooms, &p.Type, &p.Amenities, &p.Image, &p.OwnerID, &p.CreatedAt)

	if err != nil {
		log.Printf("[UpdateProperty] Database error: %v", err)
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	log.Printf("[UpdateProperty] Property updated: id=%d by user=%d", p.ID, user.UserID)
	writeJSON(w, http.StatusOK, p)
}

func (s *Server) deleteProperty(w http.ResponseWriter, r *http.Request, id int) {
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	// Check if property exists and user is owner or admin
	var ownerID *int
	err = s.db.Pool.QueryRow(r.Context(), `SELECT owner_id FROM properties WHERE id = $1`, id).Scan(&ownerID)
	if err == pgx.ErrNoRows {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	if user.Role != auth.RoleAdmin && (ownerID == nil || *ownerID != user.UserID) {
		writeError(w, http.StatusForbidden, "you can only delete your own properties")
		return
	}

	_, err = s.db.Pool.Exec(r.Context(), `DELETE FROM properties WHERE id = $1`, id)
	if err != nil {
		log.Printf("[DeleteProperty] Database error: %v", err)
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	log.Printf("[DeleteProperty] Property deleted: id=%d by user=%d", id, user.UserID)
	writeJSON(w, http.StatusOK, map[string]string{"message": "property deleted"})
}

func (s *Server) handleFavourites(w http.ResponseWriter, r *http.Request) {
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := user.UserID

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
			log.Printf("[Favourites] Database error: %v", err)
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
				log.Printf("[Favourites] Scan error: %v", err)
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
			log.Printf("[Favourites] Database error: %v", err)
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		if exists {
			// Remove from favourites
			_, err = s.db.Pool.Exec(r.Context(),
				`DELETE FROM favourites WHERE user_id = $1 AND property_id = $2`,
				userID, body.PropertyID)
			if err != nil {
				log.Printf("[Favourites] Database error: %v", err)
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
				log.Printf("[Favourites] Database error: %v", err)
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
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := user.UserID

	switch r.Method {
	case http.MethodGet:
		rows, err := s.db.Pool.Query(r.Context(),
			`SELECT id, user_id, property_id, start_date, end_date, guests, status, created_at
			 FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`, userID)
		if err != nil {
			log.Printf("[Bookings] Database error: %v", err)
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
				log.Printf("[Bookings] Scan error: %v", err)
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

		// Validate required fields
		if body.PropertyID <= 0 || body.StartDate == "" || body.EndDate == "" || body.Guests <= 0 {
			writeError(w, http.StatusBadRequest, "property_id, start_date, end_date, and guests are required")
			return
		}

		// Check for overlapping bookings
		var overlapping int
		err := s.db.Pool.QueryRow(r.Context(),
			`SELECT COUNT(*) FROM bookings
			 WHERE property_id = $1
			   AND status != 'cancelled'
			   AND start_date < $3
			   AND end_date > $2`,
			body.PropertyID, body.StartDate, body.EndDate,
		).Scan(&overlapping)
		if err != nil {
			log.Printf("[Bookings] Database error checking overlap: %v", err)
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}
		if overlapping > 0 {
			writeError(w, http.StatusConflict, "property is not available for selected dates")
			return
		}

		var b models.Booking
		err = s.db.Pool.QueryRow(r.Context(),
			`INSERT INTO bookings (user_id, property_id, start_date, end_date, guests, status)
			 VALUES ($1, $2, $3, $4, $5, 'confirmed')
			 RETURNING id, user_id, property_id, start_date, end_date, guests, status, created_at`,
			userID, body.PropertyID, body.StartDate, body.EndDate, body.Guests,
		).Scan(&b.ID, &b.UserID, &b.PropertyID, &b.StartDate, &b.EndDate,
			&b.Guests, &b.Status, &b.CreatedAt)

		if err != nil {
			log.Printf("[Bookings] Database error creating booking: %v", err)
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		log.Printf("[Bookings] Booking created: id=%d by user=%d", b.ID, userID)
		writeJSON(w, http.StatusCreated, b)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *Server) handleBookingByID(w http.ResponseWriter, r *http.Request) {
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id, ok := parseIDFromPath(r.URL.Path)
	if !ok {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	switch r.Method {
	case http.MethodGet:
		var b models.Booking
		err := s.db.Pool.QueryRow(r.Context(),
			`SELECT id, user_id, property_id, start_date, end_date, guests, status, created_at
			 FROM bookings WHERE id = $1`, id,
		).Scan(&b.ID, &b.UserID, &b.PropertyID, &b.StartDate, &b.EndDate, &b.Guests, &b.Status, &b.CreatedAt)

		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		// Check if user owns the booking or is admin
		if user.Role != auth.RoleAdmin && b.UserID != user.UserID {
			writeError(w, http.StatusForbidden, "access denied")
			return
		}

		writeJSON(w, http.StatusOK, b)

	case http.MethodPut:
		// Get booking to check ownership
		var bookingUserID int
		err := s.db.Pool.QueryRow(r.Context(),
			`SELECT user_id FROM bookings WHERE id = $1`, id,
		).Scan(&bookingUserID)
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		if user.Role != auth.RoleAdmin && bookingUserID != user.UserID {
			writeError(w, http.StatusForbidden, "you can only update your own bookings")
			return
		}

		type req struct {
			Status string `json:"status"`
		}
		var body req
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}

		// Validate status
		validStatuses := map[string]bool{"pending": true, "confirmed": true, "cancelled": true}
		if !validStatuses[body.Status] {
			writeError(w, http.StatusBadRequest, "invalid status")
			return
		}

		var b models.Booking
		err = s.db.Pool.QueryRow(r.Context(),
			`UPDATE bookings SET status = $1 WHERE id = $2
			 RETURNING id, user_id, property_id, start_date, end_date, guests, status, created_at`,
			body.Status, id,
		).Scan(&b.ID, &b.UserID, &b.PropertyID, &b.StartDate, &b.EndDate, &b.Guests, &b.Status, &b.CreatedAt)

		if err != nil {
			log.Printf("[Bookings] Database error updating booking: %v", err)
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		log.Printf("[Bookings] Booking updated: id=%d, status=%s by user=%d", b.ID, b.Status, user.UserID)
		writeJSON(w, http.StatusOK, b)

	case http.MethodDelete:
		// Get booking to check ownership
		var bookingUserID int
		err := s.db.Pool.QueryRow(r.Context(),
			`SELECT user_id FROM bookings WHERE id = $1`, id,
		).Scan(&bookingUserID)
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		if user.Role != auth.RoleAdmin && bookingUserID != user.UserID {
			writeError(w, http.StatusForbidden, "you can only delete your own bookings")
			return
		}

		_, err = s.db.Pool.Exec(r.Context(), `DELETE FROM bookings WHERE id = $1`, id)
		if err != nil {
			log.Printf("[Bookings] Database error deleting booking: %v", err)
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		log.Printf("[Bookings] Booking deleted: id=%d by user=%d", id, user.UserID)
		writeJSON(w, http.StatusOK, map[string]string{"message": "booking deleted"})

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *Server) handleConversations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := user.UserID

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
		log.Printf("[Conversations] Database error: %v", err)
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}
	defer rows.Close()

	conversations := []convoSummary{}
	for rows.Next() {
		var c convoSummary
		err := rows.Scan(&c.ID, &c.ContactName, &c.ContactType, &c.Property, &c.LastMessage)
		if err != nil {
			log.Printf("[Conversations] Scan error: %v", err)
			writeError(w, http.StatusInternalServerError, "scan error")
			return
		}
		conversations = append(conversations, c)
	}

	writeJSON(w, http.StatusOK, conversations)
}

func (s *Server) handleMessages(w http.ResponseWriter, r *http.Request) {
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := user.UserID

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
			log.Printf("[Messages] Database error: %v", err)
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
			log.Printf("[Messages] Database error: %v", err)
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
				log.Printf("[Messages] Scan error: %v", err)
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
			log.Printf("[Messages] Database error: %v", err)
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
			log.Printf("[Messages] Database error creating message: %v", err)
			writeError(w, http.StatusInternalServerError, "database error")
			return
		}

		writeJSON(w, http.StatusCreated, m)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *Server) handleAdminUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	rows, err := s.db.Pool.Query(r.Context(),
		`SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`)
	if err != nil {
		log.Printf("[AdminUsers] Database error: %v", err)
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}
	defer rows.Close()

	users := []models.UserResponse{}
	for rows.Next() {
		var u models.UserResponse
		err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.CreatedAt)
		if err != nil {
			log.Printf("[AdminUsers] Scan error: %v", err)
			writeError(w, http.StatusInternalServerError, "scan error")
			return
		}
		users = append(users, u)
	}

	writeJSON(w, http.StatusOK, users)
}
