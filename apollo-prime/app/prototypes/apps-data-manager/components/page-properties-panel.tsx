"use client";

import { cn } from "@uipath/apollo-wind";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import { Checkbox } from "@uipath/apollo-wind/components/ui/checkbox";
import { ChevronRight, Settings, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const TABS = ["General", "Events", "Style"] as const;
type Tab = (typeof TABS)[number];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PagePropertiesPanel({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [pageTitle, setPageTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tooltip, setTooltip] = useState("");
  const [showLoading, setShowLoading] = useState(true);
  const [accessibilityExpanded, setAccessibilityExpanded] = useState(false);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Tabs */}
      <div className="flex gap-4 border-b border-(--border-subtle) px-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "cursor-pointer border-b-2 pb-1.5 pt-2 text-xs font-medium transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {activeTab === "General" && (
          <div className="flex flex-col gap-4">
            {/* Page title */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">
                  Page title
                </label>
                <Settings className="size-3.5 cursor-pointer text-muted-foreground hover:text-foreground" />
              </div>
              <Input
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Enter value"
                className="h-8 text-xs"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter value"
                className="h-8 text-xs"
              />
            </div>

            {/* Tooltip */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Tooltip
              </label>
              <div className="flex items-center gap-1">
                <Input
                  value={tooltip}
                  onChange={(e) => setTooltip(e.target.value)}
                  placeholder="Enter value"
                  className="h-8 flex-1 text-xs"
                />
                <button className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-(--border-subtle) text-muted-foreground hover:bg-accent hover:text-foreground">
                  <SlidersHorizontal className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Show loading progress indicator */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="show-loading"
                checked={showLoading}
                onCheckedChange={(checked) =>
                  setShowLoading(checked === true)
                }
              />
              <label
                htmlFor="show-loading"
                className="text-xs text-foreground"
              >
                Show loading progress indicator
              </label>
            </div>

            {/* Divider */}
            <div className="border-t border-(--border-subtle)" />

            {/* Accessibility */}
            <button
              onClick={() => setAccessibilityExpanded((prev) => !prev)}
              className="flex cursor-pointer items-center gap-2"
            >
              <ChevronRight
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-150",
                  accessibilityExpanded && "rotate-90"
                )}
              />
              <span className="text-xs font-medium text-foreground">
                Accessibility
              </span>
            </button>

            {accessibilityExpanded && (
              <div className="pl-5.5 text-xs text-muted-foreground">
                No accessibility properties configured.
              </div>
            )}
          </div>
        )}

        {activeTab === "Events" && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-muted-foreground">No events configured.</p>
          </div>
        )}

        {activeTab === "Style" && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-muted-foreground">No style properties configured.</p>
          </div>
        )}
      </div>
    </div>
  );
}
