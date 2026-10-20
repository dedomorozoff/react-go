# React + Vite

This is the frontend part of the React-Go template. It's a React 19 SPA built with Vite.

It uses:
- **react-router** (v7) for client-side routing with auth guards
- **zustand** for the auth store (localStorage-backed JWT)
- **axios** with a global 401 interceptor
- **lucide-react** for icons

In dev mode (`npm run dev`, port `5173`) all `/api` requests are proxied to the Go backend at `http://localhost:8080`. In production the built SPA (`dist/`) gets embedded into the Go binary via `go:embed`.
