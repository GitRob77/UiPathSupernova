"use client";

import { useState, useCallback } from "react";
import { CanvasLayout } from "@/components/layouts/canvas-layout";
import type { SidePanelItem } from "@/components/custom/side-panel";
import {
  useExplorerPanel,
  type ExplorerFileOpenEvent,
} from "@/components/custom/explorer-panel";
import { useDataManagerPanel } from "@/components/custom/data-manager-panel";
import { useHealthAnalyzerPanel } from "@/components/custom/health-analyzer-panel";
import { useAutopilotPanel } from "@/components/custom/autopilot-panel";
import { useChangeHistoryPanel } from "@/components/custom/change-history-panel";
import {
  CanvasWorkspace,
  type CanvasTab,
} from "@/components/custom/canvas-workspace";
import type { CanvasType } from "@/components/custom/canvas-grid";
import {
  DebugPanel,
  DEMO_RUN_HISTORY,
  DEMO_BREAKPOINTS,
  DEMO_LOG_ENTRIES,
  DEMO_WATCHES,
  DEMO_LOCALS_SECTIONS,
} from "@/components/custom/debug-panel";
import {
  Folders,
  Briefcase,
  SquareActivity,
  GitBranch,
  Sparkles,
  SlidersHorizontal,
  Search,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  File → canvas type mapping                                         */
/* ------------------------------------------------------------------ */

const PARENT_TYPE_TO_CANVAS: Record<string, CanvasType> = {
  agent: "agent",
  "api-workflow": "api-workflow",
  app: "app",
  "rpa-workflow": "rpa-workflow",
  "agentic-process": "agentic-process",
};

/* ------------------------------------------------------------------ */
/*  Placeholder panel body                                             */
/* ------------------------------------------------------------------ */

function PanelPlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <p className="text-sm text-muted-foreground">No content yet</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Right panel items                                                  */
/* ------------------------------------------------------------------ */

const rightPanelItems: SidePanelItem[] = [
  {
    id: "properties",
    icon: SlidersHorizontal,
    label: "Properties",
    panelTitle: "Properties",
    panel: <PanelPlaceholder />,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DebugPanelsHomePage() {
  /* --- Tab state --- */
  const [tabs, setTabs] = useState<CanvasTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | undefined>();
  const [debugOpen, setDebugOpen] = useState(false);

  const handleFileOpen = useCallback((file: ExplorerFileOpenEvent) => {
    const canvasType = PARENT_TYPE_TO_CANVAS[file.parentType];
    if (!canvasType) return;

    setTabs((prev) => {
      if (prev.some((t) => t.id === file.id)) return prev;
      return [...prev, { id: file.id, label: file.name, type: canvasType }];
    });
    setActiveTabId(file.id);
  }, []);

  const handleTabClose = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (activeTabId === id) {
          const idx = prev.findIndex((t) => t.id === id);
          const newActive = next[Math.min(idx, next.length - 1)]?.id;
          setActiveTabId(newActive);
        }
        return next;
      });
    },
    [activeTabId]
  );

  const handleCloseAll = useCallback(() => {
    setTabs([]);
    setActiveTabId(undefined);
  }, []);

  const handleCloseOthers = useCallback((id: string) => {
    setTabs((prev) => prev.filter((t) => t.id === id));
    setActiveTabId(id);
  }, []);

  /* --- Panels --- */
  const explorer = useExplorerPanel({ onFileOpen: handleFileOpen, selectedItemId: activeTabId });
  const dataManager = useDataManagerPanel();
  const healthAnalyzer = useHealthAnalyzerPanel();
  const autopilot = useAutopilotPanel();
  const changeHistory = useChangeHistoryPanel();

  const leftPanelItems: SidePanelItem[] = [
    {
      id: "explorer",
      icon: Folders,
      label: "Explorer",
      panelTitle: "Explorer",
      panelActions: explorer.panelActions,
      panelHeaderExtra: explorer.headerActions,
      panelHeaderOverride: explorer.panelHeaderOverride,
      panel: explorer.panel,
      panelFooter: explorer.footer,
    },
    {
      id: "data-manager",
      icon: Briefcase,
      label: "Data Manager",
      panelTitle: "Data Manager",
      panelActions: [
        { icon: Search, label: "Search", onClick: () => {} },
      ],
      panel: dataManager.panel,
    },
    {
      id: "health-analyzer",
      icon: SquareActivity,
      label: "Health Analyzer",
      panelTitle: "Health Analyzer",
      panel: healthAnalyzer.panel,
      panelHeaderExtra: healthAnalyzer.headerActions,
    },
    {
      id: "history",
      icon: GitBranch,
      label: "Change history",
      panelTitle: "Change history",
      panel: changeHistory.panel,
      panelHeaderExtra: changeHistory.headerActions,
    },
    {
      id: "autopilot",
      icon: Sparkles,
      label: "Autopilot",
      panelTitle: "Autopilot",
      panel: autopilot.panel,
    },
  ];

  return (
    <CanvasLayout
      titleBarActions
      leftPanel={{
        items: leftPanelItems,
        defaultActiveId: "explorer",
      }}
      rightPanel={{
        items: rightPanelItems,
      }}
      bottomPanel={
        <DebugPanel
          open={debugOpen}
          runs={DEMO_RUN_HISTORY}
          logsByRun={DEMO_LOG_ENTRIES}
          localsByRun={DEMO_LOCALS_SECTIONS}
          initialBreakpoints={DEMO_BREAKPOINTS}
          initialWatches={DEMO_WATCHES}
          defaultSelectedRunId="run-1"
        />
      }
      statusBar={{
        solutionName: "Solution 5",
        onDebugClick: () => setDebugOpen((prev) => !prev),
        debugActive: debugOpen,
      }}
    >
      <CanvasWorkspace
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={setActiveTabId}
        onTabClose={handleTabClose}
        onCloseAll={handleCloseAll}
        onCloseOthers={handleCloseOthers}
      />
    </CanvasLayout>
  );
}
