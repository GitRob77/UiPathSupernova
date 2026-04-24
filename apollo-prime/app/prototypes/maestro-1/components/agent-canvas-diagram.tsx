"use client";

import { useRef, useState, useCallback, type MouseEvent, type WheelEvent } from "react";
import { ZoomIn, ZoomOut, Maximize, Plus, User, FileText, Cog, Mail } from "lucide-react";
import type { AgentCanvasNode } from "../mock-data/instance-5797111";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const SVG_W = 1000;
const SVG_H = 500;

// Agent header node
const HEADER_W = 288;
const HEADER_H = 96;
const HEADER_X = (SVG_W - HEADER_W) / 2;
const HEADER_Y = 40;

// Child node
const CHILD_SIZE = 96;
const ICON_SIZE = 72;
const ICON_R = 8;

// Colors
const BORDER = "#CFD8DD";
const BORDER_EXECUTED = "#22C55E";
const BORDER_CANCELLED = "#9CA3AF";
const BORDER_FAULTED = "#EF4444";
const TEXT = "#182027";
const TEXT_DIM = "#526069";
const TEXT_MUTED = "#8A97A0";
const BG_PILL = "#F4F5F7";
const GRAD_START = "rgb(255, 224, 255)";
const GRAD_END = "rgb(207, 217, 255)";

/* ------------------------------------------------------------------ */
/* Icon components                                                     */
/* ------------------------------------------------------------------ */

function AgentIcon({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size * 0.5;
  const cx = x + size / 2;
  const cy = y + size / 2;
  return (
    <g>
      {/* Simplified agent icon (robot head shape) */}
      <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s * 0.7} rx={4} fill="none" stroke={TEXT_DIM} strokeWidth="2" />
      <circle cx={cx - s * 0.15} cy={cy - s * 0.1} r={2.5} fill={TEXT_DIM} />
      <circle cx={cx + s * 0.15} cy={cy - s * 0.1} r={2.5} fill={TEXT_DIM} />
      <line x1={cx - s * 0.15} y1={cy + s * 0.12} x2={cx + s * 0.15} y2={cy + s * 0.12} stroke={TEXT_DIM} strokeWidth="1.5" strokeLinecap="round" />
      {/* Antenna */}
      <line x1={cx} y1={cy - s / 2} x2={cx} y2={cy - s / 2 - 5} stroke={TEXT_DIM} strokeWidth="1.5" />
      <circle cx={cx} cy={cy - s / 2 - 7} r={2.5} fill={TEXT_DIM} />
    </g>
  );
}

