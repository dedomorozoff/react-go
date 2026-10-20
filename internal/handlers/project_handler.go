package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/dedomorozoff/react-go/internal/database"
	"github.com/dedomorozoff/react-go/internal/models"
	"github.com/go-chi/chi/v5"
)

var validStatuses = map[string]bool{"Active": true, "Pending": true, "Completed": true}

func GetProjects(w http.ResponseWriter, r *http.Request) {
	var projects []models.Project
	q := database.DB.Order("created_at DESC")

	if s := strings.TrimSpace(r.URL.Query().Get("search")); s != "" {
		like := "%" + s + "%"
		q = q.Where("title LIKE ? OR description LIKE ?", like, like)
	}
	if st := strings.TrimSpace(r.URL.Query().Get("status")); st != "" {
		q = q.Where("status = ?", st)
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	var total int64
	q.Model(&models.Project{}).Count(&total)
	q = q.Offset((page - 1) * perPage).Limit(perPage)

	if err := q.Find(&projects).Error; err != nil {
		WriteError(w, "Failed to fetch projects", http.StatusInternalServerError)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"data": projects, "page": page, "per_page": perPage, "total": total,
	})
}

func GetProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var p models.Project
	if err := database.DB.First(&p, id).Error; err != nil {
		WriteError(w, "Project not found", http.StatusNotFound)
		return
	}
	WriteJSON(w, http.StatusOK, p)
}

type projectInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

func validateProjectInput(in *projectInput) string {
	in.Title = strings.TrimSpace(in.Title)
	in.Description = strings.TrimSpace(in.Description)
	in.Status = strings.TrimSpace(in.Status)
	if in.Title == "" {
		return "Title is required"
	}
	if len(in.Title) > 200 {
		return "Title is too long (max 200)"
	}
	if in.Status == "" {
		in.Status = "Active"
	}
	if !validStatuses[in.Status] {
		return "Invalid status (Active, Pending, Completed)"
	}
	return ""
}

func CreateProject(w http.ResponseWriter, r *http.Request) {
	var in projectInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		WriteError(w, "Invalid request", http.StatusBadRequest)
		return
	}
	if msg := validateProjectInput(&in); msg != "" {
		WriteError(w, msg, http.StatusBadRequest)
		return
	}
	p := models.Project{Title: in.Title, Description: in.Description, Status: in.Status}
	if err := database.DB.Create(&p).Error; err != nil {
		WriteError(w, "Failed to create project", http.StatusInternalServerError)
		return
	}
	WriteJSON(w, http.StatusCreated, p)
}

func UpdateProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var p models.Project
	if err := database.DB.First(&p, id).Error; err != nil {
		WriteError(w, "Project not found", http.StatusNotFound)
		return
	}
	var in projectInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		WriteError(w, "Invalid request", http.StatusBadRequest)
		return
	}
	if msg := validateProjectInput(&in); msg != "" {
		WriteError(w, msg, http.StatusBadRequest)
		return
	}
	p.Title, p.Description, p.Status = in.Title, in.Description, in.Status
	if err := database.DB.Save(&p).Error; err != nil {
		WriteError(w, "Failed to update project", http.StatusInternalServerError)
		return
	}
	WriteJSON(w, http.StatusOK, p)
}

func DeleteProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := database.DB.Delete(&models.Project{}, id).Error; err != nil {
		WriteError(w, "Failed to delete project", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	dbOK := true
	if database.DB == nil {
		dbOK = false
	} else if sqlDB, err := database.DB.DB(); err != nil || sqlDB.Ping() != nil {
		dbOK = false
	}
	status := "ok"
	if !dbOK {
		status = "degraded"
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"status": status, "message": "Go API is alive", "database": dbOK,
	})
}

// DashboardStats returns live counts for the admin dashboard.
func DashboardStats(w http.ResponseWriter, r *http.Request) {
	var total, active, completed, pending int64
	database.DB.Model(&models.Project{}).Count(&total)
	database.DB.Model(&models.Project{}).Where("status = ?", "Active").Count(&active)
	database.DB.Model(&models.Project{}).Where("status = ?", "Completed").Count(&completed)
	database.DB.Model(&models.Project{}).Where("status = ?", "Pending").Count(&pending)
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"total": total, "active": active, "completed": completed, "pending": pending,
	})
}
