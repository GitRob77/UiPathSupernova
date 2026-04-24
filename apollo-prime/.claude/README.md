# Claude Code Configuration

This directory contains the Claude Code configuration for this project, including skills (slash commands), hooks (automatic guard rails), and settings.

## Skills

Skills are slash commands that Claude Code users can invoke to perform multi-step workflows. Use `/skills` to list them or type `/<skill-name>` to invoke one directly.

### Prototypes

| Command | Description |
|---------|-------------|
| `/create-prototype` | Scaffold a new prototype with folder structure, `prototype.json`, cover page, and home page. |
| `/clone-prototype` | Duplicate an existing prototype as a starting point for a new one. |
| `/add-page` | Add a new page or route to an existing prototype. |
| `/remove-prototype` | Remove/delete an existing prototype and all its files. |

### Design

| Command | Description |
|---------|-------------|
| `/implement-design` | Translate a Figma design into production-ready code with 1:1 visual fidelity. Requires Figma MCP server. |
| `/image-to-code` | Convert a screenshot or image into a faithful code reproduction. |

### Components

| Command | Description |
|---------|-------------|
| `/create-component` | Create a new reusable custom component built on apollo-wind primitives. |
| `/create-layout` | Create a new layout template for prototype pages. |

### Data Visualization

| Command | Description |
|---------|-------------|
| `/charts` | Create production-quality data visualizations (bar, line, area, donut, radar, scatter, dashboards, infographics, etc.). |

### Deployment

| Command | Description |
|---------|-------------|
| `/deploy` | Commit with a `[deploy]` tag and push to trigger a Vercel preview deployment. Also supports empty commits to re-trigger builds. |

## Hooks

Hooks are automatic guard rails that run before certain actions. They are configured in `settings.json` and enforced transparently — users don't need to invoke them.

### Branch Protection (`hooks/guard-main.sh`)

Runs automatically before every `git commit` and `git push` command. Prevents non-maintainers from committing or pushing directly to `main`/`master`.

**How it works:**

1. Checks the current branch name.
2. If on `main` or `master`, reads `CLAUDE.local.md` in the project root.
3. If the file contains the word "maintainer" (case-insensitive), the command is **allowed**.
4. Otherwise, the command is **blocked** with a message asking the user to create a feature branch.

**To grant maintainer access**, add a line like this to your `CLAUDE.local.md`:

```markdown
- Lead maintainer of this repo.
```

## File Structure

```
.claude/
  settings.json         # Hook configuration (shared, checked in)
  settings.local.json   # Local permissions (not checked in)
  hooks/
    guard-main.sh       # Branch protection hook script
  skills/
    add-page/           # /add-page skill
    charts/             # /charts skill
    clone-prototype/    # /clone-prototype skill
    create-component/   # /create-component skill
    create-layout/      # /create-layout skill
    create-prototype/   # /create-prototype skill
    deploy/             # /deploy skill
    image-to-code/      # /image-to-code skill
    implement-design/   # /implement-design skill
    remove-prototype/   # /remove-prototype skill
```
