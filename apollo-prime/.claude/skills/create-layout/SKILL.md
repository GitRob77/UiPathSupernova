---
name: create-layout
description: >
  Create a new layout template for prototypes. Use when the user says "create a layout",
  "new layout template", "add a layout", or asks to build a new layout wrapper
  for prototype pages.
---

# Create Layout

Use when the user asks to create a new layout template (e.g., "create a form layout", "new layout for wizard flows", "add a split-view layout").

## Required information

Before creating any files, ensure you have the following. If not provided by the user, **ask** before proceeding:

1. **Layout name** - kebab-case (e.g., `form`, `wizard`, `split-view`). The file will be `<name>-layout.tsx`.
2. **Visual structure** - Describe the layout regions: header, sidebars, panels, footer, content area slots.

## Steps to create a layout

1. **Check existing layouts won't suffice**:
   - Review `components/layouts/` for layouts that could be extended with props instead of creating a new one.
   - Available: `dashboard-layout`, `listing-layout`, `canvas-layout`, `empty-layout`.
   - If an existing layout covers 80%+ of the need, suggest extending it with new props instead.

2. **Read the closest existing layout** for pattern reference:
   - Panel-heavy designs → read `canvas-layout.tsx`
   - Sidebar designs → read `dashboard-layout.tsx`
   - Table/data designs → read `listing-layout.tsx`
   - Minimal designs → read `empty-layout.tsx`

3. **Create `components/layouts/<name>-layout.tsx`**:
   - Accept `children: React.ReactNode` as the main content slot
   - Accept additional named slot props for sidebars, panels, headers, footers as needed
   - Use `AppHeader` from `@/components/custom/app-header` for the top bar
   - Use `SidePanel` / `SidebarNav` from `@/components/custom/` for side regions
   - Use `StatusBar` if the layout needs a bottom bar
   - Add `"use client"` — layouts almost always need it for interactive state
   - Use named export: `export function <Name>Layout({ ... })`

   Example structure:
   ```tsx
   "use client";

   import { AppHeader } from "@/components/custom/app-header";

   interface <Name>LayoutProps {
     children: React.ReactNode;
     productName?: string;
     // ... slot props
   }

   export function <Name>Layout({
     children,
     productName = "<Name>",
   }: <Name>LayoutProps) {
     return (
       <div className="flex h-screen flex-col overflow-hidden">
         <AppHeader productName={productName} />
         <main className="flex-1 overflow-auto">{children}</main>
       </div>
     );
   }
   ```

4. **Create `components/layouts/_<name>-content.tsx`** (starter content):
   - Export a named component: `export function <Name>Content()`
   - Include realistic placeholder content that demonstrates the layout's intended use
   - Use apollo-wind components and `components/custom/` components
   - Add `"use client"` if it uses hooks or state

5. **Create `app/starter-templates/<name>/page.tsx`**:
   - Import both the layout and content component
   - Follow the exact pattern from existing starter templates:
   ```tsx
   "use client";

   import { <Name>Layout } from "@/components/layouts/<name>-layout";
   import { <Name>Content } from "@/components/layouts/_<name>-content";

   export default function <Name>DemoPage() {
     return (
       <<Name>Layout>
         <<Name>Content />
       </<Name>Layout>
     );
   }
   ```

6. **Update CLAUDE.md**:
   - Add the layout to the "Available layouts" list with its description and supported props
   - Add the content template to the "Content Templates" list

7. **Verify**: Run `pnpm lint` to check for errors.

8. **Report**: List all created files.

## Important

- Follow conventions in CLAUDE.md > Conventions (kebab-case, `@/*` aliases, `"use client"` when needed).
- Use `components/custom/` components as building blocks (AppHeader, SidebarNav, SidePanel, StatusBar, TabsNav, etc.).
- Layouts should be composable — accept slot props rather than hardcoding content.
- Keep the root `app/layout.tsx` free of layout-specific styles or providers.
