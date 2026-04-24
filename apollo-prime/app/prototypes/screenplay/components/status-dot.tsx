import { cn } from "@uipath/apollo-wind";
import type { StepStatus } from "../data/types";

const statusColors: Record<StepStatus, string> = {
  success: "bg-green-600",
  error: "bg-destructive",
  pending: "bg-neutral-200",
};

export function StatusDot({
  status,
  size = 8,
  className,
}: {
  status: StepStatus;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block shrink-0 rounded-full", statusColors[status], className)}
      style={{ width: size, height: size }}
    />
  );
}
