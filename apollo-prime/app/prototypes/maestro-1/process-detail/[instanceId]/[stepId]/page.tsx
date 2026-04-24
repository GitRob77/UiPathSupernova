"use client";

import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/custom/app-header";
import { StatusChip } from "@/components/custom/status-chip";
import { AgentCanvasDiagram } from "../../../components/agent-canvas-diagram";
import { ExecutionTrail } from "../../../components/execution-trail";
import { LocalsPanel } from "../../../components/locals-panel";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import {
  executionTrail,
  agentCanvasNodes,
  type ExecutionTrailNode,
} from "../../../mock-data/instance-5797111";
import {
  executionTrail_5788894,
  agentCanvasNodes_5788894,
  notificationCanvasSteps_5788894,
  phoneLowestPriceCanvasSteps_5788894,
} from "../../../mock-data/instance-5788894";
import { fetchPdfExecutionTrail, fetchPdfExecutionTrail_faulted } from "../../../mock-data/instance-coded";
import { instances, codedInstances } from "../../../mock-data/instances";
import { RobotJobCanvasDiagram } from "../../../components/robot-job-canvas-diagram";
import { SequentialWorkflowCanvas } from "../../../components/sequential-workflow-canvas";
import { FetchPdfWorkflowDiagram } from "../../../components/fetch-pdf-workflow-diagram";

/* ------------------------------------------------------------------ */
/* Helper: find a subtree by id                                        */
/* ------------------------------------------------------------------ */

function findNode(
  node: ExecutionTrailNode,
  id: string
): ExecutionTrailNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Step labels and trail roots                                         */
/* ------------------------------------------------------------------ */

const stepConfig: Record<
  string,
  { label: string; agentName: string; trailRootId: string; canvasType?: "agent" | "sequential" | "fetch-pdf" }
