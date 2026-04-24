"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GraphNode, getBestHandles, type OntologyNodeData } from "./graph-node";
import { objectTypes, linkTypes } from "../data/mock-data";
import type { ObjectType } from "../data/types";

const nodeTypes = { ontologyNode: GraphNode };

interface ObjectTypeGraphProps {
  objectType: ObjectType;
  className?: string;
}

export function ObjectTypeGraph({ objectType, className }: ObjectTypeGraphProps) {
  const { nodes, edges } = useMemo(() => {
    // Find all link types involving this object type
    const relevantLinks = linkTypes.filter(
      (lt) =>
        lt.sourceObjectTypeId === objectType.id ||
        lt.targetObjectTypeId === objectType.id,
    );

    // Collect connected object type IDs
    const connectedIds = new Set<string>();
    for (const lt of relevantLinks) {
      if (lt.sourceObjectTypeId !== objectType.id)
        connectedIds.add(lt.sourceObjectTypeId);
      if (lt.targetObjectTypeId !== objectType.id)
        connectedIds.add(lt.targetObjectTypeId);
    }

    const connectedOTs = objectTypes.filter((ot) => connectedIds.has(ot.id));

    // Place center node
    const centerX = 300;
    const centerY = 175;
    const radius = 160;

    const graphNodes: Node<OntologyNodeData>[] = [
      {
        id: objectType.id,
        type: "ontologyNode",
        position: { x: centerX - 60, y: centerY - 18 },
        data: {
          label: objectType.displayName,
          icon: objectType.icon,
          iconColor: objectType.iconColor,
          isHighlighted: true,
        },
      },
    ];

    // Arrange connected nodes in a radial layout
    connectedOTs.forEach((ot, i) => {
      const angle = (2 * Math.PI * i) / connectedOTs.length - Math.PI / 2;
      graphNodes.push({
        id: ot.id,
        type: "ontologyNode",
        position: {
          x: centerX - 60 + Math.cos(angle) * radius,
          y: centerY - 18 + Math.sin(angle) * radius,
        },
        data: {
          label: ot.displayName,
          icon: ot.icon,
          iconColor: ot.iconColor,
        },
      });
    });

    // Build a position lookup for handle routing
    const posMap = new Map<string, { x: number; y: number }>();
    for (const n of graphNodes) {
      posMap.set(n.id, n.position);
    }

    // Build edges with best handle routing
    const graphEdges: Edge[] = relevantLinks.map((lt) => {
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
        style: { stroke: "var(--color-border)", strokeWidth: 1.5 },
        labelStyle: { fontSize: 11, fill: "var(--color-muted-foreground)" },
        labelBgStyle: { fill: "var(--color-background)", opacity: 0.9 },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
      };
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [objectType]);

  return (
    <div className={className} style={{ height: 350 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
