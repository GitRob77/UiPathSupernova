"use client";

import { useState } from "react";
import { cn } from "@uipath/apollo-wind";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import {
  Play,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  Mail,
  Wrench,
  Brain,
  Sparkles,
  Shield,
  Send,
  FileOutput,
  FileText,
} from "lucide-react";
import type { RunHistoryItem, RunStepItem } from "./types";

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tool: Wrench,
  llm: Brain,
  sparkles: Sparkles,
  shield: Shield,
  send: Send,
  output: FileOutput,
};

function RunStepRow({
  step,
  depth,
  selectedId,
  onSelect,
}: {
  step: RunStepItem;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = step.children && step.children.length > 0;
  const StepIcon = STEP_ICONS[step.icon ?? "sparkles"] ?? Sparkles;
  const isSelected = selectedId === step.id;
  const paddingLeft = 8 + depth * 16;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "flex h-7 cursor-pointer items-center gap-1.5 rounded-sm pr-2",
          isSelected
            ? "bg-(--color-background-selected)"
            : "hover:bg-(--surface-hover)"
        )}
        style={{ paddingLeft: step.isCurrent ? 4 : paddingLeft }}
        onClick={() => {
          onSelect(step.id);
          if (hasChildren) setExpanded((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(step.id);
            if (hasChildren) setExpanded((v) => !v);
          }
        }}
      >
        {step.isCurrent && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/execution-pointer.svg" alt="" className="h-3.5 shrink-0" />
            <span className="shrink-0" style={{ width: paddingLeft - 10 }} />
          </>
        )}

        {hasChildren ? (
          expanded ? (
            <ChevronDown className="size-3.5 shrink-0 text-(--color-icon-default)" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-(--color-icon-default)" />
          )
        ) : (
          !step.isCurrent && <span className="w-3.5 shrink-0" />
        )}
        <StepIcon className="size-3.5 shrink-0 text-(--color-icon-default)" />
        <span className="flex-1 truncate text-(--foreground)">
          {step.label}
        </span>
        {step.badge && (
          <span className="shrink-0 rounded border border-(--border-subtle) bg-white px-1 py-px text-[10px] text-(--foreground-subtle)">
            {step.badge}
          </span>
        )}
        {step.status === "success" && (
          <span className="shrink-0 rounded bg-(--color-success-background) px-1.5 py-px text-[10px] font-semibold text-(--color-success-text)">
            Success
          </span>
        )}
        {step.status === "in-progress" && (
          <span className="shrink-0 rounded bg-(--color-info-background) px-1.5 py-px text-[10px] font-semibold text-(--color-info-text)">
            In progress
          </span>
        )}
        {step.status === "canceled" && (
          <span className="shrink-0 rounded bg-(--color-background-secondary) px-1.5 py-px text-[10px] font-semibold text-(--color-foreground)">
            Canceled
          </span>
        )}
        {step.duration ? (
          <span className="w-10 shrink-0 text-right text-[11px] text-(--foreground-subtle)">
            {step.duration}
          </span>
        ) : step.status && (
          <span className="w-10 shrink-0" />
        )}
      </div>
      {expanded && hasChildren && step.children!.map((child) => (
        <RunStepRow key={child.id} step={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </>
  );
}

function RunHistoryRow({
  item,
  isSelected,
  onSelect,
  isExpanded,
  onToggle,
  selectedStepId,
  onStepSelect,
}: {
  item: RunHistoryItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  selectedStepId: string | null;
  onStepSelect: (id: string) => void;
}) {
  const IconComponent = item.icon === "play" ? Play : item.icon === "mail" ? Mail : item.icon === "document" ? FileText : ArrowUp;
  const hasSteps = item.steps && item.steps.length > 0;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "flex h-7 cursor-pointer items-center gap-1.5 rounded-sm px-1",
          isSelected
            ? "bg-(--color-background-selected)"
            : "hover:bg-(--surface-hover)"
        )}
        onClick={() => {
          onSelect(item.id);
          if (hasSteps) onToggle(item.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(item.id);
            if (hasSteps) onToggle(item.id);
          }
        }}
      >
        {hasSteps ? (
          isExpanded ? (
            <ChevronDown className="size-3.5 shrink-0 text-(--color-icon-default)" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-(--color-icon-default)" />
          )
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-(--color-icon-default)" />
        )}

        <IconComponent className="size-3.5 shrink-0 text-(--color-icon-default)" />

        <span className="flex-1 truncate text-(--foreground)">
          <span className="font-semibold">{item.label}</span>
          <span className="ml-1 text-(--foreground-subtle)">— {item.timestamp}</span>
        </span>

        {item.status === "in-progress" && (
          <span className="shrink-0 rounded bg-(--color-info-background) px-1.5 py-px text-[10px] font-semibold text-(--color-info-text)">
            In progress
          </span>
        )}
        {item.status === "success" && (
          <span className="shrink-0 rounded bg-(--color-success-background) px-1.5 py-px text-[10px] font-semibold text-(--color-success-text)">
            Success
          </span>
        )}
        {item.status === "canceled" && (
          <span className="shrink-0 rounded bg-(--color-background-secondary) px-1.5 py-px text-[10px] font-semibold text-(--color-foreground)">
            Canceled
          </span>
        )}
        <span className="w-12 shrink-0 text-right text-[11px] text-(--foreground-subtle)">
          {item.duration ?? ""}
        </span>
      </div>

      {isExpanded && hasSteps && item.steps!.map((step) => (
        <RunStepRow key={step.id} step={step} depth={1} selectedId={selectedStepId} onSelect={onStepSelect} />
      ))}
    </div>
  );
}

export interface RunHistoryPanelProps {
  items: RunHistoryItem[];
  selectedRunId: string | null;
  selectedStepId: string | null;
  expandedRunIds: Set<string>;
  onSelectRun: (id: string) => void;
  onToggleRun: (id: string) => void;
  onSelectStep: (runId: string, stepId: string) => void;
}

export function RunHistoryPanel({
  items,
  selectedRunId,
  selectedStepId,
  expandedRunIds,
  onSelectRun,
  onToggleRun,
  onSelectStep,
}: RunHistoryPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-1">
        {items.map((item) => (
          <RunHistoryRow
            key={item.id}
            item={item}
            isSelected={selectedRunId === item.id && selectedStepId === null}
            onSelect={onSelectRun}
            isExpanded={expandedRunIds.has(item.id)}
            onToggle={onToggleRun}
            selectedStepId={selectedRunId === item.id ? selectedStepId : null}
            onStepSelect={(stepId) => onSelectStep(item.id, stepId)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
