"use client";

import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown, ChevronLeft, CheckCircle, XCircle, SkipForward, Play, AlertCircle, Circle, Download } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@uipath/apollo-wind/components/ui/tabs";
import { TabsContent } from "@/components/custom/tabs-nav";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import type { ExecutionTrailNode } from "../mock-data/instance-5797111";

/* ------------------------------------------------------------------ */
/* Status icon mapping                                                 */
/* ------------------------------------------------------------------ */

const statusConfig: Record<
  ExecutionTrailNode["status"],
  { icon: typeof CheckCircle; color: string; fillClass?: string }
> = {
  completed: { icon: CheckCircle, color: "text-green-600" },
  cancelled: { icon: XCircle, color: "text-gray-400" },
  skipped: { icon: Circle, color: "text-gray-300" },
  running: { icon: Play, color: "text-blue-600" },
  faulted: { icon: AlertCircle, color: "text-pink-600" },
};

/* ------------------------------------------------------------------ */
/* Single trail row (recursive)                                        */
/* ------------------------------------------------------------------ */

function TrailRow({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: ExecutionTrailNode;
  depth: number;
  selectedId: string | null;
  onSelect: (node: ExecutionTrailNode) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [iterationIndex, setIterationIndex] = useState(0);

  const hasChildren = !!node.children?.length;
  const config = statusConfig[node.status];
  const Icon = config.icon;
  const isSelected = selectedId === node.id;

  /* Detect if children are loop iterations (all children start with "Iteration") */
  const isLoop =
    hasChildren &&
    node.children!.length > 1 &&
    node.children!.every((c) => c.id.startsWith("iteration-"));

  const totalIterations = isLoop ? node.children!.length : 0;
  const currentIteration = isLoop ? node.children![iterationIndex] : null;
  const displayChildren = isLoop ? currentIteration?.children ?? [] : node.children ?? [];

  const handleIterationChange = useCallback(
    (newIndex: number) => {
      const oldChildren = node.children![iterationIndex]?.children ?? [];
      const newChildren = node.children![newIndex]?.children ?? [];

      const selectedChildIndex = oldChildren.findIndex((c) => c.id === selectedId);

      setIterationIndex(newIndex);

      if (selectedChildIndex >= 0 && selectedChildIndex < newChildren.length) {
        onSelect(newChildren[selectedChildIndex]);
      }
    },
    [iterationIndex, node.children, selectedId, onSelect],
  );

  return (
    <>
      <tr
        className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
          isSelected ? "bg-blue-50" : ""
        }`}
        onClick={() => {
          if (hasChildren) setExpanded((v) => !v);
          onSelect(node);
        }}
      >
        {/* Status & step */}
        <td className="py-2 pr-2">
          <div
            className="flex items-center gap-1.5"
            style={{ paddingLeft: depth * 20 + 8 }}
          >
            <Icon size={16} className={`shrink-0 ${config.color}`} />
            {hasChildren ? (
              expanded ? (
                <ChevronDown size={13} className="shrink-0 text-gray-400" />
              ) : (
                <ChevronRight size={13} className="shrink-0 text-gray-400" />
              )
            ) : null}
            <span className="text-[13px] text-gray-800 truncate">{node.label}</span>

            {/* Loop iteration pagination */}
            {isLoop && expanded && (
              <div className="flex items-center gap-1 ml-2 select-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIterationChange(Math.max(0, iterationIndex - 1));
                  }}
                  disabled={iterationIndex === 0}
                  className={`p-0.5 rounded hover:bg-gray-200 transition-colors ${
                    iterationIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
                  }`}
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
                  className={`p-0.5 rounded hover:bg-gray-200 transition-colors ${
                    iterationIndex === totalIterations - 1 ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                >
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </td>
        {/* Ended at */}
        <td className="py-2 px-3 text-[13px] text-gray-600 whitespace-nowrap">
          {isLoop && expanded && currentIteration ? currentIteration.endedAt : node.endedAt}
        </td>
        {/* Duration */}
        <td className="py-2 px-3 text-[13px] text-gray-600 whitespace-nowrap text-right">
          {isLoop && expanded && currentIteration ? currentIteration.duration : node.duration}
        </td>
      </tr>
      {hasChildren &&
        expanded &&
        displayChildren.map((child) => (
          <TrailRow
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Exported component                                                  */
/* ------------------------------------------------------------------ */

export function ExecutionTrail({
  root,
  selectedId,
  onSelect,
}: {
  root: ExecutionTrailNode;
  selectedId?: string | null;
  onSelect?: (node: ExecutionTrailNode) => void;
}) {
  const [tab, setTab] = useState("execution-trail");
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const sel = selectedId ?? internalSelected;
  const handleSelect =
    onSelect ?? ((n: ExecutionTrailNode) => setInternalSelected(n.id));

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pl-4 pr-4 pt-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto gap-0 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="execution-trail"
              className="rounded-none px-3 py-2 text-xs font-medium shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Execution trail
            </TabsTrigger>
            <TabsTrigger
              value="action-history"
              className="rounded-none px-3 py-2 text-xs font-medium shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Action history
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 mr-1">
          <Download size={14} className="text-gray-400" />
        </Button>
      </div>

      {/* Table content */}
      {tab === "execution-trail" && (
        <div className="flex-1 overflow-auto pl-4 pr-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white sticky top-0">
                <th className="pt-2 pb-2 px-2 text-left text-xs font-medium text-(--color-foreground-light)">
                  Status &amp; step
                </th>
                <th className="py-2 px-3 text-left text-xs font-medium text-(--color-foreground-light) whitespace-nowrap">
                  Ended at
                </th>
                <th className="py-2 px-3 text-right text-xs font-medium text-(--color-foreground-light)">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              <TrailRow
                node={root}
                depth={0}
                selectedId={sel}
                onSelect={handleSelect}
              />
            </tbody>
          </table>
        </div>
      )}

      {tab === "action-history" && (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400 pl-4 pr-4">
          No action history available
        </div>
      )}
    </div>
  );
}
