type StatusChipVariant = "error" | "warning" | "info" | "success" | "default";
type StatusChipSize = "sm" | "lg";

interface StatusChipProps {
  children: React.ReactNode;
  variant?: StatusChipVariant;
  size?: StatusChipSize;
  className?: string;
}

const variantStyles: Record<StatusChipVariant, string> = {
  error: "bg-(--color-error-background) text-(--color-error-text)",
  warning: "bg-(--color-warning-background) text-(--color-warning-text)",
  info: "bg-(--color-info-background) text-(--color-info-text)",
  success: "bg-(--color-success-background) text-(--color-success-text)",
  default: "bg-(--color-background-secondary) text-(--color-foreground)",
};

const sizeStyles: Record<StatusChipSize, string> = {
  sm: "px-2 text-[10px] leading-4",
  lg: "px-4 py-0.5 text-sm leading-5",
};

export function StatusChip({
  children,
  variant = "default",
  size = "sm",
  className,
}: StatusChipProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center font-semibold whitespace-nowrap",
        variant === "default" && size === "sm"
          ? "rounded-lg"
          : "rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
