"use client";

import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Sparkles,
  ImagePlus,
} from "lucide-react";
import { PROMPT_TEXT } from "../data/mock-data";

export function PromptEditor({
  collapsed,
  onToggle,
  onToggleAutopilot,
  autopilotActive,
  collapsible = true,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onToggleAutopilot: () => void;
  autopilotActive: boolean;
  collapsible?: boolean;
}) {
  return (
    <div className={`border-b border-(--border-subtle) bg-neutral-100 px-4 ${collapsible ? "shrink-0" : "flex flex-1 flex-col overflow-hidden"}`}>
      {/* Collapsed / expand header */}
      <div
        className={`flex h-10 items-center gap-1.5 ${collapsible ? "cursor-pointer" : ""}`}
        onClick={collapsible ? onToggle : undefined}
      >
        {collapsible && (
          collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        )}
        <span className="text-[13px] font-semibold text-muted-foreground">
          Prompt
        </span>

        {collapsed && (
          <>
            <span className="ml-2 flex-1 truncate font-code text-[13px] text-muted-foreground">
              {PROMPT_TEXT}
            </span>
            <div
              className="flex shrink-0 gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="secondary" size="sm" className="h-8 gap-1.5 px-2.5 text-xs">
                <Play className="h-3 w-3" /> Run
              </Button>
              <Button
                variant={autopilotActive ? "secondary" : "outline"}
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs"
                onClick={onToggleAutopilot}
              >
                <Sparkles className="h-3 w-3" /> Autopilot
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Expanded state */}
      {!collapsed && (
        <div className={`mb-3 overflow-hidden rounded-lg border border-(--border-subtle) bg-background ${!collapsible ? "flex flex-1 flex-col" : ""}`}>
          <textarea
            defaultValue={PROMPT_TEXT}
            placeholder="What would you like me to do?"
            rows={2}
            className={`block w-full border-none bg-transparent px-3.5 pt-3.5 pb-2.5 font-code text-sm leading-relaxed text-foreground outline-none ${collapsible ? "resize-y" : "flex-1 resize-none"}`}
          />
          <div className="flex items-center border-t border-(--border-subtle)/50 px-2.5 py-1.5">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
              >
                <ImagePlus className="h-[15px] w-[15px]" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-0.5 text-xs"
                  >
                    Insert variable
                    <ChevronDown className="h-[11px] w-[11px]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>current_url</DropdownMenuItem>
                  <DropdownMenuItem>page_title</DropdownMenuItem>
                  <DropdownMenuItem>selected_text</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-0.5 text-xs"
                  >
                    Model: gpt-5
                    <ChevronDown className="h-[11px] w-[11px]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>gpt-5</DropdownMenuItem>
                  <DropdownMenuItem>gpt-4.1</DropdownMenuItem>
                  <DropdownMenuItem>claude-sonnet-4</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <Button size="sm" className="h-8 px-2.5 text-xs">Use this prompt</Button>
              <Button
                variant={autopilotActive ? "secondary" : "outline"}
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs"
                onClick={onToggleAutopilot}
              >
                <Sparkles className="h-3 w-3" /> Autopilot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
