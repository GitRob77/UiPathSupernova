"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@uipath/apollo-wind/components/ui/popover";
import { PocketKnife, RotateCcw, LayoutGrid, Monitor, Sun, Moon, Layers, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

const DESIGN_THEMES = ["vnow", "studio"] as const;
type DesignTheme = typeof DESIGN_THEMES[number];

function getCurrentTheme(): string {
  const body = document.body;
  for (const theme of THEMES) {
    if (body.classList.contains(theme.value)) return theme.value;
  }
  return "light";
}

function setTheme(theme: string) {
  const body = document.body;
  for (const t of THEMES) {
    body.classList.remove(t.value);
  }
  body.classList.add(theme);
}

function getDesignTheme(): DesignTheme {
  return document.body.classList.contains("studio") ? "studio" : "vnow";
}

function applyDesignTheme(theme: DesignTheme) {
  document.body.classList.remove(...DESIGN_THEMES);
  document.body.classList.add(theme);
}

export function NavWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("light");
  const [activeDesignTheme, setActiveDesignTheme] = useState<DesignTheme>("vnow");

  useEffect(() => {
    setActiveDesignTheme(getDesignTheme());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "t") {
        const next: DesignTheme = activeDesignTheme === "vnow" ? "studio" : "vnow";
        applyDesignTheme(next);
        setActiveDesignTheme(next);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDesignTheme]);

  const prototypeMatch = pathname.match(/^(\/prototypes\/[^/]+)/);
  const prototypeBase = prototypeMatch ? prototypeMatch[1] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed z-50 h-10 w-10 rounded-full shadow-lg bg-[#fa4616] hover:bg-[#e03e13] hover:text-white text-white border-none"
          style={{ bottom: 20, right: 20 }}
        >
          <PocketKnife className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-56 p-1">
        {prototypeBase && (
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer"
            onClick={() => { setOpen(false); router.push(`${prototypeBase}/home`); }}
          >
            <RotateCcw className="h-4 w-4" />
            Restart Prototype
          </button>
        )}
        <button
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer"
          onClick={() => { setOpen(false); router.push("/prototypes"); }}
        >
          <LayoutGrid className="h-4 w-4" />
          Go to Prototypes
        </button>
        <button
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer"
          onClick={() => { setOpen(false); router.push("/starter-templates"); }}
        >
          <Monitor className="h-4 w-4" />
          Go to Starter Templates
        </button>

        <div className="my-1 h-px bg-border" />

        <button
          className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer"
          onClick={() => {
            const next: DesignTheme = activeDesignTheme === "vnow" ? "studio" : "vnow";
            applyDesignTheme(next);
            setActiveDesignTheme(next);
          }}
        >
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Design: {activeDesignTheme === "vnow" ? "VNow" : "Studio"}
          </div>
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">⌥T</kbd>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer">
              <Palette className="h-4 w-4" />
              Theme: {THEMES.find(t => t.value === activeTheme)?.label}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" align="end">
            {THEMES.map((theme) => {
              const Icon = theme.icon;
              return (
                <DropdownMenuItem
                  key={theme.value}
                  onClick={() => { setTheme(theme.value); setActiveTheme(theme.value); }}
                  className={activeTheme === theme.value ? "bg-accent" : ""}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {theme.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </PopoverContent>
    </Popover>
  );
}
