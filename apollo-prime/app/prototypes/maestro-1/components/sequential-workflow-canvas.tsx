"use client";

import { useState } from "react";
import type { RobotJobStep } from "./robot-job-canvas-diagram";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface SequentialWorkflowCanvasProps {
  steps: RobotJobStep[];
  selectedStepId?: string | null;
  onStepClick?: (stepId: string) => void;
  onStepDoubleClick?: (stepId: string) => void;
}

/* ------------------------------------------------------------------ */
/* Step type icons                                                     */
/* ------------------------------------------------------------------ */

function TriggerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect width="20" height="20" rx="4" fill="url(#ig1)" />
      <path d="M10.5 4L7 11h3l-.5 5L13 9h-3l.5-5z" fill="#526069" />
      <defs>
        <linearGradient id="ig1" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAFAFB" />
          <stop offset="1" stopColor="#ECEDEF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ReadRangeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect width="20" height="20" rx="4" fill="#E2EFDA" />
      <rect x="3" y="3" width="14" height="14" rx="2" fill="#217346" />
      <text x="10" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="sans-serif">X</text>
    </svg>
  );
}

function ForEachIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect width="20" height="20" rx="4" fill="url(#ig2)" />
      <path d="M7 7a3 3 0 0 1 6 0" fill="none" stroke="#526069" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M7 13a3 3 0 0 0 6 0" fill="none" stroke="#526069" strokeWidth="1.2" strokeLinecap="round" />
      <defs>
        <linearGradient id="ig2" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAFAFB" />
          <stop offset="1" stopColor="#ECEDEF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AssignIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect width="20" height="20" rx="4" fill="url(#ig3)" />
      <circle cx="10" cy="10" r="4" fill="none" stroke="#526069" strokeWidth="1.2" />
      <circle cx="10" cy="10" r="1.5" fill="#526069" />
      <defs>
        <linearGradient id="ig3" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAFAFB" />
          <stop offset="1" stopColor="#ECEDEF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SendEmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect width="20" height="20" rx="4" fill="#DBEAFE" />
      <rect x="3" y="5.5" width="14" height="9" rx="1.5" fill="none" stroke="#1665B3" strokeWidth="1.1" />
      <polyline points="3,5.5 10,11 17,5.5" fill="none" stroke="#1665B3" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function LogMessageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect width="20" height="20" rx="4" fill="#EDE9FE" />
      <rect x="4" y="3" width="12" height="14" rx="2" fill="none" stroke="#7C3AED" strokeWidth="1.1" />
      <line x1="7" y1="7" x2="13" y2="7" stroke="#7C3AED" strokeWidth="0.9" />
      <line x1="7" y1="10" x2="13" y2="10" stroke="#7C3AED" strokeWidth="0.9" />
      <line x1="7" y1="13" x2="11" y2="13" stroke="#7C3AED" strokeWidth="0.9" />
    </svg>
  );
}

const stepIconMap: Record<string, React.FC> = {
  trigger: TriggerIcon,
  "read-range": ReadRangeIcon,
  "for-each": ForEachIcon,
  assign: AssignIcon,
  "send-email": SendEmailIcon,
  "log-message": LogMessageIcon,
  end: TriggerIcon,
};

/* ------------------------------------------------------------------ */
/* Layout constants                                                    */
/* ------------------------------------------------------------------ */

