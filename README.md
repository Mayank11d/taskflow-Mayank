# TaskFlow

A minimal but production-quality task management system with authentication, project management, and task tracking — built as part of an engineering take-home assignment.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Running Locally](#running-locally)
4. [Running Migrations](#running-migrations)
5. [Test Credentials](#test-credentials)
6. [API Reference](#api-reference)
7. [What You'd Do With More Time](#what-youd-do-with-more-time)

---

## Overview

TaskFlow allows users to register, log in, create projects, and manage tasks within those projects. Tasks can be assigned to team members, filtered by status or assignee, and updated with priorities and due dates.

### Tech Stack

| Layer       | Technology                                      |
|-------------|--------------------------------------------------|
| Backend     | Go (net/http + chi router)                       |
| Database    | PostgreSQL 15                                    |
| Migrations  | `golang-migrate`                                 |
| Auth        | JWT (HS256, 24h expiry) + bcrypt (cost 12)       |
| Frontend    | React 18 + TypeScript                            |
| UI Library  | shadcn/ui (Radix primitives + Tailwind CSS)      |
| State       | React Query (server state) + Context (auth)      |
| Routing     | React Router v6                                  |
| Infra       | Docker + Docker Compose                          |

---

## Architecture Decisions

### Backend: Standard library over framework

I used Go's `net/http` with the `chi` router rather than a heavier framework like Gin or Echo. `chi` is lightweight, idiomatic, and its middleware model is easy to reason about. This keeps the dependency surface small and makes the routing layer transparent.

### Auth: JWT stored in localStorage, not cookies

JWTs are returned on login and stored in localStorage on the client. This was a pragmatic choice for a take-home scope — it avoids CSRF complexity while keeping the auth flow simple. In a production system I'd prefer `httpOnly` cookies to mitigate XSS risk.

### Database: Raw SQL over ORM

All queries are written in raw SQL using `pgx` (the PostgreSQL driver). ORMs abstract away the database in ways that make query performance hard to reason about. For a project this size, the overhead of writing SQL is low and the result is more explicit, reviewable code.

### Migrations: `golang-migrate`, run on startup

Migrations are embedded in the binary using Go's `embed` package and run automatically when the API container starts. This means `docker compose up` is genuinely the only command needed — no separate migration step. Down migrations are included for every file.

### Frontend: React Query for server state

Rather than managing loading/error/data states manually with `useEffect`, I used React Query for all API interactions. This gives caching, background refetching, and optimistic updates almost for free. Auth state is managed in a React Context and persisted via localStorage.

### Monorepo layout

```
taskflow/
├── backend/          # Go API
│   ├── cmd/server/   # Entry point
│   ├── internal/     # Handlers, middleware, db, models
│   └── migrations/   # SQL migration files (up + down)
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/      # API client functions
│   │   └── hooks/    # React Query hooks
├── docker-compose.yml
├── .env.example
└── README.md
```

### What I intentionally left out

- **Email verification** — adds infra complexity (SMTP/SES) that's out of scope here.
- **Refresh tokens** — 24h JWT expiry is acceptable for a take-home; production would need token rotation.
- **Role-based access control** — the spec only requires owner-level permissions, so I modeled that explicitly rather than building a generalized RBAC system.
- **Pagination** — implemented for the tasks list endpoint (`?page=&limit=`), skipped for projects (typically low cardinality).

---

## Running Locally

> **Prerequisites:** Docker and Docker Compose only. No Go, Node, or PostgreSQL required locally.

```bash
# 1. Clone the repository
git clone https://github.com/your-name/taskflow
cd taskflow

# 2. Copy environment variables
cp .env.example .env

# 3. Start the full stack (PostgreSQL + API + React app)
docker compose up
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:8080
- **PostgreSQL:** localhost:5432

The first run will build the Docker images, run all database migrations, and seed the database with test data. Subsequent runs use cached layers and start in seconds.

To run in detached mode:

```bash
docker compose up -d
```

To stop and remove volumes (full reset):

```bash
docker compose down -v
```

---

## Running Migrations

Migrations run **automatically on API container startup** — no manual step is required.

If you need to run them manually (e.g., against a local Postgres instance):

```bash
# Install golang-migrate
brew install golang-migrate  # macOS
# or: go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run migrations up
migrate -path ./backend/migrations -database "postgres://taskflow:taskflow@localhost:5432/taskflow?sslmode=disable" up

# Roll back the last migration
migrate -path ./backend/migrations -database "postgres://taskflow:taskflow@localhost:5432/taskflow?sslmode=disable" down 1
```

Migration files live in `backend/migrations/` and follow the naming convention:

```
000001_create_users.up.sql
000001_create_users.down.sql
000002_create_projects.up.sql
000002_create_projects.down.sql
000003_create_tasks.up.sql
000003_create_tasks.down.sql
```

---

## Test Credentials

The seed script creates the following user, project, and tasks automatically:

```
Email:    test@example.com
Password: password123
```

Seeded data includes:

- **1 user** — the test user above
- **1 project** — "Website Redesign" (owned by the test user)
- **3 tasks** — one each in `todo`, `in_progress`, and `done` status

You can log in immediately at http://localhost:3000/login without registering.

---

## API Reference

**Base URL:** `http://localhost:8080`

All non-auth endpoints require:
```
Authorization: Bearer <token>
```

All responses are `Content-Type: application/json`.

---

### Auth

#### `POST /auth/register`

Register a new user.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "created_at": "2026-04-09T10:00:00Z"
  }
}
```

---

#### `POST /auth/login`

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

### Projects

#### `GET /projects`

List all projects the current user owns or has tasks in.

**Response `200`:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Website Redesign",
      "description": "Q2 project",
      "owner_id": "uuid",
      "created_at": "2026-04-01T10:00:00Z"
    }
  ]
}
```

---

#### `POST /projects`

Create a new project. The authenticated user becomes the owner.

**Request:**
```json
{
  "name": "New Project",
  "description": "Optional description"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "name": "New Project",
  "description": "Optional description",
  "owner_id": "uuid",
  "created_at": "2026-04-09T10:00:00Z"
}
```

---

#### `GET /projects/:id`

Get project details including all its tasks.

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "Website Redesign",
  "description": "Q2 project",
  "owner_id": "uuid",
  "created_at": "2026-04-01T10:00:00Z",
  "tasks": [
    {
      "id": "uuid",
      "title": "Design homepage",
      "description": "Create wireframes",
      "status": "in_progress",
      "priority": "high",
      "project_id": "uuid",
      "assignee_id": "uuid",
      "due_date": "2026-04-15",
      "created_at": "2026-04-01T10:00:00Z",
      "updated_at": "2026-04-05T14:30:00Z"
    }
  ]
}
```

---

#### `PATCH /projects/:id`

Update a project's name or description. **Owner only.**

**Request:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response `200`:** Returns updated project object.

---

#### `DELETE /projects/:id`

Delete a project and all its tasks. **Owner only.**

**Response `204`:** No content.

---

#### `GET /projects/:id/stats` *(bonus)*

Task counts grouped by status and by assignee.

**Response `200`:**
```json
{
  "by_status": {
    "todo": 3,
    "in_progress": 2,
    "done": 5
  },
  "by_assignee": [
    { "assignee_id": "uuid", "name": "Jane Doe", "count": 4 },
    { "assignee_id": null,   "name": "Unassigned", "count": 6 }
  ]
}
```

---

### Tasks

#### `GET /projects/:id/tasks`

List tasks in a project. Supports filters and pagination.

**Query params:**
- `?status=todo|in_progress|done`
- `?assignee=<user_uuid>`
- `?page=1&limit=20`

**Response `200`:**
```json
{
  "tasks": [ /* task objects */ ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

#### `POST /projects/:id/tasks`

Create a task in a project.

**Request:**
```json
{
  "title": "Design homepage",
  "description": "Create wireframes and mockups",
  "priority": "high",
  "assignee_id": "uuid",
  "due_date": "2026-04-15"
}
```

**Response `201`:** Returns created task object.

---

#### `PATCH /tasks/:id`

Update a task. All fields are optional.

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "done",
  "priority": "low",
  "assignee_id": "uuid",
  "due_date": "2026-04-20"
}
```

**Response `200`:** Returns updated task object.

---

#### `DELETE /tasks/:id`

Delete a task. **Project owner or task creator only.**

**Response `204`:** No content.

---

### Error Responses

All errors follow a consistent structure:

```json
// 400 Validation error
{ "error": "validation failed", "fields": { "email": "is required" } }

// 401 Unauthenticated
{ "error": "unauthorized" }

// 403 Forbidden (authenticated but not allowed)
{ "error": "forbidden" }

// 404 Not found
{ "error": "not found" }
```

---

## What You'd Do With More Time

### Shortcuts taken

- **No refresh tokens.** The JWT is long-lived (24h). A production system needs short-lived access tokens and a refresh token rotation strategy.
- **localStorage for JWT.** Vulnerable to XSS in theory. `httpOnly` cookies with CSRF protection would be the production approach.
- **Minimal test coverage.** I wrote integration tests for the auth and task endpoints but skipped unit tests for individual handler functions. The happy-path flows are covered; edge cases less so.
- **No rate limiting.** The auth endpoints especially should have rate limits to prevent brute-force.
- **Basic error logging.** Structured logging with `slog` is in place, but there's no log aggregation or alerting setup.

### What I'd add with more time

- **Refresh token rotation** with a `refresh_tokens` table and short-lived access tokens.
- **WebSocket / SSE** for real-time task updates — the architecture would accommodate this cleanly with a pub/sub layer (Redis or in-process).
- **Drag-and-drop** status columns (Kanban view) — the data model supports it; it's a frontend investment.
- **Full test suite** — table-driven unit tests for handlers, integration tests per endpoint, and a test factory for seeding fixture data.
- **Pagination on all list endpoints**, not just tasks.
- **Soft deletes** — instead of hard-deleting tasks/projects, set a `deleted_at` timestamp so data is recoverable.
- **Audit log** — track who changed what and when, especially for task status transitions.
- **CI pipeline** — GitHub Actions with lint, test, and Docker build checks on every PR.
- **Production Dockerfile improvements** — distroless base image, non-root user, read-only filesystem.
