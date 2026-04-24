import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@uipath/apollo-wind/components/ui/card";
import { LayoutDashboard, Table, PenTool, Square, ArrowRight, ArrowLeft } from "lucide-react";

const layouts = [
  {
    slug: "dashboard",
    title: "Orchestrator New IA",
    description:
      "Dashboard with stat cards, charts, and summary widgets. Built on the new information architecture.",
    icon: LayoutDashboard,
  },
  {
    slug: "listing",
    title: "Orchestrator Data Tables",
    description:
      "Data table with filters, pagination, and side panels.",
    icon: Table,
  },
  {
    slug: "canvas",
    title: "Studio",
    description: "Studio canvas with panels and starter templates for each project type.",
    icon: PenTool,
  },
  {
    slug: "empty",
    title: "Empty",
    description:
      "Minimal blank starting point with just an app header.",
    icon: Square,
  },
];

export default function StarterTemplatesPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">Starter Templates</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Predefined templates you can ask Claude to use as a starting point. They also showcase Apollo UI elements you can reference in your prototypes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {layouts.map((layout) => {
            const Icon = layout.icon;
            return (
              <Link key={layout.slug} href={`/starter-templates/${layout.slug}`}>
                <Card className="group transition-colors hover:bg-accent/50 cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base mt-3">
                      {layout.title}
                    </CardTitle>
                    <CardDescription>
                      {layout.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Preview
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
