import { cn } from "@uipath/apollo-wind";

export function JsonView({
  data,
  className,
}: {
  data: unknown;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "m-0 whitespace-pre-wrap break-all font-code text-[13px] leading-relaxed text-foreground",
        className
      )}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
