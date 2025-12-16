package main

import (
	httpapi "go-backend/internal/http"
	"log"
	"net/http"
)

func main() {
	srv := httpapi.NewServer()

	log.Println("HTTP server listening on :8080")
	if err := http.ListenAndServe(":8080", srv.Router()); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
