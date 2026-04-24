"use client";

import { cn } from "@uipath/apollo-wind";
import { Checkbox } from "@uipath/apollo-wind/components/ui/checkbox";
import { Label } from "@uipath/apollo-wind/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@uipath/apollo-wind/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import {
  ListFilter,
  Camera,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  AlertCircle,
  Plus,
  ArrowUpCircle,
  ExternalLink,
} from "lucide-react";
import { useState, useMemo, useRef, useLayoutEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type HistoryEntryType = "current" | "publish" | "manual-snapshot" | "auto-snapshot";
export type PublishStatus = "success" | "error";

export interface HistoryEntry {
  id: string;
  type: HistoryEntryType;
  title: string;
  timeAgo: string;
  author: string;
  description?: string;
  /** Only for publish entries */
  version?: string;
  /** Only for publish entries */
  feedName?: string;
  /** Only for publish entries — defaults to "success" */
  publishStatus?: PublishStatus;
}

export interface ChangeHistoryFilters {
  manualSnapshot: boolean;
  autoSnapshot: boolean;
  publish: boolean;
}

export interface ChangeHistoryPanelProps {
  entries?: HistoryEntry[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const DEFAULT_ENTRIES: HistoryEntry[] = [
  {
    id: "current",
    type: "current",
    title: "Current version",
    timeAgo: "2 seconds ago",
    author: "Codin Andrei",
  },
  {
    id: "pub-1.1.0",
    type: "publish",
    title: "v 1.1.0 - Feedback form included",
    timeAgo: "3 days ago",
    author: "Codin Andrei",
    description: "Added feedback form with validation and submission confirmation dialog",
    feedName: "Feed name here",
    publishStatus: "success",
  },
  {
    id: "snap-1",
    type: "manual-snapshot",
    title: "Before linking to app form",
    timeAgo: "6 days ago",
    author: "Silviu Tanasie",
  },
  {
    id: "pub-1.0.0",
    type: "publish",
    title: "v 1.0.0 - Title, description, and labels were mapped to the Jira issue",
    timeAgo: "12 days ago",
    author: "Codin Andrei",
    description: "Mapped Jira fields to project metadata including title, description, and label sync",
    feedName: "Feed name here",
    publishStatus: "success",
  },
  {
    id: "snap-2",
    type: "auto-snapshot",
    title: "Stable build before testing Netsuite integration",
    timeAgo: "1 month ago",
    author: "Codin Andrei",
    description: "This description can have multiple lines but we truncate whatever is longer than",
  },
  {
    id: "snap-3",
    type: "auto-snapshot",
    title: "Get info from Google Sheets 2",
    timeAgo: "2 months ago",
    author: "Codin Andrei",
    description: "Jira issue was mapped to title, description, and labels",
  },
  {
    id: "snap-4",
    type: "manual-snapshot",
    title: "Get info from Google Sheets 1",
    timeAgo: "2 months ago",
    author: "Codin Andrei",
    description: "Jira issue was mapped to title, description, and labels",
  },
  {
    id: "pub-0.2.0",
    type: "publish",
    title: "v 0.2.0 - Auth module update",
    timeAgo: "2 months ago",
    author: "Codin Andrei",
    feedName: "Production feed",
    publishStatus: "error",
  },
  {
    id: "pub-0.1.0",
    type: "publish",
    title: "v 0.1.0 - Initial deployment",
    timeAgo: "3 months ago",
    author: "Codin Andrei",
    description: "First production release with core workflow automation and Google Sheets integration",
    feedName: "Personal workspace",
    publishStatus: "success",
  },
  {
    id: "snap-5",
    type: "auto-snapshot",
    title: "Stable build before deploytest",
    timeAgo: "3 months ago",
    author: "Codin Andrei",
    description: "This description can have multiple lines but we truncate whatever is longer than",
  },
  {
    id: "snap-6",
    type: "manual-snapshot",
    title: "Connections added",
    timeAgo: "3 months ago",
    author: "Codin Andrei",
  },
];

const DEFAULT_FILTERS: ChangeHistoryFilters = {
  manualSnapshot: true,
  autoSnapshot: true,
  publish: true,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function filterEntries(
  entries: HistoryEntry[],
  filters: ChangeHistoryFilters
): HistoryEntry[] {
  return entries.filter((entry) => {
    if (entry.type === "current") return true;
    if (entry.type === "publish" && !filters.publish) return false;
    if (entry.type === "manual-snapshot" && !filters.manualSnapshot) return false;
    if (entry.type === "auto-snapshot" && !filters.autoSnapshot) return false;
    return true;
  });
}

/* ------------------------------------------------------------------ */
/*  Timeline indicator                                                 */
/* ------------------------------------------------------------------ */

function TimelineIndicator({ entry }: { entry: HistoryEntry }) {
  if (entry.type === "current") {
    return (
      <div className="flex size-4 shrink-0 items-center justify-center">
        <div className="size-1.5 rounded-full bg-muted-foreground" />
      </div>
    );
  }

  if (entry.type === "publish") {
    if (entry.publishStatus === "error") {
      return <AlertCircle className="size-4 shrink-0 text-(--color-error-icon)" />;
    }
    return <CheckCircle2 className="size-4 shrink-0 text-(--color-success-icon)" />;
  }

  return <Circle className="size-4 shrink-0 text-muted-foreground/50" />;
}

/* ------------------------------------------------------------------ */
/*  History entry row                                                  */
/* ------------------------------------------------------------------ */

const PUBLISH_ACTIONS = [
  { icon: Plus, label: "Create new deployment" },
  { icon: ArrowUpCircle, label: "Upgrade deployment" },
  { icon: ExternalLink, label: "View deployment" },
];

function HistoryEntryRow({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const isCurrent = entry.type === "current";
  const isPublish = entry.type === "publish";
  const isSuccessPublish = isPublish && entry.publishStatus !== "error";

  return (
    <div
      className={cn(
        "group rounded-[3px] transition-colors",
        isCurrent
          ? "bg-[var(--color-background-selected)]"
          : "hover:bg-[var(--color-background-secondary)]"
      )}
    >
      <button
        onClick={() => isSuccessPublish && setExpanded((v) => !v)}
        className={cn(
          "flex w-full min-w-0 items-start gap-2 px-2 py-2 text-left",
          isSuccessPublish && "cursor-pointer"
        )}
      >
        {/* Timeline dot */}
        <div data-timeline-icon className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-(--color-background)" style={{ transform: "translate(-4px, -4px)" }}>
          <TimelineIndicator entry={entry} />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={cn(
              "text-xs leading-snug",
              isCurrent ? "font-semibold" : "font-medium"
            )}
          >
            {entry.title}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {entry.timeAgo} by {entry.author}
          </span>
          {entry.feedName && (
            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <FolderOpen className="size-3 shrink-0" />
              {entry.feedName}
            </span>
          )}
          {entry.description && !isSuccessPublish && (
            <span className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
              {entry.description}
            </span>
          )}
        </div>

        {/* Chevron for successful publish entries */}
        {isSuccessPublish && (
          expanded ? (
            <ChevronUp className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )
        )}
      </button>

      {/* Expanded area for successful publishes */}
      {isSuccessPublish && expanded && (
        <div className="ml-8 mr-2 mb-1 flex flex-col gap-1 p-2">
          {entry.description && (
            <p className="text-[11px] text-muted-foreground mb-1">
              {entry.description}
            </p>
          )}
          {PUBLISH_ACTIONS.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label}
                className="flex w-full items-center gap-1.5 rounded-[3px] px-1.5 py-1 text-[11px] text-primary hover:bg-accent transition-colors cursor-pointer"
              >
                <ActionIcon className="size-3 shrink-0" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline line connector                                            */
/* ------------------------------------------------------------------ */

function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const updateLine = useCallback(() => {
    const container = containerRef.current;
    const line = lineRef.current;
    if (!container || !line) return;

    const icons = container.querySelectorAll<HTMLElement>("[data-timeline-icon]");
    if (icons.length < 2) {
      line.style.display = "none";
      return;
    }

    const first = icons[0];
    const last = icons[icons.length - 1];
    const containerRect = container.getBoundingClientRect();
    const firstRect = first.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();

    const top = firstRect.top - containerRect.top + firstRect.height / 2;
    const bottom = lastRect.top - containerRect.top + lastRect.height / 2;

    line.style.display = "";
    line.style.top = `${top}px`;
    line.style.height = `${bottom - top}px`;
  }, []);

  useLayoutEffect(() => {
    updateLine();
  });

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No history entries
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-px py-1 px-1">
      {/* Vertical timeline line */}
      <div ref={lineRef} className="absolute left-[17px] w-px bg-border" />

      {entries.map((entry) => (
        <div key={entry.id} className="relative z-10">
          <HistoryEntryRow entry={entry} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Popover                                                     */
/* ------------------------------------------------------------------ */

function ChangeHistoryFilterPopover({
  filters,
  onChange,
}: {
  filters: ChangeHistoryFilters;
  onChange: (f: ChangeHistoryFilters) => void;
}) {
  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <button className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] px-1 transition-colors hover:bg-accent">
                <ListFilter className="h-4 w-4 text-[var(--color-icon-default)]" />
              </button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent>Filter history</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="end" className="w-48 p-3 space-y-1.5">
        <div className="flex h-5 items-center gap-2">
          <Checkbox
            id="filter-manual"
            checked={filters.manualSnapshot}
            onCheckedChange={(v) =>
              onChange({ ...filters, manualSnapshot: v === true })
            }
          />
          <Label htmlFor="filter-manual" className="text-xs cursor-pointer">
            Manual snapshot
          </Label>
        </div>
        <div className="flex h-5 items-center gap-2">
          <Checkbox
            id="filter-auto"
            checked={filters.autoSnapshot}
            onCheckedChange={(v) =>
              onChange({ ...filters, autoSnapshot: v === true })
            }
          />
          <Label htmlFor="filter-auto" className="text-xs cursor-pointer">
            Auto snapshot
          </Label>
        </div>
        <div className="flex h-5 items-center gap-2">
          <Checkbox
            id="filter-publish"
            checked={filters.publish}
            onCheckedChange={(v) =>
              onChange({ ...filters, publish: v === true })
            }
          />
          <Label htmlFor="filter-publish" className="text-xs cursor-pointer">
            Publish
          </Label>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/*  Inner content (receives filters from hook)                         */
/* ------------------------------------------------------------------ */

function ChangeHistoryPanelInner({
  entries = DEFAULT_ENTRIES,
  className,
  filters,
}: ChangeHistoryPanelProps & {
  filters: ChangeHistoryFilters;
}) {
  const filtered = useMemo(
    () => filterEntries(entries, filters),
    [entries, filters]
  );

  return (
    <div className={cn("flex h-full w-full min-w-0 flex-col overflow-hidden", className)}>
      <div className="flex-1 overflow-auto">
        <HistoryList entries={filtered} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook (SidePanel integration)                                       */
/* ------------------------------------------------------------------ */

export function useChangeHistoryPanel(props: ChangeHistoryPanelProps = {}) {
  const [filters, setFilters] = useState<ChangeHistoryFilters>(DEFAULT_FILTERS);

  const panel = (
    <ChangeHistoryPanelInner {...props} filters={filters} />
  );

  const headerActions = (
    <div className="flex items-center gap-0.5">
      <ChangeHistoryFilterPopover filters={filters} onChange={setFilters} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] px-1 transition-colors hover:bg-accent">
              <Camera className="h-4 w-4 text-[var(--color-icon-default)]" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Take snapshot</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return { panel, headerActions, filters, setFilters };
}
