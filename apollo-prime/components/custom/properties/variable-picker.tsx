"use client";

import { useMemo, useRef, useState } from "react";
import { cn, TreeView } from "@uipath/apollo-wind";
import type { TreeViewIconMap, TreeViewItem } from "@uipath/apollo-wind";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@uipath/apollo-wind/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import { AtSign, Box, ChevronRight, Sparkles, Tag } from "lucide-react";
import {
  SAMPLE_ACTIVITIES,
  SAMPLE_RECOMMENDED,
} from "./data/variable-picker-sample";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyNode {
  id: string;
  name: string;
  children?: PropertyNode[];
}

export interface ActivityNode {
  id: string;
  name: string;
  properties: PropertyNode[];
}

export interface RecommendedItem {
  id: string;
  name: string;
}

export interface VariablePickerTriggerProps {
  activities?: ActivityNode[];
  /** Pass `null` to omit the recommended row entirely. Omit the prop to use the default sample. */
  recommended?: RecommendedItem | null;
  onSelect?: (path: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PROPERTY_COLLAPSE_LIMIT = 5;

const SHOW_MORE_SUFFIX = "__show-more";

const RECOMMENDED_ID = "__recommended";

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const iconMap: TreeViewIconMap = {
  activity: <Box className="size-4" />,
  data: <Tag className="size-4" />,
  /* Show more — ChevronRight sits in the chevron slot; label follows directly */
  "show-more": (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
      <ChevronRight className="size-4" />
    </span>
  ),
  /* Recommended occupies both the chevron slot (Sparkles) and the icon slot (Tag) */
  recommended: (
    <span className="flex items-center gap-[2px]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        <Sparkles className="size-3.5 text-muted-foreground" />
      </span>
      <Tag className="size-4 shrink-0 text-muted-foreground" />
    </span>
  ),
};

/* ------------------------------------------------------------------ */
/*  Data shaping                                                       */
/* ------------------------------------------------------------------ */

function propertyToTreeItem(p: PropertyNode): TreeViewItem {
  const hasChildren = p.children && p.children.length > 0;
  const children = hasChildren
    ? p.children!.map(propertyToTreeItem)
    : [
        {
          id: `${p.id}.length`,
          name: "Length",
          type: "data",
        } as TreeViewItem,
      ];
  return {
    id: p.id,
    name: p.name,
    type: "data",
    children,
  };
}

function buildTreeData(
  activities: ActivityNode[],
  recommended: RecommendedItem | null,
  fullyExpanded: Set<string>,
): TreeViewItem[] {
  const items: TreeViewItem[] = [];

  if (recommended) {
    items.push({
      id: RECOMMENDED_ID,
      name: recommended.name,
      type: "recommended",
      meta: (
        <span className="text-[length:calc(var(--font-size-base)-2px)] text-muted-foreground">
          AI Suggested
        </span>
      ),
    });
  }

  for (const activity of activities) {
    const all = activity.properties.map(propertyToTreeItem);
    const isCollapsed =
      !fullyExpanded.has(activity.id) && all.length > PROPERTY_COLLAPSE_LIMIT;
    const children = isCollapsed
      ? [
          ...all.slice(0, PROPERTY_COLLAPSE_LIMIT),
          {
            id: `${activity.id}${SHOW_MORE_SUFFIX}`,
            name: "Show more",
            type: "show-more",
          } as TreeViewItem,
        ]
      : all;
    items.push({
      id: activity.id,
      name: activity.name,
      type: "activity",
      children,
    });
  }

  return items;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const treeContainerClassName =
  "w-full border-0 shadow-none rounded-none bg-transparent p-3 max-w-none space-y-0";

const treeClassName = "w-full !space-y-0 bg-transparent text-sm";

const treeCss = `
  .variable-picker-tree [data-tree-item] { font-size: var(--font-size-base) !important; }
  .variable-picker-tree [data-tree-item] .h-8 { height: 28px !important; }
  .variable-picker-tree [data-tree-item] .gap-2 { gap: 4px !important; }
  .variable-picker-tree [data-tree-item] .pl-8 { padding-left: 28px !important; }

  /* Align each depth level so a child's chevron arrow sits under its parent's icon.
     Step = chevron button width (24px), so arrow centers line up across levels regardless of gap. */
  .variable-picker-tree [data-tree-item][data-depth="1"] { padding-left: 24px !important; }
  .variable-picker-tree [data-tree-item][data-depth="2"] { padding-left: 48px !important; }
  .variable-picker-tree [data-tree-item][data-depth="3"] { padding-left: 72px !important; }
  .variable-picker-tree [data-tree-item][data-depth="4"] { padding-left: 96px !important; }
  .variable-picker-tree [data-tree-item][aria-selected="true"] { background-color: transparent !important; }
  .variable-picker-tree [data-tree-item][data-id$="__show-more"] { color: var(--primary) !important; }
  .variable-picker-tree [data-tree-item][data-id$="__show-more"] .lucide-chevron-right { color: var(--primary) !important; }
  /* Show more — no leaf indent so the ChevronRight sits in the chevron slot, aligning with property chevrons at the same (second) level */
  .variable-picker-tree [data-tree-item][data-id$="__show-more"] .pl-8 { padding-left: 0 !important; }

  /* Recommended row — no leaf indent so the Sparkles composite sits in the chevron slot */
  .variable-picker-tree [data-tree-item][data-id="__recommended"] .pl-8 { padding-left: 0 !important; }

  /* Hide TreeView's built-in search bar, info button, and expand/select toolbar */
  .variable-picker-tree div:has(> input[placeholder]) { display: none !important; }
  .variable-picker-tree div:has(> svg.lucide-search) { display: none !important; }
  .variable-picker-tree button:has(> svg.lucide-info) { display: none !important; }
  .variable-picker-tree > div > div > div.flex.items-center.justify-between { display: none !important; }
`;

/* ------------------------------------------------------------------ */
/*  VariablePickerPopover — the content                                */
/* ------------------------------------------------------------------ */

interface VariablePickerPopoverProps {
  activities: ActivityNode[];
  recommended: RecommendedItem | null;
  onSelect: (path: string) => void;
}

function VariablePickerPopover({
  activities,
  recommended,
  onSelect,
}: VariablePickerPopoverProps) {
  const [fullyExpanded, setFullyExpanded] = useState<Set<string>>(new Set());

  const treeData = useMemo(
    () => buildTreeData(activities, recommended, fullyExpanded),
    [activities, recommended, fullyExpanded],
  );

  const handleSelectionChange = (items: TreeViewItem[]) => {
    const item = items[0];
    if (!item) return;

    if (item.type === "show-more") {
      const activityId = item.id.slice(0, -SHOW_MORE_SUFFIX.length);
      setFullyExpanded((prev) => {
        const next = new Set(prev);
        next.add(activityId);
        return next;
      });
      return;
    }

    if (item.id === RECOMMENDED_ID && recommended) {
      onSelect(recommended.id);
      return;
    }

    onSelect(item.id);
  };

  return (
    <>
      <TreeView
        data={treeData}
        iconMap={iconMap}
        selectionMode="single"
        showExpandAll={false}
        onSelectionChange={handleSelectionChange}
        className={treeClassName}
        containerClassName={treeContainerClassName}
      />
      <style>{treeCss}</style>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  VariablePickerTrigger — the @ button + popover                     */
/* ------------------------------------------------------------------ */

/** Fallback width when no field container can be measured (rare). */
const FALLBACK_WIDTH = 360;

export function VariablePickerTrigger({
  activities,
  recommended,
  onSelect,
}: VariablePickerTriggerProps) {
  const [open, setOpen] = useState(false);
  const [contentWidth, setContentWidth] = useState<number>(FALLBACK_WIDTH);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  const effectiveActivities = activities ?? SAMPLE_ACTIVITIES;
  const effectiveRecommended =
    recommended === undefined ? SAMPLE_RECOMMENDED : recommended;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const field = buttonRef.current?.closest<HTMLElement>(".relative");
      anchorRef.current = field ?? null;
      setContentWidth(field?.getBoundingClientRect().width ?? FALLBACK_WIDTH);
    }
    setOpen(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor
        virtualRef={anchorRef as React.RefObject<{ getBoundingClientRect(): DOMRect }>}
      />
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                ref={buttonRef}
                type="button"
                aria-label="Use variable"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground hover:bg-accent hover:text-foreground",
                  open && "bg-accent text-foreground",
                )}
              >
                <AtSign className="size-3.5" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="text-[length:var(--font-size-base)]"
          >
            Use variable
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent
        align="start"
        sideOffset={0}
        style={{ width: contentWidth }}
        className="variable-picker-tree max-h-[420px] overflow-auto p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <VariablePickerPopover
          activities={effectiveActivities}
          recommended={effectiveRecommended}
          onSelect={(path) => {
            onSelect?.(path);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
