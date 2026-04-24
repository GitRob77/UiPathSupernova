"use client";

import { useState } from "react";
import { cn } from "@uipath/apollo-wind";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import {
  ChevronRight,
  ChevronDown,
  Copy,
  MoreVertical,
  Pencil,
  Trash2,
  CopyPlus,
} from "lucide-react";
import type { WatchItem } from "./types";

function WatchChildRow({ child }: { child: { name: string; value: string; type: string } }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(child.value);

  return (
    <div
      className="flex h-7 items-center gap-1 pr-2 hover:bg-(--surface-hover)"
      style={{ paddingLeft: 26 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="w-3.5 shrink-0" />
      <span className="shrink-0 text-(--foreground)">{child.name}</span>
      <span className="text-(--foreground-subtle)">=</span>
      {editing ? (
        <input
          autoFocus
          className="min-w-[80px] rounded-sm border border-(--border-subtle) bg-white px-1 leading-5 text-(--foreground) focus:border-(--brand) focus:outline-none"
          value={editValue}
          size={Math.max(editValue.length, 8)}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              setEditing(false);
            }
          }}
          onBlur={() => setEditing(false)}
        />
      ) : (
        <span className="flex-1 truncate text-(--foreground-subtle)">{child.value}</span>
      )}
      {!editing && (
        <div className="shrink-0 items-center gap-0.5" style={{ display: hovered ? "flex" : "none" }}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
              >
                <MoreVertical className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Pencil className="mr-2 size-3.5" /> Edit value
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 size-3.5" /> Copy value
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 size-3.5" /> Copy as expression
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

function WatchRow({ watch, onRemove, onEdit }: { watch: WatchItem; onRemove: (id: string) => void; onEdit: (id: string, expression: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(watch.expression);
  const hasChildren = watch.children && watch.children.length > 0;
  const isError = watch.type === "error";

  return (
    <>
      <div
        {...(hasChildren ? { role: "button", tabIndex: 0 } : {})}
        className="flex h-7 items-center gap-1 pr-2 pl-2 hover:bg-(--surface-hover)"
        onClick={hasChildren ? () => setExpanded((v) => !v) : undefined}
        onKeyDown={
          hasChildren
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpanded((v) => !v);
                }
              }
            : undefined
        }
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: hasChildren ? "pointer" : undefined }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="size-3.5 shrink-0 text-(--color-icon-default)" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-(--color-icon-default)" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {editing ? (
          <input
            autoFocus
            className="min-w-[80px] rounded-sm border border-(--border-subtle) bg-white px-1 leading-5 text-(--foreground) focus:border-(--brand) focus:outline-none"
            size={Math.max(editValue.length, 8)}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEdit(watch.id, editValue);
                setEditing(false);
              }
              if (e.key === "Escape") {
                setEditValue(watch.expression);
                setEditing(false);
              }
            }}
            onBlur={() => {
              onEdit(watch.id, editValue);
              setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <span className={cn("shrink-0", isError ? "text-(--color-error-text)" : "text-(--foreground)")}>
              {watch.expression}
            </span>
            {watch.value && (
              <>
                <span className="text-(--foreground-subtle)">=</span>
                <span className={cn(
                  "flex-1 truncate",
                  isError ? "italic text-(--color-error-text)" : watch.type === "number" ? "text-(--color-feedback-info-text)" : watch.type === "boolean" ? "text-(--color-feedback-info-text)" : "text-(--foreground-subtle)"
                )}>
                  {watch.value}
                </span>
              </>
            )}
            {!watch.value && <span className="flex-1" />}
          </>
        )}
        <div className="shrink-0 items-center gap-0.5" style={{ display: hovered && !editing ? "flex" : "none" }}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            <Pencil className="size-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Pencil className="mr-2 size-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                onEdit(`w-${Date.now()}`, watch.expression);
              }}>
                <CopyPlus className="mr-2 size-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRemove(watch.id)}>
                <Trash2 className="mr-2 size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {expanded && hasChildren && watch.children!.map((child) => (
        <WatchChildRow key={child.name} child={child} />
      ))}
    </>
  );
}

export interface WatchesPanelProps {
  watches: WatchItem[];
  onAdd: (expression: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, expression: string) => void;
}

export function WatchesPanel({ watches, onAdd, onRemove, onEdit }: WatchesPanelProps) {
  const [input, setInput] = useState("");

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {watches.map((watch) => (
          <WatchRow
            key={watch.id}
            watch={watch}
            onRemove={onRemove}
            onEdit={onEdit}
          />
        ))}
        <div className="flex h-7 items-center gap-1 px-2">
          <span className="w-3.5 shrink-0" />
          <input
            className="flex-1 bg-transparent text-(--foreground) placeholder:italic placeholder:text-(--foreground-subtle) focus:outline-none focus:ring-0 focus:border-none"
            placeholder="Add expression..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                onAdd(input.trim());
                setInput("");
              }
            }}
          />
        </div>
      </div>
    </ScrollArea>
  );
}
