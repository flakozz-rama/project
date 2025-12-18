package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

// Middleware provides JWT authentication middleware
type Middleware struct {
	authService *Service
}

// NewMiddleware creates a new auth middleware
func NewMiddleware(authService *Service) *Middleware {
	return &Middleware{authService: authService}
}

// writeJSONError writes a JSON error response
func writeJSONError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// Authenticate validates JWT token and adds user to context
func (m *Middleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeJSONError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		// Expect "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			writeJSONError(w, http.StatusUnauthorized, "invalid authorization header format")
			return
		}

		tokenString := parts[1]
		claims, err := m.authService.ValidateToken(tokenString)
		if err != nil {
			if err == ErrExpiredToken {
				writeJSONError(w, http.StatusUnauthorized, "token has expired")
				return
			}
			writeJSONError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		// Add user info to context
		userCtx := UserContext{
			UserID: claims.UserID,
			Email:  claims.Email,
			Role:   claims.Role,
		}
		ctx := ContextWithUser(r.Context(), userCtx)

		log.Printf("[Auth] Authenticated user: id=%d, email=%s, role=%s", userCtx.UserID, userCtx.Email, userCtx.Role)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireRole creates middleware that requires specific role(s)
func (m *Middleware) RequireRole(roles ...string) func(http.Handler) http.Handler {
	roleSet := make(map[string]bool)
	for _, role := range roles {
		roleSet[role] = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, err := UserFromContext(r.Context())
			if err != nil {
				writeJSONError(w, http.StatusUnauthorized, "unauthorized")
				return
			}

			if !roleSet[user.Role] {
				writeJSONError(w, http.StatusForbidden, "insufficient permissions")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// Optional allows unauthenticated requests but adds user to context if token present
func (m *Middleware) Optional(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			next.ServeHTTP(w, r)
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			next.ServeHTTP(w, r)
			return
		}

		tokenString := parts[1]
		claims, err := m.authService.ValidateToken(tokenString)
		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		userCtx := UserContext{
			UserID: claims.UserID,
			Email:  claims.Email,
			Role:   claims.Role,
		}
		ctx := ContextWithUser(r.Context(), userCtx)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
