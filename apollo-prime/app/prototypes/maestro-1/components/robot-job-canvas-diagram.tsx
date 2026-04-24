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
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type RobotJobStepType =
  | "trigger"
  | "read-range"
  | "for-each"
  | "assign"
  | "send-email"
  | "log-message"
  | "end";

export interface RobotJobStep {
  id: string;
  label: string;
  type: RobotJobStepType;
  /** If true, this step is inside a loop body */
  loopChild?: boolean;
  /** If true, this step is the loop header (e.g. "For each row in data table") */
  loopHeader?: boolean;
  /** If true, this is the last step inside the loop */
  loopLast?: boolean;
}

interface RobotJobCanvasDiagramProps {
  steps: RobotJobStep[];
  selectedStepId?: string | null;
  onStepClick?: (stepId: string) => void;
}

/* ------------------------------------------------------------------ */
/* Step icon SVGs                                                      */
/* ------------------------------------------------------------------ */

const ICON_SIZE = 14;

function TriggerIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={ICON_SIZE} height={ICON_SIZE} rx={2} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth={0.6} />
      <path d="M8 3L5.5 8h2.5l-1 3.5 3.5-4.5H8l1-4z" fill="#6B7280" strokeLinejoin="round" />
    </g>
  );
}

function ReadRangeIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={ICON_SIZE} height={ICON_SIZE} rx={2} fill="#DCFCE7" stroke="#86EFAC" strokeWidth={0.6} />
      <rect x={3} y={3} width={8} height={8} rx={1} fill="#16A34A" />
      <line x1={5.5} y1={5.5} x2={11} y2={5.5} stroke="white" strokeWidth={0.8} />
      <line x1={5.5} y1={8} x2={11} y2={8} stroke="white" strokeWidth={0.8} />
      <line x1={7} y1={3.5} x2={7} y2={10.5} stroke="white" strokeWidth={0.8} />
    </g>
  );
}

function ForEachIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={ICON_SIZE} height={ICON_SIZE} rx={2} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth={0.6} />
      <path d="M5 5a2.5 2.5 0 0 1 4.5 0M5 9.5a2.5 2.5 0 0 0 4.5 0" fill="none" stroke="#6B7280" strokeWidth={1} strokeLinecap="round" />
    </g>
  );
}

function AssignIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={ICON_SIZE} height={ICON_SIZE} rx={2} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth={0.6} />
      <circle cx={7} cy={7} r={3} fill="none" stroke="#6B7280" strokeWidth={1} />
      <circle cx={7} cy={7} r={1.2} fill="#6B7280" />
    </g>
  );
}

function SendEmailIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={ICON_SIZE} height={ICON_SIZE} rx={2} fill="#DBEAFE" stroke="#93C5FD" strokeWidth={0.6} />
      <rect x={2.5} y={4} width={9} height={6.5} rx={1} fill="none" stroke="#2563EB" strokeWidth={0.9} />
      <polyline points="2.5,4 7,8 11.5,4" fill="none" stroke="#2563EB" strokeWidth={0.9} strokeLinejoin="round" />
    </g>
  );
}

function LogMessageIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={ICON_SIZE} height={ICON_SIZE} rx={2} fill="#EDE9FE" stroke="#C4B5FD" strokeWidth={0.6} />
      <rect x={3} y={2.5} width={8} height={9.5} rx={1} fill="none" stroke="#7C3AED" strokeWidth={0.8} />
      <line x1={5} y1={5} x2={10} y2={5} stroke="#7C3AED" strokeWidth={0.6} />
      <line x1={5} y1={7} x2={10} y2={7} stroke="#7C3AED" strokeWidth={0.6} />
      <line x1={5} y1={9} x2={8} y2={9} stroke="#7C3AED" strokeWidth={0.6} />
    </g>
  );
}

function EndCircle({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={4.5} fill="none" stroke="#93C5FD" strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={2} fill="#3B82F6" />
    </>
  );
}

const iconMap: Record<RobotJobStepType, typeof TriggerIcon> = {
  trigger: TriggerIcon,
  "read-range": ReadRangeIcon,
  "for-each": ForEachIcon,
  assign: AssignIcon,
  "send-email": SendEmailIcon,
  "log-message": LogMessageIcon,
  end: TriggerIcon, // unused, end uses EndCircle
};

