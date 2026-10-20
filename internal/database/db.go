package database

import (
	"fmt"
	"log"
	"os"

	"github.com/dedomorozoff/react-go/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "app.db"
	}

	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
}

func Migrate() {
	err := DB.AutoMigrate(&models.Project{}, &models.User{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
}

func Seed() {
	var count int64
	DB.Model(&models.Project{}).Count(&count)
	if count == 0 {
		projects := []models.Project{
			{Title: "react-go Starter", Description: "Initial project setup", Status: "Completed"},
			{Title: "Database Integration", Description: "Add SQLite and GORM", Status: "Active"},
			{Title: "Premium UI", Description: "Make it look stunning", Status: "Active"},
		}
		DB.Create(&projects)
		log.Println("Seeded projects data.")
	}
}

func SetAdmin() {
	adminPass := os.Getenv("ADMIN_PASSWORD")
	if adminPass == "" {
		fmt.Print("Enter new admin password: ")
		fmt.Scanln(&adminPass)
		if adminPass == "" {
			adminPass = "password123"
			fmt.Println("No password entered, using default: password123")
		}
	}

	var user models.User
	result := DB.Where("username = ?", "admin").First(&user)
	
	if result.Error != nil {
		// Create new admin
		admin := models.User{
			Username: "admin",
			Password: adminPass,
		}
		admin.HashPassword()
		DB.Create(&admin)
		log.Printf("Created admin user: admin / %s\n", adminPass)
	} else {
		// Update existing admin password
		user.Password = adminPass
		user.HashPassword()
		DB.Save(&user)
		log.Printf("Updated admin password for: admin / %s\n", adminPass)
	}
}
