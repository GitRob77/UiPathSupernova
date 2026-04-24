"use client";

import { cn } from "@uipath/apollo-wind";
import {
  Bot,
  Workflow,
  AppWindow,
  Cog,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CanvasType =
  | "agent"
  | "api-workflow"
  | "app"
  | "rpa-workflow"
  | "agentic-process";

interface CanvasGridProps {
  type: CanvasType;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Config per canvas type                                             */
/* ------------------------------------------------------------------ */

interface CanvasTypeConfig {
  icon: LucideIcon;
  label: string;
  dotColor: string;
  iconColor: string;
}

const CANVAS_CONFIG: Record<CanvasType, CanvasTypeConfig> = {
  agent: {
    icon: Bot,
    label: "Agent",
    dotColor: "var(--canvas-dot-color)",
    iconColor: "text-(--canvas-agent-accent)",
  },
  "api-workflow": {
    icon: Workflow,
    label: "API Workflow",
    dotColor: "var(--canvas-dot-color)",
    iconColor: "text-(--canvas-api-workflow-accent)",
  },
  app: {
    icon: AppWindow,
    label: "App",
    dotColor: "var(--canvas-dot-color)",
    iconColor: "text-(--canvas-app-accent)",
  },
  "rpa-workflow": {
    icon: Cog,
    label: "RPA Workflow",
    dotColor: "var(--canvas-dot-color)",
    iconColor: "text-(--canvas-rpa-workflow-accent)",
  },
  "agentic-process": {
    icon: Bot,
    label: "Agentic Process",
    dotColor: "var(--canvas-dot-color)",
    iconColor: "text-(--canvas-agentic-process-accent)",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CanvasGrid({ type, className }: CanvasGridProps) {
  const config = CANVAS_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={cn("relative flex h-full w-full items-center justify-center overflow-hidden bg-background", className)}
      style={{
        backgroundImage: `radial-gradient(circle, ${config.dotColor} 1px, transparent 1px)`,
        backgroundSize: "16px 16px",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={cn("rounded-lg border border-(--border-subtle) bg-background/80 p-4 shadow-sm backdrop-blur-sm")}>
          <Icon className={cn("size-10", config.iconColor)} strokeWidth={1.5} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {config.label}
        </span>
      </div>
    </div>
  );
}
