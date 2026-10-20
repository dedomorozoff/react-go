package routes

import (
	"github.com/dedomorozoff/react-go/internal/auth"
	"github.com/dedomorozoff/react-go/internal/handlers"
	"github.com/go-chi/chi/v5"
)

func RegisterAuthRoutes(r chi.Router) {
	r.Post("/auth/login", handlers.Login)
	r.With(auth.JWTMiddleware).Get("/auth/me", handlers.Me)
}
