"use client";

import {
  useRef,
  useState,
  useCallback,
  type MouseEvent,
  type WheelEvent,
} from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface FetchPdfWorkflowDiagramProps {
  executionPath?: string[];
  faultedNodes?: string[];
  selectedNodeKey?: string | null;
  onNodeClick?: (nodeKey: string) => void;
}

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

const GREEN = "#6AAC6C";
const BORDER_GRAY = "#A4B1B8";
const BG = "#F4F5F7";
const TEXT = "#182027";
const TEXT_DIM = "#526069";
const TEXT_BODY = "#273139";
const SUCCESS_ICON = "#038108";
const SELECTED = "#0067DF";

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const SVG_W = 1700;
const SVG_H = 480;
const MAIN_Y = 300;
const NODE_SIZE = 96;
const CIRCLE_R = 40;
const DIAMOND_SIZE = 32; // half-size of rotated square (64/2)
const GAP = 176;

/* ------------------------------------------------------------------ */
/* Node definitions                                                    */
/* ------------------------------------------------------------------ */

interface FlowNode {
  key: string;
  label: string;
  sublabel?: string;
  type: "start" | "code" | "gateway" | "end";
  x: number;
  y: number;
}

const nodes: FlowNode[] = [
  { key: "execute", label: "Execute ()", sublabel: "Start", type: "start", x: 100, y: MAIN_Y },
  { key: "look-for-files", label: "Look for files", type: "code", x: 260, y: MAIN_Y },
  { key: "any-images-found", label: "Any images found?", type: "gateway", x: 436, y: MAIN_Y },
  { key: "convert-to-pdf", label: "Convert to PDF", type: "code", x: 612, y: MAIN_Y },
  { key: "any-pdfs-found", label: "Any PDFs found?", type: "gateway", x: 788, y: MAIN_Y },
  { key: "merge-pdfs", label: "Merge PDFs in one file", type: "code", x: 964, y: MAIN_Y },
  { key: "create-zip", label: "Create ZIP file with\nmerged PDF", type: "code", x: 1140, y: MAIN_Y },
  { key: "upload-zip", label: "Upload ZIP to\nGoogle Drive", type: "code", x: 1316, y: MAIN_Y },
  { key: "end-no-pdfs", label: "End execution", sublabel: "Return", type: "end", x: 920, y: 100 },
];

/* ------------------------------------------------------------------ */
/* Connectors                                                          */
/* ------------------------------------------------------------------ */

interface Connector {
  from: string;
  to: string;
  label?: string;
  type: "straight" | "branch-up";
}

