"use client";

import { useState, useCallback } from "react";
import { cn } from "@uipath/apollo-wind";
import { ExecutionTrailStep } from "../types/debug";
import {
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Circle,
  Download,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@uipath/apollo-wind/components/ui/button";

const statusIcon = {
  completed: { icon: CheckCircle, color: "text-green-600" },
  faulted: { icon: AlertCircle, color: "text-red-500" },
  running: { icon: Circle, color: "text-blue-500" },
  skipped: { icon: Circle, color: "text-gray-400" },
  paused: { icon: PauseCircle, color: "text-amber-500" },
  cancelled: { icon: XCircle, color: "text-gray-500" },
};

interface TrailRowProps {
  step: ExecutionTrailStep;
  depth: number;
  defaultExpanded?: boolean;
  selectedStepId?: string | null;
  onStepSelect?: (step: ExecutionTrailStep) => void;
}

function TrailRow({
  step,
  depth,
  defaultExpanded = false,
  selectedStepId,
  onStepSelect,
}: TrailRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [iterationIndex, setIterationIndex] = useState(0);

  const isLoop = step.iterations && step.iterations.length > 0;
  const hasChildren = isLoop || (step.children && step.children.length > 0);
  const { icon: StatusIcon, color } = statusIcon[step.status];
  const isSelected = selectedStepId === step.id;

  const currentChildren = isLoop
    ? step.iterations![iterationIndex]
    : step.children;

  const totalIterations = isLoop ? step.iterations!.length : 0;

  const handleIterationChange = useCallback((newIndex: number) => {
    if (!isLoop || !onStepSelect) {
      setIterationIndex(newIndex);
      return;
    }

    const oldIteration = step.iterations![iterationIndex];
    const newIteration = step.iterations![newIndex];

    const selectedChildIndex = oldIteration.findIndex(
      (child) => child.id === selectedStepId
    );

    setIterationIndex(newIndex);

    if (selectedChildIndex >= 0 && selectedChildIndex < newIteration.length) {
      onStepSelect(newIteration[selectedChildIndex]);
    }
  }, [isLoop, iterationIndex, step.iterations, selectedStepId, onStepSelect]);

  return (
    <>
      <tr
        className={cn(
          "border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer",
          depth === 0 && "bg-gray-50/50",
          isSelected && "bg-blue-50 hover:bg-blue-50"
        )}
        onClick={() => onStepSelect?.(step)}
      >
        <td className="py-2 pr-3 text-sm">
          <div
            className="flex items-center gap-1.5"
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
          >
            <StatusIcon size={14} className={cn(color, "flex-shrink-0")} />
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                {expanded ? (
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                )}
                <span className={cn("text-xs", isSelected ? "text-blue-700 font-medium" : "text-gray-800")}>
                  {step.name}
                </span>
              </button>
            ) : (
              <span
                className={cn(
                  "text-xs",
                  isSelected ? "text-blue-700 font-medium" : "text-gray-700"
                )}
                style={{ paddingLeft: hasChildren ? 0 : 18 }}
              >
                {step.name}
              </span>
            )}

            {/* Loop iteration pagination */}
            {isLoop && expanded && (
              <div className="flex items-center gap-1 ml-2 select-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIterationChange(Math.max(0, iterationIndex - 1));
                  }}
                  disabled={iterationIndex === 0}
                  className={cn(
                    "p-0.5 rounded hover:bg-gray-200 transition-colors",
                    iterationIndex === 0 && "opacity-30 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft size={14} className="text-gray-600" />
                </button>
                <span className="text-xs font-semibold text-gray-700 tabular-nums">
                  {iterationIndex + 1} of {totalIterations}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIterationChange(Math.min(totalIterations - 1, iterationIndex + 1));
                  }}
                  disabled={iterationIndex === totalIterations - 1}
                  className={cn(
                    "p-0.5 rounded hover:bg-gray-200 transition-colors",
                    iterationIndex === totalIterations - 1 && "opacity-30 cursor-not-allowed"
                  )}
                >
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </td>
        <td className="py-2 px-3 text-xs text-gray-500 whitespace-nowrap">
          {step.endedAt}
        </td>
        <td className="py-2 px-3 text-xs text-gray-500 whitespace-nowrap">
          {step.duration}
        </td>
      </tr>
      {expanded &&
        hasChildren &&
        currentChildren!.map((child) => (
          <TrailRow
            key={child.id}
            step={child}
            depth={depth + 1}
            defaultExpanded={depth < 1}
            selectedStepId={selectedStepId}
            onStepSelect={onStepSelect}
          />
        ))}
    </>
  );
}

interface ExecutionTrailProps {
  trail: ExecutionTrailStep;
  selectedStepId?: string | null;
  onStepSelect?: (step: ExecutionTrailStep) => void;
}

export function ExecutionTrailV2({
  trail,
  selectedStepId,
  onStepSelect,
}: ExecutionTrailProps) {
  const [activeTab, setActiveTab] = useState<"trail" | "history">("trail");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b pl-4 pr-4 pt-2">
        <div className="flex">
          <button
            onClick={() => setActiveTab("trail")}
            className={cn(
              "px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
              activeTab === "trail"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Execution trail
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Action history
          </button>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400">
          <Download size={14} />
        </Button>
      </div>

      <div className="overflow-auto flex-1 pl-4 pr-4">
        <table className="w-full">
          <thead>
            <tr className="bg-white sticky top-0">
              <th className="text-left text-xs font-medium text-(--color-foreground-light) pt-2 pb-2 px-2">
                Status & step
              </th>
              <th className="text-left text-xs font-medium text-(--color-foreground-light) py-2 px-3">
                Ended at
              </th>
              <th className="text-left text-xs font-medium text-(--color-foreground-light) py-2 px-3">
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {activeTab === "trail" ? (
              <TrailRow
                step={trail}
                depth={0}
                defaultExpanded={true}
                selectedStepId={selectedStepId}
                onStepSelect={onStepSelect}
              />
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-8 text-xs text-gray-400">
                  No action history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
