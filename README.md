# TaskFlow — Backend

A RESTful API for the TaskFlow task management system. Handles authentication, project management, and task tracking with role-based access control.

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

TaskFlow backend is a **Node.js + TypeScript** REST API that powers user authentication, project creation, and task management. It connects to a **Neon PostgreSQL** (serverless cloud Postgres) database and is containerized with Docker.

### Tech Stack

| Layer            | Technology                                          |
|------------------|------------------------------------------------------|
| Runtime          | Node.js + TypeScript                                 |
| Framework        | Express.js                                           |
| Database         | Neon PostgreSQL (serverless cloud Postgres)           |
| Auth             | JWT (HS256, 24h expiry) + bcrypt (cost 12)           |
| Migrations       | Custom migration runner (`scripts/migrate.ts`)        |
| DB Driver        | Raw SQL via `pg` / `postgres` driver                 |
| Containerization | Docker + Docker Compose                              |

### Folder Structure

```
backend/
├── build/                    # Compiled JS output (tsc)
├── migrations/               # SQL migration files (up + down)
├── scripts/
│   └── migrate.ts            # Migration runner script
├── src/
│   ├── api/                  # Route definitions
│   ├── config/
│   │   ├── db.ts             # Neon DB connection setup
│   │   └── env.ts            # Environment variable validation
│   ├── constants/            # App-wide constants (enums, status codes, etc.)
│   ├── controllers/          # Request handlers (thin layer, delegates to services)
│   ├── datalayer/            # Raw SQL queries (repository pattern)
│   ├── helpers/              # Utility functions (JWT, hashing, response helpers)
│   ├── interfaces/           # TypeScript interfaces and types
│   ├── loaders/              # App initialization (DB, middleware, routes)
│   ├── middlewares/          # Auth, error handling, validation middleware
│   ├── models/               # Data model definitions
│   ├── services/             # Business logic layer
│   ├── utility/
│   │   └── app_socket_serve  # WebSocket / socket setup
│   └── app.ts                # Express app entry point
├── .dockerignore
├── .env.example              # Example env vars (commit this, never .env)
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── start.sh                  # Container startup script (migrate + start)
└── tsconfig.json
```

---

## Architecture Decisions

### Node.js + TypeScript over Go

The project is built in Node.js + TypeScript. TypeScript provides strong compile-time safety — interfaces, enums, strict null checks — that keeps the codebase maintainable as it scales, without sacrificing Node.js's fast iteration speed. The spec permits any language; TypeScript was chosen as it's the team's primary backend language.

### Neon PostgreSQL (serverless cloud Postgres)

Neon is a serverless Postgres provider that is fully wire-compatible with standard PostgreSQL. This means the SQL and driver code are identical to self-hosted Postgres — no vendor lock-in at the query level. The key advantage for local development: **no Postgres container needed**. The API connects directly to the Neon cloud instance via a `DATABASE_URL` connection string in `.env`, keeping the Docker setup lightweight.

### Layered Architecture: Controller → Service → Datalayer

The codebase follows a strict three-layer separation:

- **Controllers** — parse the HTTP request, call the appropriate service, send the HTTP response. Zero business logic.
- **Services** — business logic, permission checks, and orchestration across multiple datalayer calls.
- **Datalayer** — raw SQL queries only. No business logic, no HTTP concerns. One function per query.

This makes each layer independently testable and easy to change in isolation.

### Raw SQL over ORM

All queries are written in raw SQL inside the datalayer. ORMs abstract away query behaviour in ways that make performance issues hard to diagnose. For a project this size, writing SQL directly is low overhead and produces more transparent, reviewable code.

### Custom Migration Runner

Migrations are managed via `scripts/migrate.ts` and plain `.sql` files in `migrations/`. This avoids adding a heavy CLI dependency and keeps the entire migration flow visible and version-controlled alongside the source code.

### What I intentionally left out

- **Refresh tokens** — 24h JWT expiry is fine for this scope; production needs short-lived access tokens + refresh rotation.
- **Email verification** — requires SMTP/email infra that is out of scope.
- **Rate limiting** — auth endpoints should have rate limits in production (e.g., `express-rate-limit`).
- **Generalized RBAC** — permissions are modelled explicitly per the spec (owner vs. assignee) rather than building a generic roles system.

---

## Running Locally

> **Prerequisites:** Docker and Docker Compose only. Node.js is not required on the host.

```bash
# 1. Clone the repository
git clone https://github.com/your-name/taskflow-backend
cd taskflow-backend

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL to your Neon connection string
# Set JWT_SECRET to a long random string

# 3. Start the API server
docker compose up
```

**API is available at: `http://localhost:3000`**

To run in detached mode:

```bash
docker compose up -d
```

To run without Docker (local dev with hot reload):

```bash
npm install
npm run dev       # starts nodemon / ts-node in watch mode
```

To compile and run the built output:

```bash
npm run build     # compiles TypeScript → build/
npm start         # runs build/app.js
```

---

## Environment Variables

Copy `.env.example` to `.env` and set the required values:

```bash
cp .env.example .env
```

| Variable       | Required | Description                                       | Example                                              |
|----------------|----------|---------------------------------------------------|------------------------------------------------------|
| `PORT`         | Yes      | Port the API listens on                           | `3000`                                               |
| `DATABASE_URL` | Yes      | Neon PostgreSQL connection string                 | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `JWT_SECRET`   | Yes      | Secret key used to sign JWTs                      | `a-very-long-random-secret-string`                   |
| `NODE_ENV`     | No       | Environment mode                                  | `development` / `production`                         |



