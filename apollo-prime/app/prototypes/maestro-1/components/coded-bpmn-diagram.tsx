"use client";

import { useRef, useState, useCallback, type MouseEvent, type WheelEvent } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

const GREEN = "#16a34a";
const RED = "#dc2626";

function CompletedBadge({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="11" fill="white" />
      <circle cx={cx} cy={cy} r="9" fill={GREEN} />
      <polyline
        points={`${cx - 4},${cy} ${cx - 1},${cy + 3} ${cx + 4},${cy - 3}`}
        fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </g>
  );
}

function FaultedBadge({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="11" fill="white" />
      <circle cx={cx} cy={cy} r="9" fill={RED} />
      <text x={cx} y={cy + 4} textAnchor="middle" className="text-[11px]" fill="white" fontWeight="700">!</text>
    </g>
  );
}

function GlowRect({ x, y, width, height, rx }: { x: number; y: number; width: number; height: number; rx: number }) {
  return <rect x={x - 4} y={y - 4} width={width + 8} height={height + 8} rx={rx + 2} fill="none" stroke="#86EFAC" strokeWidth="3" opacity="0.45" />;
}

function FaultedGlowRect({ x, y, width, height, rx }: { x: number; y: number; width: number; height: number; rx: number }) {
  return <rect x={x - 4} y={y - 4} width={width + 8} height={height + 8} rx={rx + 2} fill="none" stroke="#FCA5A5" strokeWidth="3" opacity="0.5" />;
}

function GlowCircle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#86EFAC" strokeWidth="3" opacity="0.45" />;
}

const SELECTED_STROKE = "#2563EB";

interface CountBadgeItem {
  count: number;
  color: string;
}

