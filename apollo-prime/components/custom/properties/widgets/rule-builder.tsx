"use client";

import { cn } from "@uipath/apollo-wind";
import type { RuleBuilderWidgetProps, RuleGroup } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";

export interface PropertyRuleBuilderProps extends RuleBuilderWidgetProps {
  value: RuleGroup;
  onChange: (value: RuleGroup) => void;
  supportsRefresh?: boolean;
  className?: string;
}

export function PropertyRuleBuilder({
  supportsRefresh,
  className,
}: PropertyRuleBuilderProps) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-(--border-subtle) px-3 py-4 text-[length:var(--font-size-base)] text-muted-foreground">
        Condition Builder — work in progress
      </div>
      <PropertyConfigMenu
        pattern="basic"
        triggerSize="md"
        showForceRefresh={supportsRefresh}
      />
    </div>
  );
}
