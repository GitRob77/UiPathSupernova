"use client";

import { useState, useCallback } from "react";
import {
  CanvasWorkspace,
  type CanvasTab,
} from "@/components/custom/canvas-workspace";

const DEMO_TABS: CanvasTab[] = [
  { id: "demo-agent", label: "Definition", type: "agent" },
  { id: "demo-api", label: "Workflow.json", type: "api-workflow" },
  { id: "demo-app", label: "SampleFormPage", type: "app" },
  { id: "demo-rpa", label: "Main.xaml", type: "rpa-workflow" },
  { id: "demo-ap", label: "Orchestration.json", type: "agentic-process" },
];

export function CanvasContent() {
  const [tabs, setTabs] = useState<CanvasTab[]>(DEMO_TABS);
  const [activeTabId, setActiveTabId] = useState<string>("demo-agent");

  const handleTabClose = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (activeTabId === id) {
          const idx = prev.findIndex((t) => t.id === id);
          const newActive = next[Math.min(idx, next.length - 1)]?.id;
          setActiveTabId(newActive ?? "");
        }
        return next;
      });
    },
    [activeTabId]
  );

  const handleCloseAll = useCallback(() => {
    setTabs([]);
    setActiveTabId("");
  }, []);

  const handleCloseOthers = useCallback((id: string) => {
    setTabs((prev) => prev.filter((t) => t.id === id));
    setActiveTabId(id);
  }, []);

  return (
    <CanvasWorkspace
      tabs={tabs}
      activeTabId={activeTabId}
      onTabSelect={setActiveTabId}
      onTabClose={handleTabClose}
      onCloseAll={handleCloseAll}
      onCloseOthers={handleCloseOthers}
    />
  );
}