function CountBadges({ x, y, items }: { x: number; y: number; items: CountBadgeItem[] }) {
  const badgeW = 18;
  const badgeH = 16;
  const gap = 2;
  const totalW = items.length * badgeW + (items.length - 1) * gap;
  const startX = x - totalW;
  const topY = y - badgeH - 2;
  return (
    <g>
      {items.map((item, i) => {
        const bx = startX + i * (badgeW + gap);
        return (
          <g key={i}>
            <rect x={bx - 1} y={topY - 1} width={badgeW + 2} height={badgeH + 2} rx="5" fill="white" />
            <rect x={bx} y={topY} width={badgeW} height={badgeH} rx="4" fill={item.color} />
            <text x={bx + badgeW / 2} y={topY + badgeH / 2 + 3.5} textAnchor="middle" className="text-[9px]" fill="white" fontWeight="700">
              {item.count}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function SelectedRect({ x, y, width, height, rx }: { x: number; y: number; width: number; height: number; rx: number }) {
  return (
    <rect
      x={x - 3} y={y - 3} width={width + 6} height={height + 6} rx={rx + 2}
      fill="none" stroke={SELECTED_STROKE} strokeWidth="2.5" opacity="0.7"
    />
  );
}

function SelectedCircle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke={SELECTED_STROKE} strokeWidth="2.5" opacity="0.7" />;
}

interface CodedBpmnDiagramProps {
  executionPath?: string[];
  onNodeDoubleClick?: (nodeKey: string) => void;
  selectedNodeKey?: string | null;
  faultedNodes?: string[];
  showHeatmap?: boolean;
}

interface TooltipInfo {
  label: string;
  type: string;
  status?: string;
  detail?: string;
}

const codedNodeTooltips: Record<string, TooltipInfo> = {
  start: { label: "Doc Received", type: "Message Start Event", detail: "Trigger: incoming document from email" },
  classifyDoc: { label: "Classify Document", type: "Service Task", detail: "AI classification of document type" },
  gateway1: { label: "Is Invoice?", type: "Exclusive Gateway", detail: "Routes based on document classification" },
  archiveDoc: { label: "Archive Document", type: "Service Task", detail: "Archives processed document to storage" },
  sendConfirmation: { label: "Send Confirmation", type: "Service Task", detail: "Sends confirmation email to stakeholders" },
  end: { label: "End", type: "End Event", detail: "Process completed" },
  fetchPdf: { label: "Fetch PDF & Extract Data", type: "Agent Task", detail: "AI agent fetches and extracts invoice data" },
  gateway2: { label: "Data Valid?", type: "Exclusive Gateway", detail: "Validates extracted data quality" },
  flagReview: { label: "Flag for Review", type: "Service Task", detail: "Flags document for manual review" },
  sendReminder: { label: "Send Reminder", type: "Integration Event", detail: "Sends reminder via Integration Service" },
  timer: { label: "Timer", type: "Timer Event", detail: "Waits 2 days before escalating" },
  manualReview: { label: "Manual Data Review", type: "Human Task", detail: "Action Center review form" },
  waitResponse: { label: "Wait for Reviewer", type: "Message Event", detail: "Integration Service — wait for response trigger" },
};

export function CodedBpmnDiagram({ executionPath, onNodeDoubleClick, selectedNodeKey, faultedNodes, showHeatmap }: CodedBpmnDiagramProps) {
  const faulted = new Set(faultedNodes ?? []);
  const hasExec = !!executionPath && executionPath.length > 0;
  const executed = new Set(executionPath ?? []);
  const sel = selectedNodeKey ?? null;

  const stroke = "#2D3A4A";
  const textFill = "#2D3A4A";
  const annotationFill = "#2D3A4A";
  const lightStroke = "#8899AA";

  const connStroke = (nodeKey: string) => executed.has(nodeKey) ? GREEN : stroke;

  const [tooltip, setTooltip] = useState<{ x: number; y: number; info: TooltipInfo } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = (e: React.MouseEvent<SVGElement>, key: string) => {
    const info = codedNodeTooltips[key];
    if (!info) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const status = faulted.has(key) ? "Faulted" : executed.has(key) ? "Completed" : "Pending";
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - 10;
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => {
      setTooltip({ x, y, info: { ...info, status } });
    }, 800);
  };

  const moveTooltip = (e: React.MouseEvent<SVGElement>, key: string) => {
    if (!tooltip) return;
    const info = codedNodeTooltips[key];
    if (!info) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const status = faulted.has(key) ? "Faulted" : executed.has(key) ? "Completed" : "Pending";
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10, info: { ...info, status } });
  };

  const hideTooltip = () => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltip(null);
  };
  const connWidth = (nodeKey: string) => executed.has(nodeKey) ? "2.5" : "1.5";

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.15;

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((prev) => clampZoom(prev + delta));
  }, []);

  const panActive = useRef(false);
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panActive.current = false;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
  }, [pan]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    if (!panActive.current && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
    panActive.current = true;
    setPan({
      x: panOrigin.current.x + dx,
      y: panOrigin.current.y + dy,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => setZoom((z) => clampZoom(z + ZOOM_STEP)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => clampZoom(z - ZOOM_STEP)), []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isPanning.current ? "grabbing" : "grab" }}
    >
      {/* Zoom controls */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/90 border rounded-md shadow-sm px-1 py-0.5">
        <button onClick={handleZoomOut} className="p-1 hover:bg-gray-100 rounded" title="Zoom out">
          <ZoomOut size={15} className="text-gray-600" />
        </button>
        <span className="text-[10px] text-gray-500 min-w-[36px] text-center select-none">{Math.round(zoom * 100)}%</span>
        <button onClick={handleZoomIn} className="p-1 hover:bg-gray-100 rounded" title="Zoom in">
          <ZoomIn size={15} className="text-gray-600" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <button onClick={handleReset} className="p-1 hover:bg-gray-100 rounded" title="Reset view">
          <Maximize size={14} className="text-gray-600" />
        </button>
      </div>

      {/* Tooltip overlay */}
      <div
        className="absolute z-20 pointer-events-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-xl shadow-black/8"
        style={{
          left: tooltip?.x ?? 0,
          top: tooltip?.y ?? 0,
          transform: `translate(-50%, -100%) scale(${tooltip ? 1 : 0.95})`,
          opacity: tooltip ? 1 : 0,
          transition: "opacity 180ms cubic-bezier(0.4,0,0.2,1), transform 180ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {tooltip && (
          <>
            <p className="text-[11px] font-semibold text-gray-900 whitespace-nowrap">{tooltip.info.label}</p>
            <p className="text-[10px] text-gray-500">{tooltip.info.type}</p>
            {tooltip.info.status && (
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: tooltip.info.status === "Completed" ? GREEN : tooltip.info.status === "Faulted" ? RED : "#9CA3AF",
                  }}
                />
                <span className="text-[10px] text-gray-600">{tooltip.info.status}</span>
              </div>
            )}
            {tooltip.info.detail && (
              <p className="text-[10px] text-gray-400 mt-0.5 max-w-[200px]">{tooltip.info.detail}</p>
            )}
          </>
        )}
      </div>

      <svg
        viewBox="0 0 1300 780"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          minHeight: 400,
          maxHeight: 700,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isPanning.current ? "none" : "transform 0.1s ease-out",
        }}
      >
        {/* ===== ROW 1 (y=110) ===== */}

        {/* Connector: Start → Classify Document */}
        <line x1="102" y1="110" x2="224" y2="110" stroke={connStroke("start")} strokeWidth={connWidth("start")} />
        <polygon points="222,106 230,110 222,114" fill={connStroke("start")} />

        {/* Message Start Event "Doc Received" */}
        {sel === "start" && <SelectedCircle cx={80} cy={110} r={22} />}
        {executed.has("start") && <GlowCircle cx={80} cy={110} r={22} />}
        <circle cx="80" cy="110" r="22" fill="white" stroke={stroke} strokeWidth="2" />
        <rect x="68" y="103" width="24" height="15" rx="1" fill="none" stroke={stroke} strokeWidth="1.3" />
        <polyline points="68,103 80,112 92,103" fill="none" stroke={stroke} strokeWidth="1.3" />
        {executed.has("start") && <CompletedBadge cx={106} cy={85} />}
        <text x="80" y="150" textAnchor="middle" className="text-[10px]" fill={textFill}>Doc</text>
        <text x="80" y="162" textAnchor="middle" className="text-[10px]" fill={textFill}>Received</text>

        {/* Classify Document (task) */}
        {sel === "classifyDoc" && <SelectedRect x={230} y={85} width={152} height={50} rx={6} />}
        {executed.has("classifyDoc") && <GlowRect x={230} y={85} width={152} height={50} rx={6} />}
        <g
          style={{ cursor: onNodeDoubleClick ? "pointer" : undefined }}
          onDoubleClick={() => onNodeDoubleClick?.("classifyDoc")}
        >
          <rect x="230" y="85" width="152" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="236" y="90" width="14" height="10" rx="2" fill="none" stroke={stroke} strokeWidth="1" />
          <text x="306" y="115" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Classify Document</text>
        </g>
        {executed.has("classifyDoc") && <CompletedBadge cx={386} cy={80} />}

        {/* Connector: Classify Document → Gateway 1 */}
        <line x1="382" y1="110" x2="444" y2="110" stroke={connStroke("classifyDoc")} strokeWidth={connWidth("classifyDoc")} />
        <polygon points="442,106 450,110 442,114" fill={connStroke("classifyDoc")} />

        {/* XOR Gateway 1: "Is Invoice?" */}
        {executed.has("gateway1") && (
          <rect x="-30" y="-30" width="60" height="60" rx="2" fill="none" stroke="#86EFAC" strokeWidth="3" opacity="0.45" transform="translate(480,110) rotate(45,0,0)" />
        )}
        <g transform="translate(480,110)">
          <rect x="-26" y="-26" width="52" height="52" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" transform="rotate(45,0,0)" />
          <line x1="-10" y1="-10" x2="10" y2="10" stroke={stroke} strokeWidth="2.5" />
          <line x1="10" y1="-10" x2="-10" y2="10" stroke={stroke} strokeWidth="2.5" />
        </g>
        <text x="480" y="158" textAnchor="middle" className="text-[9px]" fill={textFill}>Is Invoice?</text>

        {/* "No" label on top path */}
        <text x="545" y="103" textAnchor="middle" className="text-[9px]" fill={textFill}>No</text>

        {/* Connector: Gateway 1 → Archive Document (No path) */}
        <line x1="517" y1="110" x2="614" y2="110" stroke={executed.has("archiveDoc") && !executed.has("fetchPdf") ? GREEN : stroke} strokeWidth={executed.has("archiveDoc") && !executed.has("fetchPdf") ? "2.5" : "1.5"} />
        <polygon points="612,106 620,110 612,114" fill={executed.has("archiveDoc") && !executed.has("fetchPdf") ? GREEN : stroke} />

        {/* Archive Document (task) */}
        {sel === "archiveDoc" && <SelectedRect x={620} y={85} width={152} height={50} rx={6} />}
        {executed.has("archiveDoc") && <GlowRect x={620} y={85} width={152} height={50} rx={6} />}
        <g
          style={{ cursor: onNodeDoubleClick ? "pointer" : undefined }}
          onDoubleClick={() => onNodeDoubleClick?.("archiveDoc")}
        >
          <rect x="620" y="85" width="152" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="626" y="90" width="14" height="10" rx="2" fill="none" stroke={stroke} strokeWidth="1" />
          <text x="696" y="115" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Archive Document</text>
        </g>
        {executed.has("archiveDoc") && <CompletedBadge cx={776} cy={80} />}

        {/* Connector: Archive Document → Send Confirmation */}
        <line x1="772" y1="110" x2="864" y2="110" stroke={connStroke("archiveDoc")} strokeWidth={connWidth("archiveDoc")} />
        <polygon points="862,106 870,110 862,114" fill={connStroke("archiveDoc")} />

        {/* Send Confirmation (task) */}
        {sel === "sendConfirmation" && <SelectedRect x={870} y={85} width={152} height={50} rx={6} />}
        {executed.has("sendConfirmation") && <GlowRect x={870} y={85} width={152} height={50} rx={6} />}
        <g
          style={{ cursor: onNodeDoubleClick ? "pointer" : undefined }}
          onDoubleClick={() => onNodeDoubleClick?.("sendConfirmation")}
        >
          <rect x="870" y="85" width="152" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="876" y="90" width="16" height="11" rx="1" fill="none" stroke={stroke} strokeWidth="1" />
          <polyline points="876,90 884,97 892,90" fill="none" stroke={stroke} strokeWidth="1" />
          <text x="946" y="115" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Send Confirmation</text>
        </g>
        {executed.has("sendConfirmation") && <CompletedBadge cx={1026} cy={80} />}

        {/* Connector: Send Confirmation → End */}
        <line x1="1022" y1="110" x2="1092" y2="110" stroke={connStroke("end")} strokeWidth={connWidth("end")} />
        <polygon points="1090,106 1098,110 1090,114" fill={connStroke("end")} />

        {/* End Event */}
        {sel === "end" && <SelectedCircle cx={1120} cy={110} r={22} />}
        {executed.has("end") && <GlowCircle cx={1120} cy={110} r={22} />}
        <circle cx="1120" cy="110" r="22" fill="white" stroke={stroke} strokeWidth="3" />
        <circle cx="1120" cy="110" r="16" fill="white" stroke={stroke} strokeWidth="2.5" />
        {executed.has("end") && <CompletedBadge cx={1146} cy={85} />}
        <text x="1120" y="148" textAnchor="middle" className="text-[10px]" fill={textFill}>End</text>

        {/* ===== YES PATH (down from Gateway 1 to ROW 2, y=330) ===== */}
        <text x="470" y="180" textAnchor="middle" className="text-[9px]" fill={textFill}>Yes</text>
        <line x1="480" y1="147" x2="480" y2="270" stroke={connStroke("fetchPdf")} strokeWidth={connWidth("fetchPdf")} />
        <line x1="480" y1="270" x2="480" y2="299" stroke={connStroke("fetchPdf")} strokeWidth={connWidth("fetchPdf")} />
        <polygon points="476,297 480,305 484,297" fill={connStroke("fetchPdf")} />

        {/* ===== ROW 2 (y=330) ===== */}

        {/* Fetch PDF & Extract Data annotation */}
        <g>
          <line x1="340" y1="330" x2="394" y2="330" stroke={lightStroke} strokeWidth="1" strokeDasharray="4 3" />
          <text x="280" y="320" textAnchor="middle" className="text-[10px]" fill={annotationFill}>(Agent)</text>
          <text x="280" y="333" textAnchor="middle" className="text-[10px]" fill={annotationFill}>Fetch PDF</text>
          <text x="280" y="346" textAnchor="middle" className="text-[10px]" fill={annotationFill}>Agent</text>
        </g>

        {/* Fetch PDF & Extract Data (agent task) */}
        {sel === "fetchPdf" && <SelectedRect x={400} y={305} width={170} height={50} rx={6} />}
        {faulted.has("fetchPdf") && <FaultedGlowRect x={400} y={305} width={170} height={50} rx={6} />}
        {executed.has("fetchPdf") && !faulted.has("fetchPdf") && <GlowRect x={400} y={305} width={170} height={50} rx={6} />}
        <g
          style={{ cursor: onNodeDoubleClick ? "pointer" : undefined }}
          onDoubleClick={() => onNodeDoubleClick?.("fetchPdf")}
        >
          <rect x="400" y="305" width="170" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="406" y="310" width="14" height="10" rx="2" fill="none" stroke={stroke} strokeWidth="1" />
          <text x="485" y="334" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Fetch PDF &</text>
          <text x="485" y="348" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Extract Data</text>
          <circle cx="420" cy="355" r="11" fill="white" stroke={stroke} strokeWidth="1.2" />
          <path d="M415,355 Q420,349 425,355" fill="none" stroke={stroke} strokeWidth="1" />
        </g>
        {executed.has("fetchPdf") && !faulted.has("fetchPdf") && <CompletedBadge cx={574} cy={300} />}
        {faulted.has("fetchPdf") && <FaultedBadge cx={574} cy={300} />}

        {/* Connector: Fetch PDF → Gateway 2 */}
        <line x1="570" y1="330" x2="644" y2="330" stroke={connStroke("gateway2")} strokeWidth={connWidth("gateway2")} />
        <polygon points="642,326 650,330 642,334" fill={connStroke("gateway2")} />

        {/* XOR Gateway 2: "Data Valid?" */}
        {executed.has("gateway2") && (
          <rect x="-30" y="-30" width="60" height="60" rx="2" fill="none" stroke="#86EFAC" strokeWidth="3" opacity="0.45" transform="translate(680,330) rotate(45,0,0)" />
        )}
        <g transform="translate(680,330)">
          <rect x="-26" y="-26" width="52" height="52" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" transform="rotate(45,0,0)" />
          <line x1="-10" y1="-10" x2="10" y2="10" stroke={stroke} strokeWidth="2.5" />
          <line x1="10" y1="-10" x2="-10" y2="10" stroke={stroke} strokeWidth="2.5" />
        </g>
        <text x="680" y="378" textAnchor="middle" className="text-[9px]" fill={textFill}>Data Valid?</text>

        {/* "Validated" path: Gateway 2 → up to Archive Document */}
        <text x="700" y="260" textAnchor="middle" className="text-[9px]" fill={textFill}>Validated</text>
        <line x1="680" y1="293" x2="680" y2="141" stroke={executed.has("archiveDoc") && executed.has("fetchPdf") ? GREEN : stroke} strokeWidth={executed.has("archiveDoc") && executed.has("fetchPdf") ? "2.5" : "1.5"} />
        <polygon points="676,143 680,135 684,143" fill={executed.has("archiveDoc") && executed.has("fetchPdf") ? GREEN : stroke} />

        {/* "Rejected" path: Gateway 2 → Flag for Review */}
        <text x="752" y="323" textAnchor="middle" className="text-[9px]" fill={textFill}>Rejected</text>
        <line x1="717" y1="330" x2="824" y2="330" stroke={stroke} strokeWidth="1.5" />
        <polygon points="822,326 830,330 822,334" fill={stroke} />

        {/* Flag for Review (task) */}
        {sel === "flagReview" && <SelectedRect x={830} y={305} width={152} height={50} rx={6} />}
        {executed.has("flagReview") && <GlowRect x={830} y={305} width={152} height={50} rx={6} />}
        <g
          style={{ cursor: onNodeDoubleClick ? "pointer" : undefined }}
          onDoubleClick={() => onNodeDoubleClick?.("flagReview")}
        >
          <rect x="830" y="305" width="152" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="836" y="310" width="16" height="11" rx="1" fill="none" stroke={stroke} strokeWidth="1" />
          <polyline points="836,310 844,317 852,310" fill="none" stroke={stroke} strokeWidth="1" />
          <text x="906" y="335" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Flag for Review</text>
          <rect x="968" y="310" width="12" height="12" rx="2" fill="#0078D4" />
        </g>

        {/* ===== "Escalate" path: Gateway 2 → down → left to Manual Data Review ===== */}
        <text x="640" y="475" textAnchor="middle" className="text-[9px]" fill={textFill}>Escalate</text>
        <line x1="680" y1="367" x2="680" y2="560" stroke={stroke} strokeWidth="1.5" />
        <line x1="680" y1="560" x2="595" y2="560" stroke={stroke} strokeWidth="1.5" />
        <line x1="595" y1="560" x2="595" y2="579" stroke={stroke} strokeWidth="1.5" />
        <polygon points="591,577 595,585 599,577" fill={stroke} />

        {/* ===== ROW 3 (y=490) ===== */}

        {/* Connector: Flag for Review → down → Send reminder */}
        <line x1="906" y1="355" x2="906" y2="430" stroke={stroke} strokeWidth="1.5" />
        <line x1="906" y1="430" x2="870" y2="430" stroke={stroke} strokeWidth="1.5" />
        <line x1="870" y1="430" x2="870" y2="466" stroke={stroke} strokeWidth="1.5" />
        <polygon points="866,464 870,472 874,464" fill={stroke} />

        {/* (Integration Service) Send reminder event */}
        {sel === "sendReminder" && <SelectedCircle cx={870} cy={490} r={18} />}
        <circle cx="870" cy="490" r="18" fill="white" stroke={stroke} strokeWidth="1.5" />
        <circle cx="870" cy="490" r="14" fill="white" stroke={stroke} strokeWidth="1" />
        <circle cx="870" cy="490" r="5" fill="none" stroke={stroke} strokeWidth="1.2" />
        <text x="810" y="480" textAnchor="middle" className="text-[9px]" fill={annotationFill}>(Integration</text>
        <text x="810" y="492" textAnchor="middle" className="text-[9px]" fill={annotationFill}>Service) Send</text>
        <text x="810" y="504" textAnchor="middle" className="text-[9px]" fill={annotationFill}>reminder</text>

        {/* Connector: Send reminder → right → Timer */}
        <line x1="888" y1="490" x2="1006" y2="490" stroke={stroke} strokeWidth="1.5" />
        <polygon points="1004,486 1012,490 1004,494" fill={stroke} />

        {/* Connector: Send reminder → down → Wait for reviewer response */}
        <line x1="870" y1="508" x2="870" y2="586" stroke={stroke} strokeWidth="1.5" />
        <polygon points="866,584 870,592 874,584" fill={stroke} />

        {/* Timer Event */}
        {sel === "timer" && <SelectedCircle cx={1030} cy={490} r={18} />}
        <circle cx="1030" cy="490" r="18" fill="white" stroke={stroke} strokeWidth="1.5" />
        <circle cx="1030" cy="490" r="14" fill="white" stroke={stroke} strokeWidth="1" />
        <circle cx="1030" cy="490" r="2" fill={stroke} />
        <line x1="1030" y1="490" x2="1030" y2="481" stroke={stroke} strokeWidth="1.2" />
        <line x1="1030" y1="490" x2="1037" y2="493" stroke={stroke} strokeWidth="1.2" />
        <text x="1070" y="535" textAnchor="start" className="text-[9px]" fill={textFill}>No response</text>

        {/* Timer annotation */}
        <line x1="1048" y1="490" x2="1080" y2="490" stroke={lightStroke} strokeWidth="1" strokeDasharray="4 3" />
        <text x="1085" y="475" textAnchor="start" className="text-[9px]" fill={annotationFill}>(Timer) wait</text>
        <text x="1085" y="487" textAnchor="start" className="text-[9px]" fill={annotationFill}>2 days before</text>
        <text x="1085" y="499" textAnchor="start" className="text-[9px]" fill={annotationFill}>escalating to</text>
        <text x="1085" y="511" textAnchor="start" className="text-[9px]" fill={annotationFill}>human review</text>

        {/* ===== ROW 4 (y=610) ===== */}

        {/* Connector: Timer → right (past annotation) → up → left to End */}
        <line x1="1030" y1="508" x2="1030" y2="540" stroke={stroke} strokeWidth="1.5" />
        <line x1="1030" y1="540" x2="1220" y2="540" stroke={stroke} strokeWidth="1.5" />
        <line x1="1220" y1="540" x2="1220" y2="110" stroke={stroke} strokeWidth="1.5" />
        <line x1="1220" y1="110" x2="1148" y2="110" stroke={stroke} strokeWidth="1.5" />

        {/* Wait for reviewer response (message receive event) */}
        {sel === "waitResponse" && <SelectedCircle cx={870} cy={610} r={18} />}
        <circle cx="870" cy="610" r="18" fill="white" stroke={stroke} strokeWidth="1.5" />
        <rect x="860" y="604" width="20" height="13" rx="1" fill="none" stroke={stroke} strokeWidth="1.2" />
        <polyline points="860,604 870,611 880,604" fill="none" stroke={stroke} strokeWidth="1" />
        <text x="870" y="648" textAnchor="middle" className="text-[9px]" fill={annotationFill}>(Integration Service)</text>
        <text x="870" y="660" textAnchor="middle" className="text-[9px]" fill={annotationFill}>Wait for reviewer</text>
        <text x="870" y="672" textAnchor="middle" className="text-[9px]" fill={annotationFill}>response trigger</text>

        {/* Connector: Wait for reviewer → Manual Data Review */}
        <line x1="852" y1="610" x2="686" y2="610" stroke={stroke} strokeWidth="1.5" />
        <polygon points="688,606 680,610 688,614" fill={stroke} />

        {/* Manual Data Review (human task) */}
        {sel === "manualReview" && <SelectedRect x={510} y={585} width={170} height={50} rx={6} />}
        {executed.has("manualReview") && <GlowRect x={510} y={585} width={170} height={50} rx={6} />}
        <g
          style={{ cursor: onNodeDoubleClick ? "pointer" : undefined }}
          onDoubleClick={() => onNodeDoubleClick?.("manualReview")}
        >
          <rect x="510" y="585" width="170" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
          <circle cx="525" cy="597" r="5" fill="none" stroke={stroke} strokeWidth="1" />
          <path d="M518,610 Q525,603 532,610" fill="none" stroke={stroke} strokeWidth="1" />
          <text x="595" y="614" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Manual Data Review</text>
        </g>
        {executed.has("manualReview") && <CompletedBadge cx={684} cy={580} />}

        {/* Manual Data Review annotation (below) */}
        <g>
          <line x1="595" y1="635" x2="595" y2="660" stroke={lightStroke} strokeWidth="1" strokeDasharray="4 3" />
          <text x="595" y="672" textAnchor="middle" className="text-[9px]" fill={annotationFill}>(Action Center) Review form with</text>
          <text x="595" y="684" textAnchor="middle" className="text-[9px]" fill={annotationFill}>extracted data, source document</text>
          <text x="595" y="696" textAnchor="middle" className="text-[9px]" fill={annotationFill}>and correction fields</text>
        </g>

        {/* Connector: Manual Data Review → up → back to Fetch PDF & Extract Data (loop back) */}
        <line x1="510" y1="610" x2="460" y2="610" stroke={stroke} strokeWidth="1.5" />
        <line x1="460" y1="610" x2="460" y2="361" stroke={stroke} strokeWidth="1.5" />
        <polygon points="456,363 460,355 464,363" fill={stroke} />

        {/* TOOLTIP HOVER ZONES */}
        {[
          { key: "start", x: 58, y: 88, w: 44, h: 44, circle: true },
          { key: "classifyDoc", x: 230, y: 85, w: 152, h: 50 },
          { key: "gateway1", x: 456, y: 86, w: 48, h: 48, circle: true },
          { key: "archiveDoc", x: 620, y: 85, w: 152, h: 50 },
          { key: "sendConfirmation", x: 870, y: 85, w: 152, h: 50 },
          { key: "end", x: 1098, y: 88, w: 44, h: 44, circle: true },
          { key: "fetchPdf", x: 400, y: 305, w: 170, h: 50 },
          { key: "gateway2", x: 656, y: 306, w: 48, h: 48, circle: true },
          { key: "flagReview", x: 830, y: 305, w: 152, h: 50 },
          { key: "sendReminder", x: 852, y: 472, w: 36, h: 36, circle: true },
          { key: "timer", x: 1012, y: 472, w: 36, h: 36, circle: true },
          { key: "manualReview", x: 510, y: 585, w: 170, h: 50 },
          { key: "waitResponse", x: 852, y: 592, w: 36, h: 36, circle: true },
        ].map(({ key, x, y, w, h, circle }) => (
          <rect
            key={key}
            x={x} y={y} width={w} height={h}
            rx={circle ? w / 2 : 6}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={(e) => showTooltip(e, key)}
            onMouseMove={(e) => moveTooltip(e, key)}
            onMouseLeave={hideTooltip}
            onDoubleClick={() => {
              hideTooltip();
              onNodeDoubleClick?.(key);
            }}
          />
        ))}

        {/* HEATMAP OVERLAY on Fetch PDF & Extract Data */}
        {showHeatmap && (
          <>
            <defs>
              <radialGradient id="codedHeatmap" cx="50%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.55" />
                <stop offset="20%" stopColor="#EF4444" stopOpacity="0.4" />
                <stop offset="40%" stopColor="#F97316" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#EAB308" stopOpacity="0.2" />
                <stop offset="80%" stopColor="#22C55E" stopOpacity="0.12" />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity="0.06" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <filter id="codedFlowBlur">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <polyline
              points="80,110 306,110 480,110 480,330 680,330 680,110 700,110 946,110 1120,110"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.12"
              filter="url(#codedFlowBlur)"
            />
            <ellipse cx="485" cy="330" rx="160" ry="110" fill="url(#codedHeatmap)" />
          </>
        )}

        {/* COUNT BADGES — rendered last so they sit on top */}
        {(!hasExec || showHeatmap) && (
          <>
            <CountBadges x={104} y={88} items={[{ count: 2, color: GREEN }]} />
            <CountBadges x={382} y={85} items={[{ count: 2, color: GREEN }]} />
            <CountBadges x={776} y={85} items={[{ count: 1, color: GREEN }]} />
            <CountBadges x={1026} y={85} items={[{ count: 1, color: GREEN }]} />
            <CountBadges x={1146} y={88} items={[{ count: 1, color: GREEN }]} />
            <CountBadges x={574} y={305} items={[{ count: 1, color: GREEN }, { count: 1, color: RED }]} />
          </>
        )}
      </svg>
    </div>
  );
}