/* ------------------------------------------------------------------ */
/* Layout constants                                                    */
/* ------------------------------------------------------------------ */

const LEFT_MARGIN = 28;      // space for line numbers
const LOOP_INDENT = 16;      // extra indent for loop children
const NODE_W = 220;
const NODE_H = 24;
const ROW_GAP = 32;          // vertical distance between step tops
const CANVAS_PAD_X = 12;
const CANVAS_PAD_Y = 10;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function RobotJobCanvasDiagram({
  steps,
  selectedStepId,
  onStepClick,
}: RobotJobCanvasDiagramProps) {
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

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { ...pan };
    },
    [pan]
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    setPan({
      x: panOrigin.current.x + (e.clientX - panStart.current.x),
      y: panOrigin.current.y + (e.clientY - panStart.current.y),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  /* ── Compute positions ──────────────────────────────────────── */

  const visibleSteps = steps.filter((s) => s.type !== "end");
  const totalRows = visibleSteps.length;
  const hasEnd = steps.some((s) => s.type === "end");
  const canvasH = CANVAS_PAD_Y * 2 + totalRows * ROW_GAP + (hasEnd ? 30 : 0);
  const canvasW = CANVAS_PAD_X * 2 + LEFT_MARGIN + LOOP_INDENT + NODE_W + 60;

  /* Loop bracket bounds */
  const loopStartIdx = visibleSteps.findIndex((s) => s.loopChild);
  const loopEndIdx = (() => {
    let last = -1;
    visibleSteps.forEach((s, i) => {
      if (s.loopChild || s.loopLast) last = i;
    });
    return last;
  })();
  const loopHeaderIdx = visibleSteps.findIndex((s) => s.loopHeader);

  return (
    <div className="relative select-none">
      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1 rounded-lg border bg-white p-1 shadow-sm">
        <button
          onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
          className="rounded p-1 hover:bg-gray-100"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
          className="rounded p-1 hover:bg-gray-100"
        >
          <ZoomOut size={16} />
        </button>
        <button onClick={resetView} className="rounded p-1 hover:bg-gray-100">
          <Maximize size={16} />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="h-full min-h-[280px] overflow-hidden rounded-lg bg-white cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {visibleSteps.map((step, idx) => {
            const isLoopChild = step.loopChild || step.loopLast;
            const nodeX = CANVAS_PAD_X + LEFT_MARGIN + (isLoopChild ? LOOP_INDENT : 0);
            const nodeY = CANVAS_PAD_Y + idx * ROW_GAP;
            const isSelected = selectedStepId === step.id;
            const lineNum = idx + 1;

            const Icon = iconMap[step.type];

            return (
              <g key={step.id}>
                {/* Row highlight for selected step */}
                {isSelected && (
                  <rect
                    x={0}
                    y={nodeY - 4}
                    width={canvasW}
                    height={NODE_H + 8}
                    fill="#EFF6FF"
                  />
                )}

                {/* Line number */}
                <text
                  x={CANVAS_PAD_X + 8}
                  y={nodeY + NODE_H / 2 + 3}
                  textAnchor="middle"
                  className="text-[9px]"
                  fill="#9CA3AF"
                >
                  {lineNum}
                </text>

                {/* Arrow from previous step */}
                {idx > 0 && (
                  <g>
                    <line
                      x1={nodeX + NODE_W / 2}
                      y1={nodeY - ROW_GAP + NODE_H + 1}
                      x2={nodeX + NODE_W / 2}
                      y2={nodeY - 1}
                      stroke="#D1D5DB"
                      strokeWidth={1}
                    />
                    <polygon
                      points={`${nodeX + NODE_W / 2 - 2.5},${nodeY - 5} ${nodeX + NODE_W / 2},${nodeY - 1} ${nodeX + NODE_W / 2 + 2.5},${nodeY - 5}`}
                      fill="#D1D5DB"
                    />
                  </g>
                )}

                {/* Step node */}
                <g
                  onClick={() => onStepClick?.(step.id)}
                  className="cursor-pointer"
                >
                  <rect
                    x={nodeX}
                    y={nodeY}
                    width={NODE_W}
                    height={NODE_H}
                    rx={4}
                    fill="white"
                    stroke={isSelected ? "#3B82F6" : "#E5E7EB"}
                    strokeWidth={isSelected ? 1.5 : 0.8}
                  />

                  {/* Step icon */}
                  <Icon x={nodeX + 5} y={nodeY + (NODE_H - ICON_SIZE) / 2} />

                  {/* Step label */}
                  <text
                    x={nodeX + 23}
                    y={nodeY + NODE_H / 2 + 3}
                    className="text-[10px]"
                    fill="#1F2937"
                  >
                    {step.label}
                  </text>

                  {/* Play + menu icons for selected step */}
                  {isSelected && (
                    <g>
                      <polygon
                        points={`${nodeX + NODE_W + 8},${nodeY + NODE_H / 2 - 4} ${nodeX + NODE_W + 8},${nodeY + NODE_H / 2 + 4} ${nodeX + NODE_W + 15},${nodeY + NODE_H / 2}`}
                        fill="#6B7280"
                      />
                      <g transform={`translate(${nodeX + NODE_W + 22}, ${nodeY + NODE_H / 2 - 5})`}>
                        <circle cx={1.5} cy={1.5} r={1.2} fill="#6B7280" />
                        <circle cx={1.5} cy={5} r={1.2} fill="#6B7280" />
                        <circle cx={1.5} cy={8.5} r={1.2} fill="#6B7280" />
                      </g>
                    </g>
                  )}
                </g>
              </g>
            );
          })}

          {/* Loop bracket */}
          {loopStartIdx >= 0 && loopEndIdx >= 0 && (
            <g>
              {(() => {
                const bracketX = CANVAS_PAD_X + LEFT_MARGIN + 2;
                const topY = CANVAS_PAD_Y + loopStartIdx * ROW_GAP + NODE_H / 2;
                const bottomY = CANVAS_PAD_Y + loopEndIdx * ROW_GAP + NODE_H / 2;
                const headerBottomY = loopHeaderIdx >= 0
                  ? CANVAS_PAD_Y + loopHeaderIdx * ROW_GAP + NODE_H
                  : topY - 10;

                return (
                  <>
                    {/* Vertical line */}
                    <line
                      x1={bracketX}
                      y1={headerBottomY + 6}
                      x2={bracketX}
                      y2={bottomY + 4}
                      stroke="#D1D5DB"
                      strokeWidth={1}
                      strokeDasharray="3 2"
                    />
                    {/* Top tick */}
                    <line
                      x1={bracketX}
                      y1={headerBottomY + 6}
                      x2={bracketX + 10}
                      y2={headerBottomY + 6}
                      stroke="#D1D5DB"
                      strokeWidth={1}
                    />
                    {/* Bottom tick */}
                    <line
                      x1={bracketX}
                      y1={bottomY + 4}
                      x2={bracketX + 10}
                      y2={bottomY + 4}
                      stroke="#D1D5DB"
                      strokeWidth={1}
                    />
                    {/* "Loop" label */}
                    <text
                      x={bracketX + 10}
                      y={headerBottomY + 9}
                      className="text-[8px]"
                      fill="#9CA3AF"
                    >
                      Loop
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {/* End circle */}
          {hasEnd && (
            <g>
              {(() => {
                const lastStepIdx = visibleSteps.length - 1;
                const lastIsLoopChild = visibleSteps[lastStepIdx]?.loopChild || visibleSteps[lastStepIdx]?.loopLast;
                const lastNodeX = CANVAS_PAD_X + LEFT_MARGIN + (lastIsLoopChild ? LOOP_INDENT : 0);
                const lastNodeY = CANVAS_PAD_Y + lastStepIdx * ROW_GAP;
                const endCx = lastNodeX + NODE_W / 2;
                const endCy = lastNodeY + NODE_H + 18;

                return (
                  <>
                    <line
                      x1={endCx}
                      y1={lastNodeY + NODE_H + 1}
                      x2={endCx}
                      y2={endCy - 7}
                      stroke="#D1D5DB"
                      strokeWidth={1.2}
                    />
                    <EndCircle cx={endCx} cy={endCy} />
                  </>
                );
              })()}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
