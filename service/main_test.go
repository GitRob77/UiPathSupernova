package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
)

// ============================================================================
// Unit Tests: URL Rebasing
// ============================================================================

func TestRebaseURL_ValidInputs(t *testing.T) {
	tests := []struct {
		name        string
		capturedURL string
		baseURL     string
		expected    string
	}{
		{
			name:        "simple path",
			capturedURL: "https://example.com/api/users",
			baseURL:     "http://localhost:3000",
			expected:    "http://localhost:3000/api/users",
		},
		{
			name:        "preserves query string",
			capturedURL: "https://example.com/api/users?id=123&name=test",
			baseURL:     "http://localhost:3000",
			expected:    "http://localhost:3000/api/users?id=123&name=test",
		},
		{
			name:        "preserves path segments",
			capturedURL: "https://example.com/api/v1/users/123/profile",
			baseURL:     "http://localhost:8080",
			expected:    "http://localhost:8080/api/v1/users/123/profile",
		},
		{
			name:        "handles root path",
			capturedURL: "https://example.com/",
			baseURL:     "http://localhost:3000",
			expected:    "http://localhost:3000/",
		},
		{
			name:        "handles path without leading slash",
			capturedURL: "https://example.com",
			baseURL:     "http://localhost:3000",
			expected:    "http://localhost:3000",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := rebaseURL(tt.capturedURL, tt.baseURL)
			if err != nil {
				t.Fatalf("rebaseURL failed: %v", err)
			}
			if result != tt.expected {
				t.Errorf("expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestRebaseURL_PreservesQueryString(t *testing.T) {
	captured := "https://api.example.com/search?q=golang&limit=10&offset=20"
	base := "http://localhost:3000"
	expected := "http://localhost:3000/search?q=golang&limit=10&offset=20"

	result, err := rebaseURL(captured, base)
	if err != nil {
		t.Fatalf("rebaseURL failed: %v", err)
	}
	if result != expected {
		t.Errorf("expected %s, got %s", expected, result)
	}
}

func TestRebaseURL_HandlesDifferentPorts(t *testing.T) {
	tests := []struct {
		name     string
		captured string
		base     string
		expected string
	}{
		{"port 8080", "https://example.com:5000/api", "http://localhost:8080", "http://localhost:8080/api"},
		{"port 443", "https://example.com/api", "https://localhost:443", "https://localhost:443/api"},
		{"no port in base", "https://example.com:5000/api", "http://localhost", "http://localhost/api"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := rebaseURL(tt.captured, tt.base)
			if err != nil {
				t.Fatalf("rebaseURL failed: %v", err)
			}
			if result != tt.expected {
				t.Errorf("expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestRebaseURL_InvalidInputs(t *testing.T) {
	tests := []struct {
		name        string
		capturedURL string
		baseURL     string
		shouldError bool
	}{
		{"invalid captured URL", "ht!tp://[invalid]", "http://localhost", true},
		{"invalid base URL", "https://example.com", "ht!tp://[invalid]", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := rebaseURL(tt.capturedURL, tt.baseURL)
			if (err != nil) != tt.shouldError {
				t.Errorf("error expectation mismatch: expected error=%v, got error=%v", tt.shouldError, err != nil)
			}
		})
	}
}

// ============================================================================
// Unit Tests: HAR Parsing
// ============================================================================

func TestParseHAR_ValidFile(t *testing.T) {
	harJSON := `{
		"log": {
			"entries": [
				{
					"request": {
						"method": "GET",
						"url": "https://example.com/api/users",
						"headers": []
					}
				}
			]
		}
	}`

	var har HAR
	err := json.Unmarshal([]byte(harJSON), &har)
	if err != nil {
		t.Fatalf("failed to parse HAR: %v", err)
	}

	if len(har.Log.Entries) != 1 {
		t.Errorf("expected 1 entry, got %d", len(har.Log.Entries))
	}

	if har.Log.Entries[0].Request.Method != "GET" {
		t.Errorf("expected GET method, got %s", har.Log.Entries[0].Request.Method)
	}

	if har.Log.Entries[0].Request.URL != "https://example.com/api/users" {
		t.Errorf("expected URL https://example.com/api/users, got %s", har.Log.Entries[0].Request.URL)
	}
}

func TestParseHAR_MultipleRequests(t *testing.T) {
	harJSON := `{
		"log": {
			"entries": [
				{
					"request": {
						"method": "GET",
						"url": "https://example.com/api/users",
						"headers": []
					}
				},
				{
					"request": {
						"method": "POST",
						"url": "https://example.com/api/users",
						"headers": [{"name": "Content-Type", "value": "application/json"}],
						"postData": {"mimeType": "application/json", "text": "{\"name\":\"test\"}"}
					}
				}
			]
		}
	}`

	var har HAR
	err := json.Unmarshal([]byte(harJSON), &har)
	if err != nil {
		t.Fatalf("failed to parse HAR: %v", err)
	}

	if len(har.Log.Entries) != 2 {
		t.Errorf("expected 2 entries, got %d", len(har.Log.Entries))
	}

	if har.Log.Entries[1].Request.Method != "POST" {
		t.Errorf("expected POST method, got %s", har.Log.Entries[1].Request.Method)
	}

	if har.Log.Entries[1].Request.Body == nil || har.Log.Entries[1].Request.Body.Text != "{\"name\":\"test\"}" {
		t.Errorf("expected body with test JSON")
	}
}

func TestParseHAR_MalformedJSON(t *testing.T) {
	harJSON := `{invalid json`

	var har HAR
	err := json.Unmarshal([]byte(harJSON), &har)
	if err == nil {
		t.Errorf("expected error for malformed JSON, got none")
	}
}

func TestParseHAR_EmptyEntries(t *testing.T) {
	harJSON := `{"log": {"entries": []}}`

	var har HAR
	err := json.Unmarshal([]byte(harJSON), &har)
	if err != nil {
		t.Fatalf("failed to parse HAR: %v", err)
	}

	if len(har.Log.Entries) != 0 {
		t.Errorf("expected 0 entries, got %d", len(har.Log.Entries))
	}
}

// ============================================================================
// Unit Tests: Database Schema
// ============================================================================

func setupTestDB(t *testing.T) *sql.DB {
	tmpFile, err := os.CreateTemp("", "test*.db")
	if err != nil {
		t.Fatalf("failed to create temp db file: %v", err)
	}
	tmpFile.Close()
	dbPath := tmpFile.Name()

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		t.Fatalf("failed to open test database: %v", err)
	}

	db.SetMaxOpenConns(1)
	if err := db.Ping(); err != nil {
		t.Fatalf("failed to ping database: %v", err)
	}

	if _, err := db.Exec("PRAGMA journal_mode=WAL"); err != nil {
		t.Fatalf("failed to set WAL mode: %v", err)
	}
	if _, err := db.Exec("PRAGMA busy_timeout=5000"); err != nil {
		t.Fatalf("failed to set busy timeout: %v", err)
	}

	if err := createSchema(db); err != nil {
		t.Fatalf("failed to create schema: %v", err)
	}

	t.Cleanup(func() {
		db.Close()
		os.Remove(dbPath)
		os.Remove(dbPath + "-shm")
		os.Remove(dbPath + "-wal")
	})

	return db
}

func TestCreateSchema_Success(t *testing.T) {
	db := setupTestDB(t)

	// Verify tables exist
	tables := []string{"sessions", "requests", "replay_jobs", "results"}
	for _, table := range tables {
		var name string
		err := db.QueryRow(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, table).Scan(&name)
		if err != nil {
			t.Errorf("table %s not found: %v", table, err)
		}
	}
}

func TestCreateSchema_Idempotent(t *testing.T) {
	db := setupTestDB(t)

	// Schema already created once in setupTestDB
	// Call createSchema again - should not error
	err := createSchema(db)
	if err != nil {
		t.Errorf("createSchema should be idempotent, got error: %v", err)
	}

	// Verify data from first schema creation is still intact
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table'").Scan(&count)
	if err != nil {
		t.Fatalf("failed to query tables: %v", err)
	}
	if count != 4 {
		t.Errorf("expected 4 tables, got %d", count)
	}
}

// ============================================================================
// API Integration Tests
// ============================================================================

func TestHealthEndpoint(t *testing.T) {
	handler := http.HandlerFunc(healthHandler)
	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var response HealthResponse
	if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if response.Status != "ok" {
		t.Errorf("expected status 'ok', got '%s'", response.Status)
	}
}

func TestCreateSession_ValidHAR(t *testing.T) {
	db := setupTestDB(t)

	tmpDir, err := os.MkdirTemp("", "har-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	harContent := `{
		"log": {
			"entries": [
				{
					"request": {
						"method": "GET",
						"url": "https://example.com/api/users",
						"headers": []
					}
				}
			]
		}
	}`

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("har_file", "test.har")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	part.Write([]byte(harContent))

	writer.WriteField("name", "Test Session")
	writer.WriteField("base_url", "http://localhost:3000")
	writer.Close()

	handler := createSessionHandler(db, tmpDir)
	req := httptest.NewRequest("POST", "/sessions", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("expected status 201, got %d; body: %s", w.Code, w.Body.String())
	}

	var session Session
	if err := json.NewDecoder(w.Body).Decode(&session); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if session.Name != "Test Session" {
		t.Errorf("expected session name 'Test Session', got '%s'", session.Name)
	}
	if session.BaseURL != "http://localhost:3000" {
		t.Errorf("expected base URL 'http://localhost:3000', got '%s'", session.BaseURL)
	}
	if session.RequestCount != 1 {
		t.Errorf("expected 1 request, got %d", session.RequestCount)
	}
}

func TestCreateSession_InvalidHAR(t *testing.T) {
	db := setupTestDB(t)
	tmpDir := t.TempDir()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("har_file", "test.har")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	part.Write([]byte("invalid json"))

	writer.WriteField("name", "Test Session")
	writer.WriteField("base_url", "http://localhost:3000")
	writer.Close()

	handler := createSessionHandler(db, tmpDir)
	req := httptest.NewRequest("POST", "/sessions", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", w.Code)
	}
}

func TestCreateSession_MissingSessionName(t *testing.T) {
	db := setupTestDB(t)
	tmpDir := t.TempDir()

	harContent := `{"log": {"entries": []}}`

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("har_file", "test.har")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	part.Write([]byte(harContent))

	// Don't write session name
	writer.WriteField("base_url", "http://localhost:3000")
	writer.Close()

	handler := createSessionHandler(db, tmpDir)
	req := httptest.NewRequest("POST", "/sessions", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", w.Code)
	}
}

func TestGetSession_Exists(t *testing.T) {
	db := setupTestDB(t)

	// Insert test session
	sessionID := "test_session_123"
	now := time.Now()
	_, err := db.Exec(`
		INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, sessionID, "Test", "/path/to/test.har", "http://localhost:3000", 1, now)
	if err != nil {
		t.Fatalf("failed to insert test session: %v", err)
	}

	// Test the database query logic directly
	var session Session
	query := `SELECT id, name, har_path, base_url, request_count, created_at, last_replayed_at FROM sessions WHERE id = ?`
	row := db.QueryRow(query, sessionID)
	err = row.Scan(&session.ID, &session.Name, &session.HARPath, &session.BaseURL, &session.RequestCount, &session.CreatedAt, &session.ReplayedAt)

	if err != nil {
		t.Fatalf("failed to query session: %v", err)
	}

	if session.ID != sessionID {
		t.Errorf("expected session ID %s, got %s", sessionID, session.ID)
	}
	if session.Name != "Test" {
		t.Errorf("expected name 'Test', got '%s'", session.Name)
	}
}

// ============================================================================
// Replay Engine Tests - OUTCOME VALIDATION (CRITICAL)
// ============================================================================

func TestReplayRequest_ActualHTTPRequest(t *testing.T) {
	// Create a test HTTP server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/test" {
			t.Errorf("expected path /api/test, got %s", r.URL.Path)
		}
		if r.Method != "GET" {
			t.Errorf("expected GET, got %s", r.Method)
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ok"}`))
	}))
	defer server.Close()

	// Create HAR request
	harReq := HARRequest{
		Method:  "GET",
		URL:     "https://example.com/api/test",
		Headers: []HARHeader{},
	}

	// Rebase to test server URL
	baseURL := server.URL
	result := replayRequest(harReq, baseURL)

	// CRITICAL: Verify actual HTTP request was sent
	if result.Error != "" {
		t.Errorf("expected no error, got: %s", result.Error)
	}

	// CRITICAL: Verify actual status code was received
	if result.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", result.StatusCode)
	}

	// CRITICAL: Verify URL was rebased correctly
	if !strings.Contains(result.URL, baseURL) {
		t.Errorf("expected URL to contain base %s, got %s", baseURL, result.URL)
	}
}

func TestReplayRequest_StatusCodeCapture(t *testing.T) {
	tests := []struct {
		name           string
		statusCode     int
		expectedStatus int
	}{
		{"OK", http.StatusOK, http.StatusOK},
		{"Created", http.StatusCreated, http.StatusCreated},
		{"Bad Request", http.StatusBadRequest, http.StatusBadRequest},
		{"Not Found", http.StatusNotFound, http.StatusNotFound},
		{"Server Error", http.StatusInternalServerError, http.StatusInternalServerError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tt.statusCode)
			}))
			defer server.Close()

			harReq := HARRequest{
				Method:  "GET",
				URL:     "https://example.com/test",
				Headers: []HARHeader{},
			}

			result := replayRequest(harReq, server.URL)

			if result.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, result.StatusCode)
			}
		})
	}
}

