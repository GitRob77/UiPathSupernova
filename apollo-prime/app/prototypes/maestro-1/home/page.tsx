"use client";

import { useRef, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind/components/ui/select";
import Link from "next/link";
import { AppHeader } from "@/components/custom/app-header";
import { SidebarNav } from "@/components/custom/sidebar-nav";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@uipath/apollo-wind/components/ui/card";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import {
  Home,
  Layers,
  AlertTriangle,
  AppWindow,
  FolderOpen,
  ShieldAlert,
  Workflow,
  Flame,
  Clock,
  Play,
  PlayCircle,
  ChevronDown,
  Search,
  ArrowLeft,
  ArrowRight,
  GitBranch,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

const navItems = [
  { label: "Home", icon: Home, active: true, href: "/prototypes/maestro-1/home" },
  { label: "Process instances", icon: Layers, href: "/prototypes/maestro-1/process-instances" },
  { label: "Process incidents", icon: AlertTriangle },
  { label: "Case app", icon: AppWindow },
  { label: "Case instances", icon: FolderOpen },
  { label: "Case incidents", icon: ShieldAlert },
  { label: "Flow instances", icon: Workflow },
  { label: "Flow incidents", icon: Flame },
];

const previewItems = ["Case app", "Case instances", "Case incidents", "Flow instances", "Flow incidents"];

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface RecentProject {
  name: string;
  status: "PUBLISHED" | "DRAFT";
  lastModified: string;
}

const recentProjects: RecentProject[] = [
  { name: "Figma Comment Email Monitor", status: "DRAFT", lastModified: "2 months ago" },
  { name: "Random Number", status: "DRAFT", lastModified: "26 days ago" },
  { name: "MotoGP", status: "DRAFT", lastModified: "2 months ago" },
];

interface ProcessTemplate {
  type: "Project Template" | "Solution Template";
  name: string;
  description: string;
  action: "View" | "Use";
}

const processTemplates: ProcessTemplate[] = [
  { type: "Project Template", name: "Supplier Onboarding", description: "An agentic process built with Maestro (Agentic Orchestration), modeled using…", action: "View" },
  { type: "Project Template", name: "Invoice Processing", description: "An agentic process built with Maestro (Agentic Orchestration), modeled using…", action: "View" },
  { type: "Project Template", name: "MyPoNEwTeMplate", description: "aav", action: "View" },
  { type: "Project Template", name: "Invoice Processing", description: "#1 Marketplace BPMN Test An agentic process built with Maestro (Agentic…", action: "View" },
  { type: "Project Template", name: "Invoice Processing", description: "#1 Marketplace BPMN Test An agentic process built with Maestro (Agentic…", action: "View" },
  { type: "Project Template", name: "Invoice Processing", description: "#1 Marketplace BPMN Test An agentic process built with Maestro (Agentic…", action: "View" },
  { type: "Solution Template", name: "Test RPA + BPMN", description: "Test RPA + BPMN", action: "View" },
];

const incidentData = [
  { date: "19/03", value: 0 },
  { date: "20/03", value: 0 },
  { date: "21/03", value: 0 },
  { date: "22/03", value: 0 },
  { date: "23/03", value: 0 },
  { date: "24/03", value: 0 },
  { date: "25/03", value: 0 },
  { date: "26/03", value: 0 },
  { date: "27/03", value: 0 },
];

const topProcessesByInstances = [
  { label: "Maestro API Integrations", value: 16 },
  { label: "Maestro Document Processing", value: 8 },
  { label: "Demo Maestro for RPA", value: 5 },
  { label: "Demo Maestro Coded Automations", value: 2 },
];

/* ------------------------------------------------------------------ */
/* Shared card style                                                   */
/* ------------------------------------------------------------------ */

const CARD_CLASS =
  "flex flex-col min-h-[160px] max-h-[160px] w-[320px] shrink-0 overflow-hidden cursor-pointer transition-colors hover:bg-accent/50 active:bg-accent/70";

/* ------------------------------------------------------------------ */
/* Chart components                                                    */
/* ------------------------------------------------------------------ */

function HomeBarChart({ data }: { data: { label: string; value: number }[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const tickCount = 4;
  const tickStep = Math.ceil(max / tickCount);
  const adjustedMax = tickStep * tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickStep);

  return (
    <div className="flex flex-col gap-1 relative" ref={containerRef}>
      <div className="flex flex-col gap-2.5">
        {data.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const barPct = (item.value / adjustedMax) * 100;
          return (
            <div
              key={item.label}
              className="flex items-center gap-2 relative"
              onMouseEnter={(e) => {
                setHoveredIdx(idx);
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseMove={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span className="w-[120px] shrink-0 truncate text-right text-xs text-muted-foreground" title={item.label}>
                {item.label}
              </span>
              <div className="relative flex-1 h-5">
                <div
                  className="h-full rounded transition-all duration-200"
                  style={{
                    width: `${barPct}%`,
                    minWidth: item.value > 0 ? "4px" : "0",
                    background: isHovered
                      ? "linear-gradient(90deg, #3B82F6 0%, #6366F1 100%)"
                      : "linear-gradient(90deg, #60A5FA 0%, #818CF8 100%)",
                    boxShadow: isHovered ? "0 2px 8px rgba(99, 102, 241, 0.35)" : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="ml-[128px] flex justify-between text-[10px] text-muted-foreground mt-1">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>

      {/* Tooltip */}
      <div
        className="absolute z-20 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-xl shadow-black/8 pointer-events-none"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          transform: "translate(-50%, -110%)",
          opacity: hoveredIdx !== null ? 1 : 0,
          scale: hoveredIdx !== null ? "1" : "0.95",
          transition: "opacity 180ms cubic-bezier(0.4,0,0.2,1), scale 180ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {hoveredIdx !== null && data[hoveredIdx] && (
          <>
            <p className="text-[11px] font-semibold text-gray-900 whitespace-nowrap">{data[hoveredIdx].label}</p>
            <p className="text-[11px] text-gray-500 tabular-nums">{data[hoveredIdx].value} instances</p>
          </>
        )}
      </div>
    </div>
  );
}

function SimpleLineChart({
  data,
}: {
  data: { date: string; value: number }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 120;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: chartHeight - (d.value / maxVal) * chartHeight,
  }));
  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 flex h-[120px] flex-col justify-between text-[10px] text-muted-foreground">
        {[1, 0.8, 0.6, 0.4, 0.2, 0].map((v) => (
          <span key={v}>{v}</span>
        ))}
      </div>
      <div className="ml-8">
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          className="h-[120px] w-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
            <line
              key={v}
              x1="0"
              y1={chartHeight - v * chartHeight}
              x2="100"
              y2={chartHeight - v * chartHeight}
              stroke="var(--color-border-subtle, #e5e7eb)"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="2,2"
            />
          ))}
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="var(--color-error-text, #ef4444)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2"
              fill="var(--color-error-text, #ef4444)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          {data.map((d) => (
            <span key={d.date}>{d.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right Sidebar Content                                               */
/* ------------------------------------------------------------------ */

function RightSidebarContent() {
  return (
    <div className="p-5 space-y-6">
      {/* How it works */}
      <div>
        <h3 className="text-sm font-semibold mb-4">How it works</h3>
        <div className="flex items-center justify-center">
          <div className="relative h-[160px] w-[160px]">
            {/* Circular diagram */}
            <svg viewBox="0 0 160 160" className="h-full w-full">
              {/* Outer ring segments */}
              <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="2" />
              {/* Model - top (orange) */}
              <path d="M 80 10 A 70 70 0 0 1 150 80" fill="none" stroke="#f97316" strokeWidth="24" strokeLinecap="butt" opacity="0.15" />
              <path d="M 80 10 A 70 70 0 0 1 150 80" fill="none" stroke="#f97316" strokeWidth="2" />
              {/* Implement - right (blue) */}
              <path d="M 150 80 A 70 70 0 0 1 80 150" fill="none" stroke="#3b82f6" strokeWidth="24" strokeLinecap="butt" opacity="0.15" />
              <path d="M 150 80 A 70 70 0 0 1 80 150" fill="none" stroke="#3b82f6" strokeWidth="2" />
              {/* Monitor - bottom (green) */}
              <path d="M 80 150 A 70 70 0 0 1 10 80" fill="none" stroke="#22c55e" strokeWidth="24" strokeLinecap="butt" opacity="0.15" />
              <path d="M 80 150 A 70 70 0 0 1 10 80" fill="none" stroke="#22c55e" strokeWidth="2" />
              {/* Optimize - left (purple) */}
              <path d="M 10 80 A 70 70 0 0 1 80 10" fill="none" stroke="#a855f7" strokeWidth="24" strokeLinecap="butt" opacity="0.15" />
              <path d="M 10 80 A 70 70 0 0 1 80 10" fill="none" stroke="#a855f7" strokeWidth="2" />
              {/* Center circle */}
              <circle cx="80" cy="80" r="36" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            </svg>
            {/* Labels */}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 text-[10px] font-semibold text-orange-500">Model</span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-[10px] font-semibold text-blue-500">Implement</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5 text-[10px] font-semibold text-green-500">Monitor</span>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 text-[10px] font-semibold text-purple-500">Optimize</span>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] text-muted-foreground">UiPath</span>
              <span className="text-xs font-semibold">Maestro</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" className="text-xs">
            Learn more on UiPath.com
          </Button>
        </div>
      </div>

      {/* Getting started */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Getting started</h3>
        <div className="space-y-1">
          <Link href="#" className="block text-sm text-primary hover:underline">
            Process modeling essentials
          </Link>
          <Link href="#" className="block text-sm text-primary hover:underline">
            Dos and don&apos;ts for process modeling
          </Link>
        </div>
      </div>

      {/* Exceed business outcomes */}
      <div>
        <h3 className="text-sm font-semibold mb-2">
          Exceed your business outcomes with UiPath Maestro
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Model, implement, operate, monitor, and optimize your long running
          processes while managing them effectively at scale.
        </p>
        <div className="mt-3">
          <Button variant="outline" size="sm" className="text-xs">
            Upskill with UiPath Academy
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Process Templates Carousel                                          */
/* ------------------------------------------------------------------ */

function ProcessTemplatesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 400;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Process templates</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canScrollLeft}
            onClick={() => scroll("left")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canScrollRight}
            onClick={() => scroll("right")}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {processTemplates.map((tpl, i) => (
            <Card key={i} className={CARD_CLASS}>
              <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
                <div className="space-y-2">
                  <Badge
                    variant="outline"
                    className="border-gray-300 bg-gray-50 text-gray-600 text-[10px]"
                  >
                    {tpl.type}
                  </Badge>
                  <p className="text-sm font-medium leading-snug">{tpl.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tpl.description}
                  </p>
                </div>
                <div className="pt-1 text-right">
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                    {tpl.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Right fade gradient */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent" />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Maestro1HomePage() {
  const [activeNav, setActiveNav] = useState("Home");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader
        productName="Maestro"
        tenantName="DefaultTenant"
        userInitials="MB"
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <SidebarNav side="left" defaultCollapsed={false}>
          {() => (
            <div className="flex flex-col gap-0.5 p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isPreview = previewItems.includes(item.label);
                const isActive = item.label === activeNav;
                const content = (
                  <button
                    key={item.label}
                    onClick={() => setActiveNav(item.label)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-200 ease-out ${
                      isActive
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground "
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isPreview && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Preview
                      </Badge>
                    )}
                  </button>
                );
                if (item.href) {
                  return (
                    <Link key={item.label} href={item.href}>
                      {content}
                    </Link>
                  );
                }
                return <div key={item.label}>{content}</div>;
              })}
            </div>
          )}
        </SidebarNav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="flex h-full overflow-hidden">
            {/* Center content */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-8 p-6">
                {/* Hero Banner */}
                <Card className="overflow-hidden border-0 bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardContent className="flex items-center justify-between p-8">
                    <div className="max-w-md space-y-4">
                      <h2 className="text-2xl font-semibold leading-snug">
                        Orchestrate{" "}
                        <span className="text-blue-600">AI agents, robots,</span>
                        <br />
                        <span className="text-blue-600">and people</span> with{" "}
                        <span className="text-blue-600">Maestro</span> to
                        <br />
                        exceed business outcomes
                      </h2>
                      <Button>Start modeling</Button>
                    </div>
                    <div className="hidden items-center justify-center lg:flex">
                      <div className="flex h-40 w-64 items-center justify-center rounded-lg bg-gray-800 text-white shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                          <Play className="h-6 w-6 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Projects */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent projects</h2>
                    <Button variant="link" size="sm" className="text-primary" asChild>
                      <Link href="#">View all projects</Link>
                    </Button>
                  </div>
                  <div
                    className="flex gap-4 overflow-x-auto pb-2"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {recentProjects.map((project, i) => (
                      <Card
                        key={i}
                        className={CARD_CLASS}
                      >
                        <CardContent className="flex h-full flex-col justify-between p-4">
                          <div className="space-y-2">
                            <Badge
                              variant="outline"
                              className="border-gray-300 bg-gray-50 text-gray-600 text-[10px]"
                            >
                              {project.status}
                            </Badge>
                            <p className="text-sm font-medium leading-snug">
                              {project.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Last modified</span>
                            <span>{project.lastModified}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Process Templates */}
                <ProcessTemplatesCarousel />

                {/* Process Monitoring */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Process monitoring</h2>
                    <Select defaultValue="last-week">
                      <SelectTrigger className="h-8 w-[120px] text-sm text-primary border-0 shadow-none gap-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-day">Last Day</SelectItem>
                        <SelectItem value="last-week">Last Week</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Top processes by instances */}
                    <Card className="shadow-none">
                      <CardHeader className="p-4 pb-3">
                        <CardTitle className="text-sm font-medium">
                          Top processes by instances
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <HomeBarChart data={topProcessesByInstances} />
                      </CardContent>
                    </Card>

                    {/* Incidents chart */}
                    <Card className="shadow-none">
                      <CardHeader className="flex flex-row items-center justify-between p-4 pb-3">
                        <CardTitle className="text-sm font-medium">Incidents</CardTitle>
                        <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                          View all incidents
                        </Button>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <SimpleLineChart data={incidentData} />
                      </CardContent>
                    </Card>

                    {/* Live Instances */}
                    <Card className="shadow-none">
                      <CardHeader className="p-4 pb-3">
                        <CardTitle className="text-sm font-medium">
                          Live Instances
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 px-4 pb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-semibold">31</span>
                          <span className="text-sm text-muted-foreground">
                            Total Instances
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                            Running{" "}
                            <span className="font-medium">1</span>{" "}
                            <span className="text-muted-foreground">(3.2%)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                            Faulted{" "}
                            <span className="font-medium">5</span>{" "}
                            <span className="text-muted-foreground">(16.1%)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Process Instances */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Process instances</h2>
                    <Link href="/prototypes/maestro-1/process-instances" className="text-sm text-primary hover:underline">
                      View all instances
                    </Link>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {[
                      { name: "Demo Maestro for RPA", createdBy: "UiPath", lastUpdated: "Mar 12", avgDuration: "4 days, 21 hr, 45 min, 50 sec", faulted: "1 of 5", version: "1.0.0", folder: "Shared" },
                      { name: "Demo Maestro Coded Automations", createdBy: "UiPath", lastUpdated: "Mar 12", avgDuration: "17 min, 53 sec", faulted: "1 of 2", version: "1.0.0", folder: "Shared" },
                      { name: "Maestro API Integrations", createdBy: "UiPath", lastUpdated: "Mar 15", avgDuration: "20 min, 12 sec", faulted: "3 of 16", version: "2.0.1", folder: "Shared" },
                      { name: "Maestro Document Processing", createdBy: "UiPath", lastUpdated: "Mar 14", avgDuration: "22 min, 30 sec", faulted: "0 of 8", version: "1.0.2", folder: "Shared" },
                    ].map((proc) => (
                      <Card key={proc.name} className="shadow-none shrink-0 w-[280px] h-[360px] rounded-lg border-(--border-subtle) overflow-hidden">
                        {/* Header */}
                        <div className="bg-[rgba(244,245,247,0.6)] p-4">
                          <div className="flex gap-2.5">
                            <div className="flex-1 flex flex-col gap-4">
                              <p className="text-[10px] font-semibold text-muted-foreground">
                                Last update on {proc.lastUpdated}
                              </p>
                              <div>
                                <h3 className="text-base font-semibold text-foreground leading-6">{proc.name}</h3>
                                <p className="text-xs text-muted-foreground leading-4">Created by {proc.createdBy}</p>
                              </div>
                            </div>
                            <PlayCircle size={24} className="text-primary shrink-0" />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="p-3 flex-1 space-y-3">
                          <div className="flex items-center gap-4">
                            <Clock size={24} className="text-(--xpl-color-background-gray-emphasized) shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground/60 leading-4">Average duration</p>
                              <p className="text-sm font-semibold text-foreground leading-5">{proc.avgDuration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <AlertTriangle size={24} className="text-(--xpl-color-background-gray-emphasized) shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground/60 leading-4">Faulted instances</p>
                              <p className="text-sm font-semibold text-foreground leading-5">{proc.faulted}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <GitBranch size={24} className="text-(--xpl-color-background-gray-emphasized) shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground/60 leading-4">Version</p>
                              <p className="text-sm font-semibold text-foreground leading-5">{proc.version}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <FolderOpen size={24} className="text-(--xpl-color-background-gray-emphasized) shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground/60 leading-4">Folder</p>
                              <p className="text-sm font-semibold text-foreground leading-5">{proc.folder}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <SidebarNav side="right" defaultCollapsed={false} collapsible resizable>
              {() => <RightSidebarContent />}
            </SidebarNav>
          </div>
        </main>
      </div>
    </div>
  );
}
