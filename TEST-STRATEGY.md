# UiPathSupernova Test Regression Strategy

## Executive Summary

**Critical Finding:** UiPathSupernova currently has **ZERO automated tests**, leading to major regressions after MVP release.

This strategy establishes comprehensive test coverage across all system layers to prevent future regressions and ensure quality with each change.

**Target:** 80%+ code coverage across backend and frontend
**Timeline:** Phased implementation over 4 sprints
**Risk Mitigation:** Prioritize critical paths first (HAR import → replay → results)

---

## Current State Analysis

### System Architecture
- **Backend:** Go service with Chi router, SQLite database, async replay engine
- **Frontend:** Next.js 16 (React 19), TypeScript, Apollo Wind UI components
- **API Endpoints:** 8 REST endpoints for sessions, replay, and results
- **Database:** 4 tables (sessions, requests, replay_jobs, results)

### Critical Gaps
1. ❌ **No unit tests** for business logic (URL rebasing, HAR parsing)
2. ❌ **No API integration tests** for endpoint validation
3. ❌ **No frontend component tests** for UI reliability
4. ❌ **No E2E tests** for user workflows
5. ❌ **No CI/CD test automation** to catch regressions early

### Risk Assessment
- **HIGH:** HAR parsing errors can corrupt session data
- **HIGH:** URL rebasing bugs break replay functionality
- **HIGH:** Async replay race conditions cause inconsistent results
- **MEDIUM:** Database migrations could break existing sessions
- **MEDIUM:** Frontend state bugs cause UI inconsistencies

---

## Test Strategy Framework

### Test Pyramid Approach

```
           /\
          /  \         E2E Tests (10%)
         /    \        - Critical user journeys
        /------\       - Cross-browser validation
       /        \      
      /          \     Integration Tests (30%)
     /            \    - API endpoint tests
    /              \   - DB integration tests
   /----------------\  
  /                  \ Unit Tests (60%)
 /____________________\- Business logic
                       - Utilities
                       - Components
```

---

## Phase 1: Backend Testing (Sprint 1)

### 1.1 Unit Tests (Go)

**Priority: CRITICAL**

Test coverage for core business logic:

#### URL Rebasing Logic (rebaseURL)
```go
// service/rebase_test.go
TestRebaseURL_ValidInputs
TestRebaseURL_PreservesQueryString
TestRebaseURL_PreservesPath
TestRebaseURL_HandlesInvalidURLs
TestRebaseURL_HandlesEmptyQueryString
```

**Why Critical:** URL rebasing is the foundation of replay accuracy. Bugs here break the entire replay engine.

#### HAR Parsing
```go
// service/har_parser_test.go
TestParseHAR_ValidFile
TestParseHAR_MalformedJSON
TestParseHAR_MissingRequiredFields
TestParseHAR_LargeFiles
TestParseHAR_EmptyEntries
```

**Why Critical:** HAR parsing errors corrupt session data, requiring manual cleanup.

#### Database Schema & Migrations
```go
// service/db_test.go
TestCreateSchema_Success
TestCreateSchema_Idempotent
TestMigration_BackwardsCompatible
```

### 1.2 API Integration Tests

**Priority: CRITICAL**

Test all 8 API endpoints with real database:

```go
// service/api_test.go
TestHealthEndpoint
TestCreateSession_ValidHAR
TestCreateSession_InvalidHAR
TestCreateSession_DuplicateUpload
TestListSessions_Empty
TestListSessions_MultipleResults
TestGetSession_Exists
TestGetSession_NotFound
TestGetSessionRequests_ValidSession
TestStartReplayJob_ValidSession
TestStartReplayJob_AlreadyRunning
TestReplayStatus_Running
TestReplayStatus_Completed
TestResultsEndpoint_FullResults
TestResultsEndpoint_NoResults
```

**Test Infrastructure:**
- Use httptest package for HTTP testing
- SQLite in-memory database for fast test execution
- Table-driven tests for comprehensive coverage
- Test fixtures for sample HAR files

### 1.3 Async Replay Engine Tests

**Priority: HIGH**

```go
// service/replay_test.go
TestReplayEngine_SequentialRequests
TestReplayEngine_ConcurrentSafety
TestReplayEngine_ErrorHandling
TestReplayEngine_TimeoutHandling
TestReplayEngine_ResultsStorage
TestReplayEngine_JobStatusUpdates
```

**Why Critical:** Race conditions in async engine caused results inconsistencies in MVP.

---

## Phase 2: Frontend Testing (Sprint 2)

### 2.1 Component Unit Tests (React Testing Library)

**Priority: HIGH**

Test individual UI components in isolation:

```typescript
// apollo-prime/components/__tests__/SessionsDataGrid.test.tsx
describe('SessionsDataGrid', () => {
  it('renders empty state when no sessions')
  it('displays sessions in grid format')
  it('handles row selection')
  it('triggers import when HAR uploaded')
  it('shows loading state during import')
})

// apollo-prime/components/__tests__/ReplayButton.test.tsx
describe('ReplayButton', () => {
  it('enables when session has requests')
  it('disables when session empty')
  it('shows loading spinner during replay')
  it('displays error on replay failure')
})

// apollo-prime/components/__tests__/ResultsTable.test.tsx
describe('ResultsTable', () => {
  it('displays all result columns')
  it('highlights failed assertions in red')
  it('shows response time metrics')
  it('filters by status (passed/failed)')
})
```

**Test Setup:**
- Use Vitest as test runner (faster than Jest)
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking

### 2.2 Page Integration Tests

**Priority: MEDIUM**

Test full page rendering with data fetching:

