import { Button } from "@uipath/apollo-wind/components/ui/button";
import { Play } from "lucide-react";
import type { Step } from "../data/types";

export function ContextBar({ step }: { step: Step }) {
  return (
    <div className="shrink-0 px-3 pt-3">
    <div className="rounded-lg bg-neutral-100 px-4 py-2.5">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[13px] font-semibold text-foreground">
          Step {step.id}: {step.label}
        </span>
      </div>

      <div className="flex items-end gap-3">
        <p
          className="m-0 flex-1 text-xs leading-normal text-neutral-600"
          style={{
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {step.observation}
        </p>
        <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 px-2.5 text-xs">
          <Play className="h-[11px] w-[11px]" /> Rerun step
        </Button>
      </div>
    </div>
    </div>
  );
}
