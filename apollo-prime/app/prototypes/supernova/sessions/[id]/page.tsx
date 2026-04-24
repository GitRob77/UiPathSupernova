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

interface ReplayResult {
  url: string;
  status_code: number;
  error?: string;
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [requests, setRequests] = useState<RequestEntry[]>([]);
  const [replayResults, setReplayResults] = useState<ReplayResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState(false);
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

      const response = await fetch(`/api/sessions/${sessionId}/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_url: baseURLInput || baseURL,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to replay session");
      }

      const data = await response.json();
      setReplayResults(data.results || []);

      // Refresh session to update last_replayed_at
      fetchSessionDetails();
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

  const successCount = replayResults?.filter((r) => !r.error && r.status_code >= 200 && r.status_code < 300).length || 0;
  const errorCount = replayResults?.filter((r) => r.error || r.status_code >= 400).length || 0;

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

          {replayResults && (
            <div className="space-y-2">
              <div className="flex gap-4 text-sm">
                <Badge variant="default" className="gap-1">
                  <span className="font-bold">{successCount}</span>
                  Successful
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
                    <TableHead className="w-20">Method</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-24">Content Type</TableHead>
                    <TableHead className="w-16">Body</TableHead>
                    {replayResults && <TableHead className="w-20">Status</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req, idx) => {
                    const replayResult = replayResults?.[idx];
                    const statusColor =
                      replayResult?.error
                        ? "text-destructive"
                        : replayResult?.status_code >= 200 &&
                            replayResult?.status_code < 300
                          ? "text-green-600"
                          : replayResult?.status_code >= 400
                            ? "text-destructive"
                            : "text-yellow-600";

                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {req.method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="truncate font-mono text-xs" title={req.url}>
                            {req.url}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {req.mime_type ? (
                            <code className="rounded bg-muted px-2 py-1">
                              {req.mime_type.split(";")[0]}
                            </code>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {req.has_body ? (
                            <Badge variant="secondary" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            "No"
                          )}
                        </TableCell>
                        {replayResults && (
                          <TableCell>
                            <div className={`font-mono text-xs font-semibold ${statusColor}`}>
                              {replayResult?.error ? (
                                <div className="max-w-xs truncate" title={replayResult.error}>
                                  Error
                                </div>
                              ) : (
                                replayResult?.status_code || "—"
                              )}
                            </div>
                          </TableCell>
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
            <CardTitle>Replay Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {replayResults.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-lg border border-border bg-muted/50 p-3 text-sm"
                >
                  <div className="flex-1 space-y-1">
                    <div className="truncate font-mono text-xs" title={result.url}>
                      {result.url}
                    </div>
                    {result.error && (
                      <div className="text-xs text-destructive">{result.error}</div>
                    )}
                  </div>
                  <div className="ml-4 text-right font-mono font-semibold">
                    {result.error ? (
                      <span className="text-destructive">Error</span>
                    ) : (
                      <span
                        className={
                          result.status_code >= 200 && result.status_code < 300
                            ? "text-green-600"
                            : result.status_code >= 400
                              ? "text-destructive"
                              : "text-yellow-600"
                        }
                      >
                        {result.status_code}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
