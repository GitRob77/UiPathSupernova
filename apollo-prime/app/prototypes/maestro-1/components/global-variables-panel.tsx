"use client";

import { useState, useCallback } from "react";
import { cn } from "@uipath/apollo-wind";
import { ExecutionTrailStep, StepDetailItem, GlobalVariable } from "../types/debug";
import {
  Type,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Minus,
  Maximize2,
  Box,
  Copy,
  Code2,
  Search,
  Info,
  SlidersHorizontal,
  Hash,
  ToggleLeft,
  Braces,
  List,
} from "lucide-react";

/* ── Copy helper ─────────────────────────────────────────── */

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

/* ── Section action buttons ──────────────────────────────── */

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
    <div className="flex items-center gap-0.5 ml-auto">
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

/* ── JSON code snippet ───────────────────────────────────── */

function JsonSnippet({ data }: { data: unknown }) {
  const jsonStr = JSON.stringify(data, null, 2);

  return (
    <div className="px-4 pb-3">
      <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-[300px] text-gray-700 whitespace-pre-wrap">
        {jsonStr}
      </pre>
    </div>
  );
}

/* ── JSON tree value renderer ────────────────────────────── */

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
      <span className={cn(
        "text-sm font-mono px-2 py-0.5 rounded border",
        value === null
          ? "text-gray-400 italic bg-gray-50 border-gray-200"
          : "text-gray-700 bg-white border-gray-200"
      )}>
        {formatValue(value)}
      </span>
    </div>
  );
}

/* ── JSON tree section (collapsible with copy/json toggle) ── */

