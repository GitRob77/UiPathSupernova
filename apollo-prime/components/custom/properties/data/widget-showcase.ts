import type { PropertiesPanelSchema } from "../types";

export const widgetShowcaseSchema: PropertiesPanelSchema = {
  title: "Widget Showcase",
  subtitle: "All 13 widget types",
  activityHeader: {
    displayName: "Widget Showcase",
    typeLabel: "All 13 widget types",
    icon: "LayoutGrid",
    iconColor: "#6366f1",
  },
  sections: [
    {
      id: "text-inputs",
      title: "Text Inputs",
      defaultOpen: false,
      fields: [
        {
          id: "demo-text",
          widget: "text-input",
          label: "Plain text",
          supportsVariables: true,
          widgetProps: { placeholder: "Enter text…" },
        },
        {
          id: "demo-number",
          widget: "text-input",
          label: "Number with units",
          widgetProps: {
            mode: "number",
            placeholder: "0",
            units: "seconds",
            min: 0,
            max: 300,
          },
        },
        {
          id: "demo-filepath",
          widget: "file-picker",
          label: "File path",
          supportsAdvanced: true,
          widgetProps: {
            mode: "file",
          },
        },
        {
          id: "demo-multiline",
          widget: "text-input",
          label: "Multiline text",
          supportsVariables: true,
          supportsAdvanced: true,
          widgetProps: {
            multiline: true,
            placeholder: "Enter a longer description…",
          },
        },
      ],
    },
    {
      id: "selection",
      title: "Selection",
      defaultOpen: false,
      fields: [
        {
          id: "demo-select",
          widget: "select",
          label: "Basic dropdown",
          required: true,
          widgetProps: {
            options: [
              { value: "single", label: "Single click" },
              { value: "double", label: "Double click" },
              { value: "hover", label: "Hover" },
              { value: "right", label: "Right click" },
            ],
            placeholder: "Select click type…",
          },
        },
        {
          id: "demo-select-searchable",
          widget: "select",
          label: "Searchable & grouped",
          widgetProps: {
            options: [
              { value: "low", label: "Low", group: "Priority" },
              { value: "medium", label: "Medium", group: "Priority" },
              { value: "high", label: "High", group: "Priority" },
              { value: "critical", label: "Critical", group: "Priority" },
              { value: "info", label: "Informational", group: "Severity" },
              { value: "warning", label: "Warning", group: "Severity" },
              { value: "error", label: "Error", group: "Severity" },
            ],
            searchable: true,
            grouped: true,
            placeholder: "Search or select…",
          },
        },
        {
          id: "demo-select-refresh",
          widget: "select",
          label: "Dynamic with refresh",
          widgetProps: {
            options: [
              { value: "conn-1", label: "Production API" },
              { value: "conn-2", label: "Staging API" },
            ],
            searchable: true,
            placeholder: "Select connection…",
          },
        },
        {
          id: "demo-combobox",
          widget: "combobox",
          label: "Combobox (typeahead)",
          supportsVariables: true,
          supportsRefresh: true,
          helpText: "Has Force refresh in the config menu (supportsRefresh).",
          widgetProps: {
            options: [
              { value: "us-east-1", label: "US East (N. Virginia)", group: "Americas" },
              { value: "us-west-2", label: "US West (Oregon)", group: "Americas" },
              { value: "eu-west-1", label: "EU (Ireland)", group: "Europe" },
              { value: "eu-central-1", label: "EU (Frankfurt)", group: "Europe" },
              { value: "ap-southeast-1", label: "Asia Pacific (Singapore)", group: "Asia Pacific" },
            ],
            grouped: true,
            placeholder: "Search region…",
          },
        },
        {
          id: "demo-combobox-flat",
          widget: "combobox",
          label: "Combobox (flat)",
          widgetProps: {
            options: [
              { value: "json", label: "JSON" },
              { value: "xml", label: "XML" },
              { value: "csv", label: "CSV" },
              { value: "yaml", label: "YAML" },
              { value: "protobuf", label: "Protocol Buffers" },
            ],
            placeholder: "Search format…",
          },
        },
        {
          id: "demo-radio",
          widget: "radio-group",
          label: "Radio group (horizontal)",
          widgetProps: {
            options: [
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "default", label: "System default" },
            ],
            nullable: true,
          },
        },
        {
          id: "demo-radio-vertical",
          widget: "radio-group",
          label: "Radio group (vertical)",
          widgetProps: {
            options: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ],
            direction: "vertical",
          },
        },
        {
          id: "demo-toggle",
          widget: "toggle",
          label: "Toggle switch",
          helpText: "A simple on/off control for boolean flags.",
          widgetProps: {
            onLabel: "Enabled",
            offLabel: "Disabled",
          },
        },
        {
          id: "demo-checkbox",
          widget: "checkbox-group",
          label: "Checkbox group (grid)",
          widgetProps: {
            options: [
              { value: "alt", label: "Alt/Opt" },
              { value: "ctrl", label: "Ctrl" },
              { value: "shift", label: "Shift" },
              { value: "meta", label: "Win/Cmd" },
            ],
            layout: "grid",
            columns: 2,
          },
        },
        {
          id: "demo-checkbox-vertical",
          widget: "checkbox-group",
          label: "Checkbox group (vertical)",
          widgetProps: {
            options: [
              { value: "read", label: "Read" },
              { value: "write", label: "Write" },
              { value: "execute", label: "Execute" },
              { value: "delete", label: "Delete" },
            ],
            layout: "vertical",
          },
        },
      ],
    },
    {
      id: "tags-rich",
      title: "Tags & Rich Text",
      defaultOpen: false,
      fields: [
        {
          id: "demo-tags",
          widget: "tag-input",
          label: "Tag input",
          supportsVariables: true,
          widgetProps: {
            placeholder: "Search countries…",
            suggestions: [
              { value: "United States", label: "United States", icon: "Globe" },
              { value: "United Kingdom", label: "United Kingdom", icon: "Globe" },
              { value: "Germany", label: "Germany", icon: "Globe" },
              { value: "France", label: "France", icon: "Globe" },
              { value: "Japan", label: "Japan", icon: "Globe" },
              { value: "Australia", label: "Australia", icon: "MapPin" },
              { value: "Canada", label: "Canada", icon: "MapPin" },
              { value: "Brazil", label: "Brazil", icon: "MapPin" },
            ],
          },
        },
        {
          id: "demo-richtext",
          widget: "rich-text-editor",
          label: "Rich text editor",
          widgetProps: {
            toolbar: ["bold", "italic", "underline", "code", "ol", "ul"],
            placeholder: "Compose your message…",
          },
        },
      ],
    },
    {
      id: "datetime-file",
      title: "Date/Time & Files",
      defaultOpen: false,
      fields: [
        {
          id: "demo-date",
          widget: "date-time-picker",
          label: "Date picker",
          widgetProps: { mode: "date" },
        },
        {
          id: "demo-time",
          widget: "date-time-picker",
          label: "Time picker",
          widgetProps: { mode: "time" },
        },
        {
          id: "demo-datetime",
          widget: "date-time-picker",
          label: "Date & time",
          widgetProps: { mode: "datetime" },
        },
      ],
    },
    {
      id: "advanced-widgets",
      title: "Advanced Widgets",
      defaultOpen: false,
      fields: [
        {
          id: "demo-rules",
          widget: "rule-builder",
          label: "Condition builder",
          helpText: "Build filter conditions with AND/OR logic.",
          widgetProps: {
            fields: [
              { name: "status", label: "Status", type: "string" },
              { name: "priority", label: "Priority", type: "string" },
              { name: "age", label: "Age (days)", type: "number" },
              { name: "assignee", label: "Assignee", type: "string" },
            ],
          },
        },
        {
          id: "demo-collection",
          widget: "collection-editor",
          label: "Collection editor",
          widgetProps: {
            addLabel: "Add argument",
            reorderable: true,
            itemPlaceholder: "Enter value…",
          },
        },
        {
          id: "demo-dictionary",
          widget: "dictionary-editor",
          label: "Dictionary editor",
          widgetProps: {
            keyLabel: "Name",
            valueLabel: "Value",
            keyPlaceholder: "Parameter name",
            valuePlaceholder: "Parameter value",
          },
        },
      ],
      helpBlock: {
        variant: "info",
        message:
          "Advanced widgets support complex data structures like rules, collections, and key-value pairs.",
      },
    },
    {
      id: "output-section",
      title: "Output",
      defaultOpen: false,
      fields: [
        {
          id: "demo-output-1",
          widget: "output-field",
          label: "Result",
          isOutput: true,
          direction: "output",
          widgetProps: { name: "ProcessResult", type: "Object" },
        },
        {
          id: "demo-output-2",
          widget: "output-field",
          label: "Status code",
          isOutput: true,
          direction: "output",
          widgetProps: { name: "StatusCode", type: "Int32" },
        },
      ],
    },
    {
      id: "error-states",
      title: "Error & Validation States",
      defaultOpen: false,
      fields: [],
      helpBlock: {
        variant: "info",
        message:
          "Error and validation state demos are coming soon.",
      },
    },
    {
      id: "buttons",
      title: "Buttons",
      defaultOpen: false,
      fields: [],
      actions: [
        { id: "link-plain", label: "Add Connection", variant: "link" },
        {
          id: "link-icon",
          label: "Add Property",
          variant: "link",
          icon: "Plus",
        },
        {
          id: "primary-centered",
          label: "Save Changes",
          variant: "primary",
          align: "center",
        },
      ],
    },
  ],
};
