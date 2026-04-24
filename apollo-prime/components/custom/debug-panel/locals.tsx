"use client";

import { useState } from "react";
import { cn } from "@uipath/apollo-wind";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Code,
  List,
  MoreVertical,
} from "lucide-react";
import type { LocalsSection, LocalsVariable } from "./types";

function LocalsItemRow({ item, depth }: { item: LocalsVariable; depth: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isExpandable = hasChildren || item.type === "object" || item.type === "array";
  const paddingLeft = 8 + depth * 18;

  const typeIcon = item.type === "object" || item.type === "array" ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/object-type.svg" alt={item.type} className="size-3.5 shrink-0" />
  ) : (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/string-type.svg" alt={item.type} className="size-3.5 shrink-0" />
  );

  return (
    <>
      <div
        {...(isExpandable ? { role: "button", tabIndex: 0 } : {})}
        className={cn(
          "flex h-7 items-center gap-1 pr-2 hover:bg-(--surface-hover)",
          isExpandable && "cursor-pointer"
        )}
        style={{ paddingLeft }}
        onClick={isExpandable ? () => setExpanded((v) => !v) : undefined}
        onKeyDown={
          isExpandable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpanded((v) => !v);
                }
              }
            : undefined
        }
      >
        {isExpandable ? (
          expanded ? (
            <ChevronDown className="size-3.5 shrink-0 text-(--color-icon-default)" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-(--color-icon-default)" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {typeIcon}
        <span className="shrink-0 text-(--foreground)">
          {item.name}
        </span>
        {!hasChildren && (
          item.value ? (
            <span className="ml-1 inline-flex max-w-full truncate rounded border border-(--border-subtle) bg-white px-1 py-px text-[11px] leading-4 text-(--foreground)">
              <span className="truncate">{item.value}</span>
            </span>
          ) : (
            <span className="ml-1 rounded border border-(--border-subtle) bg-white px-1 py-px text-[11px] italic leading-4 text-(--foreground-subtle)">
              null
            </span>
          )
        )}
      </div>
      {expanded && hasChildren && item.children!.map((child) => (
        <LocalsItemRow key={child.name} item={child} depth={depth + 1} />
      ))}
    </>
  );
}

function LocalsSectionRow({ section }: { section: LocalsSection }) {
  const [open, setOpen] = useState(section.defaultOpen ?? false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [codeView, setCodeView] = useState(false);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        className={cn(
          "group flex h-8 cursor-pointer items-center gap-1 px-2 hover:bg-(--surface-hover)"
        )}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0 text-(--foreground-subtle)" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-(--foreground-subtle)" />
        )}
        <span className="flex-1 font-semibold text-(--foreground)">
          {section.label}
        </span>
        <TooltipProvider delayDuration={400}>
          <div className={cn(
            "flex items-center gap-0.5 transition-opacity",
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex size-6 items-center justify-center rounded-[3px] hover:bg-accent"
                  onClick={(e) => { e.stopPropagation(); setCodeView((v) => !v); if (!open) setOpen(true); }}
                >
                  {codeView ? (
                    <List className="size-3.5 text-(--color-icon-default)" />
                  ) : (
                    <Code className="size-3.5 text-(--color-icon-default)" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{codeView ? "View as list" : "View as code"}</TooltipContent>
            </Tooltip>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button className="flex size-6 items-center justify-center rounded-[3px] hover:bg-accent">
                      <MoreVertical className="size-3.5 text-(--color-icon-default)" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="mr-2 size-3.5" />
                  Copy
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      </div>

      {!open && <div className="h-1" />}

      {open && !codeView && (
        <div className="flex flex-col py-0.5">
          {section.items.map((item) => (
            <LocalsItemRow key={item.name} item={item} depth={0} />
          ))}
        </div>
      )}

      {open && codeView && (
        <pre className="mx-2 mb-1 mt-1 overflow-x-auto rounded border border-(--border-subtle) bg-(--surface-level-0) p-3 font-code leading-6">
          <code>
            <span className="text-(--foreground)">{"{\n"}</span>
            {section.items.map((item, i) => {
              const isLast = i === section.items.length - 1;
              const comma = isLast ? "" : ",";
              const dir = section.direction ?? "VAR";
              const typeLabel = item.type === "object" ? "Object" : "Text";
              return (
                <span key={item.name}>
                  {"  "}<span className="text-(--color-feedback-error-text)">{`"${item.name}"`}</span>
                  <span className="text-(--foreground)">{": {\n"}</span>
                  {"    "}<span className="text-(--color-feedback-error-text)">{`"value"`}</span>
                  <span className="text-(--foreground)">: </span>
                  {item.value ? (
                    <span className="text-(--color-feedback-info-text)">{`"${item.value}"`}</span>
                  ) : (
                    <span className="text-(--color-feedback-info-text)">null</span>
                  )}
                  <span className="text-(--foreground)">{",\n"}</span>
                  {"    "}<span className="text-(--color-feedback-error-text)">{`"type"`}</span>
                  <span className="text-(--foreground)">: </span>
                  <span className="text-(--color-feedback-info-text)">{`"${typeLabel}"`}</span>
                  <span className="text-(--foreground)">{",\n"}</span>
                  {"    "}<span className="text-(--color-feedback-error-text)">{`"direction"`}</span>
                  <span className="text-(--foreground)">: </span>
                  <span className="text-(--color-feedback-info-text)">{`"${dir}"`}</span>
                  <span className="text-(--foreground)">{"\n"}</span>
                  {"  "}<span className="text-(--foreground)">{"}"}{comma}{"\n"}</span>
                </span>
              );
            })}
            <span className="text-(--foreground)">{"}"}</span>
          </code>
        </pre>
      )}
    </div>
  );
}

export interface LocalsPanelProps {
  sections: LocalsSection[];
}

export function LocalsPanel({ sections }: LocalsPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {sections.map((section) => (
          <LocalsSectionRow key={section.id} section={section} />
        ))}
      </div>
    </ScrollArea>
  );
}
