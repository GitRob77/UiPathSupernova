"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GraphNode, getBestHandles, type OntologyNodeData } from "./graph-node";
import { objectTypes, linkTypes } from "../data/mock-data";

const nodeTypes = { ontologyNode: GraphNode };

interface OntologyGraphViewProps {
  onSelectObjectType: (id: string) => void;
}

export function OntologyGraphView({ onSelectObjectType }: OntologyGraphViewProps) {
  const { nodes, edges } = useMemo(() => {
    // Hand-tuned positions: Employee is the hub, connected nodes radiate out,
    // Office branches off Department
    const positionMap: Record<string, { x: number; y: number }> = {
      employee: { x: 300, y: 180 },
      department: { x: 60, y: 40 },
      office: { x: 60, y: 320 },
      project: { x: 540, y: 40 },
      equipment: { x: 540, y: 320 },
      ticket: { x: 300, y: 400 },
    };

    const graphNodes: Node<OntologyNodeData>[] = objectTypes.map((ot) => ({
      id: ot.id,
      type: "ontologyNode",
      position: positionMap[ot.id] ?? { x: 0, y: 0 },
      data: {
        label: ot.displayName,
        icon: ot.icon,
        iconColor: ot.iconColor,
      },
    }));

    // Build a position lookup for handle routing
    const posMap = new Map<string, { x: number; y: number }>();
    for (const n of graphNodes) {
      posMap.set(n.id, n.position);
    }

    const graphEdges: Edge[] = linkTypes.map((lt) => {
      const sPos = posMap.get(lt.sourceObjectTypeId)!;
      const tPos = posMap.get(lt.targetObjectTypeId)!;
      const handles = getBestHandles(sPos, tPos);
      return {
        id: lt.id,
        source: lt.sourceObjectTypeId,
        target: lt.targetObjectTypeId,
        sourceHandle: handles.sourceHandle,
        targetHandle: handles.targetHandle,
        label: lt.displayName,
        type: "smoothstep",
        animated: true,
        style: { stroke: "var(--color-border)", strokeWidth: 1.5 },
        labelStyle: { fontSize: 11, fill: "var(--color-muted-foreground)" },
        labelBgStyle: { fill: "var(--color-background)", opacity: 0.9 },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
      };
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, []);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onSelectObjectType(node.id);
    },
    [onSelectObjectType],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Ontology Graph</h1>
        <p className="text-sm text-muted-foreground">
          Visual representation of all object types and their relationships
        </p>
      </div>
      <div className="rounded-lg border border-(--border-subtle)" style={{ height: "calc(100vh - 220px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.35 }}
          nodesDraggable={false}
          nodesConnectable={false}
          onNodeClick={handleNodeClick}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
