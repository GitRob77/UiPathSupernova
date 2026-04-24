"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import { OntologyIcon } from "./ontology-icon";
import { cn } from "@uipath/apollo-wind";

export interface OntologyNodeData {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  isHighlighted?: boolean;
  [key: string]: unknown;
}

type OntologyNode = Node<OntologyNodeData, "ontologyNode">;

const hiddenHandle: React.CSSProperties = {
  opacity: 0,
  width: 0,
  height: 0,
  minWidth: 0,
  minHeight: 0,
  border: "none",
  background: "transparent",
  padding: 0,
  pointerEvents: "none",
};

const positions = [Position.Top, Position.Right, Position.Bottom, Position.Left] as const;
const positionIds = ["top", "right", "bottom", "left"] as const;

export function GraphNode({ data }: NodeProps<OntologyNode>) {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-sm transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/10",
        data.isHighlighted
          ? "border-primary ring-2 ring-primary/20"
          : "border-(--border-subtle)",
      )}
    >
      {positions.map((pos, i) => (
        <Handle
          key={`s-${positionIds[i]}`}
          id={`${positionIds[i]}-source`}
          type="source"
          position={pos}
          style={hiddenHandle}
        />
      ))}
      {positions.map((pos, i) => (
        <Handle
          key={`t-${positionIds[i]}`}
          id={`${positionIds[i]}-target`}
          type="target"
          position={pos}
          style={hiddenHandle}
        />
      ))}
      <OntologyIcon icon={data.icon} colorClass={data.iconColor} size="sm" />
      <span className="text-sm font-medium whitespace-nowrap">{data.label}</span>
    </div>
  );
}

/**
 * Given source and target node positions, returns the best
 * sourceHandle / targetHandle IDs so edges connect from the
 * closest sides of each node.
 */
export function getBestHandles(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
) {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0
      ? { sourceHandle: "right-source", targetHandle: "left-target" }
      : { sourceHandle: "left-source", targetHandle: "right-target" };
  }
  return dy > 0
    ? { sourceHandle: "bottom-source", targetHandle: "top-target" }
    : { sourceHandle: "top-source", targetHandle: "bottom-target" };
}
