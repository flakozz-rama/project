package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port     string
	Database DatabaseConfig
	JWT      JWTConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type JWTConfig struct {
	SecretKey          string
	TokenDurationHours int
}

func (d DatabaseConfig) DSN() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		d.User, d.Password, d.Host, d.Port, d.DBName)
}

func Load() *Config {
	return &Config{
		Port: getEnv("PORT", "8080"),
		Database: DatabaseConfig{
			Host:     getEnv("POSTGRES_HOST", "localhost"),
			Port:     getEnv("POSTGRES_PORT", "5432"),
			User:     getEnv("POSTGRES_USER", "gorent"),
			Password: getEnv("POSTGRES_PASSWORD", "gorent123"),
			DBName:   getEnv("POSTGRES_DB", "gorent"),
		},
		JWT: JWTConfig{
			SecretKey:          getEnv("JWT_SECRET", "your-256-bit-secret-key-change-in-production"),
			TokenDurationHours: getEnvInt("JWT_DURATION_HOURS", 24),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