> = {
  "agent-scout": {
    label: "Agent Scout",
    agentName: "Price Scout Phone",
    trailRootId: "agent-scout",
  },
  notification: {
    label: "Internal notification",
    agentName: "Internal notification",
    trailRootId: "notification",
  },
  "fetch-pdf": {
    label: "Fetch PDF & Extract Data",
    agentName: "Fetch PDF Agent",
    trailRootId: "fetch-pdf",
    canvasType: "fetch-pdf",
  },
  "phone-lowest-price": {
    label: "Cheapest Apple iPhone",
    agentName: "Phone Lowest Price",
    trailRootId: "phone-lowest-price",
    canvasType: "sequential",
  },
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function StepDetailPage() {
  const params = useParams();
  const router = useRouter();
  const instanceId = decodeURIComponent(params.instanceId as string);
  const stepId = decodeURIComponent(params.stepId as string);

  const is5788894 = instanceId === "5788894";
  const isFetchPdf = stepId === "fetch-pdf";

  // Determine instance status from mock data
  const allInstances = [...instances, ...codedInstances];
  const currentInstance = allInstances.find((i) => {
    const match = i.id.match(/#(\d+)/);
    return match && match[1] === instanceId;
  });
  const isInstanceFaulted = currentInstance?.status === "faulted";

  const instanceTrail = isFetchPdf
    ? (isInstanceFaulted ? fetchPdfExecutionTrail_faulted : fetchPdfExecutionTrail)
    : (is5788894 ? executionTrail_5788894 : executionTrail);
  const instanceCanvasNodes = is5788894 ? agentCanvasNodes_5788894 : agentCanvasNodes;
  const instanceStatus = isFetchPdf
    ? (isInstanceFaulted ? "faulted" : "completed")
    : (is5788894 ? "completed" : "cancelled");

  const config = stepConfig[stepId];
  const trailRoot = config
    ? (isFetchPdf ? (isInstanceFaulted ? fetchPdfExecutionTrail_faulted : fetchPdfExecutionTrail) : findNode(instanceTrail, config.trailRootId))
    : null;

  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [selectedTrailNode, setSelectedTrailNode] =
    useState<ExecutionTrailNode | null>(null);
  const [selectedCanvasStepId, setSelectedCanvasStepId] = useState<string | null>(null);

  const isNotificationRobotJob = is5788894 && stepId === "notification";
  const isPhoneLowestPrice = stepId === "phone-lowest-price";
  const isFetchPdfWorkflow = stepId === "fetch-pdf";

  const fetchPdfExecutionPath = isInstanceFaulted
    ? ["execute", "look-for-files", "any-images-found", "convert-to-pdf"]
    : ["execute", "look-for-files", "any-images-found", "convert-to-pdf", "any-pdfs-found", "merge-pdfs", "create-zip", "upload-zip", "end"];

  const fetchPdfFaultedNodes = isInstanceFaulted ? ["convert-to-pdf"] : [];

  /* ── Resizable bottom panel ─────────────────────────────────── */
  const [panelHeight, setPanelHeight] = useState(460);
  const resizing = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizing.current = true;
      startY.current = e.clientY;
      startH.current = panelHeight;

      const onMove = (ev: MouseEvent) => {
        if (!resizing.current) return;
        const delta = startY.current - ev.clientY;
        setPanelHeight(Math.max(200, Math.min(window.innerHeight - 200, startH.current + delta)));
      };
      const onUp = () => {
        resizing.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [panelHeight]
  );

  /* Reverse map: trail node ID → canvas node ID */
  const trailToCanvasMap: Record<string, string> = {
    "tool-call-approve": "approve-module",
    "tool-call-acquisition": "acquisition-policy",
    "tool-call-phone": "cheapest-iphone",
    "tool-call-email": "send-email",
  };

  /** Resolve trail node ID → canvas step ID, handling iteration-indexed IDs */
  const trailIdToCanvasId = (trailId: string): string => {
    if (trailToCanvasMap[trailId]) return trailToCanvasMap[trailId];
    // Strip iteration index: "iter3-send-email" → "iter-send-email"
    const iterMatch = trailId.match(/^iter\d+-(.*)/);
    if (iterMatch) return `iter-${iterMatch[1]}`;
    return trailId;
  };

  const handleTrailSelect = (node: ExecutionTrailNode) => {
    setSelectedTrailId(node.id);
    setSelectedTrailNode(node);
    setSelectedCanvasStepId(trailIdToCanvasId(node.id));
  };

  /* Map canvas node IDs → execution trail node IDs */
  const canvasToTrailMap: Record<string, string> = {
    "approve-module": "tool-call-approve",
    "acquisition-policy": "tool-call-acquisition",
    "cheapest-iphone": "tool-call-phone",
    "send-email": "tool-call-email",
  };

  const handleCanvasNodeClick = (nodeId: string) => {
    setSelectedCanvasStepId(nodeId);
    if (trailRoot) {
      const trailId = canvasToTrailMap[nodeId] || nodeId;
      const match = findNode(trailRoot, trailId);
      if (match) {
        setSelectedTrailId(match.id);
        setSelectedTrailNode(match);
      }
    }
  };

  /** Resolve canvas step ID → trail node ID, handling loop children.
   *  Canvas uses "iter-send-email", trail uses "iter1-send-email".
   *  We check which iteration is currently selected and map accordingly. */
  const canvasIdToTrailId = (canvasId: string): string => {
    const iterMatch = canvasId.match(/^iter-(.*)/);
    if (iterMatch) {
      // Find current iteration index from the last selected trail ID
      const currentIterMatch = selectedTrailId?.match(/^iter(\d+)-/);
      const iterIdx = currentIterMatch ? currentIterMatch[1] : "1";
      return `iter${iterIdx}-${iterMatch[1]}`;
    }
    return canvasToTrailMap[canvasId] || canvasId;
  };

  const handleSequentialStepClick = (stepNodeId: string) => {
    setSelectedCanvasStepId(stepNodeId);
    if (trailRoot) {
      const trailId = canvasIdToTrailId(stepNodeId);
      const match = findNode(trailRoot, trailId);
      if (match) {
        setSelectedTrailId(match.id);
        setSelectedTrailNode(match);
      }
    }
  };

  const handleCanvasNodeDoubleClick = (nodeId: string) => {
    if (nodeId === "cheapest-iphone") {
      router.push(
        `/prototypes/maestro-1/process-detail/${instanceId}/phone-lowest-price`
      );
    }
  };

  if (!config || !trailRoot) {
    return (
      <div className="flex h-screen flex-col">
        <AppHeader
          productName="Maestro"
          tenantName="DefaultTenant"
          userInitials="MB"
        />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Step not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader
        productName="Maestro"
        tenantName="DefaultTenant"
        userInitials="MB"
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Breadcrumb header */}
        <div className="flex items-center justify-between border-b border-(--border-subtle) px-6 py-3 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/prototypes/maestro-1/process-detail/${instanceId}`}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {isFetchPdf ? "Demo.MaestroCoded.Agentic.Process" : "Phone_.Price.Scout.agentic.Agentic.Process"}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Link
              href={`/prototypes/maestro-1/process-detail/${instanceId}`}
              className="text-muted-foreground hover:text-foreground"
            >
              {isFetchPdf ? `[Demo MaestroCoded] Agentic Process - #${instanceId}` : `[Demo MaestroRPA] Agentic Process - #${instanceId}`}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{config.label}</span>
            <span className="ml-2 text-muted-foreground">Status</span>
            <StatusChip variant={isInstanceFaulted ? "error" : is5788894 ? "success" : "default"} size="sm">
              {isInstanceFaulted ? "Faulted" : is5788894 ? "Completed" : "Cancelled"}
            </StatusChip>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Configure filtering</Button>
            <Button size="sm">Run</Button>
          </div>
        </div>

        {/* Canvas diagram — Robot Job flow for notification, Agent canvas for others */}
        <div className="px-6 pt-4 flex-1 min-h-[120px] overflow-hidden">
          <div className="rounded-lg border bg-white h-full">
            {isFetchPdfWorkflow ? (
              <FetchPdfWorkflowDiagram
                executionPath={fetchPdfExecutionPath}
                faultedNodes={fetchPdfFaultedNodes}
                selectedNodeKey={selectedCanvasStepId}
                onNodeClick={handleSequentialStepClick}
              />
            ) : isPhoneLowestPrice ? (
              <SequentialWorkflowCanvas
                steps={phoneLowestPriceCanvasSteps_5788894}
                selectedStepId={selectedCanvasStepId}
                onStepClick={handleSequentialStepClick}
              />
            ) : isNotificationRobotJob ? (
              <SequentialWorkflowCanvas
                steps={notificationCanvasSteps_5788894}
                selectedStepId={selectedCanvasStepId}
                onStepClick={handleSequentialStepClick}
              />
            ) : (
              <AgentCanvasDiagram
                agentName={config.agentName}
                status={instanceStatus}
                nodes={instanceCanvasNodes}
                selectedNodeId={selectedCanvasStepId}
                onNodeClick={handleCanvasNodeClick}
                onNodeDoubleClick={handleCanvasNodeDoubleClick}
              />
            )}
          </div>
        </div>

        {/* Resize handle */}
        <div
          className="mx-6 h-1.5 cursor-row-resize flex items-center justify-center group shrink-0 select-none"
          onMouseDown={handleResizeStart}
        >
          <div className="w-10 h-1 rounded-full bg-gray-200 group-hover:bg-gray-400 transition-colors" />
        </div>

        {/* Bottom panels — resizable */}
        <div
          className="grid grid-cols-2 gap-0 border rounded-lg overflow-hidden mx-6 mb-3 flex-shrink-0"
          style={{ height: `${panelHeight}px` }}
        >
          {/* Left: Execution trail (has its own tabs) */}
          <div className="overflow-hidden border-r border-(--border-subtle)">
            <ExecutionTrail
              root={trailRoot}
              selectedId={selectedTrailId}
              onSelect={handleTrailSelect}
            />
          </div>

          {/* Right: Locals panel (has its own tabs) */}
          <div className="overflow-hidden">
            <LocalsPanel selectedNode={selectedTrailNode} />
          </div>
        </div>
      </main>
    </div>
  );
}
