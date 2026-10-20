# ---- frontend ----
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- backend ----
FROM golang:1.25-alpine AS backend
WORKDIR /app
RUN apk add --no-cache gcc musl-dev sqlite-libs
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend /app/frontend/dist ./frontend/dist
RUN go build -o /server .

# ---- runtime ----
FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache sqlite-libs ca-certificates
COPY --from=backend /server /app/server
EXPOSE 8080
ENV APP_PORT=8080 DB_PATH=/data/app.db
VOLUME ["/data"]
CMD ["/app/server"]
