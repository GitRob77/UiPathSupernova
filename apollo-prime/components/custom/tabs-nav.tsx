"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@uipath/apollo-wind/components/ui/tabs";
import { cn } from "@uipath/apollo-wind";

type TabsNavVariant = "primary" | "secondary" | "tiny";

interface TabsNavProps {
  variant?: TabsNavVariant;
  tabs: { value: string; label: string; disabled?: boolean }[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Show bottom border on the tab list container. Ignored for secondary variant. Defaults to true. */
  bordered?: boolean;
  /** Horizontal alignment of tabs within the container. Defaults to "left". */
  align?: "left" | "center" | "right";
  className?: string;
  /** Extra classes for the inner TabsList (e.g. to pad the tab row without affecting the bottom border). */
  tabListClassName?: string;
  children?: React.ReactNode;
}

const listStyles: Record<TabsNavVariant, string> = {
  primary: "w-full h-auto gap-0 rounded-none bg-transparent p-0",
  secondary: "w-full h-auto gap-1 rounded-none bg-transparent p-0",
  tiny: "w-full h-auto gap-0 rounded-none bg-transparent p-0",
};

const triggerStyles: Record<TabsNavVariant, string> = {
  primary: [
    "min-w-[50px] rounded-none px-4 py-2.5 text-sm font-semibold shadow-none",
    "text-(--foreground) border-b-[4px] border-transparent",
    "hover:bg-(--surface-hover) hover:rounded-t-[3px]",
    "data-[state=active]:text-(--brand) data-[state=active]:border-(--brand)",
    "data-[state=active]:bg-transparent data-[state=active]:hover:bg-(--surface-hover)",
    "data-[state=active]:shadow-none",
    "disabled:text-(--foreground-subtle) disabled:opacity-100",
  ].join(" "),
  secondary: [
    "rounded-[3px] px-3 h-8 text-sm font-semibold shadow-none",
    "text-(--foreground) bg-transparent",
    "hover:bg-(--surface-hover)",
    "data-[state=active]:text-(--brand) data-[state=active]:bg-(--surface-hover)",
    "data-[state=active]:shadow-none",
    "disabled:text-(--foreground-subtle) disabled:opacity-100 disabled:bg-transparent",
  ].join(" "),
  tiny: [
    "rounded-none px-2 py-0.5 text-[13px] font-semibold shadow-none",
    "text-(--foreground) border-b-2 border-transparent",
    "hover:bg-(--surface-hover) hover:rounded-t-[3px]",
    "data-[state=active]:text-(--brand) data-[state=active]:border-(--brand)",
    "data-[state=active]:bg-transparent data-[state=active]:hover:bg-(--surface-hover)",
    "data-[state=active]:shadow-none",
    "disabled:text-(--foreground-subtle) disabled:opacity-100",
  ].join(" "),
};

export function TabsNav({
  variant = "primary",
  tabs,
  defaultValue,
  value,
  onValueChange,
  bordered = true,
  align = "left",
  className,
  tabListClassName,
  children,
}: TabsNavProps) {
  const showBorder = bordered && variant !== "secondary";

  const alignStyles = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <Tabs
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      <TabsList
        className={cn(
          listStyles[variant],
          alignStyles[align],
          showBorder && "border-b border-(--border-subtle)",
          tabListClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(triggerStyles[variant])}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export { TabsContent };
