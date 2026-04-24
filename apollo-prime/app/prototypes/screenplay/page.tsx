import Link from "next/link";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";

export default function ScreenplayPrototypePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Screenplay</h1>
        <p className="mt-2 text-muted-foreground">
          UI Automation Task Debugger — step-by-step visualization of automated
          UI workflows with execution metadata, prompt editing, and AI
          assistant.
        </p>
        <Badge variant="secondary" className="mt-3">
          wip
        </Badge>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/prototypes">&larr; Back to Prototypes</Link>
        </Button>
        <Button asChild>
          <Link href="/prototypes/screenplay/home">Start Prototype</Link>
        </Button>
      </div>
    </div>
  );
}
