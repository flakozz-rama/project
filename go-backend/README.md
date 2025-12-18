# GoRent - Property Rental API

A robust Go-based backend REST API for a property rental platform, demonstrating proficiency in core Go backend concepts including routing, JSON handling, database operations, concurrency, context handling, testing, and deployment.

## Features

- JWT-based authentication with role-based access control (RBAC)
- Full CRUD operations for properties, bookings, favourites, and messages
- PostgreSQL database with migrations (golang-migrate)
- Background workers for automated tasks (booking expiry checker)
- Graceful shutdown with context propagation
- Comprehensive unit tests
- Docker containerization

## Project Structure

```
go-backend/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── auth/                    # JWT authentication package
│   │   ├── auth.go              # Token generation/validation
│   │   ├── context.go           # Context helpers
│   │   ├── middleware.go        # Auth middleware
│   │   └── password.go          # Password validation/hashing
│   ├── config/
│   │   └── config.go            # Configuration management
│   ├── database/
│   │   └── postgres.go          # PostgreSQL connection pool
│   ├── http/
│   │   ├── handlers.go          # HTTP request handlers
│   │   └── middleware.go        # CORS middleware
│   ├── models/                  # Data models
│   │   ├── user.go
│   │   ├── property.go
│   │   ├── booking.go
│   │   └── message.go
│   └── worker/                  # Background workers
│       ├── worker.go            # Worker manager
│       └── booking_checker.go   # Booking expiry worker
├── migrations/                  # Database migrations
│   ├── 000001_init_schema.up.sql
│   ├── 000001_init_schema.down.sql
│   ├── 000002_add_user_role.up.sql
│   └── 000002_add_user_role.down.sql
├── schema/
│   └── seed.sql                 # Demo data
├── Dockerfile
├── docker-compose.yml
├── Makefile
└── go.mod
```

## Quick Start

### Prerequisites

- Go 1.21+
- PostgreSQL 16+
- Docker (optional)

### Setup

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd go-backend
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL (using Docker):
   ```bash
   docker-compose up -d
   ```

4. Run setup (install tools, create DB, run migrations, seed data):
   ```bash
   make setup
   ```

5. Start the server:
   ```bash
   make run
   ```

The API will be available at `http://localhost:8080`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `POSTGRES_HOST` | Database host | `localhost` |
| `POSTGRES_PORT` | Database port | `5432` |
| `POSTGRES_USER` | Database user | `gorent` |
| `POSTGRES_PASSWORD` | Database password | `gorent123` |
| `POSTGRES_DB` | Database name | `gorent` |
| `JWT_SECRET` | JWT signing secret | (change in production) |
| `JWT_DURATION_HOURS` | Token expiry in hours | `24` |

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass1"
}

Response: 201 Created
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Sign In
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass1"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {...}
}
```

### Properties

#### List Properties
```
GET /api/properties
GET /api/properties?location=san+francisco
GET /api/properties?type=apartment

Response: 200 OK
[
  {
    "id": 1,
    "title": "Modern Downtown Apartment",
    "location": "San Francisco, CA",
    "price_per_night": 150.00,
    "rating": 4.8,
    "reviews": 124,
    "guests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "apartment",
    "amenities": ["wifi", "parking", "ac", "kitchen"],
    "image": "https://...",
    "owner_id": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Property by ID
```
GET /api/properties/{id}

Response: 200 OK
{...property object}
```

#### Create Property (Auth Required)
```
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beach House",
  "location": "Miami, FL",
  "price_per_night": 250.00,
  "guests": 6,
  "bedrooms": 3,
  "bathrooms": 2,
  "type": "house",
  "amenities": ["wifi", "pool", "beach_access"],
  "image": "https://..."
}

Response: 201 Created
```

#### Update Property (Auth Required, Owner/Admin)
```
PUT /api/properties/{id}
Authorization: Bearer <token>
Content-Type: application/json

{...updated fields}

Response: 200 OK
```

#### Delete Property (Auth Required, Owner/Admin)
```
DELETE /api/properties/{id}
Authorization: Bearer <token>

Response: 200 OK
{"message": "property deleted"}
```

### Bookings (Auth Required)

#### List User Bookings
```
GET /api/bookings
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "property_id": 1,
    "start_date": "2024-02-01",
    "end_date": "2024-02-05",
    "guests": 2,
    "status": "confirmed",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Booking
```
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "property_id": 1,
  "start_date": "2024-03-01",
  "end_date": "2024-03-05",
  "guests": 2
}

Response: 201 Created
```

#### Update Booking Status
```
PUT /api/bookings/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "cancelled"
}

Response: 200 OK
```

#### Delete Booking
```
DELETE /api/bookings/{id}
Authorization: Bearer <token>

Response: 200 OK
```

### Favourites (Auth Required)

#### List Favourites
```
GET /api/favourites
Authorization: Bearer <token>

Response: 200 OK
[...array of favourite properties]
```

#### Toggle Favourite
```
POST /api/favourites
Authorization: Bearer <token>
Content-Type: application/json

{
  "property_id": 1
}

Response: 200 OK
{"favourite": true/false}
```

### Conversations & Messages (Auth Required)

#### List Conversations
```
GET /api/conversations
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "contact_name": "John Host",
    "contact_type": "host",
    "property_name": "Modern Downtown Apartment",
    "last_message": "Thanks! What time is check-in?"
  }
]
```

#### Get Messages
```
GET /api/messages?conversationId=1
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "conversation_id": 1,
    "sender_id": null,
    "text": "Welcome! Let me know if you have any questions.",
    "created_at": "2024-01-01T00:00:00Z",
    "read": true
  }
]
```

#### Send Message
```
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": 1,
  "text": "What amenities are included?"
}

Response: 201 Created
```

### Admin Endpoints (Admin Role Required)

#### List All Users
```
GET /api/admin/users
Authorization: Bearer <admin-token>

Response: 200 OK
[
  {
    "id": 1,
    "email": "demo@gorent.com",
    "name": "Demo User",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Health Check

```
GET /api/health

Response: 200 OK
{"status": "ok"}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Token Format
Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Roles
- `user`: Regular user (default)
- `admin`: Administrator with full access

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

## Database Schema

### Tables
- **users**: User accounts with role-based access
- **properties**: Rental property listings
- **bookings**: Property reservations
- **favourites**: User favourite properties (many-to-many)
- **conversations**: User chat conversations
- **messages**: Chat messages

### Relationships
- One-to-many: User → Bookings, User → Conversations, Conversation → Messages
- Many-to-many: Users ↔ Properties (via favourites)
- Foreign keys with CASCADE/SET NULL for referential integrity

## Background Workers

### BookingChecker
Runs hourly to expire pending bookings whose start date has passed:
- Checks for bookings with `status = 'pending'` and `start_date < CURRENT_DATE`
- Updates status to `'expired'`
- Uses context cancellation for graceful shutdown

## Development

### Running Tests
```bash
make test
```

### Running Tests with Coverage
```bash
make test-coverage
```

### Makefile Commands
```bash
make help            # Show all available commands
make setup           # Full setup (install tools, create DB, migrate, seed)
make run             # Run the server
make build           # Build the binary
make test            # Run tests
make migrate         # Run migrations
make migrate-down    # Rollback last migration
make seed            # Seed demo data
make db-reset        # Reset database
```

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| demo@gorent.com | demo123 | user |
| admin@gorent.com | admin123 | admin |

## Error Responses

All error responses follow this format:
```json
{
  "error": "error message here"
}
```

Common HTTP status codes:
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., email already exists)
- `500 Internal Server Error`: Server error

## License

MIT
