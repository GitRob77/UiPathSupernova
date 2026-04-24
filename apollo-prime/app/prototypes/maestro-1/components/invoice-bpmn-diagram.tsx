"use client";

import { useRef, useState, useCallback, type MouseEvent, type WheelEvent } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

const GREEN = "#16a34a";
const RED = "#dc2626";
const GREY = "#9ca3af";

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

function CancelledBadge({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="11" fill="white" />
      <circle cx={cx} cy={cy} r="9" fill={GREY} />
      <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4} stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

function CancelledGlowRect({ x, y, width, height, rx }: { x: number; y: number; width: number; height: number; rx: number }) {
  return <rect x={x - 4} y={y - 4} width={width + 8} height={height + 8} rx={rx + 2} fill="none" stroke="#D1D5DB" strokeWidth="3" opacity="0.5" />;
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

interface InvoiceBpmnDiagramProps {
  executionPath?: string[];
  onNodeDoubleClick?: (nodeKey: string) => void;
  selectedNodeKey?: string | null;
  showHeatmap?: boolean;
  faultedNodes?: string[];
  cancelledNodes?: string[];
}

/* ── Tooltip metadata ─────────────────────────────────────────── */

interface TooltipInfo {
  label: string;
  type: string;
  status?: string;
  detail?: string;
}

const nodeTooltips: Record<string, TooltipInfo> = {
  start: { label: "New iPhone Request", type: "Message Start Event", detail: "Trigger: Data Service — new request created" },
  invoiceMatching: { label: "Invoice to PO Matching", type: "Service Task", detail: "Matches invoice data against purchase orders" },
  gateway1: { label: "Is resolution required?", type: "Exclusive Gateway", detail: "Routes based on matching result" },
  resolveAgent: { label: "Agent Scout", type: "Agent Task", detail: "AI agent for price scouting and resolution" },
  approveInvoice: { label: "Approve Invoice", type: "Service Task", detail: "Approves and issues purchase order" },
  notification: { label: "Internal Notification", type: "Service Task", detail: "Robot Job — sends email notifications" },
  end: { label: "End", type: "End Event", detail: "Process completed" },
};

export function InvoiceBpmnDiagram({ executionPath, onNodeDoubleClick, selectedNodeKey, showHeatmap, faultedNodes, cancelledNodes }: InvoiceBpmnDiagramProps) {
  const faulted = new Set(faultedNodes ?? []);
  const cancelled = new Set(cancelledNodes ?? []);
  const hasExec = !!executionPath && executionPath.length > 0;
  const executed = new Set(executionPath ?? []);
  const sel = selectedNodeKey ?? null;

  const stroke = "#2D3A4A";
  const textFill = "#2D3A4A";
  const annotationFill = "#2D3A4A";
  const lightStroke = "#8899AA";

  const connStroke = (nodeKey: string) => executed.has(nodeKey) ? GREEN : stroke;
  const connWidth = (nodeKey: string) => executed.has(nodeKey) ? "2.5" : "1.5";

  const [tooltip, setTooltip] = useState<{ x: number; y: number; info: TooltipInfo } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = (e: React.MouseEvent<SVGElement>, key: string) => {
    const info = nodeTooltips[key];
    if (!info) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const status = faulted.has(key) ? "Faulted" : cancelled.has(key) ? "Cancelled" : executed.has(key) ? "Completed" : "Pending";
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - 10;
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => {
      setTooltip({ x, y, info: { ...info, status } });
    }, 800);
  };

  const moveTooltip = (e: React.MouseEvent<SVGElement>, key: string) => {
    if (!tooltip) return;
    const info = nodeTooltips[key];
    if (!info) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const status = faulted.has(key) ? "Faulted" : cancelled.has(key) ? "Cancelled" : executed.has(key) ? "Completed" : "Pending";
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10, info: { ...info, status } });
  };

  const hideTooltip = () => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltip(null);
  };

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
                    backgroundColor: tooltip.info.status === "Completed" ? GREEN : tooltip.info.status === "Faulted" ? RED : tooltip.info.status === "Cancelled" ? GREY : "#9CA3AF",
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
        viewBox="0 0 1240 780"
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
        {/* ANNOTATIONS */}
        <g>
          <line x1="62" y1="115" x2="62" y2="210" stroke={lightStroke} strokeWidth="1" strokeDasharray="4 3" />
          <text x="62" y="35" textAnchor="middle" className="text-[10px]" fill={annotationFill} fontWeight="500">(Data Service)</text>
          <text x="62" y="48" textAnchor="middle" className="text-[10px]" fill={annotationFill}>New iPhone</text>
          <text x="62" y="61" textAnchor="middle" className="text-[10px]" fill={annotationFill}>request</text>
          <text x="62" y="74" textAnchor="middle" className="text-[10px]" fill={annotationFill}>created trigger</text>
        </g>
        <g>
          <line x1="270" y1="115" x2="270" y2="210" stroke={lightStroke} strokeWidth="1" strokeDasharray="4 3" />
          <text x="270" y="40" textAnchor="middle" className="text-[10px]" fill={annotationFill}>(Automation)</text>
          <text x="270" y="53" textAnchor="middle" className="text-[10px]" fill={annotationFill}>Manager</text>
          <text x="270" y="66" textAnchor="middle" className="text-[10px]" fill={annotationFill}>Approval</text>
        </g>
        <g>
          <line x1="590" y1="115" x2="590" y2="210" stroke={lightStroke} strokeWidth="1" strokeDasharray="4 3" />
          <text x="590" y="35" textAnchor="middle" className="text-[10px]" fill={annotationFill}>(Automation or IS)</text>
          <text x="590" y="48" textAnchor="middle" className="text-[10px]" fill={annotationFill}>Update Invoice</text>
          <text x="590" y="61" textAnchor="middle" className="text-[10px]" fill={annotationFill}>status</text>
        </g>

        {/* MAIN FLOW ROW 1 (y=240) */}

        {/* Connector: Start → Invoice to PO Matching */}
        <line x1="88" y1="240" x2="190" y2="240" stroke={connStroke("start")} strokeWidth={connWidth("start")} />
        <polygon points="188,236 196,240 188,244" fill={connStroke("start")} />

        {/* Message Start Event "Invoice Created" */}
        {sel === "start" && <SelectedCircle cx={62} cy={240} r={22} />}
        {executed.has("start") && <GlowCircle cx={62} cy={240} r={22} />}
        <circle cx="62" cy="240" r="22" fill="white" stroke={stroke} strokeWidth="2" />
        <rect x="50" y="233" width="24" height="15" rx="1" fill="none" stroke={stroke} strokeWidth="1.3" />
        <polyline points="50,233 62,242 74,233" fill="none" stroke={stroke} strokeWidth="1.3" />
        {executed.has("start") && <CompletedBadge cx={88} cy={215} />}
        <text x="62" y="282" textAnchor="middle" className="text-[10px]" fill={textFill}>New iPhone</text>
        <text x="62" y="294" textAnchor="middle" className="text-[10px]" fill={textFill}>Request</text>

        {/* Manager Approval (task) */}
        {sel === "invoiceMatching" && <SelectedRect x={196} y={215} width={148} height={50} rx={6} />}
        {executed.has("invoiceMatching") && <GlowRect x={196} y={215} width={148} height={50} rx={6} />}
        <rect x="196" y="215" width="148" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
        <rect x="202" y="220" width="14" height="10" rx="2" fill="none" stroke={stroke} strokeWidth="1" />
        <text x="270" y="244" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Manager</text>
        <text x="270" y="258" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Approval</text>
        {executed.has("invoiceMatching") && <CompletedBadge cx={348} cy={210} />}

        {/* Connector: Invoice to PO → Gateway 1 */}
        <line x1="344" y1="240" x2="398" y2="240" stroke={connStroke("invoiceMatching")} strokeWidth={connWidth("invoiceMatching")} />
        <polygon points="396,236 404,240 396,244" fill={connStroke("invoiceMatching")} />

        {/* XOR Gateway 1: "Is resolution required" */}
        {executed.has("gateway1") && (
          <rect x="-30" y="-30" width="60" height="60" rx="2" fill="none" stroke="#86EFAC" strokeWidth="3" opacity="0.45" transform="translate(424,240) rotate(45,0,0)" />
        )}
        <g transform="translate(424,240)">
          <rect x="-26" y="-26" width="52" height="52" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" transform="rotate(45,0,0)" />
          <line x1="-10" y1="-10" x2="10" y2="10" stroke={stroke} strokeWidth="2.5" />
          <line x1="10" y1="-10" x2="-10" y2="10" stroke={stroke} strokeWidth="2.5" />
        </g>
        <text x="424" y="290" textAnchor="middle" className="text-[9px]" fill={textFill}>Is resolution</text>
        <text x="424" y="301" textAnchor="middle" className="text-[9px]" fill={textFill}>required</text>

        {/* "No" label on top path */}
        <text x="490" y="233" textAnchor="middle" className="text-[9px]" fill={textFill}>No</text>

        {/* Connector: Gateway 1 → Approve Invoice (No path) */}
        <line x1="460" y1="240" x2="520" y2="240" stroke={executed.has("approveInvoice") && !executed.has("resolveAgent") ? GREEN : stroke} strokeWidth={executed.has("approveInvoice") && !executed.has("resolveAgent") ? "2.5" : "1.5"} />
        <polygon points="518,236 526,240 518,244" fill={executed.has("approveInvoice") && !executed.has("resolveAgent") ? GREEN : stroke} />

        {/* Approve Invoice (task) */}
        {sel === "approveInvoice" && <SelectedRect x={526} y={215} width={128} height={50} rx={6} />}
        {executed.has("approveInvoice") && <GlowRect x={526} y={215} width={128} height={50} rx={6} />}
        <rect x="526" y="215" width="128" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
        <rect x="532" y="220" width="14" height="10" rx="2" fill="none" stroke={stroke} strokeWidth="1" />
        <text x="590" y="247" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Approve Invoice</text>
        {executed.has("approveInvoice") && <CompletedBadge cx={658} cy={210} />}

        {/* Connector: Approve Invoice → Internal Notification */}
        <line x1="654" y1="240" x2="720" y2="240" stroke={connStroke("notification")} strokeWidth={connWidth("notification")} />
        <polygon points="718,236 726,240 718,244" fill={connStroke("notification")} />

        {/* Internal Notification (task) */}
        {sel === "notification" && <SelectedRect x={726} y={215} width={128} height={50} rx={6} />}
        {executed.has("notification") && <GlowRect x={726} y={215} width={128} height={50} rx={6} />}
        <g
          style={{ cursor: onNodeDoubleClick ? "pointer" : undefined }}
          onDoubleClick={() => onNodeDoubleClick?.("notification")}
        >
          <rect x="726" y="215" width="128" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="732" y="220" width="14" height="10" rx="2" fill="none" stroke={stroke} strokeWidth="1" />
          <text x="790" y="244" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Internal</text>
          <text x="790" y="258" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Notification</text>
        </g>
        {executed.has("notification") && <CompletedBadge cx={858} cy={210} />}

        {/* Connector: Internal Notification → End */}
        <line x1="854" y1="240" x2="920" y2="240" stroke={connStroke("end")} strokeWidth={connWidth("end")} />
        <polygon points="918,236 926,240 918,244" fill={connStroke("end")} />

        {/* End Event */}
        {sel === "end" && <SelectedCircle cx={952} cy={240} r={22} />}
        {executed.has("end") && <GlowCircle cx={952} cy={240} r={22} />}
        <circle cx="952" cy="240" r="22" fill="white" stroke={stroke} strokeWidth="3" />
        <circle cx="952" cy="240" r="16" fill="white" stroke={stroke} strokeWidth="2.5" />
        {executed.has("end") && <CompletedBadge cx={978} cy={215} />}
        <text x="952" y="278" textAnchor="middle" className="text-[10px]" fill={textFill}>End</text>

        {/* YES PATH (down from Gateway 1) */}
        <text x="414" y="310" textAnchor="middle" className="text-[9px]" fill={textFill}>Yes</text>
        <line x1="424" y1="277" x2="424" y2="400" stroke={connStroke("resolveAgent")} strokeWidth={connWidth("resolveAgent")} />
        <polygon points="420,398 424,406 428,398" fill={connStroke("resolveAgent")} />

        {/* ROW 2: Agent + Gateway 2 + Notify Vendor (y=430) */}

        {/* Agent Scout annotation */}
        <g>
          <line x1="310" y1="430" x2="348" y2="430" stroke={lightStroke} strokeWidth="1" strokeDasharray="4 3" />
          <text x="240" y="420" textAnchor="middle" className="text-[10px]" fill={annotationFill}>(Agent)</text>
          <text x="240" y="433" textAnchor="middle" className="text-[10px]" fill={annotationFill}>Agent</text>
          <text x="240" y="446" textAnchor="middle" className="text-[10px]" fill={annotationFill}>Scout</text>
        </g>

        {/* Agent Scout (task) */}
        {sel === "resolveAgent" && <SelectedRect x={348} y={405} width={152} height={50} rx={6} />}
        {faulted.has("resolveAgent") && <FaultedGlowRect x={348} y={405} width={152} height={50} rx={6} />}
        {cancelled.has("resolveAgent") && <CancelledGlowRect x={348} y={405} width={152} height={50} rx={6} />}
        {executed.has("resolveAgent") && !faulted.has("resolveAgent") && !cancelled.has("resolveAgent") && <GlowRect x={348} y={405} width={152} height={50} rx={6} />}
        <g
          style={{ cursor: onNodeDoubleClick ? "pointer" : undefined }}
          onDoubleClick={() => onNodeDoubleClick?.("resolveAgent")}
        >
          <rect x="348" y="405" width="152" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="356" y="410" width="14" height="10" rx="2" fill="none" stroke={stroke} strokeWidth="1" />
          <text x="424" y="434" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Agent</text>
          <text x="424" y="448" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Scout</text>
          <circle cx="370" cy="455" r="11" fill="white" stroke={stroke} strokeWidth="1.2" />
          <path d="M365,455 Q370,449 375,455" fill="none" stroke={stroke} strokeWidth="1" />
        </g>
        {executed.has("resolveAgent") && !faulted.has("resolveAgent") && !cancelled.has("resolveAgent") && <CompletedBadge cx={504} cy={400} />}
        {faulted.has("resolveAgent") && <FaultedBadge cx={504} cy={400} />}
        {cancelled.has("resolveAgent") && <CancelledBadge cx={504} cy={400} />}

        {/* Connector: Agent → Gateway 2 */}
        <line x1="500" y1="430" x2="565" y2="430" stroke={connStroke("gateway2")} strokeWidth={connWidth("gateway2")} />

        {/* XOR Gateway 2 */}
        <g transform="translate(590,430)">
          <rect x="-26" y="-26" width="52" height="52" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" transform="rotate(45,0,0)" />
          <line x1="-10" y1="-10" x2="10" y2="10" stroke={stroke} strokeWidth="2.5" />
          <line x1="10" y1="-10" x2="-10" y2="10" stroke={stroke} strokeWidth="2.5" />
        </g>

        {/* "Resolved" path: Gateway 2 → up to Approve Invoice */}
        <text x="600" y="380" textAnchor="middle" className="text-[9px]" fill={textFill}>Resolved</text>
        <line x1="590" y1="393" x2="590" y2="271" stroke={executed.has("approveInvoice") && executed.has("resolveAgent") ? GREEN : stroke} strokeWidth={executed.has("approveInvoice") && executed.has("resolveAgent") ? "2.5" : "1.5"} />
        <polygon points="586,273 590,265 594,273" fill={executed.has("approveInvoice") && executed.has("resolveAgent") ? GREEN : stroke} />

        {/* "Rejected" path: Gateway 2 → Notify Vendor */}
        <text x="660" y="423" textAnchor="middle" className="text-[9px]" fill={textFill}>Rejected</text>
        <line x1="627" y1="430" x2="700" y2="430" stroke={stroke} strokeWidth="1.5" />
        <polygon points="698,426 706,430 698,434" fill={stroke} />

        {/* "Escalate" path: Gateway 2 → down → Resolve Discrepancies */}
        <text x="548" y="585" textAnchor="middle" className="text-[9px]" fill={textFill}>Escalate</text>
        <line x1="590" y1="467" x2="590" y2="600" stroke={stroke} strokeWidth="1.5" />
        <line x1="590" y1="600" x2="524" y2="600" stroke={stroke} strokeWidth="1.5" />
        <line x1="524" y1="600" x2="524" y2="629" stroke={stroke} strokeWidth="1.5" />
        <polygon points="520,629 524,637 528,629" fill={stroke} />

        {/* Notify Vendor (task) */}
        <rect x="706" y="405" width="128" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
        <rect x="714" y="413" width="16" height="11" rx="1" fill="none" stroke={stroke} strokeWidth="1" />
        <polyline points="714,413 722,420 730,413" fill="none" stroke={stroke} strokeWidth="1" />
        <text x="770" y="437" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Notify Vendor</text>
        <rect x="820" y="413" width="12" height="12" rx="2" fill="#0078D4" />

        {/* ROW 3: Send email, Timer, Wait email, Resolve (y=550-640) */}

        {/* Connector: Notify Vendor → down → Send email */}
        <line x1="770" y1="455" x2="770" y2="530" stroke={stroke} strokeWidth="1.5" />

        {/* (Integration Service) Send email label */}
        <text x="670" y="530" textAnchor="middle" className="text-[9px]" fill={annotationFill}>(Integration</text>
        <text x="670" y="542" textAnchor="middle" className="text-[9px]" fill={annotationFill}>Service) Send</text>
        <text x="670" y="554" textAnchor="middle" className="text-[9px]" fill={annotationFill}>email</text>

        {/* Send email event */}
        <circle cx="770" cy="550" r="18" fill="white" stroke={stroke} strokeWidth="1.5" />
        <circle cx="770" cy="550" r="14" fill="white" stroke={stroke} strokeWidth="1" />
        <circle cx="770" cy="550" r="5" fill="none" stroke={stroke} strokeWidth="1.2" />

        {/* Connector: Send email → Timer */}
        <line x1="788" y1="550" x2="890" y2="550" stroke={stroke} strokeWidth="1.5" />

        {/* Timer Event */}
        <circle cx="910" cy="550" r="18" fill="white" stroke={stroke} strokeWidth="1.5" />
        <circle cx="910" cy="550" r="14" fill="white" stroke={stroke} strokeWidth="1" />
        <circle cx="910" cy="550" r="2" fill={stroke} />
        <line x1="910" y1="550" x2="910" y2="541" stroke={stroke} strokeWidth="1.2" />
        <line x1="910" y1="550" x2="917" y2="553" stroke={stroke} strokeWidth="1.2" />
        <text x="910" y="585" textAnchor="middle" className="text-[9px]" fill={textFill}>No response</text>

        {/* Timer annotation */}
        <text x="1010" y="490" textAnchor="start" className="text-[9px]" fill={annotationFill}>(Timer) wait</text>
        <text x="1010" y="502" textAnchor="start" className="text-[9px]" fill={annotationFill}>1 day before</text>
        <text x="1010" y="514" textAnchor="start" className="text-[9px]" fill={annotationFill}>ending the</text>
        <text x="1010" y="526" textAnchor="start" className="text-[9px]" fill={annotationFill}>process</text>

        {/* Connector: Timer → up to End */}
        <line x1="928" y1="550" x2="980" y2="550" stroke={stroke} strokeWidth="1.5" />
        <line x1="980" y1="550" x2="980" y2="240" stroke={stroke} strokeWidth="1.5" />
        <line x1="980" y1="240" x2="975" y2="240" stroke={stroke} strokeWidth="1.5" />

        {/* BOTTOM ROW: Wait for email + Resolve Discrepancies (y=650) */}

        {/* Connector: Send email → down → Wait for email */}
        <line x1="770" y1="568" x2="770" y2="640" stroke={stroke} strokeWidth="1.5" />

        {/* Wait for email annotation */}
        <text x="850" y="625" textAnchor="middle" className="text-[9px]" fill={annotationFill}>(Integration</text>
        <text x="850" y="637" textAnchor="middle" className="text-[9px]" fill={annotationFill}>Service) Wait</text>
        <text x="850" y="649" textAnchor="middle" className="text-[9px]" fill={annotationFill}>for email</text>
        <text x="850" y="661" textAnchor="middle" className="text-[9px]" fill={annotationFill}>received</text>
        <text x="850" y="673" textAnchor="middle" className="text-[9px]" fill={annotationFill}>trigger</text>

        {/* Message receive event */}
        <circle cx="770" cy="660" r="18" fill="white" stroke={stroke} strokeWidth="1.5" />
        <rect x="760" y="654" width="20" height="13" rx="1" fill="none" stroke={stroke} strokeWidth="1.2" />
        <polyline points="760,654 770,661 780,654" fill="none" stroke={stroke} strokeWidth="1" />

        {/* Connector: message event → left → Resolve Discrepancies */}
        <line x1="752" y1="660" x2="594" y2="660" stroke={stroke} strokeWidth="1.5" />
        <polygon points="596,656 588,660 596,664" fill={stroke} />

        {/* Resolve Discrepancies (Human Task) */}
        {executed.has("resolveHuman") && <GlowRect x={460} y={635} width={128} height={50} rx={6} />}
        <rect x="460" y="635" width="128" height="50" rx="6" fill="white" stroke={stroke} strokeWidth="1.5" />
        <circle cx="475" cy="647" r="5" fill="none" stroke={stroke} strokeWidth="1" />
        <path d="M468,660 Q475,653 482,660" fill="none" stroke={stroke} strokeWidth="1" />
        <text x="524" y="663" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Resolve</text>
        <text x="524" y="677" textAnchor="middle" className="text-[11px]" fill={textFill} fontWeight="500">Discrepancies</text>
        {executed.has("resolveHuman") && <CompletedBadge cx={592} cy={630} />}

        {/* Connector: Resolve Discrepancies → up to Agent Scout */}
        <line x1="460" y1="660" x2="424" y2="660" stroke={stroke} strokeWidth="1.5" />
        <line x1="424" y1="660" x2="424" y2="461" stroke={stroke} strokeWidth="1.5" />
        <polygon points="420,463 424,455 428,463" fill={stroke} />

        {/* Action Center annotation (bottom) */}
        <g>
          <line x1="524" y1="685" x2="524" y2="710" stroke={lightStroke} strokeWidth="1" strokeDasharray="4 3" />
          <text x="524" y="722" textAnchor="middle" className="text-[9px]" fill={annotationFill}>(Action Center) App Task form</text>
          <text x="524" y="734" textAnchor="middle" className="text-[9px]" fill={annotationFill}>with Invoice details and</text>
          <text x="524" y="746" textAnchor="middle" className="text-[9px]" fill={annotationFill}>potential PO lookup logic</text>
        </g>

        {/* HEATMAP OVERLAY on Agent Scout */}
        {showHeatmap && (
          <>
            <defs>
              <radialGradient id="agentHeatmap" cx="50%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.55" />
                <stop offset="20%" stopColor="#EF4444" stopOpacity="0.4" />
                <stop offset="40%" stopColor="#F97316" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#EAB308" stopOpacity="0.2" />
                <stop offset="80%" stopColor="#22C55E" stopOpacity="0.12" />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity="0.06" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <filter id="flowBlur">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <polyline
              points="84,240 424,240 424,430 590,430 590,240 930,240"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.12"
              filter="url(#flowBlur)"
            />
            <ellipse cx="424" cy="430" rx="160" ry="110" fill="url(#agentHeatmap)" />
          </>
        )}

        {/* TOOLTIP HOVER ZONES — invisible rects over each node */}
        {[
          { key: "start", x: 40, y: 218, w: 44, h: 44, r: true },
          { key: "invoiceMatching", x: 196, y: 215, w: 152, h: 50 },
          { key: "gateway1", x: 400, y: 216, w: 48, h: 48, r: true },
          { key: "resolveAgent", x: 348, y: 405, w: 152, h: 50 },
          { key: "approveInvoice", x: 526, y: 215, w: 128, h: 50 },
          { key: "notification", x: 726, y: 215, w: 128, h: 50 },
          { key: "end", x: 930, y: 218, w: 44, h: 44, r: true },
        ].map(({ key, x, y, w, h, r: isCircle }) => (
          <rect
            key={key}
            x={isCircle ? x : x}
            y={isCircle ? y : y}
            width={w}
            height={h}
            rx={isCircle ? w / 2 : 6}
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

        {/* COUNT BADGES — rendered last so they sit on top */}
        {!hasExec && (
          <>
            <CountBadges x={84} y={218} items={[{ count: 5, color: GREEN }]} />
            <CountBadges x={344} y={215} items={[{ count: 5, color: GREEN }]} />
            <CountBadges x={500} y={405} items={[{ count: 3, color: GREEN }, { count: 1, color: "#dc2626" }, { count: 1, color: "#9ca3af" }]} />
            <CountBadges x={654} y={215} items={[{ count: 3, color: GREEN }]} />
            <CountBadges x={854} y={215} items={[{ count: 3, color: GREEN }]} />
            <CountBadges x={974} y={218} items={[{ count: 3, color: GREEN }]} />
          </>
        )}
      </svg>
    </div>
  );
}
