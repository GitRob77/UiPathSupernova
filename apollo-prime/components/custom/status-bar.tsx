"use client";

import { cn } from "@uipath/apollo-wind";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import {
  Cloud,
  HardDrive,
  GitBranch,
  Package,
  CloudUpload,
  Terminal,
  AlertCircle,
  AlertTriangle,
  Bug,
  FlaskConical,
  ArrowDownToLine,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StatusBarItem {
  id: string;
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  align?: "left" | "right";
  /** Tooltip text shown on hover */
  tooltip?: string;
}

export interface StatusBarProps {
  /** Connection mode */
  connectionMode?: "cloud" | "local";
  /** Current branch name */
  branch?: string;
  /** Last published version label */
  lastPublished?: string;
  /** Whether there are unpublished changes since last publish */
  dirty?: boolean;
  /** Solution name shown after branch */
  solutionName?: string;
  /** Number of errors from the issues panel */
  errorCount?: number;
  /** Number of warnings from the issues panel */
  warningCount?: number;
  /** Called when issues summary is clicked */
  onIssuesClick?: () => void;
  /** Called when debug icon is clicked */
  onDebugClick?: () => void;
  /** Whether the debug panel is active/open */
  debugActive?: boolean;
  /** Called when evaluation icon is clicked */
  onEvaluateClick?: () => void;
  /** Called when terminal icon is clicked */
  onTerminalClick?: () => void;
  /** Whether the terminal panel is active/open */
  terminalActive?: boolean;
  /** Show an update available indicator next to version */
  updateAvailable?: string;
  /** Called when the update indicator is clicked */
  onUpdateClick?: () => void;
  /** Additional class names */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StatusBar({
  connectionMode = "cloud",
  branch = "main",
  lastPublished = "v1.0.0",
  dirty = false,
  solutionName,
  errorCount = 0,
  warningCount = 0,
  onIssuesClick,
  onDebugClick,
  debugActive = false,
  onEvaluateClick,
  onTerminalClick,
  terminalActive = false,
  updateAvailable,
  onUpdateClick,
  className,
}: StatusBarProps) {
  const isCloud = connectionMode === "cloud";
  const hasIssues = errorCount > 0 || warningCount > 0;

  const issueLabel = [
    errorCount > 0 && `${errorCount} error${errorCount !== 1 ? "s" : ""}`,
    warningCount > 0 && `${warningCount} warning${warningCount !== 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className={cn(
          "grid h-[37px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-t border-(--border-subtle) bg-(--surface-level-0) px-2 text-xs text-(--color-text-secondary)",
          className,
        )}
      >
        {/* Left section */}
        <div className="flex items-center gap-1">
          <StatusTooltip label={isCloud ? "Cloud connected" : "Local connected"}>
            <StatusChip
              icon={isCloud ? Cloud : HardDrive}
              label={isCloud ? "Cloud" : "Local"}
            />
          </StatusTooltip>

          <Divider />

          {solutionName && (
            <>
              <StatusTooltip label={`Solution: ${solutionName}`}>
                <StatusChip icon={Package} label={solutionName} />
              </StatusTooltip>
              <Divider />
            </>
          )}

          <StatusTooltip label={`Branch: ${branch}`}>
            <StatusChip icon={GitBranch} label={branch} />
          </StatusTooltip>

          <Divider />

          <StatusTooltip
            label={
              dirty
                ? `Last published: ${lastPublished} — unpublished changes`
                : `Last published: ${lastPublished}`
            }
          >
            <StatusChip
              icon={CloudUpload}
              label={lastPublished}
              suffix={dirty ? <DirtyDot /> : undefined}
            />
          </StatusTooltip>

          {updateAvailable && (
            <>
              <Divider />
              <StatusTooltip label={`Update available: ${updateAvailable}. Click to view.`}>
                <button
                  onClick={onUpdateClick}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-(--color-feedback-info-text) cursor-pointer transition-colors hover:bg-(--surface-level-1)"
                >
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-(--color-feedback-info-text) opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-(--color-feedback-info-text)" />
                  </span>
                  <ArrowDownToLine className="size-3.5" />
                  <span className="font-medium">{updateAvailable}</span>
                </button>
              </StatusTooltip>
            </>
          )}

          <Divider />

          <StatusTooltip label={hasIssues ? issueLabel : "No issues"}>
            <button
              onClick={onIssuesClick}
              className={cn(
                "flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors",
                "hover:bg-(--surface-level-1) hover:text-(--color-text-default)",
                onIssuesClick && "cursor-pointer",
              )}
            >
              {errorCount > 0 && (
                <span className="flex items-center gap-0.5 text-(--color-feedback-error-text)">
                  <AlertCircle className="size-3.5" />
                  <span>{errorCount}</span>
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-0.5 text-(--color-feedback-warning-text)">
                  <AlertTriangle className="size-3.5" />
                  <span>{warningCount}</span>
                </span>
              )}
              {!hasIssues && (
                <span className="flex items-center gap-0.5">
                  <AlertCircle className="size-3.5" />
                  <span>No issues</span>
                </span>
              )}
            </button>
          </StatusTooltip>
        </div>

        {/* Center section — bottom panel toggles */}
        <div className="flex items-center gap-2">
          <StatusTooltip label="Debug">
            <RailIconButton icon={Bug} onClick={onDebugClick} active={debugActive} />
          </StatusTooltip>
          <StatusTooltip label="Evaluate">
            <RailIconButton icon={FlaskConical} onClick={onEvaluateClick} />
          </StatusTooltip>
          <StatusTooltip label="Terminal">
            <RailIconButton icon={Terminal} onClick={onTerminalClick} active={terminalActive} />
          </StatusTooltip>
        </div>

        {/* Right section — empty for now, keeps center truly centered */}
        <div />
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusChip({
  icon: Icon,
  label,
  suffix,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  suffix?: React.ReactNode;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded px-1.5 py-0.5",
        onClick && "cursor-pointer transition-colors hover:bg-(--surface-level-1) hover:text-(--color-text-default)",
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span>{label}</span>
      {suffix}
    </Tag>
  );
}

function RailIconButton({
  icon: Icon,
  onClick,
  active,
}: {
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[3px] transition-colors hover:bg-accent",
        active && "bg-[var(--color-background-selected)]"
      )}
    >
      <Icon className={cn("size-4", active ? "text-(--brand)" : "text-[var(--color-icon-default)]")} />
    </button>
  );
}

function DirtyDot() {
  return (
    <span
      className="ml-0.5 inline-block size-1.5 rounded-full bg-(--color-feedback-warning-text)"
      aria-label="unpublished changes"
    />
  );
}

function Divider() {
  return <span className="mx-1 h-3.5 w-px bg-(--border-subtle)" />;
}

function StatusTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
