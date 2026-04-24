/* ------------------------------------------------------------------ */
/*  Properties Panel — Barrel Exports                                  */
/* ------------------------------------------------------------------ */

/* Types */
export type {
  PropertyWidgetType,
  PropertyFieldSchema,
  PropertySectionSchema,
  PropertiesPanelSchema,
  ActivityHeaderSchema,
  PropertyActionSchema,
  InlineHelpSchema,
  TextInputWidgetProps,
  SelectWidgetProps,
  ComboboxWidgetProps,
  SelectOption,
  RadioGroupWidgetProps,
  ToggleWidgetProps,
  CheckboxGroupWidgetProps,
  TagInputWidgetProps,
  RichTextEditorWidgetProps,
  DateTimePickerWidgetProps,
  FilePickerWidgetProps,
  RuleBuilderWidgetProps,
  CollectionEditorWidgetProps,
  DictionaryEditorWidgetProps,
  OutputFieldWidgetProps,
  RuleGroup,
  Rule,
  RuleField,
  RuleOperator,
} from "./types";

/* Core */
export { PropertyField } from "./property-field";
export { PropertiesRenderer } from "./properties-renderer";
export {
  PropertiesPanel,
  usePropertiesPanel,
} from "./properties-panel";

/* Layout */
export { PropertySection } from "./layout/section";
export { InlineHelp } from "./layout/inline-help";
export { PropertyActionButton } from "./layout/action-button";

/* Widgets */
export { PropertyTextInput } from "./widgets/text-input";
export { PropertySelect } from "./widgets/select-widget";
export { PropertyCombobox } from "./widgets/combobox-widget";
export { PropertyRadioGroup } from "./widgets/radio-group";
export { PropertyToggle } from "./widgets/toggle";
export { PropertyCheckboxGroup } from "./widgets/checkbox-group";
export { PropertyTagInput } from "./widgets/tag-input";
export { PropertyRichTextEditor } from "./widgets/rich-text-editor";
export { PropertyDateTimePicker } from "./widgets/date-time-picker";
export { PropertyFilePicker } from "./widgets/file-picker";
export { PropertyRuleBuilder } from "./widgets/rule-builder";
export { PropertyCollectionEditor } from "./widgets/collection-editor";
export { PropertyDictionaryEditor } from "./widgets/dictionary-editor";
export { PropertyOutputField } from "./widgets/output-field";

/* Demo data */
export { slackSendMessageSchema } from "./data/slack-send-message";
export { widgetShowcaseSchema } from "./data/widget-showcase";
