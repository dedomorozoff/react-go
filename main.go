package main

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/dedomorozoff/react-go/internal/database"
	"github.com/dedomorozoff/react-go/internal/server"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

//go:embed all:frontend/dist
var frontendFS embed.FS

func main() {
	// Load .env file
	_ = godotenv.Load()

	// Initialize Database connection
	database.InitDB()
	database.Migrate()

	// Handle flags
	for _, arg := range os.Args {
		switch arg {
		case "--migrate":
			fmt.Println("Migration completed.")
			return
		case "--seed":
			database.Seed()
			fmt.Println("Seeding completed.")
			return
		case "--set-admin":
			database.SetAdmin()
			fmt.Println("Admin user updated.")
			return
		}
	}

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	allowedOrigins := parseOrigins(os.Getenv("ALLOWED_ORIGINS"))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// API Routes
	r.Route("/api", server.RegisterRoutes)

	// Frontend serving
	// Check if we are in production or dev
	// In dev, we usually run Vite separately, but Go can still serve static if needed
	distFS, err := fs.Sub(frontendFS, "frontend/dist")
	if err != nil {
		log.Fatal(err)
	}

	// SPA File Server
	fileServer := http.FileServer(http.FS(distFS))

	r.Handle("/*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If the request is for a file that exists in the embedded FS, serve it
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}

		_, err := distFS.Open(path)
		if err != nil {
			// File not found, serve index.html for SPA routing
			index, _ := distFS.Open("index.html")
			if index == nil {
				// If not built yet, show a friendly message
				w.WriteHeader(http.StatusNotFound)
				fmt.Fprintf(w, "Frontend not built yet. Run 'npm run build' in the frontend folder.")
				return
			}
			index.Close()

			// Re-open index.html to serve it
			r.URL.Path = "/index.html"
		}
		fileServer.ServeHTTP(w, r)
	}))

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{Addr: ":" + port, Handler: r}

	go func() {
		slog.Info("server starting", "port", port, "origins", allowedOrigins)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()
	fmt.Printf("Server starting on http://localhost:%s\n", port)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	slog.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("server forced to shutdown: %v", err)
	}
	slog.Info("server stopped")
}

func parseOrigins(raw string) []string {
	if strings.TrimSpace(raw) == "" {
		return []string{"http://localhost:5173", "http://localhost:3000"}
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	if len(out) == 0 {
		return []string{"http://localhost:5173"}
	}
	return out
}