func TestReplayRequest_ErrorHandling(t *testing.T) {
	harReq := HARRequest{
		Method:  "GET",
		URL:     "https://example.com/test",
		Headers: []HARHeader{},
	}

	// Use a URL that will fail (invalid host)
	result := replayRequest(harReq, "http://invalid-host-that-does-not-exist-12345.local")

	// CRITICAL: Verify error is captured
	if result.Error == "" {
		t.Errorf("expected error for unreachable host, got empty error")
	}

	// CRITICAL: Verify status code is 0 on error (not a successful response)
	if result.StatusCode != 0 {
		t.Errorf("expected status 0 on error, got %d", result.StatusCode)
	}
}

func TestReplayRequest_PreservesHeaders(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Test-Header") != "test-value" {
			t.Errorf("expected X-Test-Header, got empty")
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	harReq := HARRequest{
		Method: "GET",
		URL:    "https://example.com/test",
		Headers: []HARHeader{
			{Name: "X-Test-Header", Value: "test-value"},
		},
	}

	result := replayRequest(harReq, server.URL)
	if result.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d; error: %s", result.StatusCode, result.Error)
	}
}

func TestExecuteRequest_ActualHTTPExecution(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	}))
	defer server.Close()

	harReq := HARRequest{
		Method:  "GET",
		URL:     "https://example.com/test",
		Headers: []HARHeader{},
	}

	statusCode, errorMsg := executeRequest(harReq, server.URL)

	// CRITICAL: Verify actual status code received
	if statusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", statusCode)
	}

	// CRITICAL: Verify no error on success
	if errorMsg != "" {
		t.Errorf("expected no error, got: %s", errorMsg)
	}
}

