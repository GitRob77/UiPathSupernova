import Link from "next/link";
import { Clock, Cpu } from "lucide-react";

export function ScreenplayHeader({ logoHref, showUploadTrace = true }: { logoHref?: string; showUploadTrace?: boolean }) {
  const logo = (
    <span className="text-[15px] font-bold tracking-tight">UiPath Screenplay</span>
  );

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-(--border-subtle) bg-background px-4 py-2">
      {logoHref ? (
        <Link href={logoHref} className="no-underline text-foreground hover:text-foreground">
          {logo}
        </Link>
      ) : (
        logo
      )}

      <div className="ml-auto flex items-center gap-3.5">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" /> 01:22.215
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Cpu className="h-3 w-3" /> 45,768 in / 5,688 out
        </span>
        {showUploadTrace && (
          <>
            <span className="h-4.5 w-px bg-(--border-subtle)" />
            <a
              href="#"
              className="text-xs text-primary no-underline hover:underline"
            >
              Upload trace
            </a>
          </>
        )}
      </div>
    </div>
  );
}
