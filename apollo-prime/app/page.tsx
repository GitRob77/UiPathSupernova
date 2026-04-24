import Link from "next/link";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@uipath/apollo-wind/components/ui/card";
const templates: { title: string; description: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Apollo Prime</h1>
        <p className="mt-2 text-muted-foreground">
          Prototype playground for apollo-wind components
        </p>
      </div>
      <div className="flex flex-col gap-3 w-48">
        <Button asChild>
          <Link href="/prototypes">Prototypes</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/starter-templates">Starter Templates</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.href} href={t.href}>
              <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{t.title}</CardTitle>
                  </div>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-muted-foreground">
                    View template →
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
