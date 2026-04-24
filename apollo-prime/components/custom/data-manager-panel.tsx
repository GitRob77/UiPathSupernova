"use client";

import { cn } from "@uipath/apollo-wind";
import { ChevronRight, Plus } from "lucide-react";
import { useState, useCallback } from "react";
import {
  PropertyField,
  PropertySelect,
  PropertyTextInput,
} from "./properties";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DataManagerVariable {
  id: string;
  name: string;
  type?: string;
}

export interface DataManagerCategory {
  id: string;
  label: string;
  items: DataManagerVariable[];
}

export interface DataManagerPanelProps {
  /** Initial categories seed. Treated as initial state only — subsequent changes to this prop are ignored; pass a new `key` to reset. */
  categories?: DataManagerCategory[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const DEFAULT_CATEGORIES: DataManagerCategory[] = [
  {
    id: "inputs",
    label: "Inputs",
    items: [
      { id: "in-1", name: "inputFile", type: "String" },
      { id: "in-2", name: "batchSize", type: "Int32" },
      { id: "in-3", name: "configPath", type: "String" },
    ],
  },
  {
    id: "outputs",
    label: "Outputs",
    items: [
      { id: "out-1", name: "processedCount", type: "Int32" },
      { id: "out-2", name: "resultPath", type: "String" },
    ],
  },
  {
    id: "in-out",
    label: "In/Out",
    items: [
      { id: "io-1", name: "statusFlag", type: "Boolean" },
    ],
  },
  {
    id: "variables",
    label: "Variables",
    items: [
      { id: "var-1", name: "counter", type: "Int32" },
      { id: "var-2", name: "tempFilePath", type: "String" },
      { id: "var-3", name: "isRetry", type: "Boolean" },
      { id: "var-4", name: "errorMessage", type: "String" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCOPE_OPTIONS = ["Main", "Global", "Local"];

const TYPE_OPTIONS = [
  "Text",
  "Number",
  "True or false",
  "Number with decimal",
  "Date with time",
  "Date",
  "File",
];

const DEFAULT_NAME_MAP: Record<string, string> = {
  inputs: "newInput",
  outputs: "newOutput",
  "in-out": "newInOut",
  variables: "newVariable",
};

/* ------------------------------------------------------------------ */
/*  Variable inline form                                               */
/* ------------------------------------------------------------------ */

const SCOPE_SELECT_OPTIONS = SCOPE_OPTIONS.map((s) => ({ value: s, label: s }));
const TYPE_SELECT_OPTIONS = TYPE_OPTIONS.map((t) => ({ value: t, label: t }));

function VariableForm({ item }: { item: DataManagerVariable }) {
  const [scope, setScope] = useState("Main");
  const [type, setType] = useState(item.type ?? "Text");
  const [defaultValue, setDefaultValue] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="flex flex-col gap-2.5 py-2 pr-1.5 pl-[calc(0.375rem+0.875rem+0.25rem)]">
      <PropertyField label="Scope" required>
        <PropertySelect
          value={scope}
          onChange={setScope}
          options={SCOPE_SELECT_OPTIONS}
        />
      </PropertyField>

      <PropertyField label="Type" required>
        <PropertySelect
          value={type}
          onChange={setType}
          options={TYPE_SELECT_OPTIONS}
        />
      </PropertyField>

      <PropertyField label="Default value">
        <PropertyTextInput
          value={defaultValue}
          onChange={setDefaultValue}
          placeholder="Enter text"
          supportsVariables
        />
      </PropertyField>

      <PropertyField label="Description">
        <PropertyTextInput value={description} onChange={setDescription} />
      </PropertyField>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category row                                                       */
/* ------------------------------------------------------------------ */

function CategoryNode({
  category,
  expanded,
  onToggle,
  onAdd,
  onRename,
  selectedItemId,
  onSelectItem,
}: {
  category: DataManagerCategory;
  expanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onRename: (itemId: string, newName: string) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}) {
  const count = category.items.length;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEditing = (item: DataManagerVariable) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const commitEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div>
      {/* Root node */}
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

      {/* Children */}
      {expanded && (
        <div>
          {category.items.map((item) => {
            const isSelected = selectedItemId === item.id;
            const isEditing = editingId === item.id;
            return (
              <div key={item.id}>
                <div
                  className={cn(
                    "group/item flex h-7 cursor-pointer items-center gap-1 rounded-[3px] px-1.5 hover:bg-accent",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => onSelectItem(isSelected ? null : item.id)}
                >
                  <ChevronRight
                    className={cn(
                      "size-3.5 shrink-0 text-muted-foreground opacity-0 transition-transform duration-150 group-hover/item:opacity-100",
                      isSelected && "rotate-90 opacity-100"
                    )}
                  />
                  {isEditing ? (
                    <input
                      autoFocus
                      className="min-w-0 flex-1 truncate rounded-sm border border-(--border-subtle) bg-white px-1 text-xs leading-5 text-foreground focus:border-(--brand) focus:outline-none"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={commitEdit}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className="truncate text-xs text-foreground hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(item);
                      }}
                    >
                      {item.name}
                    </span>
                  )}
                  {!isEditing && item.type && (
                    <span className="ml-auto mr-2 min-w-[18px] shrink-0 text-center text-[10px] text-muted-foreground">
                      {item.type}
                    </span>
                  )}
                </div>
                {isSelected && <VariableForm item={item} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook (mirrors useExplorerPanel pattern)                            */
/* ------------------------------------------------------------------ */

export function useDataManagerPanel(props: DataManagerPanelProps = {}) {
  const { categories: propCategories = DEFAULT_CATEGORIES, className } = props;

  const [categories, setCategories] = useState(propCategories);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(propCategories.map((c) => [c.id, true]))
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const toggleCategory = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleAdd = useCallback((categoryId: string) => {
    const newId = `${categoryId}-${Date.now()}`;
    const baseName = DEFAULT_NAME_MAP[categoryId] ?? "newVariable";
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, { id: newId, name: baseName, type: "String" }] }
          : cat
      )
    );
    setExpanded((prev) => ({ ...prev, [categoryId]: true }));
    setSelectedItemId(newId);
  }, []);

  const handleRename = useCallback((itemId: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, name: newName } : item
        ),
      }))
    );
  }, []);

  const panel = (
    <DataManagerPanelContent
      categories={categories}
      expanded={expanded}
      selectedItemId={selectedItemId}
      onToggleCategory={toggleCategory}
      onAdd={handleAdd}
      onRename={handleRename}
      onSelectItem={setSelectedItemId}
      className={className}
    />
  );

  return { panel };
}

/* ------------------------------------------------------------------ */
/*  Internal content                                                   */
/* ------------------------------------------------------------------ */

function DataManagerPanelContent({
  categories,
  expanded,
  selectedItemId,
  onToggleCategory,
  onAdd,
  onRename,
  onSelectItem,
  className,
}: {
  categories: DataManagerCategory[];
  expanded: Record<string, boolean>;
  selectedItemId: string | null;
  onToggleCategory: (id: string) => void;
  onAdd: (categoryId: string) => void;
  onRename: (itemId: string, newName: string) => void;
  onSelectItem: (id: string | null) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col p-2", className)}>
      <div className="flex flex-col gap-0.5">
        {categories.map((cat) => (
          <CategoryNode
            key={cat.id}
            category={cat}
            expanded={!!expanded[cat.id]}
            onToggle={() => onToggleCategory(cat.id)}
            onAdd={() => onAdd(cat.id)}
            onRename={onRename}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Convenience wrapper                                                */
/* ------------------------------------------------------------------ */

export function DataManagerPanel(props: DataManagerPanelProps) {
  const { panel } = useDataManagerPanel(props);
  return panel;
}
