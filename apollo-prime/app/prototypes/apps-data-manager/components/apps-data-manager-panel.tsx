"use client";

import { cn } from "@uipath/apollo-wind";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind/components/ui/select";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import { Checkbox } from "@uipath/apollo-wind/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@uipath/apollo-wind/components/ui/alert-dialog";
import { ChevronRight, Plus, Type, Trash2, Zap } from "lucide-react";
import { useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Variable {
  id: string;
  name: string;
  type?: string;
  description?: string;
  required?: boolean;
}

interface Outcome {
  id: string;
  name: string;
  description?: string;
}

interface Category {
  id: string;
  label: string;
  kind: "variable" | "outcome";
  items: (Variable | Outcome)[];
}

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const VARIABLES_CATEGORY: Category = {
  id: "variables",
  label: "Variables",
  kind: "variable",
  items: [
    { id: "var-1", name: "test_variable", type: "String" },
  ],
};

const ACTION_CATEGORIES: Category[] = [
  {
    id: "inputs",
    label: "Inputs",
    kind: "variable",
    items: [
      { id: "in-1", name: "test_input", type: "String" },
    ],
  },
  {
    id: "outputs",
    label: "Outputs",
    kind: "variable",
    items: [
      { id: "out-1", name: "test_output", type: "String" },
    ],
  },
  {
    id: "outcomes",
    label: "Outcomes",
    kind: "outcome",
    items: [
      { id: "oc-1", name: "Approve", description: "" },
      { id: "oc-2", name: "Reject", description: "" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPE_OPTIONS = [
  "String",
  "Int32",
  "Int64",
  "Boolean",
  "Double",
  "DateTime",
  "Object",
  "DataTable",
];

/* ------------------------------------------------------------------ */
/*  Variable inline form (Type*, Description, Required)                */
/* ------------------------------------------------------------------ */

function VariableForm({
  item,
  onUpdate,
}: {
  item: Variable;
  onUpdate: (updates: Partial<Variable>) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 py-2 pr-1.5 pl-[calc(0.375rem+0.875rem+0.25rem)]">
      {/* Type */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground">
          Type<span className="text-destructive">*</span>
        </label>
        <Select
          value={item.type ?? "String"}
          onValueChange={(v) => onUpdate({ type: v })}
        >
          <SelectTrigger className="h-8 text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        <Input
          value={item.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="h-8 text-[11px]"
        />
      </div>

      {/* Required */}
      <div className="flex items-center gap-2">
        <Checkbox
          id={`required-${item.id}`}
          checked={item.required ?? false}
          onCheckedChange={(checked) =>
            onUpdate({ required: checked === true })
          }
        />
        <label
          htmlFor={`required-${item.id}`}
          className="text-xs text-foreground"
        >
          Required
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Outcome inline form (Name + Description only)                      */
/* ------------------------------------------------------------------ */

function OutcomeForm({
  item,
  onUpdate,
}: {
  item: Outcome;
  onUpdate: (updates: Partial<Outcome>) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 py-2 pr-1.5 pl-[calc(0.375rem+0.875rem+0.25rem)]">
      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground">
          Name<span className="text-destructive">*</span>
        </label>
        <Input
          value={item.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="h-8 text-[11px]"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        <Input
          value={item.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="h-8 text-[11px]"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category node                                                      */
/* ------------------------------------------------------------------ */

function CategoryNode({
  category,
  expanded,
  onToggle,
  onAdd,
  onRemoveItem,
  onUpdateItem,
  expandedItems,
  onToggleItem,
}: {
  category: Category;
  expanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<Variable | Outcome>) => void;
  expandedItems: Set<string>;
  onToggleItem: (id: string) => void;
}) {
  const count = category.items.length;

  return (
    <div>
      {/* Category header */}
      <div
        className="group/node flex h-7 cursor-pointer items-center gap-1 rounded-[3px] px-1.5 hover:bg-accent"
        onClick={onToggle}
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
        <span className="flex-1 truncate text-xs font-semibold text-foreground">
          {category.label}
        </span>
        <span className="mr-0.5 min-w-[18px] text-center text-[10px] tabular-nums text-muted-foreground group-hover/node:hidden">
          {count}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="hidden h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] transition-colors hover:bg-[var(--color-background-selected)] group-hover/node:flex"
        >
          <Plus className="size-3.5 text-[var(--color-icon-default)]" />
        </button>
      </div>

      {/* Items */}
      {expanded && (
        <div>
          {category.items.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const isVariable = category.kind === "variable";
            return (
              <div key={item.id}>
                <div
                  className={cn(
                    "group/item flex h-7 cursor-pointer items-center gap-1 rounded-[3px] px-1.5 hover:bg-accent",
                    isExpanded && "bg-accent"
                  )}
                  onClick={() => onToggleItem(item.id)}
                >
                  <ChevronRight
                    className={cn(
                      "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
                      isExpanded && "rotate-90"
                    )}
                  />
                  {isVariable && (item as Variable).type && (
                    <Type className="size-3 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate text-xs text-foreground">
                    {item.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    className="ml-auto hidden h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive group-hover/item:flex"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
                {isExpanded && (
                  isVariable ? (
                    <VariableForm
                      item={item as Variable}
                      onUpdate={(updates) => onUpdateItem(item.id, updates)}
                    />
                  ) : (
                    <OutcomeForm
                      item={item as Outcome}
                      onUpdate={(updates) => onUpdateItem(item.id, updates)}
                    />
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook — returns panel + header extra (lightning toggle)             */
/* ------------------------------------------------------------------ */

export function useAppsDataManagerPanel() {
  const [actionMode, setActionMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggleClick = useCallback(() => {
    if (actionMode) {
      setShowConfirm(true);
    } else {
      setActionMode(true);
    }
  }, [actionMode]);

  const handleConfirmDisable = useCallback(() => {
    setActionMode(false);
    setShowConfirm(false);
  }, []);

  const headerExtra = (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggleClick}
            className={cn(
              "flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] transition-colors",
              actionMode
                ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Zap className={cn("size-3.5", actionMode && "fill-blue-500")} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {actionMode ? "Remove Action" : "Enable Action"}
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Action</AlertDialogTitle>
            <AlertDialogDescription>
              Disabling the Action will break any binding where inputs, outputs
              or outcomes are used. However, defined properties will be
              preserved; you can re-enable the Action later without losing
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDisable}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  const panel = (
    <AppsDataManagerPanelContent actionMode={actionMode} />
  );

  return { panel, headerExtra, actionMode };
}

/* ------------------------------------------------------------------ */
/*  Internal panel content                                             */
/* ------------------------------------------------------------------ */

function AppsDataManagerPanelContent({
  actionMode,
  className,
}: {
  actionMode: boolean;
  className?: string;
}) {
  const [variablesCategory, setVariablesCategory] = useState<Category>(VARIABLES_CATEGORY);
  const [actionCategories, setActionCategories] = useState<Category[]>(ACTION_CATEGORIES);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    variables: true,
    inputs: true,
    outputs: true,
    outcomes: true,
  });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const categories: Category[] = actionMode
    ? [variablesCategory, ...actionCategories]
    : [variablesCategory];

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addItem = useCallback((categoryId: string) => {
    const newId = `${categoryId}-${Date.now()}`;

    if (categoryId === "variables") {
      setVariablesCategory((prev) => ({
        ...prev,
        items: [...prev.items, { id: newId, name: "newVariable", type: "String" } as Variable],
      }));
      return;
    }

    setActionCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        if (cat.kind === "outcome") {
          return { ...cat, items: [...cat.items, { id: newId, name: "newOutcome", description: "" }] };
        }
        return { ...cat, items: [...cat.items, { id: newId, name: "newVariable", type: "String" } as Variable] };
      })
    );
  }, []);

  const removeItem = useCallback(
    (categoryId: string, itemId: string) => {
      if (categoryId === "variables") {
        setVariablesCategory((prev) => ({
          ...prev,
          items: prev.items.filter((i) => i.id !== itemId),
        }));
      } else {
        setActionCategories((prev) =>
          prev.map((cat) => {
            if (cat.id !== categoryId) return cat;
            return { ...cat, items: cat.items.filter((i) => i.id !== itemId) };
          })
        );
      }
      setExpandedItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    },
    []
  );

  const updateItem = useCallback(
    (categoryId: string, itemId: string, updates: Partial<Variable | Outcome>) => {
      if (categoryId === "variables") {
        setVariablesCategory((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
      } else {
        setActionCategories((prev) =>
          prev.map((cat) => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            };
          })
        );
      }
    },
    []
  );

  return (
    <div className={cn("flex h-full flex-col p-2", className)}>
      <div className="flex flex-col gap-0.5">
        {categories.map((cat) => (
          <CategoryNode
            key={cat.id}
            category={cat}
            expanded={!!expanded[cat.id]}
            onToggle={() => toggleExpanded(cat.id)}
            onAdd={() => addItem(cat.id)}
            onRemoveItem={(itemId) => removeItem(cat.id, itemId)}
            onUpdateItem={(itemId, updates) => updateItem(cat.id, itemId, updates)}
            expandedItems={expandedItems}
            onToggleItem={toggleItem}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Standalone wrapper (if needed without the hook)                    */
/* ------------------------------------------------------------------ */

export function AppsDataManagerPanel({ className }: { className?: string }) {
  const { panel } = useAppsDataManagerPanel();
  return <div className={className}>{panel}</div>;
}
