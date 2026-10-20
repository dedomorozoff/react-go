package server

import (
	"github.com/dedomorozoff/react-go/internal/auth"
	"github.com/dedomorozoff/react-go/internal/server/routes"
	"github.com/go-chi/chi/v5"
)

func RegisterRoutes(r chi.Router) {
	routes.RegisterHealthRoutes(r)
	routes.RegisterAuthRoutes(r)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(auth.JWTMiddleware)
		routes.RegisterProjectRoutes(r)
	})
}
