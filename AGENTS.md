# AI Agents Context

This file documents the AI agents (like Antigravity) that assist in the development of this project. It provides context, rules, and history to ensure consistent collaboration.

## 🤖 Current Agent: Antigravity

**Role**: Lead AI Developer / Pair Programmer
**Stack Expertise**: 
- Backend: Go (chi, gorm, embed)
- Frontend: React 19 (Vite, zustand, React Router, CSS Modules)
- Infrastructure: Make, Docker, CI/CD

### 📜 Project Guidelines for Agents

1.  **Uniformity**: Keep the "Laravel-like" feel. Commands should be centralized in the `Makefile` or root `package.json`.
2.  **Embedded First**: Always remember that the Go backend is responsible for serving the frontend in production via `go:embed`.
3.  **Clean Code**: Use `internal/` for Go logic to keep `cmd/` thin. Use React functional components and hooks for the frontend; per-view CSS Modules, shared design tokens live in `src/style.css`.
4.  **No Placeholders**: When adding features, provide working implementations or UI mocks using actual designs, not just "TODO" comments.

### 🛠 Active Workflows

- **Dev Workflow**: `make dev` runs both Vite and Go. Vite proxies `/api` to `:8080`.
- **Install Workflow**: `make install` -> `make migrate` -> `make admin` -> `make seed`.
- **Build Workflow**: `make build` compiles frontend, then builds Go with the static assets embedded.

### 📅 Session History Summary

- **2026-01-21**: Project initialization & Authentication. 
    - Set up Go server with `chi`, SQLite, and GORM.
    - Implemented JWT authentication and protected routes.
    - Created interactive `make admin` command and separate `migrate`/`seed` commands.
    - Refined UI with a premium Landing page and Admin dashboard.
- **2026-10-21**: Frontend migrated from Vue 3 to React 19.
    - Swapped Pinia for zustand (`stores/auth.js`, localStorage-backed), Vue Router for react-router v7 (`RequireAuth`/`GuestOnly` guards, `DocumentTitle` instead of `afterEach`).
    - Converted all views (Landing, Login, Dashboard, Projects CRUD, 404) and `AdminLayout` to JSX + CSS Modules; `api/client.js`, `src/style.css` and the Go backend were kept as-is.
    - Renamed the Go module to `github.com/dedomorozoff/react-go`; same build/dev commands (`make dev`, `make build`) and same `frontend/dist` embedding.
