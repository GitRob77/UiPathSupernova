"use client";

import { TreeView } from "@uipath/apollo-wind";
import type { TreeViewItem, TreeViewIconMap } from "@uipath/apollo-wind";
import { cn } from "@uipath/apollo-wind";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@uipath/apollo-wind/components/ui/popover";
import {
  Package,
  Bot,
  Workflow,
  AppWindow,
  Cog,
  FileText,
  File,
  ClipboardList,
  FlaskConical,
  LayoutGrid,
  Box,
  Plug,
  MessageSquare,
  Play,
  Inbox,
  Database,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Plus,
  Import,
  Search,
  X,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ExplorerFileOpenEvent {
  /** Tree node id */
  id: string;
  /** Display name */
  name: string;
  /** Tree node type (e.g. "agent", "file-text", "file") */
  type: string;
  /** Resolved parent project type (e.g. "agent", "api-workflow") */
  parentType: string;
}

export interface ExplorerPanelProps {
  /** Solution name displayed as the tree root */
  solutionName?: string;
  /** Override default project structure */
  projects?: TreeViewItem[];
  /** Override default resource categories */
  resources?: TreeViewItem[];
  /** Called when a leaf file is clicked in the tree */
  onFileOpen?: (file: ExplorerFileOpenEvent) => void;
  /** Currently active item id — the matching tree node will be highlighted */
  selectedItemId?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const iconMap: TreeViewIconMap = {
  solution: <Package className="size-4" />,
  agent: <Bot className="size-4" />,
  "api-workflow": <Workflow className="size-4" />,
  app: <AppWindow className="size-4" />,
  "rpa-workflow": <Cog className="size-4" />,
  "agentic-process": <Bot className="size-4" />,
  definition: <FileText className="size-4" />,
  file: <File className="size-4" />,
  "file-text": <FileText className="size-4" />,
  "evaluation-sets": <ClipboardList className="size-4" />,
  evaluators: <FlaskConical className="size-4" />,
  // Resource types
  apps: <LayoutGrid className="size-4" />,
  assets: <Box className="size-4" />,
  connections: <Plug className="size-4" />,
  context: <MessageSquare className="size-4" />,
  processes: <Play className="size-4" />,
  queues: <Inbox className="size-4" />,
  "storage-buckets": <Database className="size-4" />,
  "task-catalogs": <ListChecks className="size-4" />,
};

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const DEFAULT_PROJECTS: TreeViewItem[] = [
  {
    id: "agent",
    name: "Agent",
    type: "agent",
    children: [
      { id: "agent-definition", name: "Definition", type: "definition" },
      {
        id: "agent-eval-sets",
        name: "Evaluation Sets",
        type: "evaluation-sets",
      },
      { id: "agent-evaluators", name: "Evaluators", type: "evaluators" },
    ],
  },
  {
    id: "api-workflow",
    name: "API Workflow",
    type: "api-workflow",
    children: [
      { id: "api-workflow-json", name: "Workflow.json", type: "file-text" },
    ],
  },
  {
    id: "app",
    name: "App",
    type: "app",
    children: [
      {
        id: "app-form-page",
        name: "SampleFormPagePage_SubmitHandler",
        type: "file",
      },
      { id: "app-workflow-xaml", name: "Workflow.xaml", type: "file-text" },
    ],
  },
  {
    id: "rpa-workflow",
    name: "RPA Workflow",
    type: "rpa-workflow",
    children: [
      { id: "rpa-main-xaml", name: "Main.xaml", type: "file-text" },
    ],
  },
  {
    id: "agentic-process",
    name: "Agentic Process",
    type: "agentic-process",
    children: [
      { id: "ap-definition", name: "Definition", type: "definition" },
      { id: "ap-orchestration", name: "Orchestration.json", type: "file-text" },
    ],
  },
];

const DEFAULT_RESOURCES: TreeViewItem[] = [
  {
    id: "res-apps",
    name: "Apps",
    type: "apps",
    children: [
      { id: "res-apps-1", name: "CustomerPortal", type: "file" },
      { id: "res-apps-2", name: "InventoryTracker", type: "file" },
      { id: "res-apps-3", name: "ExpenseManager", type: "file" },
    ],
  },
  { id: "res-assets", name: "Assets", type: "assets" },
  {
    id: "res-connections",
    name: "Connections",
    type: "connections",
    children: [
      { id: "res-conn-1", name: "Salesforce_Prod", type: "file" },
      { id: "res-conn-2", name: "SAP_Gateway", type: "file" },
      { id: "res-conn-3", name: "SMTP_Relay", type: "file" },
      { id: "res-conn-4", name: "Azure_BlobStorage", type: "file" },
    ],
  },
  { id: "res-context", name: "Context", type: "context" },
  {
    id: "res-processes",
    name: "Processes",
    type: "processes",
    children: [
      { id: "res-proc-1", name: "InvoiceProcessing", type: "file" },
      { id: "res-proc-2", name: "OrderFulfillment", type: "file" },
      { id: "res-proc-3", name: "CustomerOnboarding", type: "file" },
    ],
  },
  { id: "res-queues", name: "Queues", type: "queues" },
  { id: "res-storage", name: "Storage buckets", type: "storage-buckets" },
  { id: "res-tasks", name: "Task catalogs", type: "task-catalogs" },
];

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

/** Hide the built-in search bar and card chrome from TreeView */
const treeContainerCls =
  "w-full p-3 !space-y-0 border-0 shadow-none rounded-none bg-transparent text-sm [&>div:has(>input)]:hidden [&>div:has(>svg.lucide-search)]:hidden [&_button:has(>.lucide-info)]:!hidden";

/** Hide the expand/collapse toolbar (used when we auto-expand on mount) */
const hideExpandBarCls =
  "[&>.flex.items-center.justify-between]:hidden";

/**
 * Unified CSS overrides for the explorer tree:
 * - 24px indent per level so parent icon aligns with child chevron arrow
 *   (chevron button 24px, arrow inset 4px → icon at pad+28, next arrow at pad+24+4)
 * - Compact gap: gap-2 (8px) → 4px
 * - Leaf icon alignment: pl-8 (32px) → 28px to match folder icon offset
 * - Root chevron hidden
 */
const explorerTreeCss = `
  /* TreeView's <section> has overflow-x-hidden which implicitly sets overflow-y:auto (CSS spec).
     This causes a scrollbar flash during Framer Motion expand animations on the last item.
     Force overflow-y:hidden — the outer .solution-tree container handles scrolling. */
  .explorer-tree section { overflow-y: hidden !important; }

  /* Compact gap + leaf alignment + smaller font for both trees */
  .explorer-tree [data-tree-item] { font-size: var(--font-size-base) !important; }
  .explorer-tree [data-tree-item] .h-8 { height: 28px !important; }
  .explorer-tree [data-tree-item] .gap-2 { gap: 4px !important; }
  .explorer-tree [data-tree-item] .pl-8 { padding-left: 28px !important; }

  /* Solution tree: custom indents, root chevron hidden */
  .solution-tree [data-tree-item][data-depth="0"] { padding-left: 4px !important; }
  .solution-tree [data-tree-item][data-depth="1"] { padding-left: 0px !important; }
  .solution-tree [data-tree-item][data-depth="2"] { padding-left: 10px !important; }
  .solution-tree [data-tree-item][data-depth="3"] { padding-left: 44px !important; }
  .solution-tree [data-tree-item][data-depth="4"] { padding-left: 68px !important; }
  .solution-tree [data-tree-item][data-depth='0'] .gap-2 > :has(button.h-6.w-6) {
    display: none;
  }

  /* Hide the "N selected" / Clear toolbar */
  .explorer-tree .justify-between { display: none !important; }

  /* Strip TreeView's built-in selection highlight — we manage it externally */
  .explorer-tree [data-tree-item][aria-selected="true"] {
    background-color: transparent !important;
  }
`;

/* ------------------------------------------------------------------ */
/*  Parent type resolver                                               */
/* ------------------------------------------------------------------ */

/** Project-level types that map to canvas types */
const PROJECT_TYPES = new Set([
  "agent",
  "api-workflow",
  "app",
  "rpa-workflow",
  "agentic-process",
]);

/**
 * Given a selected tree item, find the closest ancestor whose type is
 * a project type. If the item itself is a project type, return its own type.
 */
function resolveParentType(
  item: TreeViewItem,
  tree: TreeViewItem[]
): string {
  if (PROJECT_TYPES.has(item.type ?? "")) return item.type!;

  // Walk the tree to find the parent chain
  function findParent(
    nodes: TreeViewItem[],
    targetId: string
  ): string | null {
    for (const node of nodes) {
      if (node.id === targetId) return null; // found at this level
      if (node.children) {
        for (const child of node.children) {
          if (child.id === targetId) {
            // child is direct descendant — return node type if project, else keep searching up
            return PROJECT_TYPES.has(node.type ?? "")
              ? node.type!
              : "unknown";
          }
        }
        const deeper = findParent(node.children, targetId);
        if (deeper !== null) {
          return PROJECT_TYPES.has(node.type ?? "") ? node.type! : deeper;
        }
      }
    }
    return null;
  }

  return findParent(tree, item.id) ?? "unknown";
}

/* ------------------------------------------------------------------ */
/*  Tree search / filter                                               */
/* ------------------------------------------------------------------ */

/** Recursively filter tree items by name. Keeps ancestors of matches. */
function filterTree(items: TreeViewItem[], query: string): TreeViewItem[] {
  if (!query) return items;
  const lq = query.toLowerCase();

  function filterNode(item: TreeViewItem): TreeViewItem | null {
    if (item.name.toLowerCase().includes(lq)) return item;
    if (item.children) {
      const filtered = item.children
        .map(filterNode)
        .filter(Boolean) as TreeViewItem[];
      if (filtered.length > 0) return { ...item, children: filtered };
    }
    return null;
  }

  return items.map(filterNode).filter(Boolean) as TreeViewItem[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Add project popover                                                */
/* ------------------------------------------------------------------ */

const addProjectItems = [
  { icon: Bot, label: "Agentic process" },
  { icon: Bot, label: "Agent" },
  { icon: Cog, label: "RPA Workflow" },
  { icon: Workflow, label: "API Workflow" },
  { icon: AppWindow, label: "App" },
  { icon: AppWindow, label: "Escalation app" },
];

function AddProjectPopover() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] px-1 transition-colors hover:bg-accent">
          <Plus className="h-4 w-4 text-[var(--color-icon-default)]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-52 p-2">
        <div className="block pt-0.5 pb-0.5 px-2 text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">
          Add project to solution
        </div>
        <div className="flex flex-col gap-0.5">
          {addProjectItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => setOpen(false)}
                className="flex h-7 cursor-pointer items-center gap-2 rounded-[3px] px-2 text-xs hover:bg-accent transition-colors"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-(--border-subtle) mt-1 pt-1">
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 w-full cursor-pointer items-center gap-2 rounded-[3px] px-2 text-xs hover:bg-accent transition-colors"
          >
            <Import className="size-4 text-muted-foreground" />
            <span>Import existing</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/*  Split panel                                                        */
/* ------------------------------------------------------------------ */

const DEFAULT_SPLIT_RATIO = 0.6;
const DIVIDER_HEIGHT = 16;

/**
 * Hook that returns `{ panel, footer }` for use with SidePanelItem.
 * `panel` is the scrollable tree content, `footer` is the collapsed
 * "Solution resources" bar that pins to the bottom outside the ScrollArea.
 */
export function useExplorerPanel(props: ExplorerPanelProps = {}) {
  const {
    solutionName = "Solution 5",
    projects = DEFAULT_PROJECTS,
    resources = DEFAULT_RESOURCES,
    onFileOpen,
    selectedItemId,
    className,
  } = props;

  const [splitRatio, setSplitRatio] = useState(DEFAULT_SPLIT_RATIO);
  const [isResizing, setIsResizing] = useState(false);
  const prevRatioRef = useRef(DEFAULT_SPLIT_RATIO);
  const collapsed = splitRatio >= 1;

  /* Search state */
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(
    () => (searchQuery ? filterTree(projects, searchQuery) : projects),
    [projects, searchQuery]
  );

  const handleCloseSearch = useCallback(() => {
    setIsSearching(false);
    setSearchQuery("");
  }, []);

  const handleToggleCollapse = useCallback(() => {
    if (collapsed) {
      setSplitRatio(prevRatioRef.current < 1 ? prevRatioRef.current : DEFAULT_SPLIT_RATIO);
    } else {
      prevRatioRef.current = splitRatio;
      setSplitRatio(1);
    }
  }, [collapsed, splitRatio]);

  const panel = (
    <ExplorerPanelContent
      solutionName={solutionName}
      projects={filteredProjects}
      allProjects={projects}
      resources={resources}
      className={className}
      splitRatio={splitRatio}
      setSplitRatio={setSplitRatio}
      isResizing={isResizing}
      setIsResizing={setIsResizing}
      collapsed={collapsed}
      onToggleCollapse={handleToggleCollapse}
      searchQuery={searchQuery}
      noResults={searchQuery.length > 0 && filteredProjects.length === 0}
      onFileOpen={onFileOpen}
      selectedItemId={selectedItemId}
    />
  );

  const footer = collapsed ? (
    <button
      onClick={handleToggleCollapse}
      className="flex h-9 w-full shrink-0 cursor-pointer items-center gap-2 border-t border-(--border-subtle) px-3 hover:bg-accent/40 transition-colors"
    >
      <span className="text-sm font-medium text-foreground">Solution resources</span>
      <div className="flex-1" />
      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  ) : null;

  const headerActions = <AddProjectPopover />;

  const panelActions: { icon: typeof Search; label: string; onClick: () => void }[] = [
    { icon: Search, label: "Search", onClick: () => setIsSearching(true) },
  ];

  const panelHeaderOverride = isSearching ? (
    <div className="flex w-full items-center gap-1.5">
      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") handleCloseSearch(); }}
        placeholder="Search solution..."
        className="flex-1 min-w-0 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
      />
      <button
        onClick={handleCloseSearch}
        className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] transition-colors hover:bg-accent"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  ) : undefined;

  return { panel, footer, headerActions, panelActions, panelHeaderOverride };
}

/* ------------------------------------------------------------------ */
/*  Internal content component                                         */
/* ------------------------------------------------------------------ */

function ExplorerPanelContent({
  solutionName,
  projects,
  allProjects,
  resources,
  className,
  splitRatio,
  setSplitRatio,
  isResizing,
  setIsResizing,
  collapsed,
  onToggleCollapse,
  searchQuery = "",
  noResults = false,
  onFileOpen,
  selectedItemId,
}: {
  solutionName: string;
  projects: TreeViewItem[];
  allProjects: TreeViewItem[];
  resources: TreeViewItem[];
  className?: string;
  splitRatio: number;
  setSplitRatio: (v: number) => void;
  isResizing: boolean;
  setIsResizing: (v: boolean) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  searchQuery?: string;
  noResults?: boolean;
  onFileOpen?: (file: ExplorerFileOpenEvent) => void;
  selectedItemId?: string;
}) {
  const solutionTree: TreeViewItem[] = [
    {
      id: "solution-root",
      name: solutionName,
      type: "solution",
      children: projects,
    },
  ];

  const resourceTree: TreeViewItem[] = resources;

  const handleSolutionSelect = useCallback(
    (selectedItems: TreeViewItem[]) => {
      if (!onFileOpen || selectedItems.length === 0) return;
      const item = selectedItems[0];
      // Skip folder-level nodes (solution root and project roots — they expand/collapse only)
      if (item.id === "solution-root" || PROJECT_TYPES.has(item.type ?? "")) return;
      const parentType = resolveParentType(item, allProjects);
      onFileOpen({ id: item.id, name: item.name, type: item.type ?? "file", parentType });
    },
    [onFileOpen, allProjects]
  );

  // Returns a capture-phase click handler that intercepts clicks on folder rows at the
  // given depth, redirecting them to the chevron toggle (expand/collapse only, no selection).
  const makeFolderClickCapture = useCallback(
    (folderDepth: string, hasChildrenItems: TreeViewItem[]) =>
      (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const treeItem = target.closest<HTMLElement>("[data-tree-item]");
        if (!treeItem || treeItem.getAttribute("data-depth") !== folderDepth) return;

        // Only intercept items that actually have children (are folders)
        const itemId = treeItem.getAttribute("data-id");
        const isFolder = hasChildrenItems.some((i) => i.id === itemId && i.children?.length);
        if (!isFolder) return;

        // Find the chevron toggle — first button without shrink-0 (action buttons have shrink-0)
        const buttons = Array.from(treeItem.querySelectorAll<HTMLButtonElement>("button"));
        const toggleBtn = buttons.find((btn) => !btn.classList.contains("shrink-0"));
        if (!toggleBtn || toggleBtn.contains(target)) return;

        e.stopPropagation();
        toggleBtn.click();
      },
    []
  );

  // Solution tree: intercept project-root rows (depth=1)
  useEffect(() => {
    const el = solutionTreeRef.current;
    if (!el) return;
    const handler = makeFolderClickCapture("1", projects);
    el.addEventListener("click", handler, true);
    return () => el.removeEventListener("click", handler, true);
  }, [makeFolderClickCapture, projects]);

  // Resource tree: intercept top-level folder rows (depth=0)
  useEffect(() => {
    const el = resourceTreeRef.current;
    if (!el) return;
    const handler = makeFolderClickCapture("0", resources);
    el.addEventListener("click", handler, true);
    return () => el.removeEventListener("click", handler, true);
  }, [makeFolderClickCapture, resources]);

  const handleResourceSelect = useCallback(
    (selectedItems: TreeViewItem[]) => {
      if (!onFileOpen || selectedItems.length === 0) return;
      const item = selectedItems[0];
      // Skip top-level folder nodes — they expand/collapse only (handled by capture listener)
      if (resources.some((r) => r.id === item.id && r.children?.length)) return;
      onFileOpen({ id: item.id, name: item.name, type: item.type ?? "file", parentType: item.type ?? "unknown" });
    },
    [onFileOpen, resources]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const solutionTreeRef = useRef<HTMLDivElement>(null);
  const resourceTreeRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(0);

  // Measure container height synchronously before paint, then track via ResizeObserver
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerH(el.getBoundingClientRect().height);
    const ro = new ResizeObserver(([entry]) => {
      setContainerH(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-expand the solution tree on mount (before paint) and keep root non-collapsible.
  useLayoutEffect(() => {
    const el = solutionTreeRef.current;
    if (!el) return;

    // Click "Expand" synchronously so the tree opens before the first paint
    const expandBtn = el.querySelector<HTMLButtonElement>(
      ".flex.items-center.justify-between button"
    );
    if (expandBtn?.textContent?.trim() === "Expand") {
      expandBtn.click();
    }

    // Keep root node permanently expanded — if TreeView tries to collapse
    // it (second click toggles), force it back open immediately.
    const root = el.querySelector<HTMLElement>(
      '[data-tree-item][data-depth="0"]'
    );
    if (!root) return;
    const observer = new MutationObserver(() => {
      if (root.getAttribute("aria-expanded") === "false") {
        root.click();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["aria-expanded"] });
    return () => observer.disconnect();
  }, [searchQuery]);

  // Highlight matching text in the solution tree after render
  useEffect(() => {
    if (!searchQuery) return;
    const container = solutionTreeRef.current;
    if (!container) return;

    const lq = searchQuery.toLowerCase();
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      if (node.nodeValue && node.nodeValue.toLowerCase().includes(lq)) {
        textNodes.push(node);
      }
    }

    const marks: HTMLElement[] = [];
    for (const textNode of textNodes) {
      const text = textNode.nodeValue!;
      const idx = text.toLowerCase().indexOf(lq);
      if (idx === -1) continue;

      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + searchQuery.length);
      const after = text.slice(idx + searchQuery.length);

      const parent = textNode.parentNode!;
      const frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));

      const mark = document.createElement("mark");
      mark.className = "bg-transparent text-[var(--primary)] font-semibold";
      mark.textContent = match;
      marks.push(mark);
      frag.appendChild(mark);

      if (after) frag.appendChild(document.createTextNode(after));
      parent.replaceChild(frag, textNode);
    }

    return () => {
      for (const mark of marks) {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
          parent.normalize();
        }
      }
    };
  }, [searchQuery, projects]);


  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      setIsResizing(true);
      const rect = container.getBoundingClientRect();

      const onMouseMove = (ev: MouseEvent) => {
        const y = ev.clientY - rect.top;
        const ratio = Math.max(0.1, Math.min(0.9, y / rect.height));
        setSplitRatio(ratio);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [setIsResizing, setSplitRatio]
  );

  const topH = collapsed
    ? containerH
    : Math.round(containerH * splitRatio - DIVIDER_HEIGHT / 2);
  const bottomH = collapsed
    ? 0
    : containerH - topH - DIVIDER_HEIGHT;

  /* Dynamic CSS rule to highlight the externally selected item */
  const selectedHighlightCss = selectedItemId
    ? `.explorer-tree [data-tree-item][data-id="${selectedItemId}"] { background-color: var(--accent) !important; }`
    : "";

  return (
    <div ref={containerRef} className={cn("relative h-full explorer-tree", className)}>
      {/* Explorer tree CSS: indent, compact gap, leaf alignment, root chevron hiding */}
      <style dangerouslySetInnerHTML={{ __html: explorerTreeCss + selectedHighlightCss }} />

      {/* Top: Solution tree */}
      <div
        ref={solutionTreeRef}
        className="absolute inset-x-0 top-0 overflow-auto solution-tree"
        style={{ height: topH }}
      >
        {noResults ? (
          <div className="flex items-center justify-center p-6">
            <p className="text-xs text-muted-foreground">No results found</p>
          </div>
        ) : (
          <TreeView
            key={searchQuery}
            data={solutionTree}
            iconMap={iconMap}
            selectionMode="single"
            showExpandAll={true}
            containerClassName={treeContainerCls + " " + hideExpandBarCls}
            onSelectionChange={handleSolutionSelect}
          />
        )}
      </div>

      {!collapsed && (
        <>
          {/* Resizable divider */}
          <div
            onMouseDown={handleResizeStart}
            className="group/edge absolute inset-x-0 cursor-ns-resize z-20"
            style={{ top: topH, height: DIVIDER_HEIGHT }}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-1/2 border-t transition-colors",
                isResizing
                  ? "border-[var(--primary)]"
                  : "border-(--border-subtle) group-hover/edge:border-[var(--primary)]"
              )}
            />
            {/* Collapse button — appears on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="group/toggle absolute top-1/2 right-3 -translate-y-1/2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-sm opacity-0 group-hover/edge:opacity-100 sidebar-transition hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-dp-4)]"
            >
              <ChevronDown className="h-3 w-3 text-muted-foreground group-hover/toggle:text-white" strokeWidth={3} />
            </button>
          </div>

          {/* Bottom: Solution Resources tree */}
          <div
            ref={resourceTreeRef}
            className="absolute inset-x-0 bottom-0 overflow-auto"
            style={{ height: bottomH }}
          >
            <TreeView
              data={resourceTree}
              iconMap={iconMap}
              selectionMode="single"
              showExpandAll={false}
              containerClassName={treeContainerCls + " !pt-1 " + hideExpandBarCls}
              onSelectionChange={handleResourceSelect}
            />
          </div>
        </>
      )}
    </div>
  );
}

/** Convenience wrapper — use `useExplorerPanel` for footer support */
export function ExplorerPanel(props: ExplorerPanelProps) {
  const { panel } = useExplorerPanel(props);
  return panel;
}
