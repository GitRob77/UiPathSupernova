"use client";

import { useState } from "react";
import { cn } from "@uipath/apollo-wind";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import {
  MessageSquare,
  LayoutGrid,
  Pencil,
  Check,
} from "lucide-react";
import { PropertiesRenderer } from "./properties-renderer";
import { slackSendMessageSchema } from "./data/slack-send-message";
import { widgetShowcaseSchema } from "./data/widget-showcase";
import type { PropertiesPanelSchema, ActivityHeaderSchema } from "./types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PropertiesPanelProps {
  /** Override the default demo schemas with a custom one */
  schema?: PropertiesPanelSchema;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Demo presets                                                       */
/* ------------------------------------------------------------------ */

const DEMO_SCHEMAS: Record<string, PropertiesPanelSchema> = {
  slack: slackSendMessageSchema,
  showcase: widgetShowcaseSchema,
};

const DEMO_OPTIONS = [
  { value: "slack", label: "Slack: Send Message" },
  { value: "showcase", label: "Widget Showcase" },
];

/* ------------------------------------------------------------------ */
/*  Hook (SidePanel integration)                                       */
/* ------------------------------------------------------------------ */

export function usePropertiesPanel(props: PropertiesPanelProps = {}) {
  const panel = <PropertiesPanelContent {...props} />;
  return { panel };
}

/* ------------------------------------------------------------------ */
/*  Icon map for activity badges                                       */
/* ------------------------------------------------------------------ */

const ACTIVITY_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  MessageSquare,
  LayoutGrid,
};

/* ------------------------------------------------------------------ */
/*  ActivityHeader                                                     */
/* ------------------------------------------------------------------ */

function ActivityHeader({ header }: { header: ActivityHeaderSchema }) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(header.displayName);

  const IconComp = header.icon ? ACTIVITY_ICON_MAP[header.icon] : null;
  const badgeColor = header.iconColor ?? "#6366f1";

  return (
    <div className="flex items-start gap-2.5 border-b border-(--border-subtle) px-3 py-2.5">
      {/* Activity icon badge */}
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: badgeColor }}
      >
        {IconComp ? (
          <IconComp className="size-4 text-white" />
        ) : (
          <LayoutGrid className="size-4 text-white" />
        )}
      </div>

      {/* Name + type */}
      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            autoFocus
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditing(false);
              if (e.key === "Escape") {
                setDisplayName(header.displayName);
                setEditing(false);
              }
            }}
            className="h-6 px-1 !text-[length:var(--font-size-base)] font-semibold"
          />
        ) : (
          <div className="flex items-center gap-1">
            <span className="min-w-0 truncate text-[length:var(--font-size-base)] font-semibold text-foreground">
              {displayName}
            </span>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Pencil className="size-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[length:var(--font-size-base)]">
                  Rename
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        <p className="truncate text-[length:calc(var(--font-size-base) - 2px)] text-muted-foreground">
          {header.typeLabel}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal content                                                   */
/* ------------------------------------------------------------------ */

function PropertiesPanelContent({
  schema: externalSchema,
  className,
}: PropertiesPanelProps) {
  const [activePreset, setActivePreset] = useState("slack");

  const schema = externalSchema ?? DEMO_SCHEMAS[activePreset];

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Demo schema selector (only shown when no external schema) */}
      {!externalSchema && (
        <div className="border-b border-(--border-subtle) px-3 py-2">
          <Select value={activePreset} onValueChange={setActivePreset}>
            <SelectTrigger className="h-7 text-[length:calc(var(--font-size-base) - 1px)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEMO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[length:var(--font-size-base)]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Activity header */}
      {schema.activityHeader ? (
        <ActivityHeader key={schema.title} header={schema.activityHeader} />
      ) : schema.subtitle ? (
        <div className="border-b border-(--border-subtle) px-3 py-2">
          <p className="text-[length:calc(var(--font-size-base) - 2px)] font-medium uppercase tracking-wider text-muted-foreground">
            {schema.subtitle}
          </p>
          <p className="text-[length:var(--font-size-base)] font-semibold text-foreground">
            {schema.title}
          </p>
        </div>
      ) : null}

      {/* Properties renderer */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <PropertiesRenderer key={externalSchema ? schema.title : activePreset} schema={schema} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Standalone wrapper                                                 */
/* ------------------------------------------------------------------ */

export function PropertiesPanel(props: PropertiesPanelProps) {
  const { panel } = usePropertiesPanel(props);
  return panel;
}
