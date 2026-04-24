/* ------------------------------------------------------------------ */
/*  Properties Panel — Type Definitions                                */
/* ------------------------------------------------------------------ */

/** Widget type discriminator */
export type PropertyWidgetType =
  | "text-input"
  | "select"
  | "combobox"
  | "radio-group"
  | "toggle"
  | "checkbox-group"
  | "tag-input"
  | "rich-text-editor"
  | "date-time-picker"
  | "file-picker"
  | "rule-builder"
  | "collection-editor"
  | "dictionary-editor"
  | "output-field";

/* ------------------------------------------------------------------ */
/*  Widget-specific props                                              */
/* ------------------------------------------------------------------ */

export interface TextInputWidgetProps {
  placeholder?: string;
  mode?: "text" | "number";
  multiline?: boolean;
  units?: string;
  min?: number;
  max?: number;
}

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SelectWidgetProps {
  options?: SelectOption[];
  loadOptions?: (query: string) => Promise<SelectOption[]>;
  searchable?: boolean;
  grouped?: boolean;
  placeholder?: string;
}

export interface ComboboxWidgetProps {
  options?: SelectOption[];
  loadOptions?: (query: string) => Promise<SelectOption[]>;
  grouped?: boolean;
  placeholder?: string;
  emptyText?: string;
}

export interface RadioGroupWidgetProps {
  options: { value: string; label: string }[];
  nullable?: boolean;
  direction?: "horizontal" | "vertical";
}

export interface ToggleWidgetProps {
  onLabel?: string;
  offLabel?: string;
}

export interface CheckboxGroupWidgetProps {
  options: { value: string; label: string }[];
  layout?: "grid" | "vertical";
  columns?: number;
}

export interface TagSuggestion {
  value: string;
  label: string;
  icon?: string;
}

export interface TagInputWidgetProps {
  placeholder?: string;
  suggestions?: (string | TagSuggestion)[];
  allowCustom?: boolean;
  max?: number;
}

export interface RichTextEditorWidgetProps {
  toolbar?: ("bold" | "italic" | "underline" | "code" | "ol" | "ul")[];
  placeholder?: string;
}

export interface DateTimePickerWidgetProps {
  mode?: "date" | "time" | "datetime";
  placeholder?: string;
}

export interface FilePickerWidgetProps {
  mode?: "file" | "folder" | "both";
  source?: "local" | "cloud" | "both";
  filters?: string[];
}

export interface RuleField {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "date";
}

export interface RuleOperator {
  value: string;
  label: string;
}

export interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface RuleGroup {
  id: string;
  operator: "AND" | "OR";
  rules: (Rule | RuleGroup)[];
}

export interface RuleBuilderWidgetProps {
  fields: RuleField[];
  operators?: RuleOperator[];
}

export interface CollectionEditorWidgetProps {
  addLabel?: string;
  reorderable?: boolean;
  itemPlaceholder?: string;
}

export interface DictionaryEditorWidgetProps {
  keyLabel?: string;
  valueLabel?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export interface OutputFieldWidgetProps {
  name: string;
  type: string;
  icon?: string;
}

/** Union of all widget props */
export type WidgetProps =
  | TextInputWidgetProps
  | SelectWidgetProps
  | ComboboxWidgetProps
  | RadioGroupWidgetProps
  | ToggleWidgetProps
  | CheckboxGroupWidgetProps
  | TagInputWidgetProps
  | RichTextEditorWidgetProps
  | DateTimePickerWidgetProps
  | FilePickerWidgetProps
  | RuleBuilderWidgetProps
  | CollectionEditorWidgetProps
  | DictionaryEditorWidgetProps
  | OutputFieldWidgetProps;

/* ------------------------------------------------------------------ */
/*  Field schema                                                       */
/* ------------------------------------------------------------------ */

export interface PropertyFieldSchema {
  id: string;
  widget: PropertyWidgetType;
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  defaultHint?: string;
  direction?: "input" | "output";
  isOutput?: boolean;
  supportsVariables?: boolean;
  supportsAdvanced?: boolean;
  /** Shows `Force refresh` at the top of the config menu */
  supportsRefresh?: boolean;
  hidden?: boolean;
  widgetProps?: WidgetProps;
}

/* ------------------------------------------------------------------ */
/*  Inline help schema                                                 */
/* ------------------------------------------------------------------ */

export interface InlineHelpSchema {
  variant: "info" | "warning" | "tip";
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Action button schema                                               */
/* ------------------------------------------------------------------ */

export interface PropertyActionSchema {
  id: string;
  label: string;
  variant: "primary" | "secondary" | "link";
  icon?: string;
  align?: "start" | "center";
  onClick?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Section schema                                                     */
/* ------------------------------------------------------------------ */

export interface PropertySectionSchema {
  id: string;
  title: string | null;
  defaultOpen?: boolean;
  fields: PropertyFieldSchema[];
  helpBlock?: InlineHelpSchema;
  actions?: PropertyActionSchema[];
}

/* ------------------------------------------------------------------ */
/*  Top-level panel schema                                             */
/* ------------------------------------------------------------------ */

export interface ActivityHeaderSchema {
  /** Activity display name (editable) */
  displayName: string;
  /** Activity type / package label shown below the name */
  typeLabel: string;
  /** Lucide icon name for the activity badge */
  icon?: string;
  /** Badge accent color (CSS color or Tailwind-compatible value) */
  iconColor?: string;
}

export interface PropertiesPanelSchema {
  title: string;
  subtitle?: string;
  activityHeader?: ActivityHeaderSchema;
  sections: PropertySectionSchema[];
  actions?: PropertyActionSchema[];
}
