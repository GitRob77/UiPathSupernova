### TODOs

- [] Deployment https://github.com/UiPath/design-deploy-template
- [] Templates
- [] Components

### Future Skills

Skills to help PM/UX designers build prototypes faster with Claude Code:

#### P0 — Core workflow
- **`/add-page`** — Add a new route/page to an existing prototype. Prompt for path and layout, generate the file with boilerplate.
- **`/from-figma`** — Given a Figma URL, pull the design via the Figma MCP server and generate a prototype page that matches it, using apollo-wind components and custom components from the repo.
- **`/sample-data`** — Generate realistic sample/mock data for a prototype (users, orders, tickets, etc.) as a typed TypeScript array ready to drop into a page.
- **`/deploy`** — Deploy a prototype to the hosting platform (using the design-deploy-template). Handle build, push, and return the live preview URL so designers can share it immediately.
- **`/share`** — Push the current prototype branch to GitHub and create a PR with auto-generated title, description, and screenshots. Optionally tag reviewers and link to the Figma source.

#### P1 — Common page types
- **`/add-table`** — Generate a data table page from a column spec or sample data (CSV/JSON). Wire up `@tanstack/react-table` with sorting, filtering, and pagination inside a listing layout.
- **`/add-form`** — Generate a form page from a list of field names/types. Output a working form with apollo-wind inputs, validation, and layout.
- **`/add-chart`** — Generate a chart/widget section from a data description (e.g. "monthly revenue bar chart"). Pick the right chart component and wire up sample data.
#### P2 — Nice to have
- **`/swap-layout`** — Switch an existing prototype page from one layout to another (e.g. dashboard → listing) while preserving content where possible.
- **`/add-sidebar`** — Add or configure a sidebar nav for a prototype, with customizable nav items and icons.
- **`/theme`** — Apply a visual theme or token overrides to a prototype (e.g. brand colors, dark mode adjustments) by generating scoped CSS or Tailwind config.