import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrototypesView, type PrototypeItem } from "./prototypes-view";

interface PrototypeMetadata {
  title: string;
  description: string;
  status: "ready" | "in review" | "wip" | "experimental";
  tags: string[];
  author: string;
  url: string | null;
  createdAt: string | null;
}

const defaults: PrototypeMetadata = {
  title: "Untitled",
  description: "No description provided",
  status: "wip",
  tags: [],
  author: "Unknown",
  url: null,
  createdAt: null,
};

function getPrototypes(): PrototypeItem[] {
  const prototypesDir = path.join(process.cwd(), "app", "prototypes");
  const entries = fs.readdirSync(prototypesDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const jsonPath = path.join(prototypesDir, entry.name, "prototype.json");
      let metadata: PrototypeMetadata = { ...defaults };

      if (fs.existsSync(jsonPath)) {
        const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        metadata = { ...defaults, ...raw };
      } else {
        metadata.title = entry.name
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }

      // Resolve first available route: prefer /home, then first subfolder with page.tsx
      const protoDir = path.join(prototypesDir, entry.name);
      let route = `/prototypes/${entry.name}`;
      const homePage = path.join(protoDir, "home", "page.tsx");
      if (fs.existsSync(homePage)) {
        route = `/prototypes/${entry.name}/home`;
      } else {
        const subDirs = fs
          .readdirSync(protoDir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .find((d) =>
            fs.existsSync(path.join(protoDir, d.name, "page.tsx"))
          );
        if (subDirs) {
          route = `/prototypes/${entry.name}/${subDirs.name}`;
        }
      }

      return {
        href: route,
        title: metadata.title,
        description: metadata.description,
        status: metadata.status,
        tags: metadata.tags,
        author: metadata.author,
      };
    });
}

export default function PrototypesPage() {
  const prototypes = getPrototypes();

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
          <h1 className="text-2xl font-semibold tracking-tight">Prototypes</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Browse all available prototypes.
          </p>
        </div>

        <PrototypesView prototypes={prototypes} />
      </div>
    </div>
  );
}
