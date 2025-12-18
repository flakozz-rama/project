package auth

import (
	"context"
	"errors"
)

type contextKey string

const userContextKey contextKey = "user"

// ErrUserNotInContext is returned when user is not found in context
var ErrUserNotInContext = errors.New("user not found in context")

// UserContext holds authenticated user information
type UserContext struct {
	UserID int
	Email  string
	Role   string
}

// ContextWithUser adds user info to context
func ContextWithUser(ctx context.Context, user UserContext) context.Context {
	return context.WithValue(ctx, userContextKey, user)
}

// UserFromContext extracts user info from context
func UserFromContext(ctx context.Context) (UserContext, error) {
	user, ok := ctx.Value(userContextKey).(UserContext)
	if !ok {
		return UserContext{}, ErrUserNotInContext
	}
	return user, nil
}

// MustUserFromContext extracts user info, panics if not found
func MustUserFromContext(ctx context.Context) UserContext {
	user, err := UserFromContext(ctx)
	if err != nil {
		panic(err)
	}
	return user
}

// IsAdmin checks if the user in context has admin role
func IsAdmin(ctx context.Context) bool {
	user, err := UserFromContext(ctx)
	if err != nil {
		return false
	}
	return user.Role == RoleAdmin
}
