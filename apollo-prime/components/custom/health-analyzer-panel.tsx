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
  RadioGroup,
  RadioGroupItem,
} from "@uipath/apollo-wind/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import {
  AlertCircle,
  AlertTriangle,
  FileText,
  Filter,
  List,
  ListTree,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type IssueSeverity = "error" | "warning";

export interface Issue {
  id: string;
  message: string;
  severity: IssueSeverity;
  file: string;
  qualityArea?: string;
}

export type IssueScope = "file" | "project" | "solution";

export interface HealthAnalyzerPanelFilters {
  scope: IssueScope;
  errors: boolean;
  warnings: boolean;
  qualityAreas: string[];
}

export interface HealthAnalyzerPanelProps {
  issues?: Issue[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const QUALITY_AREAS = [
  "Design Best Practices",
  "Maintainability",
  "Reliability",
  "Performance",
  "Compliance",
];

const DEFAULT_ISSUES: Issue[] = [
  {
    id: "err-1",
    message:
      'Value for a required activity argument \'Task Objects (Output)\' was not supplied.',
    severity: "error",
    file: "Main.xaml",
  },
  {
    id: "err-2",
    message: 'The "Channel name/ID" field is required.',
    severity: "error",
    file: "Main.xaml",
  },
  {
    id: "err-3",
    message: 'The "Message" field is required.',
    severity: "error",
    file: "Main.xaml",
  },
  {
    id: "warn-1",
    message: "Variable 'tempResult' is declared but never used.",
    severity: "warning",
    file: "Main.xaml",
    qualityArea: "Maintainability",
  },
  {
    id: "err-4",
    message: 'The "Recipient" field is required.',
    severity: "error",
    file: "Workflow.xaml",
  },
  {
    id: "warn-2",
    message: "Activity timeout is not configured for 'HTTP Request'.",
    severity: "warning",
    file: "Workflow.xaml",
    qualityArea: "Reliability",
  },
  {
    id: "warn-3",
    message: "Hard-coded delay detected. Consider using a variable.",
    severity: "warning",
    file: "Workflow.xaml",
    qualityArea: "Design Best Practices",
  },
];

const DEFAULT_FILTERS: HealthAnalyzerPanelFilters = {
  scope: "project",
  errors: true,
  warnings: true,
  qualityAreas: [],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function filterIssues(
  issues: Issue[],
  filters: HealthAnalyzerPanelFilters
): Issue[] {
  return issues.filter((issue) => {
    if (issue.severity === "error" && !filters.errors) return false;
    if (issue.severity === "warning" && !filters.warnings) return false;
    if (
      filters.qualityAreas.length > 0 &&
      issue.qualityArea &&
      !filters.qualityAreas.includes(issue.qualityArea)
    )
      return false;
    return true;
  });
}

function groupByFile(issues: Issue[]): Map<string, Issue[]> {
  const map = new Map<string, Issue[]>();
  for (const issue of issues) {
    const list = map.get(issue.file) ?? [];
    list.push(issue);
    map.set(issue.file, list);
  }
  return map;
}

const severityIcon: Record<IssueSeverity, React.ReactNode> = {
  error: <AlertCircle className="size-4 shrink-0 text-(--color-error-icon)" />,
  warning: <AlertTriangle className="size-4 shrink-0 text-(--color-warning-icon)" />,
};

/* ------------------------------------------------------------------ */
/*  Issue row                                                          */
/* ------------------------------------------------------------------ */

function IssueRow({ issue, showFile }: { issue: Issue; showFile?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="flex w-full min-w-0 cursor-pointer items-start gap-2 overflow-hidden rounded-[3px] px-2 py-1.5 text-left text-xs hover:bg-accent"
    >
      {severityIcon[issue.severity]}
      <span className={cn("min-w-0", expanded ? "whitespace-normal break-words" : "truncate")}>
        {showFile && (
          <span className="text-muted-foreground">{issue.file}: </span>
        )}
        {issue.message}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Issue list (tree + flat)                                           */
/* ------------------------------------------------------------------ */

function IssueList({
  issues,
  viewMode,
}: {
  issues: Issue[];
  viewMode: "tree" | "flat";
}) {
  const [collapsedFiles, setCollapsedFiles] = useState<Set<string>>(new Set());

  const toggleFile = useCallback((file: string) => {
    setCollapsedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(file)) next.delete(file);
      else next.add(file);
      return next;
    });
  }, []);

  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No issues found
      </div>
    );
  }

