package auth

import (
	"testing"
	"time"
)

func TestNewService(t *testing.T) {
	service := NewService("test-secret-key", 24)
	if service == nil {
		t.Error("Expected non-nil service")
	}
}

func TestGenerateToken(t *testing.T) {
	service := NewService("test-secret-key-256-bits-long!!", 24)

	token, err := service.GenerateToken(1, "test@example.com", RoleUser)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if token == "" {
		t.Error("Expected non-empty token")
	}
}

func TestValidateToken(t *testing.T) {
	service := NewService("test-secret-key-256-bits-long!!", 24)

	// Generate a token
	token, err := service.GenerateToken(42, "test@example.com", RoleAdmin)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Validate the token
	claims, err := service.ValidateToken(token)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if claims.UserID != 42 {
		t.Errorf("Expected UserID 42, got %d", claims.UserID)
	}
	if claims.Email != "test@example.com" {
		t.Errorf("Expected email test@example.com, got %s", claims.Email)
	}
	if claims.Role != RoleAdmin {
		t.Errorf("Expected role %s, got %s", RoleAdmin, claims.Role)
	}
}

func TestValidateToken_Invalid(t *testing.T) {
	service := NewService("test-secret-key-256-bits-long!!", 24)

	_, err := service.ValidateToken("invalid-token")
	if err == nil {
		t.Error("Expected error for invalid token")
	}
	if err != ErrInvalidToken {
		t.Errorf("Expected ErrInvalidToken, got %v", err)
	}
}

func TestValidateToken_WrongSecret(t *testing.T) {
	service1 := NewService("secret-key-one-256-bits-long!!", 24)
	service2 := NewService("secret-key-two-256-bits-long!!", 24)

	// Generate token with service1
	token, err := service1.GenerateToken(1, "test@example.com", RoleUser)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Try to validate with service2 (different secret)
	_, err = service2.ValidateToken(token)
	if err == nil {
		t.Error("Expected error for token signed with different secret")
	}
}

func TestValidateToken_Expired(t *testing.T) {
	// Create service with very short token duration (0 hours = immediate expiry)
	service := NewService("test-secret-key-256-bits-long!!", 0)

	token, err := service.GenerateToken(1, "test@example.com", RoleUser)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Wait a moment for token to expire
	time.Sleep(100 * time.Millisecond)

	_, err = service.ValidateToken(token)
	if err == nil {
		t.Error("Expected error for expired token")
	}
	if err != ErrExpiredToken {
		t.Errorf("Expected ErrExpiredToken, got %v", err)
	}
}

func TestRoleConstants(t *testing.T) {
	if RoleUser != "user" {
		t.Errorf("Expected RoleUser to be 'user', got %s", RoleUser)
	}
	if RoleAdmin != "admin" {
		t.Errorf("Expected RoleAdmin to be 'admin', got %s", RoleAdmin)
	}
}
