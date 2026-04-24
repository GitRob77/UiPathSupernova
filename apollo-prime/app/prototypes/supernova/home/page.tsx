import { EmptyLayout } from "@/components/layouts/empty-layout";

export default function SupernovaHomePage() {
  return (
    <EmptyLayout>
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <h2 className="text-2xl font-semibold">Sessions</h2>
        <p className="text-muted-foreground">
          No sessions yet. Import a HAR file to get started.
        </p>
      </div>
    </EmptyLayout>
  );
}