const connectors: Connector[] = [
  { from: "execute", to: "look-for-files", type: "straight" },
  { from: "look-for-files", to: "any-images-found", type: "straight" },
  { from: "any-images-found", to: "convert-to-pdf", type: "straight", label: "Yes" },
  { from: "any-images-found", to: "any-pdfs-found", type: "branch-up", label: "No" },
  { from: "convert-to-pdf", to: "any-pdfs-found", type: "straight" },
  { from: "any-pdfs-found", to: "merge-pdfs", type: "straight", label: "Yes" },
  { from: "any-pdfs-found", to: "end-no-pdfs", type: "branch-up", label: "No" },
  { from: "merge-pdfs", to: "create-zip", type: "straight" },
  { from: "create-zip", to: "upload-zip", type: "straight" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function nodeRight(n: FlowNode) {
  if (n.type === "start" || n.type === "end") return { x: n.x + CIRCLE_R, y: n.y };
  if (n.type === "gateway") return { x: n.x + DIAMOND_SIZE + 6, y: n.y };
  return { x: n.x + NODE_SIZE / 2, y: n.y };
}
function nodeLeft(n: FlowNode) {
  if (n.type === "start" || n.type === "end") return { x: n.x - CIRCLE_R, y: n.y };
  if (n.type === "gateway") return { x: n.x - DIAMOND_SIZE - 6, y: n.y };
  return { x: n.x - NODE_SIZE / 2, y: n.y };
}
function nodeTop(n: FlowNode) {
  if (n.type === "gateway") return { x: n.x, y: n.y - DIAMOND_SIZE - 6 };
  if (n.type === "start" || n.type === "end") return { x: n.x, y: n.y - CIRCLE_R };
  return { x: n.x, y: n.y - NODE_SIZE / 2 };
}
function nodeBottom(n: FlowNode) {
  if (n.type === "start" || n.type === "end") return { x: n.x, y: n.y + CIRCLE_R };
  return { x: n.x, y: n.y + NODE_SIZE / 2 };
}

/* ------------------------------------------------------------------ */
/* SVG sub-components                                                  */
/* ------------------------------------------------------------------ */

function SuccessBadge({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={8} fill="white" />
      <circle cx={x} cy={y} r={7} fill="#EEFFE5" stroke={GREEN} strokeWidth="1.5" />
      <path d={`M${x - 3},${y} L${x - 1},${y + 2.5} L${x + 3.5},${y - 2}`} fill="none" stroke={SUCCESS_ICON} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function ErrorBadge({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={8} fill="white" />
      <circle cx={x} cy={y} r={7} fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" />
      <line x1={x} y1={y - 3} x2={x} y2={y + 1} stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      <circle cx={x} cy={y + 3.5} r={1} fill="#DC2626" />
    </g>
  );
}

function CodeIconSvg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 16}, ${y - 16}) scale(1)`}>
      <path d="M12.5329 9.86621L6.40007 16L12.5329 22.1338L10.6667 24L2.66667 16L10.6667 8L12.5329 9.86621ZM29.3337 16L21.3337 24L19.4665 22.1338L25.6003 16L19.4665 9.86621L21.3337 8L29.3337 16Z" fill={TEXT_DIM} />
    </g>
  );
}

function ExecutionIconSvg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 16}, ${y - 16}) scale(1)`}>
      <path d="M18.6667 26.6667L21.72 23.6134L17.88 19.7734L19.7733 17.8801L23.6133 21.7201L26.6667 18.6667V26.6667L18.6667 26.6667ZM13.3333 26.6667H5.33333L5.33333 18.6667L8.38666 21.7201L14.6667 15.4534V5.33342H17.3333V16.5467L10.28 23.6134L13.3333 26.6667Z" fill={TEXT_DIM} />
    </g>
  );
}

