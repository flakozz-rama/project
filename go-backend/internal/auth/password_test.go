package auth

import (
	"testing"
)

func TestValidatePassword_Valid(t *testing.T) {
	validPasswords := []string{
		"Password1",
		"MySecure123",
		"Test1234",
		"ValidPass1",
		"StrongP@ss1",
	}

	for _, password := range validPasswords {
		err := ValidatePassword(password)
		if err != nil {
			t.Errorf("Password '%s' should be valid, got error: %v", password, err)
		}
	}
}

func TestValidatePassword_TooShort(t *testing.T) {
	err := ValidatePassword("Pass1")
	if err != ErrPasswordTooShort {
		t.Errorf("Expected ErrPasswordTooShort, got %v", err)
	}
}

func TestValidatePassword_TooLong(t *testing.T) {
	// Create a password longer than 72 characters
	longPassword := "Password1" + string(make([]byte, 70))
	err := ValidatePassword(longPassword)
	if err != ErrPasswordTooLong {
		t.Errorf("Expected ErrPasswordTooLong, got %v", err)
	}
}

func TestValidatePassword_NoUppercase(t *testing.T) {
	err := ValidatePassword("password1")
	if err != ErrPasswordNoUppercase {
		t.Errorf("Expected ErrPasswordNoUppercase, got %v", err)
	}
}

func TestValidatePassword_NoLowercase(t *testing.T) {
	err := ValidatePassword("PASSWORD1")
	if err != ErrPasswordNoLowercase {
		t.Errorf("Expected ErrPasswordNoLowercase, got %v", err)
	}
}

func TestValidatePassword_NoDigit(t *testing.T) {
	err := ValidatePassword("Passwords")
	if err != ErrPasswordNoDigit {
		t.Errorf("Expected ErrPasswordNoDigit, got %v", err)
	}
}

func TestHashPassword(t *testing.T) {
	password := "TestPassword123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if hash == "" {
		t.Error("Expected non-empty hash")
	}
	if hash == password {
		t.Error("Hash should not equal original password")
	}
}

func TestCheckPassword_Valid(t *testing.T) {
	password := "TestPassword123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if !CheckPassword(password, hash) {
		t.Error("CheckPassword should return true for valid password")
	}
}

func TestCheckPassword_Invalid(t *testing.T) {
	password := "TestPassword123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if CheckPassword("WrongPassword123", hash) {
		t.Error("CheckPassword should return false for invalid password")
	}
}

func TestCheckPassword_DifferentHashes(t *testing.T) {
	password := "TestPassword123"

	// Hash the same password twice - should produce different hashes due to salt
	hash1, _ := HashPassword(password)
	hash2, _ := HashPassword(password)

	if hash1 == hash2 {
		t.Error("Same password should produce different hashes due to salt")
	}

	// But both should validate correctly
	if !CheckPassword(password, hash1) {
		t.Error("Password should validate against first hash")
	}
	if !CheckPassword(password, hash2) {
		t.Error("Password should validate against second hash")
	}
}
