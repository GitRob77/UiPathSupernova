"use client";

import { cn } from "@uipath/apollo-wind";
import { Textarea } from "@uipath/apollo-wind/components/ui/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@uipath/apollo-wind/components/ui/toggle-group";
import {
  Bold,
  Italic,
  Underline,
  Code,
  List,
  ListOrdered,
} from "lucide-react";
import { useState } from "react";
import type { RichTextEditorWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";
import { VariablePickerTrigger } from "../variable-picker";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyRichTextEditorProps extends RichTextEditorWidgetProps {
  value: string;
  onChange: (value: string) => void;
  supportsRefresh?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Toolbar icon map                                                   */
/* ------------------------------------------------------------------ */

const TOOLBAR_ITEMS = {
  bold: { icon: Bold, label: "Bold" },
  italic: { icon: Italic, label: "Italic" },
  underline: { icon: Underline, label: "Underline" },
  code: { icon: Code, label: "Code" },
  ol: { icon: ListOrdered, label: "Ordered list" },
  ul: { icon: List, label: "Unordered list" },
} as const;

const DEFAULT_TOOLBAR: (keyof typeof TOOLBAR_ITEMS)[] = [
  "bold",
  "italic",
  "underline",
  "code",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyRichTextEditor({
  value,
  onChange,
  toolbar = DEFAULT_TOOLBAR,
  placeholder = "Enter text…",
  supportsRefresh,
  className,
}: PropertyRichTextEditorProps) {
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  return (
    <div
      className={cn(
        "rounded-md border border-input focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex h-8 items-center justify-between border-b border-(--border-subtle) pl-1 pr-2">
        <ToggleGroup
          type="multiple"
          value={activeFormats}
          onValueChange={setActiveFormats}
          className="gap-0.5"
        >
          {toolbar.map((key) => {
            const item = TOOLBAR_ITEMS[key];
            if (!item) return null;
            const Icon = item.icon;
            return (
              <ToggleGroupItem
                key={key}
                value={key}
                aria-label={item.label}
                className="h-6 w-6 p-0"
              >
                <Icon className="size-3" />
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>

        <div className="flex items-center gap-0.5">
          <VariablePickerTrigger />
          <PropertyConfigMenu
            pattern="text"
            showForceRefresh={supportsRefresh}
          />
        </div>
      </div>

      {/* Editor area */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-y !rounded-none !border-0 !text-[length:var(--font-size-base)] !shadow-none !ring-0 focus-visible:!ring-0 focus-visible:!outline-none"
        rows={4}
      />
    </div>
  );
}
