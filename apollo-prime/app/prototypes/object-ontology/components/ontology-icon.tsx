import type { LucideIcon } from "lucide-react";
import { cn } from "@uipath/apollo-wind";

interface OntologyIconProps {
  icon: LucideIcon;
  colorClass: string;
  size?: "sm" | "md";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-6 w-6", icon: "h-3.5 w-3.5" },
  md: { container: "h-8 w-8", icon: "h-4 w-4" },
};

export function OntologyIcon({
  icon: Icon,
  colorClass,
  size = "sm",
  className,
}: OntologyIconProps) {
  const s = sizeMap[size];
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md",
        s.container,
        colorClass,
        className,
      )}
    >
      <Icon className={cn(s.icon, "text-white")} />
    </div>
  );
}