func TestExecuteRequest_CapturesErrors(t *testing.T) {
	harReq := HARRequest{
		Method:  "GET",
		URL:     "https://example.com/test",
		Headers: []HARHeader{},
	}

	// Use unreachable URL
	statusCode, errorMsg := executeRequest(harReq, "http://invalid-host-xyz.local")

	// CRITICAL: Verify error message captured
	if errorMsg == "" {
		t.Errorf("expected error message for unreachable host")
	}

	// CRITICAL: Verify status is 0 when request fails
	if statusCode != 0 {
		t.Errorf("expected status 0 on error, got %d", statusCode)
	}
}

func TestExecuteRequest_WithRequestBody(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		if string(body) != `{"test":"data"}` {
			t.Errorf("expected body {\"test\":\"data\"}, got %s", string(body))
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	harReq := HARRequest{
		Method: "POST",
		URL:    "https://example.com/api",
		Headers: []HARHeader{
			{Name: "Content-Type", Value: "application/json"},
		},
		Body: &HARBody{
			MimeType: "application/json",
			Text:     `{"test":"data"}`,
		},
	}

	statusCode, errorMsg := executeRequest(harReq, server.URL)

	if statusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d; error: %s", statusCode, errorMsg)
	}
}

// ============================================================================
// Test Fixtures
// ============================================================================

