import Link from "next/link";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";

export default function CanvasPrototypePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Canvas</h1>
        <p className="mt-2 text-muted-foreground">
          Canvas-style workspace with explorer, data manager, health analyzer,
          and properties side panels.
        </p>
        <Badge variant="secondary" className="mt-3">
          wip
        </Badge>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/prototypes">← Back to Prototypes</Link>
        </Button>
        <Button asChild>
          <Link href="/prototypes/canvas/home">Start Prototype</Link>
        </Button>
      </div>
    </div>
  );
}
