package auth

import (
	"context"
	"testing"
)

func TestContextWithUser(t *testing.T) {
	ctx := context.Background()
	user := UserContext{
		UserID: 1,
		Email:  "test@example.com",
		Role:   RoleUser,
	}

	newCtx := ContextWithUser(ctx, user)
	if newCtx == nil {
		t.Error("Expected non-nil context")
	}
}

func TestUserFromContext(t *testing.T) {
	ctx := context.Background()
	user := UserContext{
		UserID: 42,
		Email:  "test@example.com",
		Role:   RoleAdmin,
	}

	ctx = ContextWithUser(ctx, user)

	retrieved, err := UserFromContext(ctx)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if retrieved.UserID != 42 {
		t.Errorf("Expected UserID 42, got %d", retrieved.UserID)
	}
	if retrieved.Email != "test@example.com" {
		t.Errorf("Expected email test@example.com, got %s", retrieved.Email)
	}
	if retrieved.Role != RoleAdmin {
		t.Errorf("Expected role %s, got %s", RoleAdmin, retrieved.Role)
	}
}

func TestUserFromContext_NotFound(t *testing.T) {
	ctx := context.Background()

	_, err := UserFromContext(ctx)
	if err != ErrUserNotInContext {
		t.Errorf("Expected ErrUserNotInContext, got %v", err)
	}
}

func TestMustUserFromContext(t *testing.T) {
	ctx := context.Background()
	user := UserContext{
		UserID: 1,
		Email:  "test@example.com",
		Role:   RoleUser,
	}

	ctx = ContextWithUser(ctx, user)

	// Should not panic
	retrieved := MustUserFromContext(ctx)
	if retrieved.UserID != 1 {
		t.Errorf("Expected UserID 1, got %d", retrieved.UserID)
	}
}

func TestMustUserFromContext_Panics(t *testing.T) {
	ctx := context.Background()

	defer func() {
		if r := recover(); r == nil {
			t.Error("Expected MustUserFromContext to panic when user not in context")
		}
	}()

	MustUserFromContext(ctx)
}

func TestIsAdmin(t *testing.T) {
	tests := []struct {
		name     string
		role     string
		expected bool
	}{
		{"admin role", RoleAdmin, true},
		{"user role", RoleUser, false},
		{"empty role", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx := context.Background()
			user := UserContext{
				UserID: 1,
				Email:  "test@example.com",
				Role:   tt.role,
			}
			ctx = ContextWithUser(ctx, user)

			result := IsAdmin(ctx)
			if result != tt.expected {
				t.Errorf("IsAdmin() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestIsAdmin_NoUser(t *testing.T) {
	ctx := context.Background()
	if IsAdmin(ctx) {
		t.Error("IsAdmin should return false when no user in context")
	}
}
