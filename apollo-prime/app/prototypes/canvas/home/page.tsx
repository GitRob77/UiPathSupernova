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
import {
  CanvasWorkspace,
  type CanvasTab,
} from "@/components/custom/canvas-workspace";
import type { CanvasType } from "@/components/custom/canvas-grid";
import {
  usePropertiesPanel,
  widgetShowcaseSchema,
} from "@/components/custom/properties";
import type { PropertiesPanelSchema } from "@/components/custom/properties";
import {
  DebugPanel,
  DEMO_RUN_HISTORY,
  DEMO_BREAKPOINTS,
  DEMO_LOG_ENTRIES,
  DEMO_WATCHES,
  DEMO_LOCALS_SECTIONS,
} from "@/components/custom/debug-panel";
import {
  ActivityFlowList,
  type ActivityFlowItem,
} from "@/components/custom/activity-flow-list";
import {
  Folders,
  Briefcase,
  SquareActivity,
  History,
  Sparkles,
  SlidersHorizontal,
  Search,
  LayoutGrid,
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
/*  Activity flow items                                                */
/* ------------------------------------------------------------------ */

const ACTIVITY_ITEMS: ActivityFlowItem[] = [
  {
    id: "widget-showcase",
    label: "Widget Showcase",
    type: "showcase",
    icon: LayoutGrid,
  },
];

const ACTIVITY_SCHEMAS: Record<string, PropertiesPanelSchema> = {
  "widget-showcase": widgetShowcaseSchema,
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CanvasPrototypeHomePage() {
  /* --- Tab state --- */
  const [tabs, setTabs] = useState<CanvasTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | undefined>();
  const [debugOpen, setDebugOpen] = useState(false);

  /* --- Activity selection --- */
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    ACTIVITY_ITEMS[0].id
  );

  const selectedSchema = ACTIVITY_SCHEMAS[selectedActivityId];

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
  const properties = usePropertiesPanel({ schema: selectedSchema });

  const rightPanelItems: SidePanelItem[] = [
    {
      id: "properties",
      icon: SlidersHorizontal,
      label: "Properties",
      panelTitle: "Properties",
      panel: properties.panel,
    },
  ];

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
      icon: History,
      label: "History",
      panelTitle: "History",
      panel: <div className="flex flex-1 items-center justify-center p-4"><p className="text-sm text-muted-foreground">No content yet</p></div>,
    },
    {
      id: "autopilot",
      icon: Sparkles,
      label: "Autopilot",
      panelTitle: "Autopilot",
      panel: autopilot.panel,
    },
  ];

  /* --- Canvas content: flow list when no tabs open --- */
  const flowList = (
    <ActivityFlowList
      items={ACTIVITY_ITEMS}
      selectedId={selectedActivityId}
      onSelect={setSelectedActivityId}
    />
  );

  return (
    <CanvasLayout
      titleBarActions
      leftPanel={{
        items: leftPanelItems,
        defaultActiveId: "explorer",
      }}
      rightPanel={{
        items: rightPanelItems,
        defaultActiveId: "properties",
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
        onDebugClick: () => setDebugOpen((prev) => !prev),
        debugActive: debugOpen,
      }}
    >
      {tabs.length === 0 ? (
        flowList
      ) : (
        <CanvasWorkspace
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={setActiveTabId}
          onTabClose={handleTabClose}
          onCloseAll={handleCloseAll}
          onCloseOthers={handleCloseOthers}
          emptyState={flowList}
        />
      )}
    </CanvasLayout>
  );
}
