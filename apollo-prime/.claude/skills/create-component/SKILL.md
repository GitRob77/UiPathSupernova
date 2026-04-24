---
name: create-component
description: >
  Create a new reusable custom component built on apollo-wind primitives. Use when the user
  says "create a component", "new custom component", "extract into a shared component",
  or asks to build a reusable UI component.
---

# Create Custom Component

Use when the user asks to create a new reusable component (e.g., "create a status card component", "new custom component for breadcrumbs", "extract this into a shared component").

## Required information

Before creating any files, ensure you have the following. If not provided by the user, **ask** before proceeding:

1. **Component name** - kebab-case for the file (e.g., `stat-card-group`), PascalCase for the export (e.g., `StatCardGroup`).
2. **Purpose** - What the component does and when to use it.

## Steps to create a custom component

1. **Check for existing overlap**:
   - Review the custom components table in CLAUDE.md.
   - Search `components/custom/` for components with similar functionality.
   - If a similar component exists, suggest extending it instead. Only proceed with a new component if the use case is genuinely distinct.

2. **Read 1-2 similar existing components** to match the local pattern:
   - Simple components (no state): use `status-chip.tsx` as reference
   - Complex components (state, panels, hooks): use `side-panel.tsx` or `data-grid.tsx` as reference
   - Observe: typed props interface, `className` passthrough, apollo-wind token usage, array-join or `cn()` for class composition

3. **Create `components/custom/<name>.tsx`** following these conventions:
   - **Props interface**: Named `<ComponentName>Props`, exported if other components may need it
   - **`className` prop**: Always accept an optional `className` prop for external styling
   - **Apollo-wind tokens**: Use semantic tokens (e.g., `text-(--color-foreground)`, `bg-(--color-background-secondary)`) over hardcoded colors
   - **Tailwind classes**: Use Tailwind utilities for layout and spacing
   - **`"use client"`**: Add directive only if the component uses hooks, state, or event handlers
   - **Exports**: Use named exports (not default exports)
   - **Icons**: Use `lucide-react` only

   Example structure:
   ```tsx
   // "use client"; // only if needed

   interface MyComponentProps {
     children: React.ReactNode;
     variant?: "default" | "accent";
     className?: string;
   }

   export function MyComponent({
     children,
     variant = "default",
     className,
   }: MyComponentProps) {
     return (
       <div className={["base-styles", variantStyles[variant], className].filter(Boolean).join(" ")}>
         {children}
       </div>
     );
   }
   ```

4. **Export types if needed**: If the component defines types that consumers need (e.g., item types for a list component), export them from the component file.

5. **Update CLAUDE.md** — Add a row to the custom components table:
   ```
   | **ComponentName** | `file-name.tsx` | Description of what it does | `key`, `props`, `listed` |
   ```

6. **Verify**: Run `pnpm lint` to check for errors.

7. **Report**: List the created file and the CLAUDE.md update.

## Important

- Follow CLAUDE.md > Component Priority: only create a new custom component when no existing apollo-wind or custom component covers the need.
- Keep components focused — one component per file, one responsibility per component.
- Do not add features beyond what was requested. No speculative props "for future use".
- Use `border-(--border-subtle)` for section dividers, default borders for UI element borders.