func createSampleHARFile(t *testing.T, path string, numRequests int) {
	entries := make([]HAREntry, numRequests)
	for i := 0; i < numRequests; i++ {
		entries[i] = HAREntry{
			Request: HARRequest{
				Method:  "GET",
				URL:     fmt.Sprintf("https://example.com/api/resource/%d", i+1),
				Headers: []HARHeader{},
			},
		}
	}

	har := HAR{
		Log: HARLog{
			Entries: entries,
		},
	}

	data, err := json.MarshalIndent(har, "", "  ")
	if err != nil {
		t.Fatalf("failed to marshal HAR: %v", err)
	}

	if err := os.WriteFile(path, data, 0644); err != nil {
		t.Fatalf("failed to write HAR file: %v", err)
	}
}

func TestCreateSampleHARFiles(t *testing.T) {
	tmpDir := t.TempDir()

	// Create simple GET HAR
	harPath := filepath.Join(tmpDir, "simple-get.har")
	createSampleHARFile(t, harPath, 1)

	// Verify file exists and is valid
	data, err := os.ReadFile(harPath)
	if err != nil {
		t.Fatalf("failed to read HAR file: %v", err)
	}

	var har HAR
	if err := json.Unmarshal(data, &har); err != nil {
		t.Fatalf("HAR file is not valid JSON: %v", err)
	}

	if len(har.Log.Entries) != 1 {
		t.Errorf("expected 1 entry, got %d", len(har.Log.Entries))
	}
}

// ============================================================================
// Async Replay Job Tests - OUTCOME VALIDATION
// ============================================================================

