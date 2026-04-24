import Link from "next/link";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";

export default function SupernovaPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Supernova</h1>
        <p className="mt-2 text-muted-foreground">
          HTTP Traffic Intelligence Platform – import HAR sessions, replay HTTP requests, and analyze pass/fail results.
        </p>
        <Badge variant="secondary" className="mt-3">
          in-progress
        </Badge>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/prototypes">← Back to Prototypes</Link>
        </Button>
        <Button asChild>
          <Link href="/prototypes/supernova/home">Go to App</Link>
        </Button>
      </div>
    </div>
  );
}
