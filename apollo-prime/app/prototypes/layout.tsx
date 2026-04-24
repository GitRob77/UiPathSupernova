import fs from "fs";
import path from "path";
import { headers } from "next/headers";

type Theme = "studio" | "vnow";

async function getPrototypeTheme(): Promise<Theme | null> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Extract prototype name from /prototypes/<name>/...
  const match = pathname.match(/\/prototypes\/([^/]+)/);
  if (!match) return null;

  const prototypeName = match[1];
  const jsonPath = path.join(
    process.cwd(),
    "app",
    "prototypes",
    prototypeName,
    "prototype.json"
  );

  if (!fs.existsSync(jsonPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    if (raw.theme && raw.theme !== "studio") return raw.theme;
    return null;
  } catch {
    return null;
  }
}

export default async function PrototypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getPrototypeTheme();

  // If prototype specifies a non-default theme (e.g. "vnow"), wrap children
  // in a div that overrides the root layout's default "studio" theme.
  if (theme) {
    return <div className={theme}>{children}</div>;
  }

  return <>{children}</>;
}
