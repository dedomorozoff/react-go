package auth

import "errors"

var (
	errMissingSecret = errors.New("JWT_SECRET is not set or is insecure default")
	errInvalidMethod = errors.New("unexpected signing method")
)
