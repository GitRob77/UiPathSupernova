"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { Alert, AlertDescription } from "@uipath/apollo-wind/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@uipath/apollo-wind/components/ui/card";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@uipath/apollo-wind/components/ui/table";
import { AlertCircle, ArrowLeft, Play } from "lucide-react";

interface Session {
  id: string;
  name: string;
  request_count: number;
  created_at: string;
  last_replayed_at: string | null;
  base_url: string;
}

interface RequestEntry {
  method: string;
  url: string;
  mime_type?: string;
  has_body: boolean;
}

interface ResultDetail {
  id: string;
  seq: number;
  method: string;
  url: string;
  expected_status: number;
  actual_status: number | null;
  response_time_ms: number | null;
  passed: boolean;
  error_message: string | null;
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [requests, setRequests] = useState<RequestEntry[]>([]);
  const [replayResults, setReplayResults] = useState<ResultDetail[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [baseURL, setBaseURL] = useState("");
  const [baseURLInput, setBaseURLInput] = useState("");

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  async function fetchSessionDetails() {
    try {
      setError(null);
      const [sessionRes, requestsRes] = await Promise.all([
        fetch(`/api/sessions/${sessionId}`),
        fetch(`/api/sessions/${sessionId}/requests`),
      ]);

      if (!sessionRes.ok) {
        throw new Error("Failed to fetch session");
      }

      const sessionData = await sessionRes.json();
      setSession(sessionData);
      setBaseURL(sessionData.base_url);
      setBaseURLInput(sessionData.base_url);

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData.requests || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleReplay() {
    if (!session) return;

    try {
      setReplaying(true);
      setError(null);
      setReplayResults(null);

      // Start async replay job
      const response = await fetch(`/api/sessions/${sessionId}/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_url: baseURLInput || baseURL,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start replay");
      }

      const data = await response.json();
      const jobId = data.job_id;

      // Poll for job completion
      let status = "running";
      let pollCount = 0;
      const maxPolls = 300; // 5 minutes with 1-second polling

      while (status === "running" && pollCount < maxPolls) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        pollCount++;

        // Update progress (linear interpolation from 0 to 90%)
        setReplayProgress(Math.min(90, Math.round((pollCount / maxPolls) * 90)));

        const statusRes = await fetch(`/api/sessions/${sessionId}/replay/status`);
        if (!statusRes.ok) {
          throw new Error("Failed to check replay status");
        }

        const statusData = await statusRes.json();
        status = statusData.status;

        if (status === "completed" || status === "done") {
          setReplayProgress(95);

          // Fetch results
          const resultsRes = await fetch(`/api/sessions/${sessionId}/results`);
          if (resultsRes.ok) {
            const resultsData = await resultsRes.json();
            setReplayResults(resultsData.results || []);
            setReplayProgress(100);
          }

          // Refresh session
          await fetchSessionDetails();
          break;
        }
      }

      if (status === "running") {
        throw new Error("Replay job timed out after 5 minutes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setReplaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-96 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Session not found</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/prototypes/supernova/home">← Back to Sessions</Link>
        </Button>
      </div>
    );
  }

  const successCount = replayResults?.filter((r) => r.passed).length || 0;
  const errorCount = replayResults?.filter((r) => !r.passed).length || 0;

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/prototypes/supernova/home">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{session.name}</h1>
            <p className="text-sm text-muted-foreground">
              Session ID: {session.id}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Session metadata */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session.request_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(session.created_at).toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(session.created_at).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Replayed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {session.last_replayed_at
                ? new Date(session.last_replayed_at).toLocaleDateString()
                : "Never"}
            </div>
            {session.last_replayed_at && (
              <div className="text-xs text-muted-foreground">
                {new Date(session.last_replayed_at).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Base URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="truncate text-xs font-mono">
              {session.base_url}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Replay controls */}
      <Card>
        <CardHeader>
          <CardTitle>Replay Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="base-url" className="text-sm font-medium">
              Base URL (optional - leave empty to use session default)
            </label>
            <input
              id="base-url"
              type="url"
              value={baseURLInput}
              onChange={(e) => setBaseURLInput(e.target.value)}
              placeholder={baseURL}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Current: {baseURL}
            </p>
          </div>

          <Button
            onClick={handleReplay}
            disabled={replaying}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {replaying ? "Replaying..." : "Replay Session"}
          </Button>

          {replaying && (
            <div className="space-y-3">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${replayProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {replayProgress}% complete
              </p>
            </div>
          )}

          {replayResults && (
            <div className="space-y-2">
              <div className="flex gap-4 text-sm">
                <Badge variant="default" className="gap-1">
                  <span className="font-bold">{successCount}</span>
                  Passed
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <span className="font-bold">{errorCount}</span>
                    Failed
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests list */}
      <Card>
        <CardHeader>
          <CardTitle>
            HTTP Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No requests found in this session
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-20">Method</TableHead>
                    <TableHead>URL</TableHead>
                    {replayResults && (
                      <>
                        <TableHead className="w-20">Expected</TableHead>
                        <TableHead className="w-20">Actual</TableHead>
                        <TableHead className="w-24">Time (ms)</TableHead>
                        <TableHead className="w-16">Status</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req, idx) => {
                    const replayResult = replayResults?.find((r) => r.seq === idx + 1);

                    return (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {req.method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="truncate font-mono text-xs" title={req.url}>
                            {req.url}
                          </div>
                        </TableCell>
                        {replayResults && (
                          <>
                            <TableCell className="text-xs font-mono">
                              {replayResult?.expected_status || "—"}
                            </TableCell>
                            <TableCell className="text-xs font-mono">
                              {replayResult?.actual_status ? (
                                <span
                                  className={
                                    replayResult.actual_status >= 200 &&
                                    replayResult.actual_status < 300
                                      ? "text-green-600"
                                      : "text-destructive"
                                  }
                                >
                                  {replayResult.actual_status}
                                </span>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell className="text-xs">
                              {replayResult?.response_time_ms ? (
                                `${replayResult.response_time_ms}ms`
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              {replayResult ? (
                                <Badge
                                  variant={
                                    replayResult.passed ? "default" : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {replayResult.passed ? "Pass" : "Fail"}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replay results detailed view */}
      {replayResults && replayResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {replayResults.map((result) => (
                <div
                  key={result.id}
                  className={`rounded-lg border p-3 space-y-1 ${
                    result.passed
                      ? "border-green-200 bg-green-50"
                      : "border-destructive/30 bg-destructive/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        #{result.seq}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono">
                        {result.method}
                      </Badge>
                      <Badge
                        variant={result.passed ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {result.passed ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                    {result.response_time_ms && (
                      <span className="text-xs text-muted-foreground">
                        {result.response_time_ms}ms
                      </span>
                    )}
                  </div>
                  <div className="truncate font-mono text-xs" title={result.url}>
                    {result.url}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Expected: {result.expected_status}</span>
                    <span>
                      Actual:{" "}
                      <span
                        className={
                          result.actual_status
                            ? result.actual_status >= 200 &&
                              result.actual_status < 300
                              ? "text-green-600"
                              : "text-destructive"
                            : ""
                        }
                      >
                        {result.actual_status || "N/A"}
                      </span>
                    </span>
                  </div>
                  {result.error_message && (
                    <div className="text-xs text-destructive font-mono">
                      {result.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
