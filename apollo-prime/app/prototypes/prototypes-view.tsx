"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@uipath/apollo-wind/components/ui/card";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { TabsNav, TabsContent } from "@/components/custom/tabs-nav";
import { FilterBar } from "@/components/custom/filter-bar";

const statusColors: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  ready: "default",
  "in review": "secondary",
  wip: "outline",
  experimental: "destructive",
};

const statusToTab: Record<string, string> = {
  ready: "ready",
  "in review": "in-review",
  wip: "in-progress",
  experimental: "experimental",
};

export interface PrototypeItem {
  href: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  author: string;
}

function PrototypeGrid({ items }: { items: PrototypeItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-12 text-center">
        No prototypes match the current filters.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((proto) => (
        <Link key={proto.href} href={proto.href}>
          <Card className="group transition-colors hover:bg-accent/50 cursor-pointer h-full flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">
                  {proto.title}
                </CardTitle>
                <Badge
                  variant={statusColors[proto.status] ?? "secondary"}
                  className="shrink-0"
                >
                  {proto.status}
                </Badge>
              </div>
              <CardDescription className="mt-1.5 line-clamp-2">
                {proto.description}
              </CardDescription>
              {proto.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {proto.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-muted-foreground">
                  {proto.author}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  View
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function PrototypesView({ prototypes }: { prototypes: PrototypeItem[] }) {
  const [authorFilter, setAuthorFilter] = useState("");

  const authors = Array.from(
    new Set(prototypes.map((p) => p.author))
  ).sort();

  const tabs = [
    { value: "ready", label: "Ready" },
    { value: "in-review", label: "In Review" },
    { value: "in-progress", label: "In Progress" },
    { value: "experimental", label: "Experimental" },
  ];

  function getFiltered(tabValue: string) {
    return prototypes.filter((p) => {
      const matchesTab = statusToTab[p.status] === tabValue;
      const matchesAuthor = !authorFilter || p.author === authorFilter;
      return matchesTab && matchesAuthor;
    });
  }

  // Add counts to tab labels
  const tabsWithCounts = tabs.map((tab) => {
    const count = getFiltered(tab.value).length;
    return {
      ...tab,
      label: `${tab.label} (${count})`,
    };
  });

  // Find first tab with items, fallback to "ready"
  const firstNonEmpty =
    tabs.find((t) => getFiltered(t.value).length > 0)?.value ?? "ready";

  return (
    <div className="space-y-4">
      <FilterBar
        filters={[
          {
            key: "author",
            label: "Author",
            options: [
              { value: "", label: "All" },
              ...authors.map((a) => ({ value: a, label: a })),
            ],
            value: authorFilter,
            onChange: (v) => setAuthorFilter(v as string),
          },
        ]}
      />

      <TabsNav
        variant="primary"
        tabs={tabsWithCounts}
        defaultValue={firstNonEmpty}
      >
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <PrototypeGrid items={getFiltered(tab.value)} />
          </TabsContent>
        ))}
      </TabsNav>
    </div>
  );
}
