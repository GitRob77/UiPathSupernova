---
name: remove-prototype
description: >
  Remove/delete an existing prototype and all its files. Use when the user says
  "remove prototype", "delete prototype", or asks to remove a prototype from the project.
---

# Remove Prototype

Use when the user asks to remove/delete a prototype from the project (e.g., "remove the dashboard prototype", "delete master-detail").

## Dependency check

Before deleting components, grep the codebase to check whether they are imported by any OTHER prototype or file. A component is safe to delete only if the prototype being removed is its sole consumer.

## Steps to remove a prototype

1. **Identify the prototype name** from the user's request (the directory name under `app/prototypes/`). If the name is ambiguous or doesn't match an existing prototype directory, list the available prototypes and ask the user which one to remove before proceeding.

2. **Delete the prototype directory**:
   ```
   rm -rf app/prototypes/<name>/
   ```

3. **Clean up references** (if any):
   - Prototypes are auto-discovered by the listing page, so typically no cleanup is needed.
   - Check `app/page.tsx` for any hardcoded references to the prototype and remove them if found.

4. **Do NOT delete layout or custom components** — even if they become orphaned after removing the prototype. Components in `components/layouts/` and `components/custom/` must be preserved. They may be reused by future prototypes or referenced externally.

5. **Verify no breakage**:
   - Run `pnpm lint` to check for broken imports.
   - Optionally run `pnpm build` or `pnpm dev` to confirm the app still compiles.

6. **Report what was removed**: List all deleted files and cleaned-up references so the user knows exactly what changed.

## Important

- NEVER delete `app/prototypes/page.tsx` — that's the index page, not a prototype.
- Always grep before deleting components — another prototype may share them.
- Ask the user for confirmation before deleting if the prototype name is ambiguous.
