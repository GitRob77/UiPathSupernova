"use client";

import { cn } from "@uipath/apollo-wind";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import * as LucideIcons from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyActionButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "link";
  icon?: string;
  align?: "start" | "center";
  onClick?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Variant mapping                                                    */
/* ------------------------------------------------------------------ */

const VARIANT_MAP = {
  primary: "default",
  secondary: "secondary",
  link: "ghost",
} as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resolveIcon(name?: string) {
  if (!name) return null;
  const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[name];
  return Icon ?? null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyActionButton({
  label,
  variant = "secondary",
  icon,
  align = "start",
  onClick,
  className,
}: PropertyActionButtonProps) {
  const mapped = VARIANT_MAP[variant];
  const Icon = resolveIcon(icon);

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex cursor-pointer items-center gap-1 text-[length:var(--font-size-base)] text-primary hover:underline",
          align === "center" && "justify-center",
          className
        )}
      >
        {Icon && <Icon className="size-3.5" />}
        {label}
      </button>
    );
  }

  return (
    <Button
      variant={mapped}
      size="sm"
      onClick={onClick}
      className={cn(
        "h-7 text-[length:var(--font-size-base)]",
        align === "center" && "self-center",
        className
      )}
    >
      {Icon && <Icon className="mr-1 size-3.5" />}
      {label}
    </Button>
  );
}
