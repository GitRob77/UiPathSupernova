package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	_ "modernc.org/sqlite"
)

type Config struct {
	Port   int
	DBPath string
	HARDir string
}

type HealthResponse struct {
	Status string `json:"status"`
}

type Session struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	HARPath      string    `json:"har_path"`
	BaseURL      string    `json:"base_url"`
	RequestCount int       `json:"request_count"`
	CreatedAt    time.Time `json:"created_at"`
	ReplayedAt   *time.Time `json:"last_replayed_at"`
}

type SessionCreateRequest struct {
	Name    string `json:"name"`
	BaseURL string `json:"base_url"`
}

type ReplayRequest struct {
	BaseURL string `json:"base_url"`
}

type HAREntry struct {
	Request HARRequest `json:"request"`
}

type HARRequest struct {
	Method  string      `json:"method"`
	URL     string      `json:"url"`
	Headers []HARHeader `json:"headers"`
	Body    *HARBody    `json:"postData"`
}

type HARBody struct {
	MimeType string `json:"mimeType"`
	Text     string `json:"text"`
}

type HARHeader struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type HAR struct {
	Log HARLog `json:"log"`
}

type HARLog struct {
	Entries []HAREntry `json:"entries"`
}

type ReplayResult struct {
	URL        string `json:"url"`
	StatusCode int    `json:"status_code"`
	Error      string `json:"error,omitempty"`
}

type ReplayResponse struct {
	SessionID string          `json:"session_id"`
	Results   []ReplayResult  `json:"results"`
}

func rebaseURL(capturedURL string, baseURL string) (string, error) {
	parsedCaptured, err := url.Parse(capturedURL)
	if err != nil {
		return "", err
	}

	parsedBase, err := url.Parse(baseURL)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s://%s%s", parsedBase.Scheme, parsedBase.Host, parsedCaptured.Path) +
		ifEmpty(parsedCaptured.RawQuery, "", "?"+parsedCaptured.RawQuery), nil
}

func ifEmpty(s string, empty, notEmpty string) string {
	if s == "" {
		return empty
	}
	return notEmpty
}

func loadConfig() Config {
	port := 8080
	if p := os.Getenv("PORT"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil {
			port = parsed
		}
	}

	dbPath := "./supernova.db"
	if d := os.Getenv("DB_PATH"); d != "" {
		dbPath = d
	}

	harDir := "./har-files"
	if h := os.Getenv("HAR_DIR"); h != "" {
		harDir = h
	}

	return Config{
		Port:   port,
		DBPath: dbPath,
		HARDir: harDir,
	}
}

func initDB(dbPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	if err := createSchema(db); err != nil {
		return nil, fmt.Errorf("failed to create schema: %w", err)
	}

	return db, nil
}