function JsonTreeSection({
  title,
  data,
  defaultExpanded = false,
}: {
  title: string;
  data: unknown;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showJson, setShowJson] = useState(false);

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
        </button>
        <SectionActionButtons
          data={data}
          showJson={showJson}
          onToggleJson={() => setShowJson(!showJson)}
        />
      </div>
      {expanded && (
        <>
          {showJson && <JsonSnippet data={data} />}
          {!showJson && (
            <div className="pb-2">
              {typeof data === "object" && data !== null ? (
                Object.entries(data as Record<string, unknown>).map(([key, val]) => (
                  <JsonTreeNode key={key} label={key} value={val} depth={1} defaultExpanded={true} />
                ))
              ) : (
                <div className="px-4 pb-3 pl-9 text-xs text-gray-400 italic">No data</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Collapsible detail section ──────────────────────────── */

function DetailSection({
  title,
  items,
  defaultExpanded = false,
  hasError = false,
}: {
  title: string;
  items: StepDetailItem[];
  defaultExpanded?: boolean;
  hasError?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showJson, setShowJson] = useState(false);

  const sectionData = items.reduce((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {} as Record<string, string>);

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
        <SectionActionButtons
          data={sectionData}
          showJson={showJson}
          onToggleJson={() => setShowJson(!showJson)}
        />
      </div>
      {expanded && (
        <>
          {showJson && <JsonSnippet data={sectionData} />}
          {!showJson && (
            <div className="px-4 pb-3 space-y-2">
              {items.length === 0 ? (
                <div className="pl-5 text-xs text-gray-400 italic">No data</div>
              ) : (
                items.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-start gap-2 pl-5">
                    <Type size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 flex-shrink-0">{item.name}</span>
                    <span
                      className={cn(
                        "text-sm font-mono px-2 py-0.5 rounded border",
                        item.value === "Nothing"
                          ? "text-gray-400 bg-gray-50 border-gray-200"
                          : "text-gray-700 bg-white border-gray-200"
                      )}
                      title={item.value}
                    >
                      {item.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Locals view ─────────────────────────────────────────── */

function LocalsView({ selectedStep, globalVariables }: { selectedStep?: ExecutionTrailStep | null; globalVariables: GlobalVariable[] }) {
  const details = selectedStep?.stepDetails;
  const rawJson = details?.rawJson;

  const showGlobalVars = selectedStep?.type === "instance";

  const hasRawInput = rawJson && typeof rawJson === "object" && "input" in rawJson;
  const hasRawOutput = rawJson && typeof rawJson === "object" && "output" in rawJson;
  const useTreeView = hasRawInput || hasRawOutput;

  return (
    <div>
      {showGlobalVars && <GlobalVariablesSection variables={globalVariables} />}
      {useTreeView ? (
        <>
          {hasRawInput && (
            <JsonTreeSection title="Input" data={rawJson.input} defaultExpanded={true} />
          )}
          {hasRawOutput && (
            <JsonTreeSection title="Output" data={rawJson.output} defaultExpanded={true} />
          )}
          <DetailSection
            title="Variables"
            items={details?.variables ?? []}
            defaultExpanded={(details?.variables ?? []).length > 0}
          />
          <DetailSection title="Details" items={details?.details ?? []} />
          <DetailSection
            title="Errors"
            items={details?.errors ?? []}
            defaultExpanded={(details?.errors ?? []).length > 0}
            hasError={(details?.errors ?? []).length > 0}
          />
        </>
      ) : (
        <>
          <DetailSection title="Input" items={details?.input ?? []} />
          <DetailSection
            title="Output"
            items={details?.output ?? []}
            defaultExpanded={(details?.output ?? []).length > 0}
          />
          <DetailSection
            title="Variables"
            items={details?.variables ?? []}
            defaultExpanded={(details?.variables ?? []).length > 0}
          />
          <DetailSection title="Details" items={details?.details ?? []} />
          <DetailSection
            title="Errors"
            items={details?.errors ?? []}
            defaultExpanded={(details?.errors ?? []).length > 0}
            hasError={(details?.errors ?? []).length > 0}
          />
        </>
      )}
    </div>
  );
}

/* ── Metadata section (for Details tab) ──────────────────── */

function MetadataSection({
  title,
  data,
  defaultExpanded = true,
}: {
  title: string;
  data: Record<string, unknown> | undefined;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showJson, setShowJson] = useState(false);

  if (!data) return null;

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
        </button>
        <SectionActionButtons
          data={data}
          showJson={showJson}
          onToggleJson={() => setShowJson(!showJson)}
        />
      </div>
      {expanded && (
        <>
          {showJson && <JsonSnippet data={data} />}
          {!showJson && (
            <div className="pl-16 pr-6 pb-4 space-y-4">
              {Object.entries(data).map(([key, val]) => {
                if (typeof val === "object" && val !== null && !Array.isArray(val)) {
                  return (
                    <div key={key}>
                      <div className="text-xs text-gray-500 mb-2">{key}</div>
                      <div className="pl-6 space-y-3">
                        {Object.entries(val as Record<string, unknown>).map(([subKey, subVal]) => (
                          <div key={subKey}>
                            <div className="text-xs text-gray-500">{subKey}</div>
                            <div className={cn(
                              "text-sm font-medium mt-0.5",
                              typeof subVal === "boolean"
                                ? subVal ? "text-green-600" : "text-red-500"
                                : "text-gray-900"
                            )}>
                              {subVal === null ? <span className="text-gray-400 italic">null</span> : String(subVal)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={key}>
                    <div className="text-xs text-gray-500">{key}</div>
                    <div className={cn(
                      "text-sm font-medium mt-0.5",
                      typeof val === "boolean"
                        ? val ? "text-green-600" : "text-red-500"
                        : "text-gray-900"
                    )}>
                      {val === null ? <span className="text-gray-400 italic">null</span> : String(val)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Details view ────────────────────────────────────────── */

function DetailsView({ selectedStep }: { selectedStep: ExecutionTrailStep }) {
  const rawJson = selectedStep.stepDetails?.rawJson;

  if (!rawJson) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-gray-400">
        No raw data available for this step
      </div>
    );
  }

  const metadata = rawJson.metadata as Record<string, unknown> | undefined;
  const otherAttributes = rawJson.other_attributes as Record<string, unknown> | undefined;

  if (metadata || otherAttributes) {
    return (
      <div>
        <MetadataSection title="Metadata" data={metadata} />
        <MetadataSection title="Other attributes" data={otherAttributes} />
      </div>
    );
  }

  const formatted = JSON.stringify(rawJson, null, 2);
  const lines = formatted.split("\n");

  return (
    <div className="py-2 font-mono text-xs leading-5 overflow-auto">
      <table className="w-full">
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="hover:bg-blue-50/40">
              <td className="text-right text-gray-400 select-none pr-4 pl-3 py-0 w-8 align-top">
                {i + 1}
              </td>
              <td className="whitespace-pre-wrap break-all text-gray-800 py-0 pr-4">
                {line}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Source icon helper ───────────────────────────────────── */

const sourceIcons: Record<string, { icon: typeof Box; color: string }> = {
  "Agent Scout": { icon: Box, color: "text-blue-500" },
  "Internal notification": { icon: Box, color: "text-gray-400" },
};

/* ── Global Variables collapsible section ─────────────────── */

function GlobalVariablesSection({ variables }: { variables: GlobalVariable[] }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        {expanded ? (
          <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
        )}
        <span className="text-sm font-semibold text-gray-900">Global Variables</span>
      </button>
      {expanded && (
        variables.length === 0 ? (
          <div className="px-4 pb-3 pl-9 text-xs text-gray-400 italic">No data</div>
        ) : (
          <div className="pb-1">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-500 py-1.5 px-4 pl-9">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 py-1.5 px-4">
                    Source
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 py-1.5 px-4">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {variables.map((variable, index) => {
                  const sourceConfig = sourceIcons[variable.source] ?? { icon: Box, color: "text-gray-400" };
                  const SourceIcon = sourceConfig.icon;

                  return (
                    <tr key={`${variable.name}-${variable.source}-${index}`} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-4 pl-9">
                        <div className="flex items-center gap-2">
                          <Type size={13} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{variable.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <SourceIcon size={13} className={cn("flex-shrink-0", sourceConfig.color)} />
                          <span className="text-sm text-gray-600 truncate max-w-[120px]" title={variable.source}>
                            {variable.source}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <span className={cn(
                          "text-sm font-mono",
                          variable.value === null ? "text-gray-400" : "text-gray-700"
                        )}>
                          {variable.value === null ? "null" : variable.value}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

/* ── Log entries ──────────────────────────────────────────── */

type LogLevel = "info" | "audit" | "screenplay-prompt" | "screenplay-reasoning" | "screenplay-action";

interface LogEntry {
  time: string;
  level: LogLevel;
  message: string;
  multiline?: boolean;
}

const logEntries: LogEntry[] = [
  { time: "15:06:59", level: "info", message: "Preparing projects for debugging..." },
  { time: "15:07:00", level: "info", message: "Preparing projects for debugging completed" },
  { time: "15:07:00", level: "info", message: "Provisioning solution..." },
  { time: "15:07:01", level: "info", message: "Provisioning resources" },
  { time: "15:07:01", level: "info", message: "Provisioning solution completed" },
  { time: "15:07:04", level: "info", message: "Debug session is initializing" },
  { time: "15:07:05", level: "info", message: "Download completed" },
  { time: "15:07:10", level: "info", message: "Building project completed" },
  { time: "15:07:11", level: "info", message: "Phone Lowest Price execution started" },
  { time: "15:08:06", level: "audit", message: "Audit: Using Web App. Browser: Chrome URL: https://www.apple.com/shop/buy-iphone" },
  { time: "15:14:19", level: "info", message: "ScreenPlay: Trace file generated" },
  { time: "15:15:39", level: "info", message: '{"name": "Apple iPhone 16 Plus", "price": "$899", "color": "Ultramarine", "Chip model": "Not found on page"}' },
  { time: "15:15:55", level: "info", message: "Phone Lowest Price execution ended" },
];

function getLogIcon(level: LogLevel) {
  switch (level) {
    case "audit":
      return { color: "text-purple-500", bg: "bg-purple-100" };
    default:
      return { color: "text-blue-600", bg: "bg-blue-100" };
  }
}

function LogsView() {
  const [search, setSearch] = useState("");

  const filteredLogs = logEntries.filter((entry) => {
    if (search && !entry.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center gap-2 px-5 py-3 border-b">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-md transition-colors">
          <SlidersHorizontal size={14} />
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {filteredLogs.map((entry, i) => {
          const style = getLogIcon(entry.level);
          return (
            <div
              key={`${entry.time}-${i}`}
              className="flex gap-3 px-5 py-2.5 hover:bg-gray-50/50 transition-colors"
            >
              <div className={cn("flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center", style.bg)}>
                <Info size={12} className={style.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 font-mono flex-shrink-0 mt-0.5">
                    {entry.time}
                  </span>
                  <span className={cn(
                    "text-xs text-gray-800 leading-relaxed",
                    entry.multiline ? "whitespace-pre-wrap" : "line-clamp-2"
                  )}>
                    {entry.message}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Incidents view ───────────────────────────────────────── */

function IncidentsView() {
  return (
    <div className="flex items-center justify-center py-8 text-xs text-gray-400">
      No incidents available
    </div>
  );
}

/* ── Main panel ──────────────────────────────────────────── */

interface GlobalVariablesPanelProps {
  selectedStep?: ExecutionTrailStep | null;
  globalVariables?: GlobalVariable[];
}

export function GlobalVariablesPanel({ selectedStep, globalVariables = [] }: GlobalVariablesPanelProps) {
  const [activeTab, setActiveTab] = useState<"details" | "locals" | "incidents" | "logs">(
    "locals"
  );

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "locals", label: "Locals" },
    { key: "incidents", label: "Incidents" },
    { key: "logs", label: "Logs" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b pl-4 pr-4 pt-2">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Minus size={14} />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        {activeTab === "locals" ? (
          <LocalsView selectedStep={selectedStep} globalVariables={globalVariables} />
        ) : activeTab === "details" ? (
          selectedStep ? (
            <DetailsView selectedStep={selectedStep} />
          ) : (
            <div className="flex items-center justify-center py-8 text-xs text-gray-400">
              Select a step to view details
            </div>
          )
        ) : activeTab === "incidents" ? (
          <IncidentsView />
        ) : activeTab === "logs" ? (
          <LogsView />
        ) : null}
      </div>
    </div>
  );
}
