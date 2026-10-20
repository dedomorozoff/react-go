//go:build ignore

package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	removeAll(filepath.Join("frontend", "dist"))
	removeAll("bin")
	// keep placeholder so go:embed compiles on fresh clone
	dist := filepath.Join("frontend", "dist")
	_ = os.MkdirAll(dist, 0755)
	index := filepath.Join(dist, "index.html")
	if _, err := os.Stat(index); os.IsNotExist(err) {
		_ = os.WriteFile(index, []byte("<!DOCTYPE html><html><body>Placeholder</body></html>"), 0644)
	}
	fmt.Println("Cleaned.")
}

func removeAll(p string) {
	if err := os.RemoveAll(p); err != nil {
		fmt.Printf("warn: cannot remove %s: %v\n", p, err)
	}
}
