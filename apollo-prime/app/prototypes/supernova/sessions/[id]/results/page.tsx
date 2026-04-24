"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import { AlertCircle, ArrowLeft, Play } from "lucide-react";

interface Session {
  id: string;
  name: string;
  request_count: number;
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

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [results, setResults] = useState<ResultDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  async function fetchData() {
    try {
      setError(null);
      const [sessionRes, resultsRes] = await Promise.all([
        fetch(`/api/sessions/${sessionId}`),
        fetch(`/api/sessions/${sessionId}/results`),
      ]);

      if (!sessionRes.ok) {
        throw new Error("Failed to fetch session");
      }

      const sessionData = await sessionRes.json();
      setSession(sessionData);

      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setResults(resultsData.results || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleRunAgain() {
    try {
      setReplaying(true);
      setError(null);

      const response = await fetch(`/api/sessions/${sessionId}/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to start replay");
      }

      router.push(`/prototypes/supernova/sessions/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

  const totalRequests = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const avgResponseTime =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) /
            results.length
        )
      : 0;

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/prototypes/supernova/sessions/${sessionId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="text-sm text-muted-foreground">
              Sessions &gt; {session.name}
            </div>
            <h1 className="text-2xl font-semibold">{session.name} › Results</h1>
          </div>
        </div>
        <Button
          onClick={handleRunAgain}
          disabled={replaying}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {replaying ? "Starting..." : "Run Again"}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {passedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {failedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
          </CardContent>
        </Card>
      </div>

      {/* Results table */}
      <Card>
        <CardHeader>
          <CardTitle>Results ({totalRequests})</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No results found. Run the session to generate results.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-20">Method</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-20">Expected</TableHead>
                    <TableHead className="w-20">Actual</TableHead>
                    <TableHead className="w-24">Time (ms)</TableHead>
                    <TableHead className="w-16">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {result.seq}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {result.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate font-mono text-xs">
                                {result.url}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{result.url}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {result.expected_status}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {result.actual_status ? (
                          <span
                            className={
                              result.actual_status >= 200 &&
                              result.actual_status < 300
                                ? "text-green-600"
                                : "text-destructive"
                            }
                          >
                            {result.actual_status}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {result.response_time_ms ? `${result.response_time_ms}ms` : "—"}
                      </TableCell>
                      <TableCell>
                        {result.error_message ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="destructive" className="text-xs">
                                  Fail
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>{result.error_message}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge variant="default" className="text-xs">
                            Pass
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
