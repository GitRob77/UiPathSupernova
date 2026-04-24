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
	"sync"
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

type RequestEntry struct {
	Method      string `json:"method"`
	URL         string `json:"url"`
	MimeType    string `json:"mime_type,omitempty"`
	HasBody     bool   `json:"has_body"`
}

type SessionRequests struct {
	SessionID string           `json:"session_id"`
	Requests  []RequestEntry   `json:"requests"`
}

type ReplayJobStart struct {
	JobID  string `json:"job_id"`
	Status string `json:"status"`
}

type ReplayJobStatus struct {
	JobID       string `json:"job_id"`
	SessionID   string `json:"session_id"`
	Status      string `json:"status"`
	StartedAt   time.Time `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

type ResultDetail struct {
	ID            string `json:"id"`
	Seq           int    `json:"seq"`
	Method        string `json:"method"`
	URL           string `json:"url"`
	ExpectedStatus int   `json:"expected_status"`
	ActualStatus  *int   `json:"actual_status"`
	ResponseTimeMs *int   `json:"response_time_ms"`
	Passed        bool   `json:"passed"`
	ErrorMessage  *string `json:"error_message"`
}

type ResultsList struct {
	JobID   string          `json:"job_id"`
	Results []ResultDetail  `json:"results"`
}

type JobState struct {
	Status      string
	StartedAt   time.Time
	CompletedAt *time.Time
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
	schemas := []string{
		`CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			har_path TEXT NOT NULL,
			base_url TEXT NOT NULL DEFAULT 'http://localhost:3000',
			request_count INTEGER NOT NULL DEFAULT 0,
			created_at DATETIME NOT NULL,
			last_replayed_at DATETIME
		);`,
		`CREATE TABLE IF NOT EXISTS requests (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
			seq INTEGER NOT NULL,
			method TEXT NOT NULL,
			url TEXT NOT NULL,
			expected_status INTEGER NOT NULL,
			request_headers TEXT,
			request_body TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS replay_jobs (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL REFERENCES sessions(id),
			status TEXT NOT NULL DEFAULT 'running',
			started_at DATETIME NOT NULL,
			completed_at DATETIME
		);`,
		`CREATE TABLE IF NOT EXISTS results (
			id TEXT PRIMARY KEY,
			job_id TEXT NOT NULL REFERENCES replay_jobs(id),
			request_id TEXT NOT NULL REFERENCES requests(id),
			seq INTEGER NOT NULL,
			url TEXT NOT NULL,
			method TEXT NOT NULL,
			expected_status INTEGER NOT NULL,
			actual_status INTEGER,
			response_time_ms INTEGER,
			passed BOOLEAN NOT NULL DEFAULT FALSE,
			error_message TEXT
		);`,
	}

	for _, schema := range schemas {
		if _, err := db.Exec(schema); err != nil {
			return err
		}
	}
	return nil
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

func getSessionRequestsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionID := chi.URLParam(r, "id")

		query := `SELECT id, name, har_path FROM sessions WHERE id = ?`
		row := db.QueryRow(query, sessionID)

		var session Session
		err := row.Scan(&session.ID, &session.Name, &session.HARPath)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Session not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to query session", http.StatusInternalServerError)
			}
			return
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

		requests := []RequestEntry{}
		for _, entry := range har.Log.Entries {
			mimeType := ""
			if entry.Request.Body != nil {
				mimeType = entry.Request.Body.MimeType
			}
			req := RequestEntry{
				Method:   entry.Request.Method,
				URL:      entry.Request.URL,
				MimeType: mimeType,
				HasBody:  entry.Request.Body != nil && entry.Request.Body.Text != "",
			}
			requests = append(requests, req)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(SessionRequests{
			SessionID: sessionID,
			Requests:  requests,
		})
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

		harData, err := io.ReadAll(file)
		if err != nil {
			http.Error(w, "Failed to read HAR file", http.StatusBadRequest)
			return
		}

		f2, err := os.Create(harPath)
		if err != nil {
			http.Error(w, "Failed to save HAR file", http.StatusInternalServerError)
			return
		}

		_, err = f2.Write(harData)
		f2.Close()
		if err != nil {
			os.Remove(harPath)
			http.Error(w, "Failed to save HAR file", http.StatusInternalServerError)
			return
		}

		var har HAR
		if err := json.Unmarshal(harData, &har); err != nil {
			os.Remove(harPath)
			http.Error(w, "Invalid HAR file format", http.StatusBadRequest)
			return
		}

		requestCount := len(har.Log.Entries)

		query := `
			INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`
		_, err = db.Exec(query, sessionID, sessionName, harPath, baseURL, requestCount, time.Now())
		if err != nil {
			os.Remove(harPath)
			http.Error(w, "Failed to create session", http.StatusInternalServerError)
			return
		}

		insertReq := `INSERT INTO requests (id, session_id, seq, method, url, expected_status) VALUES (?, ?, ?, ?, ?, ?)`
		for idx, entry := range har.Log.Entries {
			requestID := fmt.Sprintf("req_%s_%d", sessionID, idx)
			expectedStatus := 200
			db.Exec(insertReq, requestID, sessionID, idx+1, entry.Request.Method, entry.Request.URL, expectedStatus)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		session := Session{
			ID:           sessionID,
			Name:         sessionName,
			HARPath:      harPath,
			BaseURL:      baseURL,
			RequestCount: requestCount,
			CreatedAt:    time.Now(),
		}
		json.NewEncoder(w).Encode(session)
	}
}

var jobStates = &sync.Map{}

func startReplayJobHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionID := chi.URLParam(r, "id")

		var replayReq ReplayRequest
		if r.Body != nil {
			defer r.Body.Close()
			json.NewDecoder(r.Body).Decode(&replayReq)
		}

		query := `SELECT id, name, har_path, base_url FROM sessions WHERE id = ?`
		row := db.QueryRow(query, sessionID)

		var session Session
		err := row.Scan(&session.ID, &session.Name, &session.HARPath, &session.BaseURL)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Session not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to query session", http.StatusInternalServerError)
			}
			return
		}

		jobID := fmt.Sprintf("job_%d", time.Now().UnixNano())
		now := time.Now()

		jobStates.Store(jobID, &JobState{
			Status:    "running",
			StartedAt: now,
		})

		insertJob := `INSERT INTO replay_jobs (id, session_id, status, started_at) VALUES (?, ?, ?, ?)`
		_, err = db.Exec(insertJob, jobID, sessionID, "running", now)
		if err != nil {
			http.Error(w, "Failed to create replay job", http.StatusInternalServerError)
			return
		}

		effectiveBaseURL := session.BaseURL
		if replayReq.BaseURL != "" {
			effectiveBaseURL = replayReq.BaseURL
		}

		go executeReplayJob(db, jobID, session, effectiveBaseURL)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(ReplayJobStart{
			JobID:  jobID,
			Status: "running",
		})
	}
}

func executeReplayJob(db *sql.DB, jobID string, session Session, baseURL string) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic in replay job %s: %v", jobID, r)
		}
	}()

	harData, err := os.ReadFile(session.HARPath)
	if err != nil {
		updateJobStatus(db, jobID, "failed")
		jobStates.Store(jobID, &JobState{Status: "failed", StartedAt: time.Now(), CompletedAt: &time.Time{}})
		return
	}

	var har HAR
	if err := json.Unmarshal(harData, &har); err != nil {
		updateJobStatus(db, jobID, "failed")
		jobStates.Store(jobID, &JobState{Status: "failed", StartedAt: time.Now(), CompletedAt: &time.Time{}})
		return
	}

	insertResult := `INSERT INTO results (id, job_id, request_id, seq, url, method, expected_status, actual_status, response_time_ms, passed, error_message)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	for idx, entry := range har.Log.Entries {
		resultID := fmt.Sprintf("result_%d_%d", time.Now().UnixNano(), idx)

		requestID := fmt.Sprintf("req_%s_%d", session.ID, idx)

		expectedStatus := 200

		rebasedURL, err := rebaseURL(entry.Request.URL, baseURL)
		if err != nil {
			db.Exec(insertResult, resultID, jobID, requestID, idx+1, entry.Request.URL, entry.Request.Method, expectedStatus, nil, nil, false, fmt.Sprintf("URL rebase failed: %v", err))
			continue
		}

		start := time.Now()
		statusCode, errorMsg := executeRequest(entry.Request, rebasedURL)
		responseTime := int(time.Since(start).Milliseconds())

		passed := false
		var actualStatus *int
		var errorMsgPtr *string

		if statusCode > 0 {
			actualStatus = &statusCode
			passed = (statusCode == expectedStatus)
			if errorMsg != "" {
				passed = false
				errorMsgPtr = &errorMsg
			}
		} else if errorMsg != "" {
			errorMsgPtr = &errorMsg
		}

		db.Exec(insertResult, resultID, jobID, requestID, idx+1, rebasedURL, entry.Request.Method, expectedStatus, actualStatus, &responseTime, passed, errorMsgPtr)
	}

	updateJobStatus(db, jobID, "done")
	now := time.Now()
	jobStates.Store(jobID, &JobState{Status: "done", StartedAt: time.Now(), CompletedAt: &now})
}