const ROW_H = 64; // each row is 64px tall (matches Figma)
const CARD_H = 32;
const CARD_W = 310;
const LINE_NUM_W = 48;
const LOOP_INDENT = 64;
const BRACKET_X = LINE_NUM_W + 16; // where the bracket vertical line sits

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function SequentialWorkflowCanvas({
  steps,
  selectedStepId,
  onStepClick,
  onStepDoubleClick,
}: SequentialWorkflowCanvasProps) {

  /* ── Derived data ─────────────────────────────────────────────── */

  const visibleSteps = steps.filter((s) => s.type !== "end");
  const hasEnd = steps.some((s) => s.type === "end");

  const loopHeaderIdx = visibleSteps.findIndex((s) => s.loopHeader);
  const loopStartIdx = visibleSteps.findIndex((s) => s.loopChild);
  const loopEndIdx = (() => {
    let last = -1;
    visibleSteps.forEach((s, i) => {
      if (s.loopChild || s.loopLast) last = i;
    });
    return last;
  })();

  const totalH = visibleSteps.length * ROW_H + (hasEnd ? 40 : 0) + 16;
  const totalW = LINE_NUM_W + LOOP_INDENT + CARD_W + 80;

  /* ── Loop bracket geometry (matches Figma composite 10885:265262) ── */

  const loopBracket = loopStartIdx >= 0 && loopEndIdx >= 0 ? (() => {
    const headerIdx = loopHeaderIdx >= 0 ? loopHeaderIdx : loopStartIdx - 1;
    // Entry Y: midpoint between header card bottom and first loop child card top
    const headerCardBottom = headerIdx * ROW_H + ROW_H / 2 + CARD_H / 2;
    const firstChildCardTop = loopStartIdx * ROW_H + ROW_H / 2 - CARD_H / 2;
    const entryY = (headerCardBottom + firstChildCardTop) / 2;
    // Exit Y: midpoint between last loop child card bottom and next card top
    const lastChildCardBottom = loopEndIdx * ROW_H + ROW_H / 2 + CARD_H / 2;
    const nextCardTop = (loopEndIdx + 1) * ROW_H + ROW_H / 2 - CARD_H / 2;
    const exitY = (lastChildCardBottom + nextCardTop) / 2;
    // Bracket X: vertical line 16px into the bracket zone (32px wide back-up column)
    const vx = LINE_NUM_W + 14;
    // Horizontal line end: where the entry/exit lines meet the card indent
    const hEnd = LINE_NUM_W + LOOP_INDENT - 4;
    return { entryY, exitY, vx, hEnd };
  })() : null;

  return (
    <div className="relative select-none h-full">
      {/* Canvas area */}
      <div className="h-full overflow-auto">
        <div
          className="relative"
          style={{
            width: `${totalW}px`,
            height: `${totalH}px`,
          }}
        >
          {/* ── Loop bracket SVG overlay (Figma 10885:265262) ──── */}
          {loopBracket && (() => {
            const { entryY, exitY, vx, hEnd } = loopBracket;
            const r = 8;  // corner radius
            const a = 4;  // chevron arrow size
            const S = "#A4B1B8"; // stroke color (colorBorder)
            const T = "#526069"; // text color (colorForegroundDemphasized)

            return (
              <svg
                className="absolute inset-0 pointer-events-none"
                width={totalW}
                height={totalH}
              >
                {/* ── Back-up vertical line (NWorkflowLinkBackUp) ──── */}
                {/* Runs full height from entry top to exit bottom */}
                <line
                  x1={vx} y1={entryY - 12}
                  x2={vx} y2={exitY + 12}
                  stroke={S} strokeWidth="1.2"
                />

                {/* ── Entry (NWorkflowLinkSEnter) ──────────────────── */}
                {/* L-shape: vertical down → rounded corner → horizontal right */}
                <path
                  d={`M ${vx} ${entryY - 12}
                      V ${entryY - r}
                      Q ${vx} ${entryY} ${vx + r} ${entryY}
                      H ${hEnd}`}
                  fill="none" stroke={S} strokeWidth="1.2"
                />
                {/* "Loop" label inline on the horizontal */}
                <text
                  x={vx + r + 3} y={entryY - 4}
                  fill={T} fontSize="11" fontWeight="600"
                  fontFamily="'Noto Sans', sans-serif"
                >
                  Loop
                </text>
                {/* Right-pointing chevron ▸ */}
                <path
                  d={`M ${hEnd - a} ${entryY - a} L ${hEnd + 1} ${entryY} L ${hEnd - a} ${entryY + a}`}
                  fill="none" stroke={S} strokeWidth="1.2"
                  strokeLinecap="round" strokeLinejoin="round"
                />

                {/* ── Exit (NWorkflowLinkSExit + BackUp bottom) ──── */}
                {/* "Loop" label above the exit line */}
                <text
                  x={vx + r + 3} y={exitY - 4}
                  fill={T} fontSize="11" fontWeight="600"
                  fontFamily="'Noto Sans', sans-serif"
                >
                  Loop
                </text>
                {/* Horizontal exit going right from bracket to cards */}
                <path
                  d={`M ${vx + r} ${exitY}
                      H ${hEnd}`}
                  fill="none" stroke={S} strokeWidth="1.2"
                />
                {/* Corner connecting vertical line to horizontal exit */}
                <path
                  d={`M ${vx} ${exitY - r}
                      Q ${vx} ${exitY} ${vx + r} ${exitY}`}
                  fill="none" stroke={S} strokeWidth="1.2"
                />
                {/* Back-up bottom: vertical continues down past exit, curves left */}
                <path
                  d={`M ${vx} ${exitY + r}
                      Q ${vx} ${exitY + 12} ${vx - r} ${exitY + 12}
                      H ${vx - 14}`}
                  fill="none" stroke={S} strokeWidth="1.2"
                />
                {/* Down-left arrow ↙ at the back-up bottom */}
                <path
                  d={`M ${vx - 10} ${exitY + 12 - a} L ${vx - 15} ${exitY + 12} L ${vx - 10} ${exitY + 12 + a}`}
                  fill="none" stroke={S} strokeWidth="1.2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            );
          })()}

          {/* ── Step rows ──────────────────────────────────────── */}
          {visibleSteps.map((step, idx) => {
            const isLoopChild = step.loopChild || step.loopLast;
            const isSelected = selectedStepId === step.id;
            const lineNum = idx + 1;
            const Icon = stepIconMap[step.type] ?? AssignIcon;
            const rowTop = idx * ROW_H;
            const cardLeft = LINE_NUM_W + (isLoopChild ? LOOP_INDENT : 0);

            return (
              <div
                key={step.id}
                className="absolute flex items-center"
                style={{
                  top: `${rowTop}px`,
                  left: 0,
                  height: `${ROW_H}px`,
                  width: `${totalW}px`,
                }}
              >
                {/* Line number */}
                <div
                  className="shrink-0 flex items-center justify-end pr-3"
                  style={{ width: `${LINE_NUM_W}px` }}
                >
                  <span className="font-mono text-[13px] leading-5 text-[#8A97A0]">
                    {lineNum}
                  </span>
                </div>

                {/* Trigger lightning bolt indicator */}
                {step.type === "trigger" && (
                  <div className="absolute flex items-center justify-center" style={{ left: `${cardLeft - 16}px` }}>
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                      <path d="M7 0L2 7h4L5 14l6-8H7l1-6z" fill="#0067DF" />
                    </svg>
                  </div>
                )}

                {/* Connector arrow from previous row */}
                {idx > 0 && (
                  <svg
                    className="absolute pointer-events-none"
                    style={{ left: `${cardLeft + CARD_W / 2 - 10}px`, top: "-16px" }}
                    width="20"
                    height="16"
                    viewBox="0 0 20 16"
                  >
                    <line x1="10" y1="0" x2="10" y2="12" stroke="#CFD8DD" strokeWidth="1.2" />
                    <polygon points="7,10 10,15 13,10" fill="#CFD8DD" />
                  </svg>
                )}

                {/* Step card */}
                <div
                  className={`
                    absolute flex items-center gap-2.5 px-1.5 rounded-lg border-2 bg-white
                    cursor-pointer transition-colors
                    ${isSelected ? "border-[#0067DF] shadow-[0_0_0_2px_rgba(0,103,223,0.15)]" : "border-[#CFD8DD] hover:border-[#A4B1B8]"}
                  `}
                  style={{
                    left: `${cardLeft}px`,
                    width: `${CARD_W}px`,
                    height: `${CARD_H}px`,
                  }}
                  onClick={() => onStepClick?.(step.id)}
                  onDoubleClick={() => onStepDoubleClick?.(step.id)}
                >
                  <Icon />
                  <span className="text-[13px] font-semibold text-[#182027] leading-5 truncate flex-1">
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* End dot */}
          {hasEnd && (
            <div
              className="absolute flex flex-col items-center"
              style={{
                top: `${visibleSteps.length * ROW_H}px`,
                left: `${LINE_NUM_W + CARD_W / 2 - 4}px`,
              }}
            >
              <div className="w-px h-3 bg-[#CFD8DD]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#526069]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
