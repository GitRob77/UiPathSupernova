"use client";

import { cn } from "@uipath/apollo-wind";
import { Info, AlertTriangle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface InlineHelpProps {
  variant?: "info" | "warning" | "tip";
  message: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Variant config                                                     */
/* ------------------------------------------------------------------ */

const VARIANT_CONFIG = {
  info: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    iconColor: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-500",
  },
  tip: {
    icon: Info,
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    iconColor: "text-emerald-500",
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function InlineHelp({
  variant = "info",
  message,
  className,
}: InlineHelpProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md px-2.5 py-2",
        config.bg,
        className
      )}
    >
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", config.iconColor)} />
      <p className={cn("text-[length:var(--font-size-base)] leading-relaxed", config.text)}>
        {message}
      </p>
    </div>
  );
}
