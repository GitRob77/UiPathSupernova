---
name: clone-prototype
description: >
  Duplicate/clone an existing prototype as a starting point for a new one. Use when the user
  says "clone prototype", "duplicate prototype", "fork prototype", or asks to copy an
  existing prototype as a base for a new one.
---

# Clone Prototype

Use when the user asks to duplicate/clone/fork an existing prototype as a starting point for a new one (e.g., "clone the canvas prototype", "duplicate maestro-1 as maestro-2", "fork screenplay for a new version").

## Required information

Before cloning, ensure you have the following. If not provided by the user, **ask** before proceeding:

1. **Source prototype** - The existing prototype folder name under `app/prototypes/`. If ambiguous, list available prototypes and ask.
2. **New prototype name** - kebab-case folder name for the clone (e.g., `maestro-2`).

## Optional information (infer or default)

- `title` - Infer from the new name (kebab-case to Title Case) unless the user specifies one
- `description` - Copy from source unless the user provides a new one

## Steps to clone a prototype

1. **Verify the source prototype exists**:
   - Check that `app/prototypes/<source>/` exists.
   - If not, list available prototypes and ask which one to clone.

2. **Check the new name doesn't conflict**:
   - Verify `app/prototypes/<new-name>/` doesn't already exist.

3. **Copy the prototype directory**:
   ```
   cp -r app/prototypes/<source>/ app/prototypes/<new-name>/
   ```

4. **Update `prototype.json`**:
   - Set `title` to the new title (from new name or user-provided)
   - Set `status` to `"wip"`
   - Set `createdAt` to today's date (`YYYY-MM-DD`)
   - Keep or update `description`, `tags`, `author` as appropriate

5. **Fix internal references**:
   - In `page.tsx` (cover page): update the `href` links from `/prototypes/<source>/` to `/prototypes/<new-name>/`
   - Search all files in the new prototype folder for references to the old prototype name and update them

6. **Verify**: Run `pnpm lint` to check for broken imports.

7. **Report**: List the cloned directory and any files that were modified.

## Important

- Prototypes are auto-discovered, so no updates to `app/page.tsx` or `app/prototypes/page.tsx` are needed.
- The clone is a full independent copy — changes to the clone do not affect the source.
- If the source prototype has prototype-specific components in its `components/` folder, those are copied too and remain independent.
