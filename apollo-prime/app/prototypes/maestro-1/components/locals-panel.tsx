"use client";

import { useState, useCallback, useRef } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@uipath/apollo-wind/components/ui/tabs";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Code2,
  Minimize2,
  Type,
  Hash,
  ToggleLeft,
  Braces,
  List,
  AlertCircle,
} from "lucide-react";
import { cn } from "@uipath/apollo-wind";
import type { ExecutionTrailNode } from "../mock-data/instance-5797111";

/* ------------------------------------------------------------------ */
/* Copy helper                                                         */
/* ------------------------------------------------------------------ */

function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, []);

  return { copied, copy };
}

/* ------------------------------------------------------------------ */
/* Section action buttons (Copy + JSON toggle)                         */
/* ------------------------------------------------------------------ */

function SectionActionButtons({
  data,
  showJson,
  onToggleJson,
}: {
  data: unknown;
  showJson: boolean;
  onToggleJson: () => void;
}) {
  const { copied, copy } = useCopyToClipboard();
  const jsonStr = JSON.stringify(data, null, 2);

  return (
    <div className="flex items-center gap-1 ml-auto">
      <button
        onClick={(e) => {
          e.stopPropagation();
          copy(jsonStr);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Copy"
      >
        {copied ? (
          <span className="text-xs text-green-500">Copied</span>
        ) : (
          <Copy size={13} />
        )}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleJson();
        }}
        className={cn(
          "p-1 transition-colors",
          showJson ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
        )}
        title="JSON view"
      >
        <Code2 size={13} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* JSON snippet (code block)                                           */
/* ------------------------------------------------------------------ */

function JsonSnippet({ data }: { data: unknown }) {
  return (
    <div className="px-4 pb-3">
      <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-[300px] text-gray-700 whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* JSON tree value helpers                                             */
/* ------------------------------------------------------------------ */

function getValueIcon(value: unknown) {
  if (typeof value === "string") return { icon: Type, color: "text-gray-400" };
  if (typeof value === "number") return { icon: Hash, color: "text-blue-500" };
  if (typeof value === "boolean") return { icon: ToggleLeft, color: "text-purple-500" };
  if (Array.isArray(value)) return { icon: List, color: "text-orange-500" };
  if (typeof value === "object" && value !== null) return { icon: Braces, color: "text-gray-400" };
  return { icon: Type, color: "text-gray-400" };
}

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

/* ------------------------------------------------------------------ */
/* JSON tree node (recursive)                                          */
/* ------------------------------------------------------------------ */

function JsonTreeNode({
  label,
  value,
  depth = 0,
  defaultExpanded = true,
}: {
  label: string;
  value: unknown;
  depth?: number;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const { icon: ValueIcon, color: iconColor } = getValueIcon(value);

  if (isExpandable) {
    const entries = isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
      : Object.entries(value as Record<string, unknown>);
    const typeLabel = isArray ? `Array(${entries.length})` : `Object(${entries.length})`;

    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 w-full hover:bg-gray-50/80 py-1 transition-colors"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {expanded ? (
            <ChevronDown size={12} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
          )}
          {isArray ? (
            <List size={13} className="text-orange-500 flex-shrink-0" />
          ) : (
            <Braces size={13} className="text-gray-400 flex-shrink-0" />
          )}
          <span className="text-sm text-gray-700">{label}</span>
          <span className="text-xs text-gray-400 ml-1">{typeLabel}</span>
        </button>
        {expanded && (
          <div>
            {entries.map(([key, val]) => (
              <JsonTreeNode
                key={key}
                label={isArray ? `{·} ${key}` : key}
                value={val}
                depth={depth + 1}
                defaultExpanded={depth < 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 py-1 hover:bg-gray-50/80 transition-colors"
      style={{ paddingLeft: `${depth * 16 + 26}px` }}
    >
      <ValueIcon size={13} className={cn("flex-shrink-0", iconColor)} />
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-xs text-gray-400 mx-0.5">:</span>
      <span
        className={cn(
          "text-sm font-mono px-2 py-0.5 rounded border",
          value === null
            ? "text-gray-400 italic bg-gray-50 border-gray-200"
            : "text-gray-700 bg-white border-gray-200"
        )}
      >
        {formatValue(value)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data section (Input / Output / Variables / Details / Errors)        */
/* ------------------------------------------------------------------ */

function DataSection({
  title,
  data,
  defaultExpanded = false,
  hasError = false,
}: {
  title: string;
  data: Record<string, string> | undefined | null;
  defaultExpanded?: boolean;
  hasError?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showJson, setShowJson] = useState(false);

  const entries = data ? Object.entries(data) : [];
  const hasData = entries.length > 0;

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center w-full px-4 py-2.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
        >
          {expanded ? (
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          {hasError && (
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
          )}
        </button>
        {hasData && (
          <SectionActionButtons
            data={data}
            showJson={showJson}
            onToggleJson={() => setShowJson(!showJson)}
          />
        )}
      </div>
      {expanded && (
        <>
          {showJson && hasData && <JsonSnippet data={data} />}
          {!showJson && (
            <div className="pb-2">
              {!hasData ? (
                <div className="px-4 pb-3 pl-9 text-xs text-gray-400 italic">No data</div>
              ) : (
                entries.map(([key, val]) => (
                  <JsonTreeNode key={key} label={key} value={val} depth={1} defaultExpanded={true} />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Details section (status / duration / endedAt)                       */
/* ------------------------------------------------------------------ */

function DetailsSection({ node }: { node: ExecutionTrailNode | null }) {
  const [expanded, setExpanded] = useState(false);

  const entries = node
    ? [
        { name: "Status", value: node.status },
        { name: "Duration", value: node.duration },
        { name: "Ended at", value: node.endedAt },
      ]
    : [];

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center w-full px-4 py-2.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
        >
          {expanded ? (
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold text-gray-900">Details</span>
        </button>
      </div>
      {expanded && (
        <div className="pb-2">
          {!node ? (
            <div className="px-4 pb-3 pl-9 text-xs text-gray-400 italic">
              Select a step to view details
            </div>
          ) : (
            entries.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1.5 py-1 hover:bg-gray-50/80 transition-colors"
                style={{ paddingLeft: "26px" }}
              >
                <Type size={13} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-xs text-gray-400 mx-0.5">:</span>
                <span className="text-sm font-mono px-2 py-0.5 rounded border text-gray-700 bg-white border-gray-200">
                  {item.value}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Errors section                                                      */
/* ------------------------------------------------------------------ */

function ErrorsSection({ node }: { node: ExecutionTrailNode | null }) {
  const hasError = !!node?.errorCode;
  const [expanded, setExpanded] = useState(hasError);
  const prevNodeId = useRef(node?.id);

  if (node?.id !== prevNodeId.current) {
    prevNodeId.current = node?.id;
    if (hasError) setExpanded(true);
  }

  const errorData = hasError
    ? {
        errorCode: node!.errorCode!,
        errorMessage: node!.errorMessage ?? "",
        ...(node!.errorDetail ? { errorDetail: node!.errorDetail } : {}),
        ...(node!.errorCategory ? { errorCategory: node!.errorCategory } : {}),
        ...(node!.errorStatus ? { errorStatus: String(node!.errorStatus) } : {}),
      }
    : null;

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center w-full px-4 py-2.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
        >
          {expanded ? (
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold text-gray-900">Errors</span>
          {hasError && (
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
          )}
        </button>
        {hasError && errorData && (
          <SectionActionButtons
            data={errorData}
            showJson={false}
            onToggleJson={() => {}}
          />
        )}
      </div>
      {expanded && (
        <div className="pb-2">
          {!hasError ? (
            <div className="px-4 pb-3 pl-9 text-xs text-gray-400 italic">No errors</div>
          ) : (
            Object.entries(errorData!).map(([key, val]) => (
              <JsonTreeNode key={key} label={key} value={val} depth={1} defaultExpanded={true} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exported panel                                                      */
/* ------------------------------------------------------------------ */

export function LocalsPanel({
  selectedNode,
}: {
  selectedNode: ExecutionTrailNode | null;
}) {
  const [tab, setTab] = useState("locals");

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pl-4 pr-4 pt-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto gap-0 rounded-none bg-transparent p-0">
            {["Details", "Locals", "Incidents", "Logs"].map((t) => (
              <TabsTrigger
                key={t.toLowerCase()}
                value={t.toLowerCase()}
                className="rounded-none px-3 py-2 text-xs font-medium shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 mr-1">
          <Minimize2 size={14} className="text-gray-400" />
        </Button>
      </div>

      {/* Locals tab content */}
      {tab === "locals" && (
        <div className="flex-1 overflow-auto">
          <DataSection
            title="Input"
            data={selectedNode?.input}
            defaultExpanded={true}
          />
          <DataSection
            title="Output"
            data={selectedNode?.output}
            defaultExpanded={!!selectedNode?.output}
          />
          <DataSection title="Variables" data={null} />
          <DetailsSection node={selectedNode} />
          <ErrorsSection node={selectedNode} />
        </div>
      )}

      {/* Details tab */}
      {tab === "details" && (
        <div className="flex-1 overflow-auto">
          {selectedNode ? (
            <div className="p-4 space-y-2">
              {[
                { name: "Step", value: selectedNode.label },
                { name: "Status", value: selectedNode.status },
                { name: "Duration", value: selectedNode.duration },
                { name: "Ended at", value: selectedNode.endedAt },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 py-1">
                  <Type size={13} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-xs text-gray-400 mx-0.5">:</span>
                  <span className="text-sm font-mono px-2 py-0.5 rounded border text-gray-700 bg-white border-gray-200">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400 p-4">
              Select a step to view details
            </div>
          )}
        </div>
      )}

      {/* Incidents tab */}
      {tab === "incidents" && (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400 pl-4 pr-4">
          No incidents reported
        </div>
      )}

      {/* Logs tab */}
      {tab === "logs" && (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400 pl-4 pr-4">
          No logs available
        </div>
      )}
    </div>
  );
}
