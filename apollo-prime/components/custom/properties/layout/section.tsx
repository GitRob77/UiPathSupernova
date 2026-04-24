"use client";

import { memo } from "react";
import { cn } from "@uipath/apollo-wind";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@uipath/apollo-wind/components/ui/accordion";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertySectionProps {
  id: string;
  title: string | null;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const PropertySection = memo(function PropertySection({
  id,
  title,
  defaultOpen = true,
  children,
  className,
}: PropertySectionProps) {
  /* No title → render fields directly without collapsible wrapper */
  if (!title) {
    return (
      <div className={cn("flex flex-col gap-3 py-2", className)}>
        {children}
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? id : undefined}
      className={className}
    >
      <AccordionItem value={id} className="border-b-0 pt-1.5">
        <AccordionTrigger className="flex-row-reverse justify-end gap-2 rounded-sm bg-secondary py-2 px-3 text-[length:var(--font-size-base)] font-semibold hover:no-underline [&>svg]:-rotate-90 [&[data-state=open]>svg]:!rotate-0">
          {title}
        </AccordionTrigger>
        <AccordionContent className="pb-2">
          <div className="flex flex-col gap-3 pt-3">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});