func TestStartReplayJob_CreatesJob(t *testing.T) {
	db := setupTestDB(t)

	// Insert test session
	sessionID := "test_session_async"
	harPath := filepath.Join(t.TempDir(), "test.har")
	createSampleHARFile(t, harPath, 1)

	now := time.Now()
	_, err := db.Exec(`
		INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, sessionID, "AsyncTest", harPath, "http://localhost:3000", 1, now)
	if err != nil {
		t.Fatalf("failed to insert test session: %v", err)
	}

	// Insert request record
	_, err = db.Exec(`
		INSERT INTO requests (id, session_id, seq, method, url, expected_status)
		VALUES (?, ?, ?, ?, ?, ?)
	`, "req_"+sessionID+"_0", sessionID, 1, "GET", "https://example.com/api/test", 200)
	if err != nil {
		t.Fatalf("failed to insert request: %v", err)
	}

	// Set up chi router for proper URL param extraction
	router := chi.NewRouter()
	router.Post("/sessions/{id}/replay", startReplayJobHandler(db))

	body := bytes.NewReader([]byte(`{"base_url":"http://localhost:3000"}`))
	req := httptest.NewRequest("POST", "/sessions/"+sessionID+"/replay", body)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusAccepted {
		t.Errorf("expected status 202, got %d; body: %s", w.Code, w.Body.String())
	}

	var jobStart ReplayJobStart
	if err := json.NewDecoder(w.Body).Decode(&jobStart); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if jobStart.Status != "running" {
		t.Errorf("expected status 'running', got '%s'", jobStart.Status)
	}

	// Verify job was created in database
	var jobID, status string
	err = db.QueryRow("SELECT id, status FROM replay_jobs WHERE id = ?", jobStart.JobID).Scan(&jobID, &status)
	if err != nil {
		t.Errorf("job not found in database: %v", err)
	}

	if status != "running" {
		t.Errorf("expected job status 'running', got '%s'", status)
	}
}

func TestStartReplayJob_SessionNotFound(t *testing.T) {
	db := setupTestDB(t)

	router := chi.NewRouter()
	router.Post("/sessions/{id}/replay", startReplayJobHandler(db))

	body := bytes.NewReader([]byte(`{"base_url":"http://localhost:3000"}`))
	req := httptest.NewRequest("POST", "/sessions/nonexistent/replay", body)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected status 404, got %d", w.Code)
	}
}

func TestReplayStatusHandler_JobStatus(t *testing.T) {
	db := setupTestDB(t)

	// Insert test session
	sessionID := "test_session_status"
	now := time.Now()
	_, err := db.Exec(`
		INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, sessionID, "StatusTest", "/path", "http://localhost", 0, now)
	if err != nil {
		t.Fatalf("failed to insert session: %v", err)
	}

	// Insert replay job
	jobID := "job_test_123"
	_, err = db.Exec(`
		INSERT INTO replay_jobs (id, session_id, status, started_at)
		VALUES (?, ?, ?, ?)
	`, jobID, sessionID, "running", now)
	if err != nil {
		t.Fatalf("failed to insert job: %v", err)
	}

	// Set up chi router
	router := chi.NewRouter()
	router.Get("/sessions/{id}/replay-status", replayStatusHandler(db))

	req := httptest.NewRequest("GET", "/sessions/"+sessionID+"/replay-status", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var jobStatus ReplayJobStatus
	if err := json.NewDecoder(w.Body).Decode(&jobStatus); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if jobStatus.JobID != jobID {
		t.Errorf("expected job ID %s, got %s", jobID, jobStatus.JobID)
	}

	if jobStatus.Status != "running" {
		t.Errorf("expected status 'running', got '%s'", jobStatus.Status)
	}
}

func TestReplayStatusHandler_NoJobFound(t *testing.T) {
	db := setupTestDB(t)

	// Insert test session but no job
	sessionID := "test_session_no_job"
	now := time.Now()
	_, err := db.Exec(`
		INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, sessionID, "NoJob", "/path", "http://localhost", 0, now)
	if err != nil {
		t.Fatalf("failed to insert session: %v", err)
	}

	router := chi.NewRouter()
	router.Get("/sessions/{id}/replay-status", replayStatusHandler(db))

	req := httptest.NewRequest("GET", "/sessions/"+sessionID+"/replay-status", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected status 404, got %d", w.Code)
	}
}

func TestResultsHandler_ReturnsResults(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	db := setupTestDB(t)
	tmpDir := t.TempDir()

	// Insert session
	sessionID := "test_session_results"
	harPath := filepath.Join(tmpDir, "test.har")
	createSampleHARFile(t, harPath, 1)
	now := time.Now()
	_, _ = db.Exec(`
		INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, sessionID, "ResultsTest", harPath, server.URL, 1, now)

	// Insert request
	_, _ = db.Exec(`
		INSERT INTO requests (id, session_id, seq, method, url, expected_status)
		VALUES (?, ?, ?, ?, ?, ?)
	`, "req_"+sessionID+"_0", sessionID, 1, "GET", "https://example.com/test", 200)

	// Insert job
	jobID := "job_results_123"
	_, _ = db.Exec(`
		INSERT INTO replay_jobs (id, session_id, status, started_at, completed_at)
		VALUES (?, ?, ?, ?, ?)
	`, jobID, sessionID, "done", now, &now)

	// Insert result (CRITICAL: outcome validation - actual status code stored)
	actualStatus := 200
	responseTime := 45
	_, _ = db.Exec(`
		INSERT INTO results (id, job_id, request_id, seq, url, method, expected_status, actual_status, response_time_ms, passed, error_message)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, "result_123", jobID, "req_"+sessionID+"_0", 1, server.URL, "GET", 200, actualStatus, responseTime, true, nil)

	// Set up chi router
	router := chi.NewRouter()
	router.Get("/sessions/{id}/results", resultsHandler(db))

	req := httptest.NewRequest("GET", "/sessions/"+sessionID+"/results", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resultsList ResultsList
	if err := json.NewDecoder(w.Body).Decode(&resultsList); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resultsList.JobID != jobID {
		t.Errorf("expected job ID %s, got %s", jobID, resultsList.JobID)
	}

	if len(resultsList.Results) != 1 {
		t.Errorf("expected 1 result, got %d", len(resultsList.Results))
	}

	// CRITICAL: Verify actual status code is captured
	if resultsList.Results[0].ActualStatus == nil || *resultsList.Results[0].ActualStatus != 200 {
		t.Errorf("expected actual status 200, got %v", resultsList.Results[0].ActualStatus)
	}

	// CRITICAL: Verify pass/fail determination is stored
	if !resultsList.Results[0].Passed {
		t.Errorf("expected result to be passed")
	}

	// CRITICAL: Verify response time is captured
	if resultsList.Results[0].ResponseTimeMs == nil || *resultsList.Results[0].ResponseTimeMs != 45 {
		t.Errorf("expected response time 45ms, got %v", resultsList.Results[0].ResponseTimeMs)
	}
}

func TestResultsHandler_NoResults(t *testing.T) {
	db := setupTestDB(t)

	// Insert session and job but no results
	sessionID := "test_session_empty_results"
	now := time.Now()
	_, _ = db.Exec(`
		INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, sessionID, "NoResults", "/path", "http://localhost", 0, now)

	jobID := "job_empty"
	_, _ = db.Exec(`
		INSERT INTO replay_jobs (id, session_id, status, started_at, completed_at)
		VALUES (?, ?, ?, ?, ?)
	`, jobID, sessionID, "done", now, &now)

	router := chi.NewRouter()
	router.Get("/sessions/{id}/results", resultsHandler(db))

	req := httptest.NewRequest("GET", "/sessions/"+sessionID+"/results", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resultsList ResultsList
	if err := json.NewDecoder(w.Body).Decode(&resultsList); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(resultsList.Results) != 0 {
		t.Errorf("expected 0 results, got %d", len(resultsList.Results))
	}
}

func TestExecuteReplayJob_ActualHTTPExecution(t *testing.T) {
	// Create a test server to simulate actual HTTP requests
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "fail") {
			w.WriteHeader(http.StatusNotFound)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer server.Close()

	db := setupTestDB(t)
	tmpDir := t.TempDir()

	// Create HAR file with test requests
	sessionID := "test_async_execution"
	harPath := filepath.Join(tmpDir, "async-test.har")
	createSampleHARFile(t, harPath, 1)

	now := time.Now()
	_, _ = db.Exec(`
		INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, sessionID, "AsyncExecution", harPath, server.URL, 1, now)

	_, _ = db.Exec(`
		INSERT INTO requests (id, session_id, seq, method, url, expected_status)
		VALUES (?, ?, ?, ?, ?, ?)
	`, "req_"+sessionID+"_0", sessionID, 1, "GET", "https://example.com/api/resource/1", 200)

	jobID := "job_async_exec"
	_, _ = db.Exec(`
		INSERT INTO replay_jobs (id, session_id, status, started_at)
		VALUES (?, ?, ?, ?)
	`, jobID, sessionID, "running", now)

	// Execute async job
	session := Session{
		ID:      sessionID,
		Name:    "AsyncExecution",
		HARPath: harPath,
		BaseURL: server.URL,
	}

	executeReplayJob(db, jobID, session, server.URL)

	// CRITICAL: Verify job status updated to done
	var finalStatus string
	err := db.QueryRow("SELECT status FROM replay_jobs WHERE id = ?", jobID).Scan(&finalStatus)
	if err != nil {
		t.Fatalf("failed to query job: %v", err)
	}
	if finalStatus != "done" {
		t.Errorf("expected job status 'done', got '%s'", finalStatus)
	}

	// CRITICAL: Verify results were stored
	var resultCount int
	err = db.QueryRow("SELECT COUNT(*) FROM results WHERE job_id = ?", jobID).Scan(&resultCount)
	if err != nil {
		t.Fatalf("failed to count results: %v", err)
	}
	if resultCount == 0 {
		t.Errorf("expected results to be stored, got 0")
	}

	// CRITICAL: Verify actual status code was captured
	var actualStatus *int
	err = db.QueryRow("SELECT actual_status FROM results WHERE job_id = ? LIMIT 1", jobID).Scan(&actualStatus)
	if err != nil {
		t.Fatalf("failed to query result: %v", err)
	}
	if actualStatus == nil || *actualStatus != http.StatusOK {
		t.Errorf("expected actual status 200, got %v", actualStatus)
	}
}

func TestHopByHopHeaders_NotAdded(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify hop-by-hop headers are not present
		if r.Header.Get("Connection") != "" {
			t.Errorf("Connection header should be filtered out")
		}
		if r.Header.Get("Keep-Alive") != "" {
			t.Errorf("Keep-Alive header should be filtered out")
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	harReq := HARRequest{
		Method: "GET",
		URL:    "https://example.com/test",
		Headers: []HARHeader{
			{Name: "Connection", Value: "keep-alive"},
			{Name: "Keep-Alive", Value: "timeout=5"},
			{Name: "X-Custom-Header", Value: "should-be-present"},
		},
	}

	result := replayRequest(harReq, server.URL)

	if result.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d; error: %s", result.StatusCode, result.Error)
	}
}

func TestIsHopByHopHeader(t *testing.T) {
	tests := []struct {
		name     string
		header   string
		isHopByHop bool
	}{
		{"connection", "connection", true},
		{"Connection", "Connection", true},
		{"keep-alive", "keep-alive", true},
		{"transfer-encoding", "transfer-encoding", true},
		{"x-custom", "x-custom", false},
		{"content-type", "content-type", false},
		{"authorization", "authorization", false},
	}

	for _, tt := range tests {
		result := isHopByHopHeader(tt.header)
		if result != tt.isHopByHop {
			t.Errorf("%s: expected %v, got %v", tt.name, tt.isHopByHop, result)
		}
	}
}

// ============================================================================
// Additional Integration Tests for Missing Endpoints
// ============================================================================

func TestGetSessionRequests(t *testing.T) {
	db := setupTestDB(t)
	tmpDir := t.TempDir()

	// Insert session with real HAR file
	sessionID := "test_session_requests"
	harPath := filepath.Join(tmpDir, "requests.har")
	createSampleHARFile(t, harPath, 2)

	now := time.Now()
	_, _ = db.Exec(`
		INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, sessionID, "RequestsTest", harPath, "http://localhost", 2, now)

	// Insert requests
	for i := 0; i < 2; i++ {
		_, _ = db.Exec(`
			INSERT INTO requests (id, session_id, seq, method, url, expected_status)
			VALUES (?, ?, ?, ?, ?, ?)
		`, fmt.Sprintf("req_%s_%d", sessionID, i), sessionID, i+1,
			[]string{"GET", "POST"}[i], fmt.Sprintf("https://example.com/api/%d", i), 200)
	}

	// Test endpoint
	router := chi.NewRouter()
	router.Get("/sessions/{id}/requests", getSessionRequestsHandler(db))

	req := httptest.NewRequest("GET", "/sessions/"+sessionID+"/requests", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d; body: %s", w.Code, w.Body.String())
	}

	var sessionRequests SessionRequests
	if err := json.NewDecoder(w.Body).Decode(&sessionRequests); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(sessionRequests.Requests) != 2 {
		t.Errorf("expected 2 requests, got %d", len(sessionRequests.Requests))
	}
}

func TestListSessions(t *testing.T) {
	db := setupTestDB(t)

	// Insert multiple sessions
	now := time.Now()
	for i := 0; i < 3; i++ {
		_, _ = db.Exec(`
			INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`, fmt.Sprintf("session_%d", i), fmt.Sprintf("Session %d", i), "/path", "http://localhost", i+1, now)
	}

	// Test endpoint (no chi routing needed for this one)
	req := httptest.NewRequest("GET", "/sessions", nil)
	w := httptest.NewRecorder()

	handler := http.HandlerFunc(listSessionsHandler(db))
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var sessions []Session
	if err := json.NewDecoder(w.Body).Decode(&sessions); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(sessions) < 3 {
		t.Errorf("expected at least 3 sessions, got %d", len(sessions))
	}
}

func TestReplaySession_SyncVersion(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	db := setupTestDB(t)
	tmpDir := t.TempDir()

	// Insert session
	sessionID := "test_session_replay_sync"
	harPath := filepath.Join(tmpDir, "test.har")
	createSampleHARFile(t, harPath, 1)

	now := time.Now()
	_, _ = db.Exec(`
		INSERT INTO sessions (id, name, har_path, base_url, request_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, sessionID, "ReplayTest", harPath, server.URL, 1, now)

	// Test endpoint
	router := chi.NewRouter()
	router.Post("/sessions/{id}/replay-sync", replaySessionHandler(db))

	body := bytes.NewReader([]byte(`{"base_url":"` + server.URL + `"}`))
	req := httptest.NewRequest("POST", "/sessions/"+sessionID+"/replay-sync", body)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var replayResponse ReplayResponse
	if err := json.NewDecoder(w.Body).Decode(&replayResponse); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if replayResponse.SessionID != sessionID {
		t.Errorf("expected session ID %s, got %s", sessionID, replayResponse.SessionID)
	}

	if len(replayResponse.Results) != 1 {
		t.Errorf("expected 1 result, got %d", len(replayResponse.Results))
	}

	// CRITICAL: Verify actual status code from sync replay
	if replayResponse.Results[0].StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", replayResponse.Results[0].StatusCode)
	}
}

func TestCreateHARDir(t *testing.T) {
	tmpDir := t.TempDir()
	harDir := filepath.Join(tmpDir, "har-files")

	err := createHARDir(harDir)
	if err != nil {
		t.Fatalf("createHARDir failed: %v", err)
	}

	// Verify directory was created
	info, err := os.Stat(harDir)
	if err != nil {
		t.Errorf("directory was not created: %v", err)
	}

	if !info.IsDir() {
		t.Errorf("expected directory, got file")
	}
}

func TestLoadConfig_DefaultValues(t *testing.T) {
	// Save original env vars
	origPort := os.Getenv("PORT")
	origDBPath := os.Getenv("DB_PATH")
	origHARDir := os.Getenv("HAR_DIR")

	// Clear env vars
	os.Unsetenv("PORT")
	os.Unsetenv("DB_PATH")
	os.Unsetenv("HAR_DIR")

	defer func() {
		if origPort != "" {
			os.Setenv("PORT", origPort)
		}
		if origDBPath != "" {
			os.Setenv("DB_PATH", origDBPath)
		}
		if origHARDir != "" {
			os.Setenv("HAR_DIR", origHARDir)
		}
	}()

	cfg := loadConfig()

	if cfg.Port != 8080 {
		t.Errorf("expected default port 8080, got %d", cfg.Port)
	}

	if cfg.DBPath != "./supernova.db" {
		t.Errorf("expected default DBPath './supernova.db', got %s", cfg.DBPath)
	}

	if cfg.HARDir != "./har-files" {
		t.Errorf("expected default HARDir './har-files', got %s", cfg.HARDir)
	}
}

func TestLoadConfig_EnvVars(t *testing.T) {
	// Save original env vars
	origPort := os.Getenv("PORT")
	origDBPath := os.Getenv("DB_PATH")
	origHARDir := os.Getenv("HAR_DIR")

	// Set env vars
	os.Setenv("PORT", "9000")
	os.Setenv("DB_PATH", "/custom/path.db")
	os.Setenv("HAR_DIR", "/custom/har")

	defer func() {
		if origPort != "" {
			os.Setenv("PORT", origPort)
		} else {
			os.Unsetenv("PORT")
		}
		if origDBPath != "" {
			os.Setenv("DB_PATH", origDBPath)
		} else {
			os.Unsetenv("DB_PATH")
		}
		if origHARDir != "" {
			os.Setenv("HAR_DIR", origHARDir)
		} else {
			os.Unsetenv("HAR_DIR")
		}
	}()

	cfg := loadConfig()

	if cfg.Port != 9000 {
		t.Errorf("expected port 9000, got %d", cfg.Port)
	}

	if cfg.DBPath != "/custom/path.db" {
		t.Errorf("expected DBPath '/custom/path.db', got %s", cfg.DBPath)
	}

	if cfg.HARDir != "/custom/har" {
		t.Errorf("expected HARDir '/custom/har', got %s", cfg.HARDir)
	}
}

func TestIfEmpty(t *testing.T) {
	tests := []struct {
		name   string
		s      string
		empty  string
		notEmpty string
		expected string
	}{
		{"empty string", "", "EMPTY", "NOT_EMPTY", "EMPTY"},
		{"non-empty string", "value", "EMPTY", "NOT_EMPTY", "NOT_EMPTY"},
	}

	for _, tt := range tests {
		result := ifEmpty(tt.s, tt.empty, tt.notEmpty)
		if result != tt.expected {
			t.Errorf("%s: expected %s, got %s", tt.name, tt.expected, result)
		}
	}
}

func TestUpdateJobStatus(t *testing.T) {
	db := setupTestDB(t)

	// Insert job
	jobID := "job_update_status"
	now := time.Now()
	_, _ = db.Exec(`
		INSERT INTO replay_jobs (id, session_id, status, started_at)
		VALUES (?, ?, ?, ?)
	`, jobID, "session_123", "running", now)

	// Update status
	updateJobStatus(db, jobID, "done")

	// Verify status was updated
	var status string
	var completedAt *time.Time
	err := db.QueryRow("SELECT status, completed_at FROM replay_jobs WHERE id = ?", jobID).Scan(&status, &completedAt)
	if err != nil {
		t.Fatalf("failed to query job: %v", err)
	}

	if status != "done" {
		t.Errorf("expected status 'done', got '%s'", status)
	}

	if completedAt == nil {
		t.Errorf("expected completed_at to be set")
	}
}
