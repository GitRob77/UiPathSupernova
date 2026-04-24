"use client";

import { cn } from "@uipath/apollo-wind";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import { Info, CheckCircle } from "lucide-react";
import type { LogEntry, LogLevel } from "./types";

function LogIcon({ level }: { level: LogLevel }) {
  switch (level) {
    case "info":
      return <Info className="size-3.5 shrink-0 text-(--color-feedback-info-text)" />;
    case "trace":
      return <Info className="size-3.5 shrink-0 text-(--color-icon-default)" />;
    case "success":
      return <CheckCircle className="size-3.5 shrink-0 text-(--color-feedback-success-icon)" />;
    case "error":
      return <Info className="size-3.5 shrink-0 text-(--color-error-text)" />;
  }
}

function LogRow({ entry }: { entry: LogEntry }) {
  const isError = entry.level === "error";
  return (
    <div className={cn("flex h-7 items-center gap-1 rounded-sm px-1", isError && "bg-(--color-error-background)")}>
      <LogIcon level={entry.level} />
      <span className={cn("shrink-0 ", isError ? "text-(--color-error-text)" : "text-(--foreground-subtle)")}>{entry.time}</span>
      <span className={cn("flex-1 truncate ", isError ? "text-(--color-error-text)" : "text-(--foreground)")}>{entry.message}</span>
      {entry.duration && (
        <span className="shrink-0 text-[11px] text-(--foreground-subtle)">{entry.duration}</span>
      )}
    </div>
  );
}

export interface LogsPanelProps {
  entries: LogEntry[];
}

export function LogsPanel({ entries }: LogsPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col justify-end p-1 pb-2">
        {entries.map((entry) => (
          <LogRow key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  );
}