func executeRequest(harReq HARRequest, rebasedURL string) (int, string) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	var bodyReader io.Reader
	if harReq.Body != nil && harReq.Body.Text != "" {
		bodyReader = strings.NewReader(harReq.Body.Text)
	}

	req, err := http.NewRequest(harReq.Method, rebasedURL, bodyReader)
	if err != nil {
		return 0, fmt.Sprintf("Request creation failed: %v", err)
	}

	for _, header := range harReq.Headers {
		if !isHopByHopHeader(header.Name) {
			req.Header.Set(header.Name, header.Value)
		}
	}

	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Sprintf("Request failed: %v", err)
	}
	defer resp.Body.Close()

	return resp.StatusCode, ""
}

func updateJobStatus(db *sql.DB, jobID, status string) {
	updateStmt := `UPDATE replay_jobs SET status = ?, completed_at = ? WHERE id = ?`
	db.Exec(updateStmt, status, time.Now(), jobID)
}

func replayStatusHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionID := chi.URLParam(r, "id")

		query := `SELECT id FROM sessions WHERE id = ?`
		row := db.QueryRow(query, sessionID)
		var id string
		err := row.Scan(&id)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Session not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to query session", http.StatusInternalServerError)
			}
			return
		}

		jobQuery := `SELECT id, status, started_at, completed_at FROM replay_jobs WHERE session_id = ? ORDER BY started_at DESC LIMIT 1`
		jobRow := db.QueryRow(jobQuery, sessionID)

		var jobID, status string
		var startedAt time.Time
		var completedAt *time.Time

		err = jobRow.Scan(&jobID, &status, &startedAt, &completedAt)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "No replay job found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to query job", http.StatusInternalServerError)
			}
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ReplayJobStatus{
			JobID:       jobID,
			SessionID:   sessionID,
			Status:      status,
			StartedAt:   startedAt,
			CompletedAt: completedAt,
		})
	}
}

func resultsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionID := chi.URLParam(r, "id")

		query := `SELECT id FROM sessions WHERE id = ?`
		row := db.QueryRow(query, sessionID)
		var id string
		err := row.Scan(&id)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Session not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to query session", http.StatusInternalServerError)
			}
			return
		}

		jobQuery := `SELECT id FROM replay_jobs WHERE session_id = ? ORDER BY started_at DESC LIMIT 1`
		jobRow := db.QueryRow(jobQuery, sessionID)

		var jobID string
		err = jobRow.Scan(&jobID)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "No replay job found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to query job", http.StatusInternalServerError)
			}
			return
		}

		resultsQuery := `SELECT id, seq, method, url, expected_status, actual_status, response_time_ms, passed, error_message FROM results WHERE job_id = ? ORDER BY seq ASC`
		rows, err := db.Query(resultsQuery, jobID)
		if err != nil {
			http.Error(w, "Failed to query results", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var results []ResultDetail
		for rows.Next() {
			var result ResultDetail
			err := rows.Scan(&result.ID, &result.Seq, &result.Method, &result.URL, &result.ExpectedStatus, &result.ActualStatus, &result.ResponseTimeMs, &result.Passed, &result.ErrorMessage)
			if err != nil {
				http.Error(w, "Failed to scan result", http.StatusInternalServerError)
				return
			}
			results = append(results, result)
		}

		if results == nil {
			results = []ResultDetail{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ResultsList{
			JobID:   jobID,
			Results: results,
		})
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
	router.Get("/api/sessions/{id}/requests", getSessionRequestsHandler(db))
	router.Post("/api/sessions/{id}/replay", startReplayJobHandler(db))
	router.Get("/api/sessions/{id}/replay/status", replayStatusHandler(db))
	router.Get("/api/sessions/{id}/results", resultsHandler(db))

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
