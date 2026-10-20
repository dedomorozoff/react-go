package routes

import (
	"github.com/dedomorozoff/react-go/internal/handlers"
	"github.com/go-chi/chi/v5"
)

func RegisterHealthRoutes(r chi.Router) {
	r.Get("/health", handlers.HealthCheck)
}