```typescript
// apollo-prime/app/prototypes/supernova/sessions/__tests__/page.test.tsx
describe('Sessions List Page', () => {
  it('fetches and displays sessions on mount')
  it('handles API errors gracefully')
  it('navigates to session detail on row click')
  it('uploads HAR file and creates session')
})

// apollo-prime/app/prototypes/supernova/sessions/[id]/__tests__/page.test.tsx
describe('Session Detail Page', () => {
  it('loads session data on mount')
  it('displays request list')
  it('triggers replay on button click')
  it('polls for replay status')
  it('navigates to results page when complete')
})
```

---

## Phase 3: End-to-End Testing (Sprint 3)

### 3.1 Critical User Journeys (Playwright)

**Priority: CRITICAL**

```typescript
// e2e/happy-path.spec.ts
test('Complete HAR replay flow', async ({ page }) => {
  // 1. Navigate to sessions page
  // 2. Upload sample HAR file
  // 3. Verify session created
  // 4. Click session to view details
  // 5. Click "Replay" button
  // 6. Wait for replay completion
  // 7. Navigate to results
  // 8. Verify results displayed
  // 9. Check pass/fail counts match expected
})

// e2e/error-handling.spec.ts
test('Handles invalid HAR upload', async ({ page }) => {
  // 1. Upload malformed HAR
  // 2. Verify error message displayed
  // 3. Verify no session created
})
```

### 3.2 Cross-Browser Testing

**Priority: MEDIUM**

Run E2E tests across:
- ✅ Chromium (primary)
- ✅ Firefox
- ✅ WebKit (Safari)

---

## Phase 4: Performance & Load Testing (Sprint 4)

### 4.1 API Performance Tests

**Priority: MEDIUM**

```go
// service/benchmark_test.go
BenchmarkRebaseURL
BenchmarkHARParsing_SmallFile
BenchmarkHARParsing_LargeFile
BenchmarkReplayEngine_10Requests
BenchmarkReplayEngine_100Requests
BenchmarkReplayEngine_1000Requests
```

### 4.2 Load Testing (k6)

**Priority: LOW**

Simulate concurrent replay requests to validate scalability.

---

## Test Infrastructure & Tooling

### Backend (Go)
- **Framework:** Go standard testing package + testify/assert
- **Mocking:** gomock for interface mocking
- **HTTP Testing:** httptest package
- **Database:** SQLite in-memory for tests
- **Coverage:** go test -cover (target: 80%+)

### Frontend (TypeScript/React)
- **Test Runner:** Vitest (faster than Jest, better TypeScript support)
- **Component Testing:** React Testing Library
- **API Mocking:** MSW (Mock Service Worker)
- **E2E Framework:** Playwright
- **Coverage:** vitest --coverage (target: 80%+)

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      - run: cd service && go test -v -race -coverprofile=coverage.out ./...
      - run: go tool cover -func=coverage.out

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: cd apollo-prime && pnpm install
      - run: pnpm test --coverage
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker-compose up -d
      - run: pnpm exec playwright test
```

---

## Test Data Management

### Sample HAR Files
Create fixture library in /TestData/har-samples/:
- simple-get.har - Single GET request
- post-with-json.har - POST with JSON body
- complex-session.har - Multi-request session with cookies
- large-file.har - 1000+ requests for performance testing
- malformed.har - Invalid JSON for error handling tests

### Database Fixtures
Seed functions for consistent test data setup and teardown.

---

## Quality Gates

### Pre-Commit (Local)
- ✅ Run unit tests: go test ./... && pnpm test
- ✅ Linting: golangci-lint run && pnpm lint
- ✅ Formatting: gofmt && prettier --check

### Pull Request (CI)
- ✅ All unit tests pass
- ✅ Coverage >= 80% for changed files
- ✅ No new linting errors
- ✅ E2E tests pass for critical paths

### Pre-Release
- ✅ Full E2E test suite passes
- ✅ Cross-browser tests pass
- ✅ Performance benchmarks within thresholds
- ✅ Load tests confirm scalability

---

## Implementation Roadmap

### Sprint 1: Backend Foundation (Week 1-2)
- [ ] Set up Go test infrastructure
- [ ] Write unit tests for URL rebasing
- [ ] Write unit tests for HAR parsing
- [ ] Write API integration tests for all endpoints
- [ ] Achieve 60%+ backend coverage

### Sprint 2: Frontend Foundation (Week 3-4)
- [ ] Set up Vitest + React Testing Library
- [ ] Write component tests for SessionsDataGrid
- [ ] Write component tests for ReplayButton
- [ ] Write component tests for ResultsTable
- [ ] Write page integration tests
- [ ] Achieve 60%+ frontend coverage

### Sprint 3: E2E & Critical Paths (Week 5-6)
- [ ] Set up Playwright
- [ ] Write happy path E2E test (import → replay → results)
- [ ] Write error handling E2E tests
- [ ] Set up cross-browser testing
- [ ] Integrate E2E tests into CI/CD

### Sprint 4: Performance & Polish (Week 7-8)
- [ ] Write benchmark tests for hot paths
- [ ] Set up k6 load testing
- [ ] Reach 80%+ coverage on both backend and frontend
- [ ] Document test strategy and patterns
- [ ] Set up test data fixtures library

---

## Success Criteria

✅ **Coverage:** 80%+ code coverage on backend and frontend  
✅ **Regression Prevention:** Zero critical bugs escape to production  
✅ **Fast Feedback:** Unit tests complete in < 10 seconds  
✅ **Confidence:** Team can refactor without fear of breaking changes  
✅ **Documentation:** All tests serve as living documentation  

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-25  
**Owner:** SQA Hopper (Quality Engineer)