function ReturnIconSvg({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 8},${y + 2} L${x + 6},${y + 2} L${x + 6},${y - 6}`} fill="none" stroke={TEXT_DIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${x - 4},${y - 2} L${x - 8},${y + 2} L${x - 4},${y + 6}`} fill="none" stroke={TEXT_DIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function GatewayIconSvg({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 5},${y - 7} L${x},${y} L${x - 5},${y + 7}`} fill="none" stroke={TEXT_DIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${x + 5},${y - 7} L${x},${y} L${x + 5},${y + 7}`} fill="none" stroke={TEXT_DIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function FetchPdfWorkflowDiagram({
  executionPath = [],
  faultedNodes = [],
  selectedNodeKey,
  onNodeClick,
}: FetchPdfWorkflowDiagramProps) {
  const MIN_ZOOM = 0.3;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.15;

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.75);
  const [pan, setPan] = useState({ x: 20, y: -20 });
  const isPanning = useRef(false);
  const panActive = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => clampZoom(prev + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP)));
  }, []);

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
    setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy });
  }, []);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);
  const resetView = () => { setZoom(0.75); setPan({ x: 20, y: -20 }); };

  const executed = new Set(executionPath);
  const faulted = new Set(faultedNodes);
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.key, n]));

  const borderFor = (key: string) => {
    if (selectedNodeKey === key) return SELECTED;
    if (faulted.has(key)) return "#EF4444";
    if (executed.has(key)) return GREEN;
    return BORDER_GRAY;
  };
  const swFor = (key: string) => (selectedNodeKey === key || executed.has(key) || faulted.has(key)) ? 2 : 1.5;

  return (
    <div className="relative select-none h-full" style={{ background: BG }}>
      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1 rounded-lg border bg-white p-1 shadow-sm">
        <button onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))} className="rounded p-1 hover:bg-gray-100"><ZoomIn size={16} /></button>
        <button onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))} className="rounded p-1 hover:bg-gray-100"><ZoomOut size={16} /></button>
        <button onClick={resetView} className="rounded p-1 hover:bg-gray-100"><Maximize size={16} /></button>
      </div>

      <div
        ref={containerRef}
        className="h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width={SVG_W} height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "top left" }}
        >
          <defs>
            <linearGradient id="fpd-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FAFAFB" />
              <stop offset="100%" stopColor="#ECEDEF" />
            </linearGradient>
            <marker id="fpd-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 8 3, 0 6" fill={BORDER_GRAY} />
            </marker>
            <marker id="fpd-arrow-g" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 8 3, 0 6" fill={GREEN} />
            </marker>
          </defs>

          {/* ── Connectors ─────────────────────────────────── */}
          {connectors.map((c) => {
            const f = nodeMap[c.from];
            const t = nodeMap[c.to];
            if (!f || !t) return null;
            const fromFaulted = faulted.has(c.from);
            const ex = !fromFaulted && executed.has(c.from) && executed.has(c.to);
            const stroke = ex ? GREEN : BORDER_GRAY;
            const marker = ex ? "url(#fpd-arrow-g)" : "url(#fpd-arrow)";

            if (c.type === "branch-up") {
              const start = nodeTop(f);
              const endPt = t.type === "end" ? nodeBottom(t) : nodeTop(t);
              const midY = Math.min(start.y, endPt.y) - 50;
              return (
                <g key={`${c.from}-${c.to}`}>
                  <path
                    d={`M ${start.x} ${start.y - 2} L ${start.x} ${midY} L ${endPt.x} ${midY} L ${endPt.x} ${endPt.y + (t.type === "end" ? 4 : -2)}`}
                    fill="none" stroke={stroke} strokeWidth="1.5" markerEnd={marker}
                  />
                  {c.label && (
                    <rect x={start.x + 4} y={start.y - 22} width={22} height={16} rx={2} fill={BG} />
                  )}
                  {c.label && (
                    <text x={start.x + 15} y={start.y - 10} textAnchor="middle" fill={TEXT_DIM} fontSize="12" fontWeight="600" fontFamily="'Noto Sans', sans-serif">{c.label}</text>
                  )}
                </g>
              );
            }

            const s = nodeRight(f);
            const e = nodeLeft(t);
            return (
              <g key={`${c.from}-${c.to}`}>
                <line x1={s.x + 4} y1={s.y} x2={e.x - 4} y2={e.y} stroke={stroke} strokeWidth="1.5" markerEnd={marker} />
                {c.label && (
                  <>
                    <rect x={(s.x + e.x) / 2 - 14} y={s.y - 20} width={28} height={16} rx={2} fill={BG} />
                    <text x={(s.x + e.x) / 2} y={s.y - 8} textAnchor="middle" fill={TEXT_DIM} fontSize="12" fontWeight="600" fontFamily="'Noto Sans', sans-serif">{c.label}</text>
                  </>
                )}
              </g>
            );
          })}

          {/* ── Nodes ──────────────────────────────────────── */}
          {nodes.map((node) => {
            const border = borderFor(node.key);
            const sw = swFor(node.key);
            const ex = executed.has(node.key);

            if (node.type === "start") {
              return (
                <g key={node.key} className="cursor-pointer" onClick={() => onNodeClick?.(node.key)}>
                  <circle cx={node.x} cy={node.y} r={CIRCLE_R} fill="white" stroke={border} strokeWidth={sw} />
                  <circle cx={node.x} cy={node.y} r={30} fill="url(#fpd-grad)" />
                  <polygon points={`${node.x - 6},${node.y - 9} ${node.x - 6},${node.y + 9} ${node.x + 8},${node.y}`} fill={TEXT} />
                  {ex && <SuccessBadge x={node.x + 24} y={node.y - 30} />}
                  <text x={node.x} y={node.y + CIRCLE_R + 20} textAnchor="middle" fill={TEXT} fontSize="14" fontWeight="600" fontFamily="'Noto Sans', sans-serif">{node.label}</text>
                  {node.sublabel && <text x={node.x} y={node.y + CIRCLE_R + 36} textAnchor="middle" fill={TEXT_BODY} fontSize="12" fontFamily="'Noto Sans', sans-serif">{node.sublabel}</text>}
                </g>
              );
            }

            if (node.type === "end") {
              return (
                <g key={node.key} className="cursor-pointer" onClick={() => onNodeClick?.(node.key)}>
                  {/* Stack effect */}
                  <circle cx={node.x} cy={node.y + 3} r={CIRCLE_R} fill="none" stroke={BORDER_GRAY} strokeWidth="1.5" />
                  <circle cx={node.x} cy={node.y} r={CIRCLE_R} fill="none" stroke={BORDER_GRAY} strokeWidth="1.5" />
                  <circle cx={node.x} cy={node.y - 3} r={CIRCLE_R} fill="white" stroke={border} strokeWidth={sw} />
                  <circle cx={node.x} cy={node.y - 3} r={30} fill="url(#fpd-grad)" />
                  <ReturnIconSvg x={node.x} y={node.y - 3} />
                  <text x={node.x} y={node.y + CIRCLE_R + 18} textAnchor="middle" fill={TEXT} fontSize="14" fontWeight="600" fontFamily="'Noto Sans', sans-serif">{node.label}</text>
                  {node.sublabel && <text x={node.x} y={node.y + CIRCLE_R + 34} textAnchor="middle" fill={TEXT_BODY} fontSize="10" fontFamily="'Noto Sans', sans-serif">{node.sublabel}</text>}
                </g>
              );
            }

            if (node.type === "gateway") {
              return (
                <g key={node.key} className="cursor-pointer" onClick={() => onNodeClick?.(node.key)}>
                  <rect
                    x={node.x - DIAMOND_SIZE} y={node.y - DIAMOND_SIZE}
                    width={DIAMOND_SIZE * 2} height={DIAMOND_SIZE * 2}
                    rx={10} fill="white" stroke={border} strokeWidth={sw}
                    transform={`rotate(45, ${node.x}, ${node.y})`}
                  />
                  <rect
                    x={node.x - 24} y={node.y - 24}
                    width={48} height={48}
                    rx={6} fill="url(#fpd-grad)"
                    transform={`rotate(45, ${node.x}, ${node.y})`}
                  />
                  <ExecutionIconSvg x={node.x} y={node.y} />
                  {ex && <SuccessBadge x={node.x + 22} y={node.y - 30} />}
                  <text x={node.x} y={node.y + DIAMOND_SIZE + 28} textAnchor="middle" fill={TEXT} fontSize="14" fontWeight="600" fontFamily="'Noto Sans', sans-serif">{node.label}</text>
                </g>
              );
            }

            // Code task
            const nx = node.x - NODE_SIZE / 2;
            const ny = node.y - NODE_SIZE / 2;
            const lines = node.label.split("\n");
            return (
              <g key={node.key} className="cursor-pointer" onClick={() => onNodeClick?.(node.key)}>
                {/* Stack effect: two offset border rects behind */}
                <rect x={nx} y={ny + 12} width={NODE_SIZE} height={NODE_SIZE - 4} rx={16} fill="none" stroke={BORDER_GRAY} strokeWidth="1.5" />
                <rect x={nx} y={ny + 8} width={NODE_SIZE} height={NODE_SIZE - 4} rx={16} fill="none" stroke={BORDER_GRAY} strokeWidth="1.5" />
                {/* Main card */}
                <rect x={nx} y={ny} width={NODE_SIZE} height={NODE_SIZE} rx={16} fill="white" stroke={border} strokeWidth={sw} />
                {/* Icon container */}
                <rect x={nx + 10} y={ny + 10} width={72} height={72} rx={8} fill="url(#fpd-grad)" />
                <CodeIconSvg x={node.x} y={node.y + 6} />
                {/* Success badge */}
                {faulted.has(node.key) ? <ErrorBadge x={nx + NODE_SIZE - 10} y={ny + 10} /> : ex && <SuccessBadge x={nx + NODE_SIZE - 10} y={ny + 10} />}
                {/* Label */}
                {lines.map((line, i) => (
                  <text
                    key={i} x={node.x} y={ny + NODE_SIZE + 20 + i * 18}
                    textAnchor="middle" fill={TEXT} fontSize="14" fontWeight="600"
                    fontFamily="'Noto Sans', sans-serif"
                  >{line}</text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