function NodeIcon({ type, x, y, size }: { type?: string; x: number; y: number; size: number }) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const s = size * 0.4;

  switch (type) {
    case "user":
      return (
        <g>
          <circle cx={cx} cy={cy - s * 0.25} r={s * 0.35} fill="none" stroke={TEXT_DIM} strokeWidth="2" />
          <path d={`M${cx - s * 0.55},${cy + s * 0.55} Q${cx - s * 0.55},${cy + s * 0.05} ${cx},${cy + s * 0.05} Q${cx + s * 0.55},${cy + s * 0.05} ${cx + s * 0.55},${cy + s * 0.55}`} fill="none" stroke={TEXT_DIM} strokeWidth="2" />
        </g>
      );
    case "document":
      return (
        <g>
          <rect x={cx - s * 0.4} y={cy - s * 0.5} width={s * 0.8} height={s} rx={2} fill="none" stroke={TEXT_DIM} strokeWidth="2" />
          <line x1={cx - s * 0.2} y1={cy - s * 0.2} x2={cx + s * 0.2} y2={cy - s * 0.2} stroke={TEXT_DIM} strokeWidth="1.5" />
          <line x1={cx - s * 0.2} y1={cy + s * 0.05} x2={cx + s * 0.2} y2={cy + s * 0.05} stroke={TEXT_DIM} strokeWidth="1.5" />
          <line x1={cx - s * 0.2} y1={cy + s * 0.3} x2={cx + s * 0.05} y2={cy + s * 0.3} stroke={TEXT_DIM} strokeWidth="1.5" />
        </g>
      );
    case "workflow":
      return (
        <g>
          <rect x={cx - s * 0.45} y={cy - s * 0.45} width={s * 0.9} height={s * 0.9} rx={3} fill="none" stroke={TEXT_DIM} strokeWidth="2" />
          <circle cx={cx - s * 0.15} cy={cy - s * 0.1} r={s * 0.12} fill={TEXT_DIM} />
          <rect x={cx + s * 0.05} y={cy - s * 0.2} width={s * 0.2} height={s * 0.2} rx={1} fill={TEXT_DIM} />
          <line x1={cx - s * 0.3} y1={cy + s * 0.2} x2={cx + s * 0.3} y2={cy + s * 0.2} stroke={TEXT_DIM} strokeWidth="1.5" />
        </g>
      );
    case "email":
      return (
        <g>
          <rect x={cx - s * 0.5} y={cy - s * 0.3} width={s} height={s * 0.65} rx={2} fill="none" stroke="#0078D4" strokeWidth="2" />
          <polyline points={`${cx - s * 0.5},${cy - s * 0.3} ${cx},${cy + s * 0.05} ${cx + s * 0.5},${cy - s * 0.3}`} fill="none" stroke="#0078D4" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      );
    default:
      return <circle cx={cx} cy={cy} r={s * 0.4} fill={TEXT_DIM} />;
  }
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface AgentCanvasDiagramProps {
  agentName: string;
  status: "completed" | "cancelled" | "faulted" | "running";
  nodes: AgentCanvasNode[];
  selectedNodeId?: string | null;
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function AgentCanvasDiagram({
  agentName,
  status,
  nodes,
  selectedNodeId,
  onNodeClick,
  onNodeDoubleClick,
}: AgentCanvasDiagramProps) {
  const MIN_ZOOM = 0.4;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.15;

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.9);
  const [pan, setPan] = useState({ x: 0, y: -10 });
  const isPanning = useRef(false);
  const panActive = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((prev) => clampZoom(prev + delta));
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0) return;
      isPanning.current = true;
      panActive.current = false;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { ...pan };
    },
    [pan]
  );

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

  const resetView = () => {
    setZoom(0.9);
    setPan({ x: 0, y: -10 });
  };

  /* ── Layout ─────────────────────────────────────────────────── */

  const headerCx = HEADER_X + HEADER_W / 2;

  // Edge anchor positions below the header
  const edgeAnchors = [
    { cat: "escalations", x: headerCx - 130, label: "Escalations" },
    { cat: "context", x: headerCx, label: "Context" },
    { cat: "tools", x: headerCx + 130, label: "Tools" },
  ];

  const edgeLabelY = HEADER_Y + HEADER_H + 18;
  const plusBtnY = HEADER_Y + HEADER_H + 50;
  const childRowY = HEADER_Y + HEADER_H + 150;

  // Lay out ALL child nodes in a single evenly-spaced row
  const childSpacing = 180;
  const totalChildW = (nodes.length - 1) * childSpacing;
  const childStartX = headerCx - totalChildW / 2;

  const anchorForCat = (cat?: string) => {
    const a = edgeAnchors.find((e) => e.cat === (cat || "tools"));
    return a ? a.x : headerCx;
  };

  const childPositions = nodes.map((node, i) => ({
    node,
    cx: childStartX + i * childSpacing,
    cy: childRowY,
    anchorX: anchorForCat(node.category),
  }));

  const borderColor = (nodeStatus: string) => {
    if (nodeStatus === "completed") return BORDER_EXECUTED;
    if (nodeStatus === "cancelled") return BORDER_CANCELLED;
    if (nodeStatus === "faulted") return BORDER_FAULTED;
    return BORDER;
  };

  return (
    <div className="relative select-none h-full">
      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1 rounded-lg border bg-white p-1 shadow-sm">
        <button onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))} className="rounded p-1 hover:bg-gray-100">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))} className="rounded p-1 hover:bg-gray-100">
          <ZoomOut size={16} />
        </button>
        <button onClick={resetView} className="rounded p-1 hover:bg-gray-100">
          <Maximize size={16} />
        </button>
      </div>

      {/* Canvas */}
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
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <defs>
            <linearGradient id="agent-icon-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="5%" stopColor={GRAD_START} />
              <stop offset="97%" stopColor={GRAD_END} />
            </linearGradient>
          </defs>

          {/* ── Dashed connector paths from plus buttons to child nodes ── */}
          {childPositions.map(({ node, cx, cy, anchorX }) => {
            const plusY = plusBtnY + 16;
            const childTop = cy - CHILD_SIZE / 2;
            return (
              <path
                key={`conn-${node.id}`}
                d={`M ${anchorX} ${plusY} C ${anchorX} ${plusY + 40}, ${cx} ${childTop - 40}, ${cx} ${childTop}`}
                fill="none"
                stroke={BORDER}
                strokeWidth="1.2"
                strokeDasharray="6 4"
              />
            );
          })}

          {/* ── Header node ────────────────────────────────────── */}
          <rect
            x={HEADER_X}
            y={HEADER_Y}
            width={HEADER_W}
            height={HEADER_H}
            rx={16}
            fill="white"
            stroke={status === "completed" ? BORDER_EXECUTED : status === "cancelled" ? BORDER_CANCELLED : BORDER}
            strokeWidth={2}
          />
          {/* Icon container */}
          <rect
            x={HEADER_X + 10}
            y={HEADER_Y + 10}
            width={ICON_SIZE}
            height={ICON_SIZE}
            rx={ICON_R}
            fill="url(#agent-icon-grad)"
          />
          <AgentIcon x={HEADER_X + 10} y={HEADER_Y + 10} size={ICON_SIZE} />
          {/* Title */}
          <text
            x={HEADER_X + 94}
            y={HEADER_Y + 43}
            fill={TEXT}
            fontSize="13"
            fontWeight="600"
            fontFamily="'Noto Sans', sans-serif"
          >
            {agentName}
          </text>
          <text
            x={HEADER_X + 94}
            y={HEADER_Y + 60}
            fill={TEXT_DIM}
            fontSize="12"
            fontFamily="'Noto Sans', sans-serif"
          >
            Agent
          </text>

          {/* ── Vertical lines from header + edge labels + plus buttons ── */}
          {edgeAnchors.map(({ cat, x, label }) => (
            <g key={cat}>
              {/* Vertical line */}
              <line
                x1={x} y1={HEADER_Y + HEADER_H}
                x2={x} y2={plusBtnY}
                stroke={BORDER}
                strokeWidth="1.2"
              />
              {/* Edge label pill */}
              <rect
                x={x - 36}
                y={edgeLabelY - 8}
                width={72}
                height={18}
                rx={2}
                fill={BG_PILL}
              />
              <text
                x={x}
                y={edgeLabelY + 5}
                textAnchor="middle"
                fill={TEXT_DIM}
                fontSize="12"
                fontWeight="600"
                fontFamily="'Noto Sans', sans-serif"
              >
                {label}
              </text>
              {/* Plus button */}
              <circle cx={x} cy={plusBtnY + 16} r={16} fill="white" stroke={BORDER} strokeWidth="1.5" />
              <line x1={x - 6} y1={plusBtnY + 16} x2={x + 6} y2={plusBtnY + 16} stroke={TEXT_DIM} strokeWidth="1.5" strokeLinecap="round" />
              <line x1={x} y1={plusBtnY + 10} x2={x} y2={plusBtnY + 22} stroke={TEXT_DIM} strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}

          {/* ── Child nodes ────────────────────────────────────── */}
          {childPositions.map(({ node, cx, cy }) => {
            const nx = cx - CHILD_SIZE / 2;
            const ny = cy - CHILD_SIZE / 2;
            const isCancelled = node.status === "cancelled";
            const isSelected = selectedNodeId === node.id;
            const border = isSelected ? "#0067DF" : borderColor(node.status);
            const opacity = isCancelled && !isSelected ? 0.6 : 1;

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => onNodeClick?.(node.id)}
                onDoubleClick={() => onNodeDoubleClick?.(node.id)}
                opacity={opacity}
              >
                {/* Selection ring */}
                {isSelected && (
                  <rect
                    x={nx - 4} y={ny - 4}
                    width={CHILD_SIZE + 8} height={CHILD_SIZE + 8}
                    rx={20}
                    fill="none"
                    stroke="#0067DF"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                )}
                {/* Glow for completed */}
                {node.status === "completed" && !isSelected && (
                  <rect
                    x={nx - 4} y={ny - 4}
                    width={CHILD_SIZE + 8} height={CHILD_SIZE + 8}
                    rx={20}
                    fill="none"
                    stroke={BORDER_EXECUTED}
                    strokeWidth="1"
                    opacity="0.3"
                  />
                )}
                {/* Card */}
                <rect
                  x={nx} y={ny}
                  width={CHILD_SIZE} height={CHILD_SIZE}
                  rx={16}
                  fill="white"
                  stroke={border}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
                {/* Icon container */}
                <rect
                  x={nx + 10} y={ny + 10}
                  width={ICON_SIZE} height={ICON_SIZE}
                  rx={ICON_R}
                  fill="url(#agent-icon-grad)"
                />
                <NodeIcon type={node.icon} x={nx + 10} y={ny + 10} size={ICON_SIZE} />

                {/* Title pill below node */}
                <rect
                  x={cx - 80} y={ny + CHILD_SIZE + 8}
                  width={160} height={18}
                  rx={4}
                  fill={BG_PILL}
                />
                <text
                  x={cx}
                  y={ny + CHILD_SIZE + 21}
                  textAnchor="middle"
                  fill={TEXT}
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="'Noto Sans', sans-serif"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
