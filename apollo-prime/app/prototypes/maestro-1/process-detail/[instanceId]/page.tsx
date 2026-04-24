"use client";

import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/custom/app-header";
import { StatusChip } from "@/components/custom/status-chip";
import { InvoiceBpmnDiagram } from "../../components/invoice-bpmn-diagram";
import { ExecutionTrailV2 } from "../../components/execution-trail-v2";
import { GlobalVariablesPanel } from "../../components/global-variables-panel";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { ArrowLeft, ChevronRight, ChevronDown, Lock } from "lucide-react";
import { instances, codedInstances } from "../../mock-data/instances";
import { CodedBpmnDiagram } from "../../components/coded-bpmn-diagram";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@uipath/apollo-wind/components/ui/popover";
import { executionTrailV2, instanceGlobalVars, executionTrailV2_faulted, instanceGlobalVars_faulted } from "../../mock-data/instance-trail";
import {
  executionTrailV2_5788894,
  instanceGlobalVars_5788894,
} from "../../mock-data/instance-5788894";
import {
  executionTrailV2_coded_5797120,
  instanceGlobalVars_coded_5797120,
} from "../../mock-data/instance-coded";
import type { ExecutionTrailStep } from "../../types/debug";

/* ------------------------------------------------------------------ */
/* Status badge variant mapping                                        */
/* ------------------------------------------------------------------ */

const statusVariant: Record<string, "error" | "warning" | "info" | "success" | "default"> = {
  completed: "success",
  faulted: "error",
  running: "info",
  paused: "warning",
  cancelled: "default",
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function InstanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const instanceId = decodeURIComponent(params.instanceId as string);

  const allInstances = [...instances, ...codedInstances];
  const instance = allInstances.find((i) => {
    const match = i.id.match(/#(\d+)/);
    return match && match[1] === instanceId;
  });
  const isCoded = instance?.processId === "demo-maestro-coded";

  const [selectedStep, setSelectedStep] = useState<ExecutionTrailStep | null>(null);

  if (!instance) {
    return (
      <div className="flex h-screen flex-col">
        <AppHeader productName="Maestro" tenantName="DefaultTenant" userInitials="MB" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Instance not found</p>
        </div>
      </div>
    );
  }

  const isLimited = instance.limitedView === true;
  const variant = statusVariant[instance.status] ?? "default";

  /* Select trail + variables based on instance */
  const is5788894 = instanceId === "5788894";
  const isCompleted = instance.status === "completed";
  const isFaulted = instance.status === "faulted";

  /* Coded automation instances */
  const codedCompletedPath = ["start", "classifyDoc", "gateway1", "fetchPdf", "gateway2", "archiveDoc", "sendConfirmation", "end"];
  const codedFaultedPath = ["start", "classifyDoc", "gateway1", "fetchPdf"];

  /* RPA instances */
  const rpaCompletedPath = ["start", "invoiceMatching", "gateway1", "resolveAgent", "approveInvoice", "notification", "end"];
  const rpaFaultedPath = ["start", "invoiceMatching", "gateway1", "resolveAgent"];

  let trail: ExecutionTrailStep;
  let globalVars;
  let executionPath: string[];

  if (isCoded) {
    trail = executionTrailV2_coded_5797120;
    globalVars = instanceGlobalVars_coded_5797120;
    executionPath = isCompleted ? codedCompletedPath : isFaulted ? codedFaultedPath : [];
  } else if (isCompleted) {
    trail = executionTrailV2_5788894;
    globalVars = instanceGlobalVars_5788894;
    executionPath = rpaCompletedPath;
  } else if (isFaulted) {
    trail = executionTrailV2_faulted;
    globalVars = instanceGlobalVars_faulted;
    executionPath = rpaFaultedPath;
  } else {
    trail = executionTrailV2;
    globalVars = instanceGlobalVars;
    executionPath = rpaFaultedPath;
  }

  const handleNodeDoubleClick = (nodeKey: string) => {
    if (nodeKey === "resolveAgent") {
      router.push(`/prototypes/maestro-1/process-detail/${instanceId}/agent-scout`);
    }
    if (nodeKey === "notification") {
      router.push(`/prototypes/maestro-1/process-detail/${instanceId}/notification`);
    }
    if (nodeKey === "fetchPdf") {
      router.push(`/prototypes/maestro-1/process-detail/${instanceId}/fetch-pdf`);
    }
  };

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
              href={isCoded ? "/prototypes/maestro-1/process-detail?process=coded" : "/prototypes/maestro-1/process-detail"}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Phone_.Price.Scout.agentic.Agentic.Process
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center text-muted-foreground hover:text-foreground">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-0">
                <div className="py-1 max-h-60 overflow-y-auto">
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Instances</p>
                  {(isCoded ? codedInstances : instances).map((inst) => {
                    const idMatch = inst.id.match(/#(\d+)/);
                    const numId = idMatch ? idMatch[1] : "";
                    const isActive = numId === instanceId;
                    return (
                      <Link
                        key={inst.id}
                        href={`/prototypes/maestro-1/process-detail/${numId}`}
                        className={`flex items-center justify-between px-3 py-2 text-xs hover:bg-accent ${isActive ? "bg-accent font-medium" : ""}`}
                      >
                        <span className="truncate">{inst.id}</span>
                        <StatusChip variant={statusVariant[inst.status] ?? "default"} size="sm">
                          {inst.status.charAt(0).toUpperCase() + inst.status.slice(1)}
                        </StatusChip>
                      </Link>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
            <span className="font-medium">{instance.id}</span>
            <span className="ml-2 text-muted-foreground">Status</span>
            <StatusChip variant={variant} size="sm">
              {instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
            </StatusChip>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Configure filtering</Button>
            <Button size="sm">Run</Button>
          </div>
        </div>

        {/* BPMN Diagram — takes remaining space above the bottom panels */}
        <div className="px-6 pt-4 flex-1 min-h-[120px] overflow-hidden">
          <div className="rounded-lg border bg-white h-full">
            {isCoded ? (
              <CodedBpmnDiagram
                executionPath={executionPath}
                faultedNodes={isFaulted ? ["fetchPdf"] : []}
                onNodeDoubleClick={handleNodeDoubleClick}
              />
            ) : (
              <InvoiceBpmnDiagram
                executionPath={executionPath}
                faultedNodes={isFaulted ? ["resolveAgent"] : []}
                cancelledNodes={isCompleted || isFaulted ? [] : ["resolveAgent"]}
                onNodeDoubleClick={handleNodeDoubleClick}
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-0 border rounded-lg overflow-hidden mx-6 mb-3 flex-shrink-0"
          style={{ height: `${panelHeight}px` }}
        >
          <div className="border-r overflow-y-auto">
            {isLimited ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <Lock size={20} className="text-amber-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Observability limited for this process</p>
                <p className="text-xs text-gray-400 max-w-xs">
                  Execution trail and detailed step debugging are not available. A valid Orchestrator licence is required to unlock full observability.
                </p>
              </div>
            ) : trail ? (
              <ExecutionTrailV2
                trail={trail}
                selectedStepId={selectedStep?.id ?? null}
                onStepSelect={setSelectedStep}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                No execution trail available
              </div>
            )}
          </div>
          <div className="overflow-y-auto">
            {isLimited ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <Lock size={20} className="text-amber-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Variables & logs unavailable</p>
                <p className="text-xs text-gray-400 max-w-xs">
                  Upgrade your licence to access global variables, step details, incidents, and logs for this process instance.
                </p>
              </div>
            ) : (
              <GlobalVariablesPanel selectedStep={selectedStep} globalVariables={globalVars} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
