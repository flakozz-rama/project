.PHONY: help setup install-tools db-create migrate migrate-down migrate-status seed run build clean

# Load .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Database URL
DATABASE_URL ?= postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: install-tools db-create migrate seed ## Full setup: install tools, create DB, run migrations, seed data

install-tools: ## Install required tools (atlas)
	@echo "Installing Atlas CLI..."
	@which atlas > /dev/null || curl -sSf https://atlasgo.sh | sh
	@echo "Installing Go dependencies..."
	@go mod download
	@echo "Done!"

db-create: ## Create database if not exists
	@echo "Creating database $(POSTGRES_DB)..."
	@PGPASSWORD=$(POSTGRES_PASSWORD) psql -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$(POSTGRES_DB)'" | grep -q 1 || \
		PGPASSWORD=$(POSTGRES_PASSWORD) psql -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d postgres -c "CREATE DATABASE $(POSTGRES_DB)"
	@echo "Done!"

migrate: ## Run migrations
	@echo "Running migrations..."
	@atlas schema apply \
		--url "$(DATABASE_URL)" \
		--to "file://schema/schema.hcl" \
		--dev-url "docker://postgres/16/dev?search_path=public" \
		--auto-approve
	@echo "Done!"

migrate-dry: ## Show migration plan without applying
	@atlas schema apply \
		--url "$(DATABASE_URL)" \
		--to "file://schema/schema.hcl" \
		--dev-url "docker://postgres/16/dev?search_path=public" \
		--dry-run

migrate-status: ## Show current schema status
	@atlas schema inspect --url "$(DATABASE_URL)"

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
