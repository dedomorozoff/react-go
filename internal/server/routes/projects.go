package routes

import (
	"github.com/dedomorozoff/react-go/internal/handlers"
	"github.com/go-chi/chi/v5"
)

func RegisterProjectRoutes(r chi.Router) {
	r.Get("/dashboard/stats", handlers.DashboardStats)
	r.Get("/projects", handlers.GetProjects)
	r.Post("/projects", handlers.CreateProject)
	r.Get("/projects/{id}", handlers.GetProject)
	r.Put("/projects/{id}", handlers.UpdateProject)
	r.Delete("/projects/{id}", handlers.DeleteProject)
}
