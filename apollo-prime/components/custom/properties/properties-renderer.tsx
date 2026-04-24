"use client";

import { useState, useCallback, useRef, memo } from "react";
import { cn } from "@uipath/apollo-wind";
import type {
  PropertiesPanelSchema,
  PropertyFieldSchema,
  PropertyWidgetType,
  TextInputWidgetProps,
  SelectWidgetProps,
  ComboboxWidgetProps,
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
} from "./types";
import { PropertyField } from "./property-field";
import { PropertySection } from "./layout/section";
import { InlineHelp } from "./layout/inline-help";
import { PropertyActionButton } from "./layout/action-button";

/* Widgets */
import { PropertyTextInput } from "./widgets/text-input";
import { PropertySelect } from "./widgets/select-widget";
import { PropertyCombobox } from "./widgets/combobox-widget";
import { PropertyRadioGroup } from "./widgets/radio-group";
import { PropertyToggle } from "./widgets/toggle";
import { PropertyCheckboxGroup } from "./widgets/checkbox-group";
import { PropertyTagInput } from "./widgets/tag-input";
import { PropertyRichTextEditor } from "./widgets/rich-text-editor";
import { PropertyDateTimePicker } from "./widgets/date-time-picker";
import { PropertyFilePicker } from "./widgets/file-picker";
import { PropertyRuleBuilder } from "./widgets/rule-builder";
import { PropertyCollectionEditor } from "./widgets/collection-editor";
import { PropertyDictionaryEditor } from "./widgets/dictionary-editor";
import { PropertyOutputField } from "./widgets/output-field";
import type { DictionaryEntry } from "./widgets/dictionary-editor";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertiesRendererProps {
  schema: PropertiesPanelSchema;
  values?: Record<string, unknown>;
  onValuesChange?: (values: Record<string, unknown>) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default values per widget type                                     */
/* ------------------------------------------------------------------ */

function getDefaultValue(widget: PropertyWidgetType): unknown {
  switch (widget) {
    case "text-input":
    case "select":
    case "combobox":
    case "date-time-picker":
    case "file-picker":
      return "";
    case "radio-group":
      return null;
    case "toggle":
      return false;
    case "checkbox-group":
    case "tag-input":
    case "collection-editor":
      return [];
    case "rich-text-editor":
      return "";
    case "rule-builder":
      return { id: "root", operator: "AND", rules: [] } as RuleGroup;
    case "dictionary-editor":
      return [] as DictionaryEntry[];
    case "output-field":
      return undefined;
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Widget renderer                                                    */
/* ------------------------------------------------------------------ */

function renderWidget(
  field: PropertyFieldSchema,
  value: unknown,
  onValueChange: (val: unknown) => void
) {
  const wp = field.widgetProps ?? {};

  switch (field.widget) {
    case "text-input": {
      const p = wp as TextInputWidgetProps;
      return (
        <PropertyTextInput
          value={(value as string) ?? ""}
          onChange={onValueChange}
          supportsVariables={field.supportsVariables}
          supportsAdvanced={field.supportsAdvanced}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "select": {
      const p = wp as SelectWidgetProps;
      return (
        <PropertySelect
          value={(value as string) ?? ""}
          onChange={onValueChange}
          supportsVariables={field.supportsVariables}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "combobox": {
      const p = wp as ComboboxWidgetProps;
      return (
        <PropertyCombobox
          value={(value as string) ?? ""}
          onChange={onValueChange}
          supportsVariables={field.supportsVariables}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "radio-group": {
      const p = wp as RadioGroupWidgetProps;
      return (
        <PropertyRadioGroup
          value={(value as string | null) ?? null}
          onChange={onValueChange}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "toggle": {
      const p = wp as ToggleWidgetProps;
      return (
        <PropertyToggle
          value={(value as boolean) ?? false}
          onChange={onValueChange}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "checkbox-group": {
      const p = wp as CheckboxGroupWidgetProps;
      return (
        <PropertyCheckboxGroup
          value={(value as string[]) ?? []}
          onChange={onValueChange}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "tag-input": {
      const p = wp as TagInputWidgetProps;
      return (
        <PropertyTagInput
          value={(value as string[]) ?? []}
          onChange={onValueChange}
          supportsVariables={field.supportsVariables}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "rich-text-editor": {
      const p = wp as RichTextEditorWidgetProps;
      return (
        <PropertyRichTextEditor
          value={(value as string) ?? ""}
          onChange={onValueChange}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "date-time-picker": {
      const p = wp as DateTimePickerWidgetProps;
      return (
        <PropertyDateTimePicker
          value={(value as string) ?? ""}
          onChange={onValueChange}
          supportsAdvanced={field.supportsAdvanced}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "file-picker": {
      const p = wp as FilePickerWidgetProps;
      return (
        <PropertyFilePicker
          value={(value as string) ?? ""}
          onChange={onValueChange}
          supportsVariables={field.supportsVariables}
          supportsAdvanced={field.supportsAdvanced}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "rule-builder": {
      const p = wp as RuleBuilderWidgetProps;
      return (
        <PropertyRuleBuilder
          value={(value as RuleGroup) ?? { id: "root", operator: "AND", rules: [] }}
          onChange={onValueChange}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "collection-editor": {
      const p = wp as CollectionEditorWidgetProps;
      return (
        <PropertyCollectionEditor
          value={(value as string[]) ?? []}
          onChange={onValueChange}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "dictionary-editor": {
      const p = wp as DictionaryEditorWidgetProps;
      return (
        <PropertyDictionaryEditor
          value={(value as DictionaryEntry[]) ?? []}
          onChange={onValueChange}
          supportsRefresh={field.supportsRefresh}
          {...p}
        />
      );
    }
    case "output-field": {
      const p = wp as OutputFieldWidgetProps;
      return <PropertyOutputField supportsRefresh={field.supportsRefresh} {...p} />;
    }
    default:
      return <div className="text-[length:var(--font-size-base)] text-muted-foreground">Unknown widget</div>;
  }
}

/* ------------------------------------------------------------------ */
/*  IsolatedField — each field owns its local value so typing in one  */
/*  field does NOT re-render the parent or any sibling fields.         */
/* ------------------------------------------------------------------ */

const IsolatedField = memo(function IsolatedField({
  field,
  initialValue,
  externalValue,
  onFieldChange,
}: {
  field: PropertyFieldSchema;
  initialValue: unknown;
  externalValue: unknown | undefined;
  onFieldChange: (fieldId: string, val: unknown) => void;
}) {
  const [localValue, setLocalValue] = useState(initialValue);
  const isControlled = externalValue !== undefined;

  /* Sync from external controlled value when it changes from outside */
  const prevExternal = useRef(externalValue);
  if (isControlled && externalValue !== prevExternal.current) {
    prevExternal.current = externalValue;
    setLocalValue(externalValue);
  }

  const value = isControlled ? externalValue : localValue;

  const handleChange = useCallback(
    (val: unknown) => {
      setLocalValue(val);
      onFieldChange(field.id, val);
    },
    [field.id, onFieldChange]
  );

  const delegateVars =
    field.widget !== "text-input" &&
    field.widget !== "file-picker" &&
    field.widget !== "select" &&
    field.widget !== "combobox" &&
    field.widget !== "tag-input" &&
    field.widget !== "date-time-picker";

  return (
    <PropertyField
      label={field.label}
      required={field.required}
      error={field.error}
      helpText={field.helpText}
      defaultHint={field.defaultHint}
      direction={field.direction}
      isOutput={field.isOutput}
      supportsVariables={delegateVars ? field.supportsVariables : false}
      supportsAdvanced={delegateVars ? field.supportsAdvanced : false}
    >
      {renderWidget(field, value, handleChange)}
    </PropertyField>
  );
});

/* ------------------------------------------------------------------ */
/*  PropertiesRenderer                                                 */
/* ------------------------------------------------------------------ */

export function PropertiesRenderer({
  schema,
  values: externalValues,
  onValuesChange,
  className,
}: PropertiesRendererProps) {
  /* Ref-based store — typing never triggers a parent re-render. */
  const valuesRef = useRef<Record<string, unknown> | null>(null);
  if (valuesRef.current === null) {
    const defaults: Record<string, unknown> = {};
    for (const section of schema.sections) {
      for (const field of section.fields) {
        defaults[field.id] = getDefaultValue(field.widget);
      }
    }
    valuesRef.current = defaults;
  }

  /* In controlled mode, keep ref in sync with external values */
  if (externalValues) {
    valuesRef.current = externalValues;
  }

  /* Stable callback — never changes identity */
  const onValuesChangeRef = useRef(onValuesChange);
  onValuesChangeRef.current = onValuesChange;

  const handleFieldChange = useCallback(
    (fieldId: string, val: unknown) => {
      valuesRef.current = { ...valuesRef.current, [fieldId]: val };
      if (onValuesChangeRef.current) {
        onValuesChangeRef.current(valuesRef.current);
      }
    },
    []
  );

  return (
    <div className={cn("flex flex-col", className)}>
      {schema.sections.map((section) => (
        <PropertySection
          key={section.id}
          id={section.id}
          title={section.title}
          defaultOpen={section.defaultOpen ?? true}
        >
          {section.fields
            .filter((f) => !f.hidden)
            .map((field) => (
              <IsolatedField
                key={field.id}
                field={field}
                initialValue={valuesRef.current?.[field.id]}
                externalValue={externalValues?.[field.id]}
                onFieldChange={handleFieldChange}
              />
            ))}

          {/* Inline help block */}
          {section.helpBlock && (
            <InlineHelp
              variant={section.helpBlock.variant}
              message={section.helpBlock.message}
            />
          )}

          {/* Section actions */}
          {section.actions?.map((action) => (
            <PropertyActionButton
              key={action.id}
              label={action.label}
              variant={action.variant}
              icon={action.icon}
              align={action.align}
              onClick={action.onClick}
            />
          ))}
        </PropertySection>
      ))}

      {/* Global actions */}
      {schema.actions && schema.actions.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-(--border-subtle) pt-3">
          {schema.actions.map((action) => (
            <PropertyActionButton
              key={action.id}
              label={action.label}
              variant={action.variant}
              icon={action.icon}
              align={action.align}
              onClick={action.onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
