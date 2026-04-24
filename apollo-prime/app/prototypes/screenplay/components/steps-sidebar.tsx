"use client";

import { Button } from "@uipath/apollo-wind/components/ui/button";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import { SidebarNav } from "@/components/custom/sidebar-nav";
import { ChevronLeft, ChevronRight, PlayCircle, Asterisk } from "lucide-react";
import type { Step } from "../data/types";

export function StepsSidebar({
  steps,
  selectedIndex,
  onSelect,
}: {
  steps: Step[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const total = steps.length;
  const current = selectedIndex + 1;

  return (
    <SidebarNav side="left" resizable collapsible={false}>
      {() => (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-(--border-subtle) px-3 py-2">
            <span className="text-xs font-semibold tracking-wide text-foreground">
              STEPS ({current} OF {total})
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-neutral-100"
                disabled={selectedIndex === 0}
                onClick={() => onSelect(selectedIndex - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-neutral-100"
                disabled={selectedIndex === total - 1}
                onClick={() => onSelect(selectedIndex + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Steps list */}
          <ScrollArea className="flex-1">
            <div className="p-1.5">
              {steps.map((s, i) => {
                const isSelected = i === selectedIndex;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(i)}
                    className={`flex w-full cursor-pointer items-start gap-1.5 rounded-md border-none px-2.5 py-2 text-left text-xs ${
                      isSelected
                        ? "bg-blue-50 text-primary"
                        : "bg-transparent text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {/* Dirty flag */}
                    <div className="flex h-4 w-3 shrink-0 items-center justify-center">
                      {s.status !== "pending" && (
                        <Asterisk className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>

                    {/* Step name + description */}
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold">Step {s.id}</span>
                      {(() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const desc = (s.actionJson as any)?.InputAction?.Action?.description as string | undefined;
                        return desc ? (
                          <p
                            className={`m-0 mt-0.5 text-[11px] leading-snug ${
                              isSelected ? "text-primary/80" : "text-muted-foreground"
                            }`}
                          >
                            {desc}
                          </p>
                        ) : null;
                      })()}
                    </div>

                    {/* Play button */}
                    {s.status !== "pending" && (
                      <div className="flex h-4 shrink-0 items-center">
                        <PlayCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </SidebarNav>
  );
}
