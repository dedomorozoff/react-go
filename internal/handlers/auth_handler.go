package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/dedomorozoff/react-go/internal/auth"
	"github.com/dedomorozoff/react-go/internal/database"
	"github.com/dedomorozoff/react-go/internal/models"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, "Invalid request", http.StatusBadRequest)
		return
	}
	req.Username = strings.TrimSpace(req.Username)
	if req.Username == "" || req.Password == "" {
		WriteError(w, "Username and password are required", http.StatusBadRequest)
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		WriteError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if !user.CheckPassword(req.Password) {
		WriteError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := auth.GenerateToken(user.ID, user.Username)
	if err != nil {
		WriteError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	WriteJSON(w, http.StatusOK, LoginResponse{
		Token: token,
		User:  user,
	})
}

// Me returns current authenticated user.
func Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		WriteError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		WriteError(w, "User not found", http.StatusUnauthorized)
		return
	}
	WriteJSON(w, http.StatusOK, user)
}