  if (viewMode === "flat") {
    return (
      <div className="flex flex-col gap-0.5 overflow-hidden p-2">
        {issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} showFile />
        ))}
      </div>
    );
  }

  const grouped = groupByFile(issues);

  return (
    <div className="flex flex-col gap-0.5 overflow-hidden p-2">
      {Array.from(grouped.entries()).map(([file, fileIssues]) => {
        const collapsed = collapsedFiles.has(file);
        return (
          <div key={file}>
            <button
              onClick={() => toggleFile(file)}
              className="flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-[3px] px-2 py-1.5 text-xs font-semibold hover:bg-accent"
            >
              <ChevronRight
                className={cn(
                  "size-3.5 shrink-0 transition-transform",
                  !collapsed && "rotate-90"
                )}
              />
              <FileText className="size-4 shrink-0" />
              <span className="truncate">{file}</span>
              <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                {fileIssues.length}
              </span>
            </button>
            {!collapsed && (
              <div className="flex flex-col gap-0.5 pl-[20px] mt-0.5">
                {fileIssues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Popover                                                     */
/* ------------------------------------------------------------------ */

function HealthAnalyzerFilterPopover({
  filters,
  onChange,
}: {
  filters: HealthAnalyzerPanelFilters;
  onChange: (f: HealthAnalyzerPanelFilters) => void;
}) {
  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <button className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] px-1 transition-colors hover:bg-accent">
                <Filter className="h-4 w-4 text-[var(--color-icon-default)]" />
              </button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent>Filter issues</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="end" className="w-56 p-4 space-y-3">
        {/* Scope */}
        <div className="space-y-2">
          <span className="block pt-0.5 pb-0.5 text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">
            Scope
          </span>
          <RadioGroup
            value={filters.scope}
            onValueChange={(v) =>
              onChange({ ...filters, scope: v as IssueScope })
            }
            className="gap-1"
          >
            {(["file", "project", "solution"] as const).map((scope) => (
              <div key={scope} className="flex h-5 items-center gap-2">
                <RadioGroupItem value={scope} id={`scope-${scope}`} />
                <Label
                  htmlFor={`scope-${scope}`}
                  className="text-xs capitalize cursor-pointer"
                >
                  {scope}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <span className="block pt-0.5 pb-0.5 text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">
            Severity
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex h-5 items-center gap-2">
              <Checkbox
                id="sev-errors"
                checked={filters.errors}
                onCheckedChange={(v) =>
                  onChange({ ...filters, errors: v === true })
                }
              />
              <Label htmlFor="sev-errors" className="text-xs cursor-pointer">
                Errors
              </Label>
            </div>
            <div className="flex h-5 items-center gap-2">
              <Checkbox
                id="sev-warnings"
                checked={filters.warnings}
                onCheckedChange={(v) =>
                  onChange({ ...filters, warnings: v === true })
                }
              />
              <Label htmlFor="sev-warnings" className="text-xs cursor-pointer">
                Warnings
              </Label>
            </div>
          </div>
        </div>

        {/* Quality Area */}
        <div className="space-y-2">
          <span className="block pt-0.5 pb-0.5 text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">
            Quality Area
          </span>
          <div className="flex flex-col gap-1">
            {QUALITY_AREAS.map((area) => {
              const checked = filters.qualityAreas.includes(area);
              return (
                <div key={area} className="flex h-5 items-center gap-2">
                  <Checkbox
                    id={`qa-${area}`}
                    checked={checked}
                    onCheckedChange={(v) => {
                      const next = v === true
                        ? [...filters.qualityAreas, area]
                        : filters.qualityAreas.filter((a) => a !== area);
                      onChange({ ...filters, qualityAreas: next });
                    }}
                  />
                  <Label
                    htmlFor={`qa-${area}`}
                    className="text-xs cursor-pointer"
                  >
                    {area}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/*  Content component                                                  */
/* ------------------------------------------------------------------ */

function HealthAnalyzerPanelContent({
  issues = DEFAULT_ISSUES,
  className,
}: HealthAnalyzerPanelProps) {
  const [filters, setFilters] = useState<HealthAnalyzerPanelFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");

  const filtered = useMemo(() => filterIssues(issues, filters), [issues, filters]);

  return (
    <div className={cn("flex h-full w-full min-w-0 flex-col overflow-hidden", className)}>
      <div className="flex-1 overflow-auto">
        <IssueList issues={filtered} viewMode={viewMode} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook (SidePanel integration)                                       */
/* ------------------------------------------------------------------ */

/**
 * Hook that returns a `SidePanelItem`-compatible shape for the health analyzer panel.
 * Panel header actions include a tree/flat toggle and a filter popover.
 */
export function useHealthAnalyzerPanel(props: HealthAnalyzerPanelProps = {}) {
  const [filters, setFilters] = useState<HealthAnalyzerPanelFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");

  const panel = (
    <HealthAnalyzerPanelInner {...props} filters={filters} viewMode={viewMode} />
  );

  const headerActions = (
    <div className="flex items-center gap-0.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() =>
                setViewMode((v) => (v === "tree" ? "flat" : "tree"))
              }
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] px-1 transition-colors hover:bg-accent"
            >
              {viewMode === "tree" ? (
                <List className="h-4 w-4 text-[var(--color-icon-default)]" />
              ) : (
                <ListTree className="h-4 w-4 text-[var(--color-icon-default)]" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {viewMode === "tree"
              ? "Switch to flat view"
              : "Switch to tree view"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <HealthAnalyzerFilterPopover filters={filters} onChange={setFilters} />
    </div>
  );

  return { panel, headerActions, filters, setFilters, viewMode, setViewMode };
}

/* ------------------------------------------------------------------ */
/*  Inner content (receives filters/viewMode from hook)                */
/* ------------------------------------------------------------------ */

function HealthAnalyzerPanelInner({
  issues = DEFAULT_ISSUES,
  className,
  filters,
  viewMode,
}: HealthAnalyzerPanelProps & {
  filters: HealthAnalyzerPanelFilters;
  viewMode: "tree" | "flat";
}) {
  const filtered = useMemo(
    () => filterIssues(issues, filters),
    [issues, filters]
  );

  return (
    <div className={cn("flex h-full w-full min-w-0 flex-col overflow-hidden", className)}>
      <div className="flex-1 overflow-auto">
        <IssueList issues={filtered} viewMode={viewMode} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Standalone component                                               */
/* ------------------------------------------------------------------ */

/** Standalone HealthAnalyzerPanel — includes its own header actions inline. */
export function HealthAnalyzerPanel(props: HealthAnalyzerPanelProps) {
  return <HealthAnalyzerPanelContent {...props} />;
}
