# Properties Panel Components — Status Tracker

> Reference doc for tracking build progress of dynamic properties panel widgets.
> Location: `components/custom/properties/`

---

## Core

| # | Component | File | Status | Notes |
|---|-----------|------|--------|-------|
| 1 | **PropertyField** | `property-field.tsx` | ✅ Built | Label, required `*`, error state, `@` variable binding, `⊞` advanced toggle, help text, default hint, output marker |
| 2 | **PropertiesRenderer** | `properties-renderer.tsx` | ✅ Built | Schema-driven renderer with WIDGET_MAP, internal/external state management |
| 3 | **PropertiesPanel** | `properties-panel.tsx` | ✅ Built | `usePropertiesPanel()` hook, demo schema switcher (Slack / Widget Showcase), activity header with icon badge + editable name |
| 4 | **PropertyConfigMenu** | `property-config-menu.tsx` | ✅ Built | Sliders-icon dropdown menu for widgets. `pattern`: `basic` \| `text` \| `output` \| `minimal` picks the "Use" section items. Optional `showForceRefresh` (schema-driven via `supportsRefresh`) adds `Force refresh` above `Remove property`; optional `showClearValue` adds `Clear value` at the bottom. `triggerSize`: `sm` (inline 5×5) or `md` (bordered 7×7). `onAction(action)` callback fires for each menu item |

## Widgets (14)

| # | Widget | File | Status | Notes |
|---|--------|------|--------|-------|
Every widget renders a `PropertyConfigMenu` (sliders icon) whose `pattern` / `showClearValue` values are listed in the `Config menu` column. Any field can opt into `Force refresh` via the schema flag `supportsRefresh`.

| # | Widget | File | Config menu | Notes |
|---|--------|------|-------------|-------|
| 1 | **TextInput** | `widgets/text-input.tsx` | `text` | text/number modes, multiline, units suffix, inline `@` variable icon inside input |
| 2 | **Select** | `widgets/select-widget.tsx` | `basic` | Dropdown with search, grouped options. Inline chevron, optional `@` variable icon. `loadOptions` async not wired (static options only) |
| 3 | **Combobox** | `widgets/combobox-widget.tsx` | `basic` | Typeahead combobox with inline search in trigger. Grouped options, inline chevron, optional `@` variable icon. `loadOptions` async not wired (static options only) |
| 4 | **RadioGroup** | `widgets/radio-group.tsx` | `basic` (md trigger) | Horizontal/vertical direction, nullable support |
| 5 | **Toggle** | `widgets/toggle.tsx` | `basic` (md trigger) | Compact switch with on/off labels |
| 6 | **CheckboxGroup** | `widgets/checkbox-group.tsx` | `basic` (md trigger) | Grid (configurable columns) and vertical layout variants |
| 7 | **TagInput** | `widgets/tag-input.tsx` | `text` | Popover + Command dropdown, light blue chips with optional icons, inline `@` variable icon, blue focus ring. Custom entries via Enter/comma/semicolon |
| 8 | **RichTextEditor** | `widgets/rich-text-editor.tsx` | `text` + Clear value | ToggleGroup toolbar + plain Textarea. Inline `@` variable icon in toolbar. Blue focus ring. Formatting state tracked but not applied to content |
| 9 | **DateTimePicker** | `widgets/date-time-picker.tsx` | `text` | Custom Popover with calendar grid + Select dropdowns for month/year/hour/minute. 24h time format |
| 10 | **FilePicker** | `widgets/file-picker.tsx` | `minimal` | Path input with inline browse/`@` icons + source selector (local/cloud). Use this instead of TextInput for file paths. Browse is simulated (no actual dialog) |
| 11 | **ConditionBuilder** | `widgets/rule-builder.tsx` | `basic` + Clear value (md trigger) | WIP placeholder. Custom AND/OR condition composer with field/operator/value rows. Supports nested groups. No drag-and-drop |
| 12 | **CollectionEditor** | `widgets/collection-editor.tsx` | `basic` + Clear value (md trigger) | WIP placeholder. Editable string array with add/remove. Reorder via button (no drag-and-drop) |
| 13 | **DictionaryEditor** | `widgets/dictionary-editor.tsx` | `basic` + Clear value (md trigger) | WIP placeholder. Key-value pair editor with add/remove. Column headers |
| 14 | **OutputField** | `widgets/output-field.tsx` | `output` | Read-only Badge with variable icon + type label |

## Layout (3)

| # | Component | File | Status | Notes |
|---|-----------|------|--------|-------|
| 1 | **Section** | `layout/section.tsx` | ✅ Built | Collapsible accordion (apollo-wind Accordion). Null title renders flat without collapsible |
| 2 | **InlineHelp** | `layout/inline-help.tsx` | ✅ Built | info/warning/tip variants with colored background + icon |
| 3 | **ActionButton** | `layout/action-button.tsx` | ✅ Built | primary/secondary/link variants. Link renders as `+ Label` text button |

## Demo Data

| Schema | File | Description |
|--------|------|-------------|
| Slack: Send Message | `data/slack-send-message.ts` | Realistic activity with 5 sections: target, recipients, options, advanced, output |
| Widget Showcase | `data/widget-showcase.ts` | All 13 widget types + error states + global actions |

## Integration Points

| Page | Status | Notes |
|------|--------|-------|
| `/starter-templates/canvas` | Wired | `usePropertiesPanel()` replaces PanelPlaceholder in right panel |
| `/prototypes/canvas/home` | Wired | Same integration |

---

## Known Limitations / Future Work

- [ ] **Select `loadOptions`** — async option loading not implemented, only static options
- [ ] **RichTextEditor** — prototype only, formatting toolbar toggles state but doesn't apply to text
- [ ] **FilePicker browse** — simulated button, no actual file dialog
- [ ] **RuleBuilder** — no drag-and-drop for rule reordering, no nested group creation UI
- [ ] **CollectionEditor** — items are plain strings only, no typed item rendering
- [ ] **DictionaryEditor** — values are plain strings, no typed value widgets
- [ ] **PropertyField `@` and `⊞` buttons** — UI is present but handlers are no-ops
- [ ] **"Use variable" (`@`) menu** — popover/dropdown for selecting variables when clicking the `@` icon on fields
- [ ] **Config menu (generic)** — popover/dropdown for the `⊞` configuration button across all widgets
- [ ] **Error states on fields** — visual error treatment beyond the red border + message (e.g. inline validation, field-level error icons, shake animation)
- [ ] **Schema-driven renderer** — no conditional visibility (show/hide based on other field values)
- [ ] **Keyboard navigation** — not thoroughly tested across all widgets
