"use client";

import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { Step } from "../data/types";

export function StepProgressBar({
  steps,
  selectedIndex,
  onSelect,
}: {
  steps: Step[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-(--border-subtle) bg-background px-4 py-2">
      {/* Execution trace selector */}
      <span className="shrink-0 text-xs text-muted-foreground">Execution trace</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs font-normal"
          >
            <span className="truncate">2026-03-30 14:32:07</span>
            <ChevronDown className="h-3 w-3 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem>2026-03-30 14:32:07</DropdownMenuItem>
          <DropdownMenuItem>2026-03-29 09:15:42</DropdownMenuItem>
          <DropdownMenuItem>2026-03-28 17:03:19</DropdownMenuItem>
          <DropdownMenuItem>C:\Downloads\trace-export-001</DropdownMenuItem>
          <DropdownMenuItem>C:\Downloads\trace-export-002</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto" />
    </div>
  );
}
