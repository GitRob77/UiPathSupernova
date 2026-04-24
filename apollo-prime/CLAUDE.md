# Apollo Prime

A scaffold repo to quickly prototype designs over the [apollo-wind](https://www.npmjs.com/package/@uipath/apollo-wind) library.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- @uipath/apollo-wind (component library)
- @tanstack/react-table
- lucide-react (icons)
- pnpm (package manager)

## Project Structure

```
app/
  layout.tsx          # Root layout - kept minimal (fonts + globals only)
  page.tsx            # Cover/landing page for the entire project
  globals.css         # Global styles
  starter-templates/
    page.tsx          # Landing page listing all starter templates as cards
    <layout-name>/
      page.tsx        # Starter template page (imports _*-content.tsx directly)
  prototypes/
    page.tsx          # Landing page listing all prototypes (reads first-level folders)
    <prototype-name>/
      prototype.json  # Metadata for the prototype
      page.tsx        # Cover/landing page for the prototype
      home/
        page.tsx      # Main page / entry point for the prototype
      ...             # Additional routes/files for the prototype
components/
  custom/             # Custom or larger components built on apollo-wind base components
  layouts/            # Layout/template wrappers and default content templates
    *-layout.tsx      # Layout wrappers (structure/chrome)
    _*-content.tsx    # Default starter content for each layout type
```

## Key Pages

- `/` (`app/page.tsx`) - Main cover page for the project/repo
- `/prototypes` (`app/prototypes/page.tsx`) - Landing page that auto-discovers prototypes by reading first-level folders under `app/prototypes/`
- `/prototypes/<name>` - Prototype cover/landing page
- `/prototypes/<name>/home` - Main prototype page (entry point after clicking "Start Prototype")
- `/starter-templates` (`app/starter-templates/page.tsx`) - Landing page listing all starter templates as cards
- `/starter-templates/<layout-name>` - Live demo of a layout with its default content template

## Starter Templates

The `app/starter-templates/` folder showcases each available layout with its matching `_*-content.tsx` imported directly as a component (not inlined). This means starter template pages always reflect the latest content template changes without copy-paste drift.

**Available starter templates:** `/starter-templates/dashboard`, `/starter-templates/listing`, `/starter-templates/canvas`, `/starter-templates/empty`

Each demo page simply wraps the corresponding content component in its layout:

```tsx
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardContent } from "@/components/layouts/_dashboard-content";

export default function DashboardDemoPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
```

When adding a new layout, create a matching starter template page under `app/starter-templates/<layout-name>/page.tsx`.

## Prototypes

Each prototype is a folder under `app/prototypes/`. The first level of folders represents a prototype.

### Prototype Template

Every prototype folder should contain:

1. **`prototype.json`** - Metadata file:
   ```json
   {
     "title": "My Prototype",
     "description": "What this prototype demonstrates",
     "url": "https://public-url-if-any.com",
     "status": "ready | in review | wip | experimental",
     "tags": ["dashboard", "forms"],
     "author": "Author Name",
     "createdAt": "2026-03-06"
   }
   ```

2. **`page.tsx`** - The cover/landing page for the prototype. Shows title, description, status badge, and a "Start Prototype" link to `/home`.

3. **`home/page.tsx`** - The main page of the prototype. This is where the actual prototype content lives, wrapped in a layout component.

### Creating a New Prototype

1. Create a folder under `app/prototypes/<prototype-name>/`
2. Add a `prototype.json` with the metadata fields above
3. Add a `page.tsx` as the cover page (title, description, badge, link to `/home`)
4. Add a `home/page.tsx` as the main prototype page, wrapped in a layout component from `components/layouts/`
5. Unless instructed otherwise, use the matching `_*-content.tsx` as the default content inside the layout (e.g., `DashboardLayout` + `DashboardContent`)

## Prototype File Organization

All components, mock data, types, and other files specific to a prototype **must live inside that prototype's folder** (`app/prototypes/<prototype-name>/`). Do not create prototype-specific files in root-level directories like `components/`, `lib/`, or `types/`. Only shared, project-wide components belong in the root `components/` folder.

A typical self-contained prototype structure:

```
app/prototypes/<prototype-name>/
  prototype.json
  page.tsx
  home/page.tsx
  components/        # Prototype-specific components
  mock-data/         # Prototype-specific mock/sample data
  types/             # Prototype-specific type definitions
```

## Apollo-Wind Import Patterns

Two import styles are available:

- **Barrel import** - `import { Button, Card } from "@uipath/apollo-wind"` - convenient for grabbing multiple components
- **Deep import** - `import { Button } from "@uipath/apollo-wind/components/ui/button"` - more explicit, better for tree-shaking

Use deep imports when you need a single component. Use barrel imports when importing several components from the library at once.

## Styling

- **Tailwind CSS 4** with apollo-wind's styles imported in `globals.css`:
  ```css
  @import "tailwindcss";
  @import "@uipath/apollo-wind/styles.css";
  @source "./node_modules/@uipath/apollo-wind";
  @source "../components";
  ```
- The `light` class is set on `<body>` in `app/layout.tsx` for apollo-wind theming
- **Fonts**: Noto Sans (body text) and Inconsolata (code, via `--font-code` CSS variable / `font-code` class)

## Components

### Component Priority (IMPORTANT)

When building a prototype page, follow this strict priority order:

1. **Use custom components first** - always check `components/custom/` for an existing component that fits the need. These are the project's curated, reusable building blocks and take priority over everything else.
2. **Use apollo-wind base components** - if no custom component exists, import from `@uipath/apollo-wind` or `@uipath/apollo-wind/components/ui/*`.
3. **Reconstruct from primitives as a fallback** - if neither a custom component nor an apollo-wind component covers the need, build it from scratch using apollo-wind primitives + Tailwind. If the result is reusable, add it to `components/custom/`.

### Layouts (`components/layouts/`)

Layouts are template wrappers used **inside** prototype `home/page.tsx` files instead of using multiple `layout.tsx` files in the folder structure. This keeps `app/layout.tsx` minimal and avoids layout nesting issues across prototypes.

**Available layouts:**

1. **Dashboard** (`dashboard-layout.tsx`) - For dashboard-style pages with stat cards, charts, and summary widgets. Supports optional `leftPanel`/`rightPanel` props (icon rail + expandable panel via `SidePanel`) and `leftSidebar`/`rightSidebar` props (collapsible sidebar via `SidebarNav`).

2. **Listing** (`listing-layout.tsx`) - Data table driven layout. Supports the same `leftPanel`/`rightPanel` and `leftSidebar`/`rightSidebar` props as Dashboard. Features:
   - Tabs at the top for switching views/categories
   - Filters toolbar and action buttons
   - Data grid with pagination
   - Optional **left side panel** for navigation
   - Optional **right side panel** for detail view when clicking an item on the data grid

3. **Canvas** (`canvas-layout.tsx`) - Canvas-style layout with optional left/right `SidePanel` rails. Supports `leftPanel` and `rightPanel` props (each a `CanvasPanelSlot` with `items`, `defaultActiveId`, `defaultWidth`, `resizable`).

4. **Empty** (`empty-layout.tsx`) - Minimal layout with just the AppHeader and a content area. Use as a blank starting point for prototypes that don't fit other layout patterns.

**How to build a layout/template:**

1. Create a new file in `components/layouts/` (e.g., `my-layout.tsx`)
2. Accept `children` or specific content slots as props
3. Compose the layout using apollo-wind components (sidebars, headers, breadcrumbs, etc.)
4. Mark with `"use client"` if the layout uses hooks or interactive state
5. Use in a prototype's `home/page.tsx` by wrapping content:

```tsx
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function PrototypePage() {
  return (
    <DashboardLayout>
      {/* page content */}
    </DashboardLayout>
  );
}
```

### Content Templates (`components/layouts/_*-content.tsx`)

Content templates are default/starter content for prototype pages. Each layout has a matching content template:

- **`_dashboard-content.tsx`** - Default content for dashboard prototypes (stat cards, charts, widgets)
- **`_listing-content.tsx`** - Default content for listing prototypes (sample data table, filters, actions)
- **`_canvas-content.tsx`** - Default content for canvas prototypes
- **`_empty-content.tsx`** - Placeholder content for empty/blank prototypes

**Usage:** When creating a new prototype, unless instructed otherwise, use the matching content template as a **reference/source to inline** into the prototype's `home/page.tsx`. The content is copied directly into the layout wrapper, not imported as a component:

```tsx
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function PrototypePage() {
  return (
    <DashboardLayout>
      {/* Content inlined from _dashboard-content.tsx */}
      {/* ...stat cards, charts, widgets, etc... */}
    </DashboardLayout>
  );
}
```

This gives every new prototype a working starting point out of the box. The inlined content is then customized in place for the specific prototype.

### Custom Components (`components/custom/`)

Larger reusable components built on top of apollo-wind primitives. **Always prefer using these over rebuilding from scratch.** Create new ones here when combining multiple apollo-wind components into a reusable pattern.

**Available custom components:**

| Component | File | Description | Key Props |
|-----------|------|-------------|-----------|
| **AppHeader** | `app-header.tsx` | Top-level application header bar with waffle menu, product name, search, autopilot, notifications, help, tenant selector, and profile avatar. | `productName`, `multiTenant`, `tenantName`, `notificationDot`, `autopilot`, `userInitials`, `onSearchClick`, `onAutopilotClick`, `onNotificationsClick`, `onHelpClick`, `onProfileClick`, `onWaffleClick` |
| **SidebarNav** | `sidebar-nav.tsx` | Generic resizable/collapsible sidebar shell. Accepts a render prop `children({ collapsed, side })` for fully composable content. | `children`, `side`, `defaultCollapsed`, `resizable`, `collapsible`, `className` |
| **SidebarNavItems** | `sidebar-nav-items.tsx` | Scrollable list of icon+label nav items with tooltips. Extracted from SidebarNav for reuse in any sidebar. | `items`, `tooltipSide` |
| **StatusChip** | `status-chip.tsx` | Compact status/priority badge using semantic apollo-wind color tokens. Two sizes, five variants. | `children`, `variant` (`error` \| `warning` \| `info` \| `success` \| `default`), `size` (`sm` \| `lg`), `className` |
| **TabsNav** | `tabs-nav.tsx` | Tab navigation with three variants (primary, secondary, tiny) matching Figma specs. Wraps apollo-wind Tabs primitives with proper token-based styling. Re-exports `TabsContent` for tab panels. | `variant` (`primary` \| `secondary` \| `tiny`), `tabs`, `defaultValue`, `value`, `onValueChange`, `bordered` (default `true`, ignored for secondary), `children`, `className` |
| **FilterBar** | `filter-bar.tsx` | Configurable toolbar row for above data tables/content areas. Supports search, column visibility dropdown, filter dropdowns (single/multi), view switcher toggle, and right-aligned action buttons with separator dividers between sections. | `search` (`boolean` \| `{ value, onChange, placeholder }`), `columns` (`{ items, onChange }`), `filters` (`FilterBarFilter[]`), `viewSwitcher` (`{ modes, value, onChange }`), `actions` (`FilterBarAction[]`), `className` |
| **DataGrid** | `data-grid.tsx` | Wrapper combining FilterBar + apollo-wind Table primitives + pagination footer. Uses TanStack React Table under the hood. Features: light header background, row selection checkboxes, page navigation (first/prev/next/last), page size selector, row click handler. Also exports `dataGridSelectColumn()` helper and re-exports `DataTableColumnHeader`. | `columns`, `data`, `filterBar` (`FilterBarProps`), `selectable`, `rowSelection`, `onRowSelectionChange`, `pageSize` (default 25), `pageSizeOptions`, `showPagination`, `compact`, `onRowClick`, `className` |
| **SidePanel** | `side-panel.tsx` | Persistent icon rail (40px) with expandable content panels. Clicking a rail icon opens/closes a panel beside it. Built-in panel header with title and action buttons, scrollable body, optional footer. Supports left/right sides. Resizable via drag handle. | `items` (`SidePanelItem[]`), `side` (`"left"` \| `"right"`), `defaultActiveId`, `defaultWidth` (396), `minWidth` (280), `maxWidth` (480), `resizable`, `className` |
| **Toolbar** | `toolbar.tsx` | Configurable button toolbar supporting simple buttons, dropdown menus, and split buttons (main action + chevron dropdown). Each item can define an icon, click handler, menu items, variant, and disabled state. | `items` (`ToolbarItem[]`), `className` |
| **ExplorerPanel** | `explorer-panel.tsx` | Solution project structure tree for canvas SidePanel. Two vertically-split apollo-wind TreeView instances: top shows a solution with nested project folders (Agent, API Workflow, App, RPA Workflow), bottom shows resource categories (Apps, Assets, Connections, etc.). Uses lucide-react icons via TreeView's `iconMap`. | `solutionName` (default `"Solution 5"`), `projects` (`TreeViewItem[]`), `resources` (`TreeViewItem[]`), `className` |
| **HealthAnalyzerPanel** | `health-analyzer-panel.tsx` | Health analyzer panel (issues/errors/warnings) for SidePanel integration. Tree view groups issues by file (with count badges); flat view lists all issues inline. Filter popover with Scope (File/Project/Solution), Severity (Errors/Warnings), and Quality Area checkboxes. Use `useHealthAnalyzerPanel()` hook for SidePanel integration — returns `{ panel, headerActions }`. | `issues` (`Issue[]`), `className` |
| **DataManagerPanel** | `data-manager-panel.tsx` | Data manager panel with collapsible variable categories for SidePanel integration. Groups variables into expandable sections with type badges. Ships a `useDataManagerPanel()` hook returning `{ panel, headerActions }`. | `categories` (`DataManagerCategory[]`), `className` |
| **AutopilotPanel** | `autopilot-panel.tsx` | Chat-style autopilot panel with a conversation stream (user messages, collapsible reasoning blocks, AI replies, recursive tool-call blocks, background activity) and a composer with suggestions and context tags. Supports streaming states. | `messages` (`Message[]`), `onSend`, `isStreaming`, `suggestions`, `emptyHeading`, `placeholder`, `contextTags`, `onRemoveTag`, `className` |
| **StatusBar** | `status-bar.tsx` | 36px bottom status bar for canvas layouts. Left side: connection mode (cloud/local), branch, last published version with dirty flag, issues summary (errors + warnings). Right side: debug/evaluation placeholder icons, theme switcher. | `connectionMode` (`"cloud"` \| `"local"`), `branch`, `lastPublished`, `dirty`, `errorCount`, `warningCount`, `onIssuesClick`, `onDebugClick`, `onEvaluateClick`, `className` |
| **CanvasGrid** | `canvas-grid.tsx` | Dot-grid placeholder background for low-code canvas areas. Five type variants (agent, api-workflow, app, rpa-workflow, agentic-process) each with a distinct accent color, centered icon, and type label. Pure CSS radial-gradient dot pattern. | `type` (`CanvasType`), `className` |
| **CanvasWorkspace** | `canvas-workspace.tsx` | Tabbed workspace for canvas layouts. Renders a tab bar with file tabs (icon + label + close button) and a canvas grid for the active tab. Supports horizontal tab overflow with a dropdown menu for tab management (switch, close all, close others). | `tabs` (`CanvasTab[]`), `activeTabId`, `onTabSelect`, `onTabClose`, `onCloseAll`, `onCloseOthers`, `emptyState`, `className` |
| **ChangeHistoryPanel** | `change-history-panel.tsx` | Project change history timeline for canvas SidePanel. Displays a vertical timeline of milestones: current version (highlighted), published versions (success/error states with feed name), manual snapshots, and auto snapshots. Filter popover for toggling entry types. Use `useChangeHistoryPanel()` hook for SidePanel integration — returns `{ panel, headerActions }`. Header includes filter and take-snapshot buttons. | `entries` (`HistoryEntry[]`), `className` |
| **PropertiesPanel** | `properties/properties-panel.tsx` | Schema-driven properties panel for activity configuration. Renders dynamic form fields from a JSON schema with 14 widget types (text, select, combobox, radio, toggle, checkbox, tag input, rich text, date/time, file picker, rule builder, collection editor, dictionary editor, output). Includes activity header with icon badge + editable name, demo schema switcher, and `usePropertiesPanel()` hook for SidePanel integration. See [`components/custom/properties/PROPERTIES-COMPONENTS.md`](components/custom/properties/PROPERTIES-COMPONENTS.md) for full widget catalog, schema format, and usage details. | `schema`, `values`, `onChange`, `className` |
| **DebugPanel** | `debug-panel/debug-panel.tsx` | Studio-style bottom debug panel with resizable height and a resizable horizontal split. Left side: Run history (nested steps with selection, expand/collapse) and Breakpoints tabs. Right side: Locals (list + code view), Watches (inline edit + add), and Logs tabs. Data-driven: pass `runs`, `logsByRun`, `localsByRun`; `initialBreakpoints` / `initialWatches` seed internal editing state. Designed for the `bottomPanel` slot on `CanvasLayout`. | `open`, `runs`, `logsByRun`, `localsByRun`, `initialBreakpoints`, `initialWatches`, `defaultSelectedRunId`, `className` |
| **TerminalBottomPanel** | `terminal-bottom-panel.tsx` | VS Code–style interactive terminal for the `bottomPanel` slot on `CanvasLayout`. Resizable height, multi-session management (add/split/kill) with a session list sidebar, split-group layout (multiple panes side-by-side in one group), command history (↑/↓), and a built-in mock shell (`help`, `clear`, `version`, `build`, `test`, `deploy`, `ls`, `date`, `echo <text>`). Line types render with distinct colors: commands, info/success, error, system, and diff-add/remove/header. Ships with a long pre-seeded demo transcript. Self-contained — no data props. | `open`, `className` |
| **Custom icons** | `icons/` | Project-specific icons built with `createLucideIcon` from `lucide-react`, so they're indistinguishable from built-in lucide icons — same defaults (24×24, `strokeWidth={2}`, `currentColor`, round caps/joins), same prop surface (`size`, `color`, `absoluteStrokeWidth`, `className`, etc.), same `lucide` CSS class. Drop-in replacements anywhere a lucide icon would go. Import from the barrel: `import { VariablesIcon } from "@/components/custom/icons"`. Current icons: `VariablesIcon`, `CreateVariableIcon`, `CreateArgumentIcon`. To add a new icon: create `<name>.tsx` calling `createLucideIcon("<Name>Icon", [...paths])` with an `iconNode` array of `[tag, attrs]` pairs (strip the outer `<svg>`, keep only children), then re-export from `index.ts`. | Full `LucideProps` (matches built-in icons) |

> **Keep this table updated** — when adding a new custom component, add a row here.

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm link:local   # Link local apollo-wind for development
pnpm link:remote  # Switch back to npm registry apollo-wind
```

## Conventions

- **Path alias**: `@/*` maps to project root (configured in `tsconfig.json`), e.g. `@/components/layouts/my-layout`
- **File naming**: kebab-case for all folders and files (e.g., `stat-card-group.tsx`, `master-detail/`)
- **Minimal root layout**: Keep `app/layout.tsx` free of prototype-specific styles or providers
- **No nested layout.tsx**: Always wrap prototype pages in a layout from `components/layouts/` rather than adding `layout.tsx` files in prototype folders
- **`"use client"` directive**: Required on any component that uses React hooks, state, or event handlers. Layout components in `components/layouts/` often need this
- Use apollo-wind components as the foundation; only create custom components when combining multiple primitives into a reusable pattern
- **Verify GitHub commands**: Always ask for user confirmation before running GitHub-related commands (`gh`, `git push`, `git push --force`, `gh pr create`, `gh issue`, etc.). These commands affect remote/shared state and should never be executed without explicit approval.

## Prototype Metadata Defaults

When `prototype.json` is missing or has incomplete fields, the prototypes listing page applies these defaults:
- `title` - auto-generated from folder name (kebab-case to Title Case)
- `description` - "No description provided"
- `status` - "wip"
- `tags` - []
- `author` - "Unknown"
- `url` - null (optional)
- `createdAt` - null (optional)

## Icons

- Use **lucide-react** as the only icon source. Do not use other icon libraries.

## Borders

- Use **subtle borders** (`border-(--border-subtle)`) for borders that separate content sections, dividers, and layout separators. Keep default borders for basic UI components like inputs, cards, and dropdowns.
