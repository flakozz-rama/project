.PHONY: help setup install-tools db-create migrate migrate-down migrate-down-all migrate-status migrate-force migrate-create seed run build clean db-reset test

# Load .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Database URL for golang-migrate
DATABASE_URL ?= postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: install-tools db-create migrate seed ## Full setup: install tools, create DB, run migrations, seed data

install-tools: ## Install required tools (golang-migrate)
	@echo "Installing golang-migrate..."
	@which migrate > /dev/null || go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@echo "Installing Go dependencies..."
	@go mod download
	@echo "Done!"

db-create: ## Create database if not exists
	@echo "Creating database $(POSTGRES_DB)..."
	@PGPASSWORD=$(POSTGRES_PASSWORD) psql -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$(POSTGRES_DB)'" | grep -q 1 || \
		PGPASSWORD=$(POSTGRES_PASSWORD) psql -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d postgres -c "CREATE DATABASE $(POSTGRES_DB)"
	@echo "Done!"

migrate: ## Run all pending migrations
	@echo "Running migrations..."
	@migrate -path migrations -database "$(DATABASE_URL)" up
	@echo "Done!"

migrate-down: ## Rollback last migration
	@echo "Rolling back last migration..."
	@migrate -path migrations -database "$(DATABASE_URL)" down 1
	@echo "Done!"

migrate-down-all: ## Rollback all migrations
	@echo "Rolling back all migrations..."
	@migrate -path migrations -database "$(DATABASE_URL)" down -all
	@echo "Done!"

migrate-status: ## Show current migration version
	@echo "Current migration version:"
	@migrate -path migrations -database "$(DATABASE_URL)" version

migrate-force: ## Force set migration version (use: make migrate-force V=1)
	@migrate -path migrations -database "$(DATABASE_URL)" force $(V)

migrate-create: ## Create new migration (use: make migrate-create NAME=add_feature)
	@migrate create -ext sql -dir migrations -seq $(NAME)

seed: ## Seed database with demo data
	@echo "Seeding database..."
	@PGPASSWORD=$(POSTGRES_PASSWORD) psql -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d $(POSTGRES_DB) -f schema/seed.sql
	@echo "Done!"

run: ## Run the server
	@go run cmd/api/main.go

build: ## Build the binary
	@go build -o bin/api cmd/api/main.go

clean: ## Clean build artifacts
	@rm -rf bin/

db-reset: ## Drop and recreate database
	@echo "Resetting database..."
	@PGPASSWORD=$(POSTGRES_PASSWORD) psql -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d postgres -c "DROP DATABASE IF EXISTS $(POSTGRES_DB)"
	@PGPASSWORD=$(POSTGRES_PASSWORD) psql -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d postgres -c "CREATE DATABASE $(POSTGRES_DB)"
	@$(MAKE) migrate seed
	@echo "Done!"

test: ## Run tests
	@go test -v ./...

test-coverage: ## Run tests with coverage
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"
