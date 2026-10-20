package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type ctxKey string

// UserContextKey is the typed context key for claims — avoids collisions.
const UserContextKey ctxKey = "user"

func getSecret() ([]byte, error) {
	secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if secret == "" || secret == "your-super-secret-key-change-it-in-production" || secret == "your-very-secret-key-fallback" {
		return nil, errMissingSecret
	}
	return []byte(secret), nil
}

func getExpiry() time.Duration {
	raw := strings.TrimSpace(os.Getenv("JWT_EXPIRES_IN"))
	if raw == "" {
		return 24 * time.Hour
	}
	d, err := time.ParseDuration(raw)
	if err != nil || d <= 0 {
		return 24 * time.Hour
	}
	return d
}

type Claims struct {
	UserID uint   `json:"user_id"`
	User   string `json:"user"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, username string) (string, error) {
	secret, err := getSecret()
	if err != nil {
		return "", err
	}
	now := time.Now()
	claims := &Claims{
		UserID: userID,
		User:   username,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(getExpiry())),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

func writeJSONError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeJSONError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			writeJSONError(w, "Invalid token format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]
		claims := &Claims{}

		secret, err := getSecret()
		if err != nil {
			writeJSONError(w, "Server misconfigured", http.StatusInternalServerError)
			return
		}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errInvalidMethod
			}
			return secret, nil
		})

		if err != nil || !token.Valid {
			writeJSONError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Add claims to context with typed key
		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// ClaimsFromContext is a helper for handlers to get current user.
func ClaimsFromContext(ctx context.Context) (*Claims, bool) {
	c, ok := ctx.Value(UserContextKey).(*Claims)
	return c, ok
}
