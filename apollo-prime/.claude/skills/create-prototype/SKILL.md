---
name: create-prototype
description: >
  Scaffold a new prototype with folder structure, prototype.json, cover page, and home page.
  Use when the user says "create a prototype", "new prototype", "scaffold a prototype",
  or similar requests to start a new prototype from scratch.
---

# Create Prototype

Use when the user asks to create/scaffold a new prototype (e.g., "create a dashboard prototype", "new prototype called inventory").

## Required information

Before creating any files, ensure you have the following. If not provided by the user, **ask** before proceeding:

1. **Prototype name** - The kebab-case folder name (e.g., `inventory-dashboard`). If the user gives a display name, convert it to kebab-case for the folder and use the original as the title in `prototype.json`.
2. **Layout template** - Which layout to use. List available `*-layout.tsx` files from `components/layouts/`. See CLAUDE.md > Layouts for descriptions of each layout type.

## Optional information (infer or default)

These fields are **not** required from the user. Infer or auto-generate them. See CLAUDE.md > Prototype Metadata Defaults for fallback values.

- `title` - Infer from the prototype name (kebab-case to Title Case) unless the user specifies one
- `description` - Infer from context or use "No description provided"
- `status` - Default to `"wip"`
- `tags` - Infer from the layout type and user context, or default to `[]`
- `author` - Default to `"Unknown"` unless the user mentions one
- `url` - Default to `null`
- `createdAt` - Use today's date in `YYYY-MM-DD` format

## Steps to create a prototype

1. **Check the prototype doesn't already exist**:
   - Look for `app/prototypes/<name>/` — if it exists, inform the user and ask how to proceed.

2. **Check the chosen layout exists**:
   - Look for `components/layouts/<template>-layout.tsx`.
   - If it doesn't exist, inform the user that the layout needs to be created first. Ask if they want you to create it or pick a different one.

3. **Check for matching content template**:
   - Look for `components/layouts/_<template>-content.tsx`.
   - If it exists, this is the default content component to import into the prototype's `home/page.tsx`. If it doesn't, just add placeholder text.

4. **Create `app/prototypes/<name>/prototype.json`**:
   ```json
   {
     "title": "<Title>",
     "description": "<description>",
     "url": null,
     "status": "wip",
     "tags": [],
     "author": "Unknown",
     "createdAt": "YYYY-MM-DD"
   }
   ```

5. **Create `app/prototypes/<name>/page.tsx`** (the prototype cover page):
   - This is a **cover/landing page** for the prototype, NOT the main content.
   - It shows the prototype title, description, status badge, and navigation links.
   - Structure:
     ```tsx
     import Link from "next/link";
     import { Button } from "@uipath/apollo-wind/components/ui/button";
     import { Badge } from "@uipath/apollo-wind/components/ui/badge";

     export default function <Name>Page() {
       return (
         <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
           <div className="text-center">
             <h1 className="text-3xl font-bold tracking-tight"><Title></h1>
             <p className="mt-2 text-muted-foreground">
               <Description>
             </p>
             <Badge variant="secondary" className="mt-3">
               <status>
             </Badge>
           </div>
           <div className="flex gap-3">
             <Button variant="outline" asChild>
               <Link href="/prototypes">← Back to Prototypes</Link>
             </Button>
             <Button asChild>
               <Link href="/prototypes/<name>/home">Start Prototype</Link>
             </Button>
           </div>
         </div>
       );
     }
     ```

6. **Create `app/prototypes/<name>/home/page.tsx`** (the main prototype page):
   - This is the **actual main page** of the prototype where users land after clicking "Start Prototype".
   - Import the layout component from `@/components/layouts/<template>-layout`.
   - If a matching `_*-content.tsx` exists, **import it as a component** and render it inside the layout wrapper (same pattern as `app/starter-templates/`). This keeps content in sync with template updates and avoids copy-paste drift.
   - If no content template exists, add a minimal placeholder inside the layout.
   - Add `"use client"` directive if the page uses hooks or event handlers.
   - Example structure:
     ```tsx
     "use client";

     import { DashboardLayout } from "@/components/layouts/dashboard-layout";
     import { DashboardContent } from "@/components/layouts/_dashboard-content";

     export default function <Name>HomePage() {
       return (
         <DashboardLayout>
           <DashboardContent />
         </DashboardLayout>
       );
     }
     ```

7. **Scaffold prototype subdirectories** (for non-trivial prototypes):
   - If the user describes custom components, data, or types, create the following subdirectories:
     - `app/prototypes/<name>/components/` — prototype-specific components
     - `app/prototypes/<name>/mock-data/` — sample/mock data files
     - `app/prototypes/<name>/types/` — TypeScript type definitions
   - Skip this step for simple prototypes that only use the default content template.

8. **Verify the prototype**:
   - Run `pnpm lint` to check for import errors.
   - Optionally run `pnpm dev` to confirm it compiles.

9. **Report what was created**: List all created files and their paths so the user knows what was scaffolded.

## Important

- Follow conventions in CLAUDE.md > Conventions (kebab-case, no nested layout.tsx, `@/*` aliases, `"use client"` when needed).
- Use apollo-wind components as the foundation. See CLAUDE.md > Component Priority for import patterns.
- `page.tsx` is always the **cover page** — the main prototype content lives in `home/page.tsx`.
- If the user provides additional requirements (specific data, custom components, etc.), incorporate them after the base scaffold is created.
