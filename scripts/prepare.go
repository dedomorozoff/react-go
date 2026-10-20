//go:build ignore

package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	// 1. Create .env from .env.example if not exists
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		if _, err := os.Stat(".env.example"); err == nil {
			content, err := os.ReadFile(".env.example")
			if err == nil {
				text := string(content)
				if strings.Contains(text, "REPLACE_ME_GENERATE_RANDOM_32_BYTES") {
					secret := randomSecret(32)
					text = strings.ReplaceAll(text, "REPLACE_ME_GENERATE_RANDOM_32_BYTES", secret)
					fmt.Println("Generated random JWT_SECRET for .env")
				}
				if err := os.WriteFile(".env", []byte(text), 0600); err == nil {
					fmt.Println(".env file created from .env.example")
				}
			}
		}
	}

	distPath := filepath.Join("frontend", "dist")

	// Create directory
	err := os.MkdirAll(distPath, 0755)
	if err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		os.Exit(1)
	}

	// Create placeholder index.html
	indexPath := filepath.Join(distPath, "index.html")
	if _, err := os.Stat(indexPath); os.IsNotExist(err) {
		err = os.WriteFile(indexPath, []byte("<!DOCTYPE html><html><body>Placeholder</body></html>"), 0644)
		if err != nil {
			fmt.Printf("Error creating placeholder: %v\n", err)
			os.Exit(1)
		}
	}

	fmt.Println("Project environment prepared.")
}

func randomSecret(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "fallback-insecure-change-me"
	}
	return hex.EncodeToString(b)
}
