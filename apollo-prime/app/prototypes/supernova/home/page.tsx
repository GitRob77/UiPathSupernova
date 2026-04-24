"use client";

import { useState, useEffect, useRef } from "react";
import { ListingLayout } from "@/components/layouts/listing-layout";
import {
  DataGrid,
  DataTableColumnHeader,
} from "@/components/custom/data-grid";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { Alert, AlertDescription } from "@uipath/apollo-wind/components/ui/alert";
import type { ColumnDef } from "@tanstack/react-table";
import { FileUp, Eye, AlertCircle } from "lucide-react";

interface Session {
  id: string;
  name: string;
  request_count: number;
  created_at: string;
  last_replayed_at: string | null;
}

const columns: ColumnDef<Session>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "request_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requests" />
    ),
  },
  {
    accessorKey: "last_replayed_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Replayed" />
    ),
    cell: ({ row }) => {
      const date = row.original.last_replayed_at;
      if (!date) return "Never";
      return new Date(date).toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="h-8 w-8 p-0"
        title="View session"
      >
        <a href={`/prototypes/supernova/sessions/${row.original.id}`}>
          <Eye className="h-4 w-4" />
        </a>
      </Button>
    ),
  },
];

export default function SupernovaHomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      setError(null);
      const response = await fetch("/api/sessions");
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const data = await response.json();
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("har_file", file);
    formData.append("name", file.name.replace(/\.har$/, ""));

    try {
      setError(null);
      const response = await fetch("/api/sessions", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload HAR file");
      }

      await fetchSessions();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  return (
    <ListingLayout productName="Supernova">
      <div className="space-y-4">
        {/* Header with title and import button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Sessions</h1>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <FileUp className="h-4 w-4" />
            Import HAR
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".har"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Import HAR file"
          />
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border p-12 text-center">
            <FileUp className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No sessions yet</h3>
              <p className="text-sm text-muted-foreground">
                Import a HAR file to get started
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-md bg-muted animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Data grid */}
        {!loading && sessions.length > 0 && (
          <DataGrid
            columns={columns}
            data={sessions}
            pageSizeOptions={[25, 50, 100]}
            showPagination
          />
        )}
      </div>
    </ListingLayout>
  );
}
