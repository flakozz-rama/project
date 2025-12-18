package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Role constants
const (
	RoleUser  = "user"
	RoleAdmin = "admin"
)

// Errors
var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

// Claims represents the JWT claims for GoRent
type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// Service handles JWT token operations
type Service struct {
	secretKey     []byte
	tokenDuration time.Duration
	issuer        string
}

// NewService creates a new auth service
func NewService(secretKey string, tokenDurationHours int) *Service {
	return &Service{
		secretKey:     []byte(secretKey),
		tokenDuration: time.Duration(tokenDurationHours) * time.Hour,
		issuer:        "gorent",
	}
}

// GenerateToken creates a new JWT token for a user
func (s *Service) GenerateToken(userID int, email, role string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(s.tokenDuration)),
			IssuedAt:  jwt.NewNumericDate(now),
			Issuer:    s.issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secretKey)
}

// ValidateToken parses and validates a JWT token
func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return s.secretKey, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}
