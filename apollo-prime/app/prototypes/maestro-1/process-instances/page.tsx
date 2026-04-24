"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/custom/app-header";
import { SidebarNav } from "@/components/custom/sidebar-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@uipath/apollo-wind/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@uipath/apollo-wind/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind/components/ui/select";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  type TooltipContentProps,
} from "recharts";
import {
  Home,
  Layers,
  AlertTriangle,
  AppWindow,
  FolderOpen,
  ShieldAlert,
  Workflow,
  Flame,
  Calendar,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

const navItems = [
  { label: "Home", icon: Home, href: "/prototypes/maestro-1/home" },
  { label: "Process instances", icon: Layers, active: true, href: "/prototypes/maestro-1/process-instances" },
  { label: "Process incidents", icon: AlertTriangle },
  { label: "Case app", icon: AppWindow },
  { label: "Case instances", icon: FolderOpen },
  { label: "Case incidents", icon: ShieldAlert },
  { label: "Flow instances", icon: Workflow },
  { label: "Flow incidents", icon: Flame },
];

const previewItems = ["Case app", "Case instances", "Case incidents", "Flow instances", "Flow incidents"];

/* ------------------------------------------------------------------ */
/* Count Badge                                                         */
/* ------------------------------------------------------------------ */

function CountBadge({
  value,
  variant,
}: {
  value: number;
  variant: "green" | "red" | "blue" | "gray";
}) {
  if (value === 0)
    return <span className="text-sm text-muted-foreground">0</span>;
  const colors = {
    green: "bg-green-500 text-white",
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    gray: "bg-gray-200 text-gray-700",
  };
  return (
    <Badge
      className={`rounded-full border-0 px-2 text-xs font-semibold ${colors[variant]}`}
    >
      {value}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal Bar Chart                                                */
/* ------------------------------------------------------------------ */

function HorizontalBarChart({
  data,
  unitLabel,
}: {
  data: { label: string; value: number }[];
  unitLabel?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const barContainerRef = useRef<HTMLDivElement>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const tickCount = 4;
  const tickStep = Math.ceil(max / tickCount);
  const adjustedMax = tickStep * tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickStep);

  return (
    <div className="flex flex-col gap-1 relative" ref={barContainerRef}>
      <div className="flex flex-col gap-2.5">
        {data.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const barPct = (item.value / adjustedMax) * 100;
          return (
            <div
              key={item.label}
              className="flex items-center gap-2 group relative"
              onMouseEnter={(e) => {
                setHoveredIdx(idx);
                const rect = barContainerRef.current?.getBoundingClientRect();
                if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseMove={(e) => {
                const rect = barContainerRef.current?.getBoundingClientRect();
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

      {/* Floating tooltip near mouse */}
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
            <p className="text-[11px] text-gray-500 tabular-nums">
              {unitLabel ? `${data[hoveredIdx].value} ${unitLabel}` : `${data[hoveredIdx].value} instances`}
            </p>
          </>
        )}
      </div>
      <div className="ml-[128px] flex justify-between text-[10px] text-muted-foreground mt-1">
        {ticks.map((t) => (
          <span key={t}>{unitLabel ? `${t} ${unitLabel}` : t}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Process Status Area Chart (recharts)                                */
/* ------------------------------------------------------------------ */

const processStatusOverTime = [
  { date: "Mar 13", completed: 1, faulted: 0, running: 0, cancelled: 0 },
  { date: "Mar 14", completed: 2, faulted: 0, running: 1, cancelled: 0 },
  { date: "Mar 15", completed: 3, faulted: 1, running: 0, cancelled: 0 },
  { date: "Mar 16", completed: 1, faulted: 0, running: 0, cancelled: 0 },
  { date: "Mar 17", completed: 2, faulted: 1, running: 1, cancelled: 0 },
  { date: "Mar 18", completed: 3, faulted: 0, running: 0, cancelled: 1 },
  { date: "Mar 19", completed: 1, faulted: 0, running: 0, cancelled: 0 },
  { date: "Mar 20", completed: 2, faulted: 1, running: 0, cancelled: 0 },
  { date: "Mar 21", completed: 1, faulted: 0, running: 1, cancelled: 0 },
  { date: "Mar 22", completed: 3, faulted: 0, running: 0, cancelled: 0 },
  { date: "Mar 23", completed: 1, faulted: 1, running: 0, cancelled: 0 },
  { date: "Mar 24", completed: 2, faulted: 0, running: 0, cancelled: 0 },
  { date: "Mar 25", completed: 1, faulted: 1, running: 0, cancelled: 0 },
  { date: "Mar 26", completed: 1, faulted: 0, running: 1, cancelled: 0 },
];

const STATUS_CONFIG = [
  { key: "completed", label: "Completed", color: "#16A34A" },
  { key: "faulted", label: "Faulted", color: "#E91E8C" },
  { key: "running", label: "Running", color: "#2563EB" },
  { key: "cancelled", label: "Cancelled", color: "#6B7280" },
] as const;

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce(
    (sum: number, entry) => sum + (Number(entry.value) || 0),
    0
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-xl shadow-black/8">
      <p className="mb-1.5 text-[11px] font-semibold text-gray-900">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          Number(entry.value) > 0 && (
            <div
              key={String(entry.dataKey)}
              className="flex items-center justify-between gap-8"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[11px] text-gray-500">{entry.name}</span>
              </div>
              <span className="text-[11px] font-medium tabular-nums text-gray-900">
                {entry.value}
              </span>
            </div>
          )
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-8 border-t border-gray-100 pt-1.5">
        <span className="text-[11px] font-medium text-gray-400">Total</span>
        <span className="text-[11px] font-semibold tabular-nums text-gray-900">
          {total}
        </span>
      </div>
    </div>
  );
}

function ProcessStatusChart() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 flex items-center justify-end gap-4">
        {STATUS_CONFIG.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-[7px] w-[7px] rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[11px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="99%" className="flex-1 min-h-0">
        <AreaChart
          data={processStatusOverTime}
          margin={{ top: 5, right: 20, bottom: 5, left: -10 }}
        >
          <defs>
            {STATUS_CONFIG.map(({ key, color }) => (
              <linearGradient
                key={key}
                id={`grad-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0.06} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F0F0F0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
            dy={4}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, "dataMax + 2"]}
          />
          <Tooltip
            content={CustomTooltip}
            cursor={{
              stroke: "#D1D5DB",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          {STATUS_CONFIG.map(({ key, label, color }) => (
            <Area
              key={key}
              type="natural"
              dataKey={key}
              name={label}
              stackId="1"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${key})`}
              activeDot={{
                r: 3.5,
                strokeWidth: 2,
                stroke: color,
                fill: "#fff",
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline data                                                         */
/* ------------------------------------------------------------------ */

interface ProcessRow {
  id: string;
  name: string;
  running: number;
  completed: number;
  faulted: number;
  total: number;
  versions: number;
  location: string;
}

const processes: ProcessRow[] = [
  { id: "proc-1", name: "Demo Maestro for RPA", running: 0, completed: 3, faulted: 1, total: 5, versions: 1, location: "Shared" },
  { id: "proc-2", name: "Demo Maestro Coded Automations", running: 0, completed: 1, faulted: 1, total: 2, versions: 1, location: "Shared" },
  { id: "proc-3", name: "Maestro API Integrations", running: 1, completed: 12, faulted: 3, total: 16, versions: 2, location: "Shared" },
  { id: "proc-4", name: "Maestro Document Processing", running: 0, completed: 8, faulted: 0, total: 8, versions: 1, location: "Shared" },
];

const topByInstances = [
  { label: "Maestro API Integrations", value: 16 },
  { label: "Maestro Document Processing", value: 8 },
  { label: "Demo Maestro for RPA", value: 5 },
  { label: "Demo Maestro Coded Automations", value: 2 },
];

const topByDuration = [
  { label: "Demo Maestro for RPA", value: 700 },
  { label: "Maestro API Integrations", value: 320 },
  { label: "Maestro Document Processing", value: 180 },
  { label: "Demo Maestro Coded Automations", value: 18 },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ProcessInstancesPage() {
  const [activeNav, setActiveNav] = useState("Process instances");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateRange, setDateRange] = useState("last-week");

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
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Process instances</h1>
              <div className="flex items-center gap-3">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">all</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="workspace">Workspace</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="h-auto w-auto border-0 p-0 text-sm shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Charts row: left 40% stacked + right 60% wave chart */}
            <div className="flex gap-4">
              {/* Left column — 40% — two cards stacked 50/50 */}
              <div className="flex flex-col gap-4 min-w-0" style={{ flex: "0 0 calc(40% - 8px)" }}>
                <Card className="flex-1 flex flex-col shadow-none">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-sm font-medium">
                      Top processes by instances
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 flex-1 flex items-center">
                    <div className="w-full">
                      <HorizontalBarChart data={topByInstances} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1 flex flex-col shadow-none">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-sm font-medium">
                      Top processes by duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 flex-1 flex items-center">
                    <div className="w-full">
                      <HorizontalBarChart
                        data={topByDuration}
                        unitLabel="min"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column — 60% — wave chart */}
              <Card className="min-w-0 flex flex-col shadow-none" style={{ flex: "0 0 calc(60% - 8px)" }}>
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-medium">
                    Process instance status
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 flex-1 min-h-0">
                  <ProcessStatusChart />
                </CardContent>
              </Card>
            </div>

            {/* Process table */}
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader className="bg-(--color-background-secondary)">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-[220px] px-4 py-0 h-10">
                      Process name
                    </TableHead>
                    <TableHead className="w-[90px] px-4 py-0 h-10 text-center">
                      Running
                    </TableHead>
                    <TableHead className="w-[100px] px-4 py-0 h-10 text-center">
                      Completed
                    </TableHead>
                    <TableHead className="w-[90px] px-4 py-0 h-10 text-center">
                      Faulted
                    </TableHead>
                    <TableHead className="w-[80px] px-4 py-0 h-10 text-center">
                      Total
                    </TableHead>
                    <TableHead className="w-[80px] px-4 py-0 h-10 text-center">
                      Versions
                    </TableHead>
                    <TableHead className="min-w-[180px] px-4 py-0 h-10">
                      Location
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processes.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="h-12 px-4 py-0">
                        <Link
                          href={`/prototypes/maestro-1/process-detail${row.id === "proc-2" ? "?process=coded" : ""}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {row.name}
                        </Link>
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 text-center">
                        <CountBadge value={row.running} variant="blue" />
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 text-center">
                        <CountBadge value={row.completed} variant="green" />
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 text-center">
                        <CountBadge value={row.faulted} variant="red" />
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 text-center text-sm font-medium">
                        {row.total}
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 text-center text-sm">
                        {row.versions}
                      </TableCell>
                      <TableCell className="h-12 px-4 py-0 text-sm text-muted-foreground">
                        {row.location}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
