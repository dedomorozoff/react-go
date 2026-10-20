# react-go Starter Kit

A full-stack project template with a Go (Golang) backend and a React 19 (Vite) frontend, designed to provide a Laravel-like developer experience.

## Features

- **Monolith Structure**: Frontend and backend in a single repository.
- **Modern Tech Stack**: Go 1.26+, React 19 (hooks), Vite, zustand, React Router, Axios.
- **Embedded Frontend**: In production, the React application is embedded into the Go binary using `go:embed`.
- **Developer Friendly**: 
    - Automated proxy in dev mode (Vite -> Go).
    - Shared management via `Makefile` (`setup`, `dev`, `build`, `vet`, `test`, `docker-build`).
    - SPA routing support out of the box.
    - Cross-platform scripts (`scripts/prepare.go`, `scripts/clean.go`) — no bash required on Windows.
- **Ready-to-go Auth**: JWT authentication (with `JWT_EXPIRES_IN` support) + zustand store + Axios client with global 401 handling.
- **Projects CRUD**: Search, status filter, pagination, create/edit modal, delete, live dashboard stats.
- **Production-ready bits**: CORS from env (no wildcard with credentials), `RequestID`/`RealIP`/`Timeout` middleware, `slog`, graceful shutdown, real DB health check, unified JSON errors, `Dockerfile` + CI.

## Project Structure

```text
.
├── main.go           # Go entry point (chi + embed + graceful shutdown)
├── frontend/         # React application (Vite)
│   └── src/api/      # Shared axios client + resource modules
├── internal/         # Backend business logic
│   ├── auth/         # JWT generate/verify middleware
│   ├── handlers/     # HTTP handlers + JSON helpers
│   ├── models/       # GORM models
│   └── server/routes # Route registration
├── scripts/          # prepare.go (env + dist stub), clean.go
├── Dockerfile        # Multi-stage build (node -> go -> alpine)
├── .github/workflows # CI: go vet + frontend build
├── Makefile          # Main command center
└── go.mod            # Go module definition
```

## Quick Start (One-liner)

You can scaffold a new project using `degit`. This will download the template without the git history:

```bash
npx degit dedomorozoff/react-go my-project && cd my-project && make setup
```

> **Note:** You can also click the **"Use this template"** button on GitHub to create a new repository based on this one.

## Getting Started

### Prerequisites

- Go (1.26 or later)
- Node.js (v20+) & npm

### Installation

The fastest way to get everything ready is:

```bash
make setup
```

This command automates:
1. Installing backend and frontend dependencies.
2. Preparing the environment (cross-platform).
3. Running database migrations.
4. Setting up the Admin user (interactive).
5. Seeding initial data.

#### Manual Installation (Optional)

If you want to run steps separately:

```bash
make install
make migrate
make admin
make seed
```

### Development

Run both backend and frontend simultaneously with Hot Module Replacement (HMR):

```bash
make dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080 (Proxied via frontend)
- **Admin**: http://localhost:5173/admin

### Production Build

Create a single executable binary containing the embedded frontend:

```bash
make build
```
The resulting binary will be in `bin/server`.

### Extra Commands

```bash
make vet          # go vet backend packages
make test         # go test backend packages
make clean        # cross-platform cleanup (Go script, Windows-safe)
make docker-build # build production Docker image
```

## Configuration

The project uses environment variables for configuration. You can find all available options in `.env.example`.

To customize your project:
1. Copy `.env.example` to `.env` (or let `make setup` / `prepare.go` generate it — a random `JWT_SECRET` is created automatically).
2. Update the values in `.env`.

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_PORT` | The port the server listens on | `8080` |
| `ALLOWED_ORIGINS` | CORS origins, comma-separated (no `*` with credentials) | `http://localhost:5173,http://localhost:3000` |
| `DB_PATH` | Path to the SQLite database file | `app.db` |
| `JWT_SECRET` | Secret key for signing JWT tokens (must be strong, never default) | _(generated)_ |
| `JWT_EXPIRES_IN` | Token lifetime, Go duration (`24h`, `720h`...) | `24h` |

##  API Endpoints

- `GET /api/health`: Health check (`{status, message, database}`).
- `POST /api/auth/login`: Authentication (`{username, password}` → `{token, user}`).
- `GET /api/auth/me`: Current user (protected).
- `GET /api/dashboard/stats`: Live counts (`{total, active, completed, pending}`) (protected).
- `GET /api/projects?search&status&page&per_page`: Paginated project list (protected).
- `POST /api/projects`: Create project (protected).
- `GET /api/projects/{id}`: Single project (protected).
- `PUT /api/projects/{id}`: Update project (protected).
- `DELETE /api/projects/{id}`: Delete project (protected).

Errors are unified JSON: `{"error": "message"}`.

##  License

MIT
