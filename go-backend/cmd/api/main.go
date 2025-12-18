package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go-backend/internal/auth"
	"go-backend/internal/config"
	"go-backend/internal/database"
	httpapi "go-backend/internal/http"
	"go-backend/internal/migrations"
	"go-backend/internal/worker"
)

func main() {
	cfg := config.Load()

	// Run database migrations
	log.Println("Running database migrations...")
	if err := migrations.Run(cfg.Database.DSN()); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, cfg.Database.DSN())
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Connected to PostgreSQL")

	// Initialize auth service
	authService := auth.NewService(cfg.JWT.SecretKey, cfg.JWT.TokenDurationHours)
	log.Printf("JWT auth service initialized (token duration: %d hours)", cfg.JWT.TokenDurationHours)

	// Initialize worker manager
	workerManager := worker.NewManager(db)

	// Create and register workers
	bookingChecker := worker.NewBookingChecker(db, 1*time.Hour) // Check every hour
	workerManager.Register(bookingChecker)

	// Start all workers
	workerManager.Start()

	// Create HTTP server
	srv := httpapi.NewServer(db, authService)

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      srv.Router(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start HTTP server in goroutine
	go func() {
		log.Printf("HTTP server listening on :%s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Create shutdown context with timeout
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	// Shutdown HTTP server first (stop accepting new requests)
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("HTTP server forced to shutdown: %v", err)
	}
	log.Println("HTTP server stopped")

	// Shutdown workers (allow them to finish current work)
	if err := workerManager.Shutdown(15 * time.Second); err != nil {
		log.Printf("Worker manager shutdown error: %v", err)
	}

	log.Println("Server stopped gracefully")
}