---

## Running Migrations

Migrations run **automatically on container startup** via `start.sh` — no manual step is needed when using Docker.

To run migrations manually (e.g., against Neon from your local machine):

```bash
# Run all pending migrations (up)
npx ts-node scripts/migrate.ts up

# Roll back the last migration (down)
npx ts-node scripts/migrate.ts down
```

Migration files live in `migrations/` and follow this naming convention:

```
migrations/
├── 001_create_users.up.sql
├── 001_create_users.down.sql
├── 002_create_projects.up.sql
├── 002_create_projects.down.sql
├── 003_create_tasks.up.sql
└── 003_create_tasks.down.sql
```

Both `up` and `down` files exist for every migration, so rollbacks are always possible.

---

## Test Credentials

The seed script creates the following test data automatically on startup:

```
Email:    test@example.com
Password: password123
```

**Seeded data includes:**

- **1 user** — the credentials above
- **1 project** — "Website Redesign" owned by the test user
- **3 tasks** — one each in `todo`, `in_progress`, and `done` status

You can log in immediately using the test credentials without registering.

---

## API Reference

**Base URL:** `http://localhost:3000`

All protected endpoints require the following header:

```
Authorization: Bearer <token>
```

All responses use `Content-Type: application/json`.

---

### Auth

#### `POST /auth/register`

Register a new user.

**Request body:**
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

Log in with email and password.

**Request body:**
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
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

### Projects

#### `GET /projects`

List all projects the authenticated user owns or has tasks in.

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

**Request body:**
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

Update project name or description. **Project owner only.**

**Request body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response `200`:** Returns the updated project object.

---

#### `DELETE /projects/:id`

Delete a project and all its tasks. **Project owner only.**

**Response `204`:** No content.

---

#### `GET /projects/:id/stats`

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

List tasks for a project. Supports filtering and pagination.

**Query parameters:**

| Param      | Type   | Description                              |
|------------|--------|------------------------------------------|
| `status`   | string | `todo` \| `in_progress` \| `done`        |
| `assignee` | uuid   | Filter by assignee user ID               |
| `page`     | number | Page number (default: `1`)               |
| `limit`    | number | Results per page (default: `20`)         |

**Response `200`:**
```json
{
  "tasks": [],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

#### `POST /projects/:id/tasks`

Create a task within a project.

**Request body:**
```json
{
  "title": "Design homepage",
  "description": "Create wireframes and mockups",
  "priority": "high",
  "assignee_id": "uuid",
  "due_date": "2026-04-15"
}
```

**Response `201`:** Returns the created task object.

---

#### `PATCH /tasks/:id`

Update a task. All fields are optional.

**Request body:**
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

**Response `200`:** Returns the updated task object.

---

#### `DELETE /tasks/:id`

Delete a task. **Project owner or task creator only.**

**Response `204`:** No content.

---

### Error Responses

All errors follow a consistent shape:

| Status | When                              | Body                                                                         |
|--------|-----------------------------------|------------------------------------------------------------------------------|
| `400`  | Validation failed                 | `{ "error": "validation failed", "fields": { "email": "is required" } }`    |
| `401`  | Missing or invalid token          | `{ "error": "unauthorized" }`                                                |
| `403`  | Authenticated but not permitted   | `{ "error": "forbidden" }`                                                   |
| `404`  | Resource not found                | `{ "error": "not found" }`                                                   |

> Note: `401` and `403` are never conflated. Unauthenticated requests always get `401`; authenticated requests that lack permission always get `403`.

---

## What You'd Do With More Time

### Shortcuts taken

- **No refresh tokens.** The JWT is long-lived (24h). A production system needs short-lived access tokens (15min) and a refresh token rotation strategy stored in a `refresh_tokens` table.
- **No rate limiting.** The `/auth/login` and `/auth/register` endpoints are vulnerable to brute-force attacks without per-IP rate limits. `express-rate-limit` would be a quick addition.
- **Minimal test coverage.** Integration tests cover the core auth and task flows, but unit tests for individual service and datalayer functions were skipped due to time constraints.
- **No input sanitization layer.** Validation is done manually inside controllers. A `zod` schema layer declared once per resource would be cleaner and eliminate repetition.
- **Neon direct connection.** For production traffic, Neon's built-in PgBouncer connection pooler should be used to handle concurrency efficiently.

### What I'd add with more time

- **Zod schema validation** — declare schemas once per resource, derive TypeScript types from them, and use them in both route validation and controller logic.
- **Refresh token rotation** — short-lived access tokens + refresh tokens stored in the DB, rotated on each use, with revocation support.
- **Full test suite** — Jest + Supertest integration tests per endpoint, plus unit tests for services and datalayer functions using a dedicated test database on Neon.
- **Structured request logging** — log every request with method, path, status, duration, and a correlation ID for tracing across logs.
- **Soft deletes** — `deleted_at` timestamp on tasks and projects instead of hard deletes, making data recoverable.
- **CI pipeline** — GitHub Actions: lint, type-check (`tsc --noEmit`), and tests on every PR.
- **Real-time task updates via WebSocket** — the `app_socket_serve` utility is partially scaffolded; with more time I'd wire up task mutation events so connected clients see status changes without polling.
- **Audit log** — a `task_history` table recording who changed task status, when, and from what value — useful for project tracking and debugging.
