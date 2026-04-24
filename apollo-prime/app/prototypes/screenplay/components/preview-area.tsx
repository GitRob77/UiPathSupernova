"use client";

import { Switch } from "@uipath/apollo-wind/components/ui/switch";
import { Label } from "@uipath/apollo-wind/components/ui/label";
import { Clock, Cpu, Monitor } from "lucide-react";
import type { Step } from "../data/types";

export function PreviewArea({
  step,
  previewMode,
  onPreviewModeChange,
  highlightsOn,
  onHighlightsChange,
}: {
  step: Step;
  previewMode: string;
  onPreviewModeChange: (mode: string) => void;
  highlightsOn: boolean;
  onHighlightsChange: (on: boolean) => void;
}) {
  return (
    <div className="flex flex-1 flex-col p-3 mb-[40px]" style={{ minHeight: 0 }}>
      {/* Controls row */}
      <div className="mb-2 flex shrink-0 items-center gap-1">
        {["Original", "Simulated"].map((m) => (
          <button
            key={m}
            onClick={() => onPreviewModeChange(m.toLowerCase())}
            className={`cursor-pointer rounded-md border-none px-3.5 py-1 text-xs font-medium ${
              previewMode === m.toLowerCase()
                ? "bg-primary text-white"
                : "bg-transparent text-muted-foreground"
            }`}
          >
            {m}
          </button>
        ))}

        <span className="mx-1.5 h-4 w-px bg-(--border-subtle)" />

        <div className="flex items-center gap-1.5">
          <Switch
            id="highlights"
            checked={highlightsOn}
            onCheckedChange={onHighlightsChange}
            className="scale-75"
          />
          <Label
            htmlFor="highlights"
            className={`cursor-pointer text-xs ${
              highlightsOn
                ? "font-medium text-primary"
                : "font-normal text-muted-foreground"
            }`}
          >
            Highlights
          </Label>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-[11px] w-[11px]" /> {step.time}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Cpu className="h-[11px] w-[11px]" /> {step.tokensIn} in /{" "}
            {step.tokensOut} out
          </span>
          <span className="text-[11px] text-muted-foreground">{step.cost}</span>
        </div>
      </div>

      {/* Screen placeholder */}
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/50">
        <Monitor className="h-9 w-9 text-blue-300" strokeWidth={1.2} />
        <span className="mt-2.5 text-[13px] font-medium text-blue-400">
          Screenshot placeholder
        </span>
        <span className="mt-0.5 text-[11px] text-blue-300">
          Step {step.id} screen capture will appear here
        </span>
      </div>
    </div>
  );
}