func createSchema(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS sessions (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		har_path TEXT NOT NULL,
		base_url TEXT NOT NULL DEFAULT 'http://localhost:3000',
		request_count INTEGER NOT NULL DEFAULT 0,
		created_at DATETIME NOT NULL,
		last_replayed_at DATETIME
	);
	`
	_, err := db.Exec(schema)
	return err
}

func createHARDir(harDir string) error {
	return os.MkdirAll(harDir, 0755)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(HealthResponse{Status: "ok"})
}

func getSessionHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionID := chi.URLParam(r, "id")

		query := `SELECT id, name, har_path, base_url, request_count, created_at, last_replayed_at FROM sessions WHERE id = ?`
		row := db.QueryRow(query, sessionID)

		var session Session
		err := row.Scan(&session.ID, &session.Name, &session.HARPath, &session.BaseURL, &session.RequestCount, &session.CreatedAt, &session.ReplayedAt)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Session not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to query session", http.StatusInternalServerError)
			}
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(session)
	}
}

func listSessionsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		query := `SELECT id, name, request_count, created_at, last_replayed_at FROM sessions ORDER BY created_at DESC`
		rows, err := db.Query(query)
		if err != nil {
			http.Error(w, "Failed to query sessions", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var sessions []Session
		for rows.Next() {
			var session Session
			err := rows.Scan(&session.ID, &session.Name, &session.RequestCount, &session.CreatedAt, &session.ReplayedAt)
			if err != nil {
				http.Error(w, "Failed to scan session", http.StatusInternalServerError)
				return
			}
			sessions = append(sessions, session)
		}

		if sessions == nil {
			sessions = []Session{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(sessions)
	}
}

func replaySessionHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionID := chi.URLParam(r, "id")

		var replayReq ReplayRequest
		if r.Body != nil {
			defer r.Body.Close()
			json.NewDecoder(r.Body).Decode(&replayReq)
		}

		query := `SELECT id, name, har_path, base_url, request_count, created_at, last_replayed_at FROM sessions WHERE id = ?`
		row := db.QueryRow(query, sessionID)

		var session Session
		err := row.Scan(&session.ID, &session.Name, &session.HARPath, &session.BaseURL, &session.RequestCount, &session.CreatedAt, &session.ReplayedAt)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Session not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to query session", http.StatusInternalServerError)
			}
			return
		}

		effectiveBaseURL := session.BaseURL
		if replayReq.BaseURL != "" {
			effectiveBaseURL = replayReq.BaseURL
		}

		harData, err := os.ReadFile(session.HARPath)
		if err != nil {
			http.Error(w, "Failed to read HAR file", http.StatusInternalServerError)
			return
		}

		var har HAR
		if err := json.Unmarshal(harData, &har); err != nil {
			http.Error(w, "Failed to parse HAR file", http.StatusBadRequest)
			return
		}

		results := []ReplayResult{}
		for _, entry := range har.Log.Entries {
			replayResult := replayRequest(entry.Request, effectiveBaseURL)
			results = append(results, replayResult)
		}

		updateStmt := `UPDATE sessions SET last_replayed_at = ? WHERE id = ?`
		db.Exec(updateStmt, time.Now(), sessionID)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ReplayResponse{
			SessionID: sessionID,
			Results:   results,
		})
	}
}

func replayRequest(harReq HARRequest, baseURL string) ReplayResult {
	rebasedURL, err := rebaseURL(harReq.URL, baseURL)
	if err != nil {
		return ReplayResult{
			URL:   harReq.URL,
			Error: fmt.Sprintf("URL rebase failed: %v", err),
		}
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	var bodyReader io.Reader
	if harReq.Body != nil && harReq.Body.Text != "" {
		bodyReader = strings.NewReader(harReq.Body.Text)
	}

	req, err := http.NewRequest(harReq.Method, rebasedURL, bodyReader)
	if err != nil {
		return ReplayResult{
			URL:   rebasedURL,
			Error: fmt.Sprintf("Request creation failed: %v", err),
		}
	}

	for _, header := range harReq.Headers {
		if !isHopByHopHeader(header.Name) {
			req.Header.Set(header.Name, header.Value)
		}
	}

	resp, err := client.Do(req)
	if err != nil {
		return ReplayResult{
			URL:   rebasedURL,
			Error: fmt.Sprintf("Request failed: %v", err),
		}
	}
	defer resp.Body.Close()

	return ReplayResult{
		URL:        rebasedURL,
		StatusCode: resp.StatusCode,
	}
}

func isHopByHopHeader(name string) bool {
	hopByHop := map[string]bool{
		"connection":          true,
		"keep-alive":          true,
		"proxy-authenticate":  true,
		"proxy-authorization": true,
		"te":                  true,
		"trailers":            true,
		"transfer-encoding":   true,
		"upgrade":             true,
	}
	return hopByHop[strings.ToLower(name)]
}

func createSessionHandler(db *sql.DB, harDir string) http.HandlerFunc {
	const maxHARSize = 100 * 1024 * 1024

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		if r.ContentLength > maxHARSize {
			http.Error(w, "HAR file exceeds 100 MB limit", http.StatusRequestEntityTooLarge)
			return
		}

		if err := r.ParseMultipartForm(maxHARSize); err != nil {
			http.Error(w, "Failed to parse form data", http.StatusBadRequest)
			return
		}

		file, header, err := r.FormFile("har_file")
		if err != nil {
			http.Error(w, "No HAR file provided", http.StatusBadRequest)
			return
		}
		defer file.Close()

		if header.Size > maxHARSize {
			http.Error(w, "HAR file exceeds 100 MB limit", http.StatusRequestEntityTooLarge)
			return
		}

		sessionName := r.FormValue("name")
		if sessionName == "" {
			http.Error(w, "Session name is required", http.StatusBadRequest)
			return
		}

		baseURL := r.FormValue("base_url")
		if baseURL == "" {
			baseURL = "http://localhost:3000"
		}

		sessionID := fmt.Sprintf("session_%d", time.Now().UnixNano())
		harPath := fmt.Sprintf("%s/%s.har", harDir, sessionID)

		f, err := os.Create(harPath)
		if err != nil {
			http.Error(w, "Failed to save HAR file", http.StatusInternalServerError)
			return
		}
		defer f.Close()

		if _, err := io.Copy(f, file); err != nil {
			os.Remove(harPath)
			http.Error(w, "Failed to save HAR file", http.StatusInternalServerError)
			return
		}

		query := `
			INSERT INTO sessions (id, name, har_path, base_url, created_at)
			VALUES (?, ?, ?, ?, ?)
		`
		_, err = db.Exec(query, sessionID, sessionName, harPath, baseURL, time.Now())
		if err != nil {
			os.Remove(harPath)
			http.Error(w, "Failed to create session", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		session := Session{
			ID:        sessionID,
			Name:      sessionName,
			HARPath:   harPath,
			BaseURL:   baseURL,
			CreatedAt: time.Now(),
		}
		json.NewEncoder(w).Encode(session)
	}
}

func main() {
	cfg := loadConfig()

	db, err := initDB(cfg.DBPath)
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.Close()

	if err := createHARDir(cfg.HARDir); err != nil {
		log.Fatalf("Failed to create HAR directory: %v", err)
	}

	router := chi.NewRouter()

	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	router.Get("/health", healthHandler)
	router.Get("/api/sessions", listSessionsHandler(db))
	router.Post("/api/sessions", createSessionHandler(db, cfg.HARDir))
	router.Get("/api/sessions/{id}", getSessionHandler(db))
	router.Post("/api/sessions/{id}/replay", replaySessionHandler(db))

	addr := fmt.Sprintf(":%d", cfg.Port)
	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		log.Printf("Server starting on %s", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	<-sigChan
	log.Println("Shutting down gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}

	log.Println("Server stopped")
}
