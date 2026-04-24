# Apollo Prime

A scaffold repo to quickly prototype designs over the [@uipath/apollo-wind](https://www.npmjs.com/package/@uipath/apollo-wind) component library.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- @uipath/apollo-wind (component library)
- @tanstack/react-table
- lucide-react (icons)
- pnpm (package manager)

## Getting Started

```bash
git clone https://github.com/uipath-product/apollo-prime.git
cd apollo-prime
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  layout.tsx              # Root layout - kept minimal (fonts + globals only)
  page.tsx                # Cover/landing page for the entire project
  globals.css             # Global styles
  starter-templates/
    page.tsx              # Landing page listing all starter templates as cards
    <layout-name>/
      page.tsx            # Starter template page (imports _*-content.tsx directly)
  prototypes/
    page.tsx              # Landing page listing all prototypes (reads first-level folders)
    <prototype-name>/
      prototype.json      # Metadata for the prototype
      page.tsx            # Cover/landing page for the prototype
      home/
        page.tsx          # Main page / entry point for the prototype
      ...                 # Additional routes/files for the prototype
  docs/                   # Documentation pages (placeholder)
components/
  custom/                 # Custom reusable components built on apollo-wind
  app-specific/           # Components tied to specific app context (e.g. nav-widget)
  layouts/                # Layout wrappers and default content templates
    *-layout.tsx          # Layout wrappers (structure/chrome)
    _*-content.tsx        # Default starter content for each layout type
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Cover page for the project |
| `/starter-templates` | Landing page listing all layout demos as cards |
| `/starter-templates/dashboard` | Dashboard layout demo |
| `/starter-templates/listing` | Listing layout demo |
| `/starter-templates/canvas` | Canvas layout demo |
| `/starter-templates/empty` | Empty layout demo |
| `/prototypes` | Landing page that auto-discovers prototypes |
| `/prototypes/<name>` | Prototype cover/landing page |
| `/prototypes/<name>/home` | Main prototype page (entry point) |

## Starter Templates

The `app/starter-templates/` folder showcases each available layout with its matching `_*-content.tsx` imported directly as a component. Starter template pages always reflect the latest content template changes without copy-paste drift.

**Available starter templates:**

| Template | Route | Description |
| --- | --- | --- |
| **Dashboard** | `/starter-templates/dashboard` | Stat cards, charts, and summary widgets |
| **Listing** | `/starter-templates/listing` | Data table with tabs, filters, and pagination |
| **Canvas** | `/starter-templates/canvas` | Canvas area with optional left/right side panels |
| **Empty** | `/starter-templates/empty` | Minimal layout with just AppHeader and content area |

Each demo page wraps the corresponding content component in its layout:

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

## Prototypes

Each prototype is a folder under `app/prototypes/`. The index page at `/prototypes` automatically discovers every first-level folder and displays it as a card.

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

2. **`page.tsx`** - Cover/landing page (title, description, status badge, link to `/home`)

3. **`home/page.tsx`** - Main prototype page, wrapped in a layout component

### Creating a New Prototype

1. Create a folder under `app/prototypes/<prototype-name>/`
2. Add a `prototype.json` with the metadata fields above
3. Add a `page.tsx` as the cover page
4. Add a `home/page.tsx` wrapped in a layout component from `components/layouts/`
5. Unless instructed otherwise, use the matching `_*-content.tsx` as the default content

### Metadata Defaults

When `prototype.json` is missing or incomplete:
- `title` - auto-generated from folder name (kebab-case to Title Case)
- `description` - "No description provided"
- `status` - "wip"
- `tags` - `[]`
- `author` - "Unknown"
- `url` / `createdAt` - null (optional)

## Components

### Component Priority

When building a prototype page, follow this priority order:

1. **Custom components** (`components/custom/`) - project's curated reusable building blocks
2. **apollo-wind base components** - `@uipath/apollo-wind` or `@uipath/apollo-wind/components/ui/*`
3. **Build from primitives** - apollo-wind primitives + Tailwind as a fallback

### Layouts (`components/layouts/`)

Layouts are template wrappers used inside prototype `home/page.tsx` files. This keeps `app/layout.tsx` minimal and avoids layout nesting issues.

| Layout | File | Description |
| --- | --- | --- |
| **Dashboard** | `dashboard-layout.tsx` | Stat cards, charts, and summary widgets |
| **Listing** | `listing-layout.tsx` | Data table with tabs, filters, optional left/right side panels |
| **Canvas** | `canvas-layout.tsx` | Canvas area with optional left/right `SidePanel` rails |
| **Empty** | `empty-layout.tsx` | Minimal layout with just AppHeader and content area |

### Content Templates (`components/layouts/_*-content.tsx`)

Default starter content for each layout type:

- `_dashboard-content.tsx` - Stat cards, charts, widgets
- `_listing-content.tsx` - Sample data table, filters, actions
- `_canvas-content.tsx` - Canvas demo content
- `_empty-content.tsx` - Placeholder content

### Custom Components (`components/custom/`)

Reusable components built on top of apollo-wind primitives. See also: [Properties Panel Components](components/custom/properties/PROPERTIES-COMPONENTS.md) for the dynamic properties panel widget system.

| Component | File | Description |
| --- | --- | --- |
| **AppHeader** | `app-header.tsx` | Top-level app header with waffle menu, search, notifications, profile |
| **SidebarNav** | `sidebar-nav.tsx` | Resizable/collapsible sidebar shell with render prop `children({ collapsed, side })` |
| **SidebarNavItems** | `sidebar-nav-items.tsx` | Scrollable list of icon+label nav items with tooltips |
| **StatusChip** | `status-chip.tsx` | Compact status/priority badge with semantic color variants |
| **TabsNav** | `tabs-nav.tsx` | Tab navigation (primary/secondary/tiny variants) |
| **FilterBar** | `filter-bar.tsx` | Toolbar row with search, column visibility, filters, view switcher, actions |
| **DataGrid** | `data-grid.tsx` | FilterBar + Table + pagination using TanStack React Table |
| **SidePanel** | `side-panel.tsx` | Persistent icon rail with expandable/resizable content panels |
| **Toolbar** | `toolbar.tsx` | Configurable button toolbar with simple buttons, dropdowns, and split buttons |
| **ExplorerPanel** | `explorer-panel.tsx` | Solution project structure tree for canvas SidePanel |
| **HealthAnalyzerPanel** | `health-analyzer-panel.tsx` | Health analyzer (issues/errors/warnings) panel for SidePanel |
| **DataManagerPanel** | `data-manager-panel.tsx` | Data manager panel with collapsible variable categories for SidePanel |
| **StatusBar** | `status-bar.tsx` | Bottom status bar for canvas layouts (connection, branch, issues, theme switcher) |
| **CanvasGrid** | `canvas-grid.tsx` | Dot-grid placeholder background for low-code canvas areas |
| **CanvasWorkspace** | `canvas-workspace.tsx` | Tabbed workspace with file tabs and canvas grid for active tab |
| **ChangeHistoryPanel** | `change-history-panel.tsx` | Project change history timeline for canvas SidePanel |
| **AutopilotPanel** | `autopilot-panel.tsx` | Chat-style autopilot panel with streaming conversation stream (user/reasoning/AI/tool-call/activity) and composer with suggestions + context tags |
| **PropertiesPanel** | `properties/properties-panel.tsx` | Schema-driven properties panel with 14 widget types for activity configuration |

### App-Specific Components (`components/app-specific/`)

Components tied to specific application context, not intended for general reuse:

| Component | File | Description |
| --- | --- | --- |
| **NavWidget** | `nav-widget.tsx` | Navigation popover for switching between project routes |

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm link:local   # Link local apollo-wind for development
pnpm link:remote  # Switch back to npm registry apollo-wind
```

### Local Linking Workflow

To use a local development version of apollo-wind (from `~/Work/apollo-ui`):

```bash
# Build the local package first
cd ~/Work/apollo-ui && pnpm --filter @uipath/apollo-wind build

# Link it
pnpm run link:local
```

To revert back to the published npm version:

```bash
pnpm run link:remote
```

## Conventions

- **Path alias**: `@/*` maps to project root (configured in `tsconfig.json`)
- **File naming**: kebab-case for all folders and files
- **Minimal root layout**: Keep `app/layout.tsx` free of prototype-specific styles or providers
- **No nested layout.tsx**: Wrap prototype pages in a layout from `components/layouts/` instead
- **`"use client"`**: Required on any component that uses React hooks, state, or event handlers
- **Icons**: Use **lucide-react** as the only icon source
- **Borders**: Use subtle borders (`border-(--border-subtle)`) for layout separators; default borders for basic UI elements
