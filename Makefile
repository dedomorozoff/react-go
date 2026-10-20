# Admin commands
.PHONY: install dev build test vet lint clean migrate seed admin setup docker-build

setup: install migrate admin seed
	@echo "Setup complete! Run 'make dev' to start."

install:
	@echo "Installing backend dependencies..."
	go mod download
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

dev-backend:
	@go run scripts/prepare.go
	@echo "Starting Go backend..."
	go run main.go

dev-frontend:
	@echo "Starting React frontend..."
	cd frontend && npm run dev

dev:
	@echo "Starting both backend and frontend..."
	make -j 2 dev-backend dev-frontend

migrate:
	@go run scripts/prepare.go
	@echo "Running migrations..."
	go run main.go --migrate

seed:
	@go run scripts/prepare.go
	@echo "Seeding initial data..."
	go run main.go --seed

admin:
	@go run scripts/prepare.go
	@go run main.go --set-admin

build:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Building backend..."
	go build -o bin/server main.go

vet:
	go vet ./internal/auth/ ./internal/models/ ./internal/server/... .

test:
	go test ./internal/auth/ ./internal/models/ ./internal/server/... .

docker-build:
	docker build -t react-go:latest .

clean:
	go run scripts/clean.go
