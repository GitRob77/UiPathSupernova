---
name: add-page
description: >
  Add a new page or route to an existing prototype. Use when the user says "add a page",
  "create a settings page", "new route in prototype", or asks to add a page/route
  to an existing prototype.
---

# Add Page

Use when the user asks to add a new page/route to an existing prototype (e.g., "add a settings page to playground", "create a details page in demo-listing").

## Required information

Before creating any files, ensure you have the following. If not provided by the user, **ask** before proceeding:

1. **Prototype name** - The existing prototype folder under `app/prototypes/`. If ambiguous, list available prototypes and ask.
2. **Page name** - The kebab-case route segment for the new page (e.g., `settings`, `details`, `reports`). If the user gives a display name, convert it to kebab-case.

## Optional information (infer or default)

- **Layout template** - Which layout to wrap the page content in. Default to the same layout used by the prototype's `home/page.tsx`. If the user specifies a different layout, use that instead.
- **Page content** - Specific content or components for the page. If not provided, use the matching `_*-content.tsx` template as a starting point, or add placeholder content.

## Steps to add a page

1. **Verify the prototype exists**:
   - Check that `app/prototypes/<prototype-name>/` exists.
   - If it doesn't, inform the user and ask if they want to create the prototype first (suggest using `/create-prototype`).

2. **Check the page doesn't already exist**:
   - Check if `app/prototypes/<prototype-name>/<page-name>/page.tsx` already exists.
   - If it does, inform the user and ask how to proceed (overwrite, pick a different name, etc.).

3. **Determine the layout to use**:
   - Read the prototype's `home/page.tsx` to see which layout it imports.
   - Use the same layout unless the user specified a different one.
   - If a different layout is requested, verify it exists in `components/layouts/`.

4. **Create `app/prototypes/<prototype-name>/<page-name>/page.tsx`**:
   - Import the layout component from `@/components/layouts/<template>-layout`.
   - If a matching `_*-content.tsx` exists and no specific content was requested, inline its content as a starting point.
   - If specific content was described by the user, implement it.
   - If neither, add a minimal placeholder inside the layout.
   - Add `"use client"` directive if the page uses hooks or event handlers.
   - Example structure:
     ```tsx
     import { SomeLayout } from "@/components/layouts/some-layout";

     export default function <PrototypeName><PageName>Page() {
       return (
         <SomeLayout>
           {/* Page content */}
         </SomeLayout>
       );
     }
     ```

5. **Add navigation to the new page** (if applicable):
   - Check the prototype's existing pages for navigation patterns (sidebar nav items, tabs, header links).
   - If a pattern exists, add a nav item for the new page following the same pattern.
   - If no navigation pattern exists, suggest adding a link from `home/page.tsx` or mention that the user can navigate directly via URL.
   - Only modify existing files to add navigation if there's a clear, existing pattern to follow.

6. **Verify the page**:
   - Run `pnpm lint` to check for import errors.

7. **Report what was created**: List the new file path and any modified files (e.g., navigation updates) so the user knows what changed.

## Important

- Follow conventions in CLAUDE.md > Conventions (kebab-case, no nested layout.tsx, `@/*` aliases, `"use client"` when needed).
- Check `components/custom/` for existing components before building new ones (see CLAUDE.md > Component Priority).
- The function name should follow the pattern `<PrototypeName><PageName>Page` in PascalCase.
- **Prototype-local files**: If the page requires new components, create them under `app/prototypes/<prototype-name>/components/`, not in `components/custom/` (unless they are reusable across prototypes). Similarly, mock data goes in `app/prototypes/<prototype-name>/mock-data/` and types in `app/prototypes/<prototype-name>/types/`.
- If the page requires data, check whether the prototype already has `mock-data/` and `types/` directories and extend them rather than creating new ones.
