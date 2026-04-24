"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/custom/app-header";
import { TabsContent } from "@/components/custom/tabs-nav";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@uipath/apollo-wind/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind/components/ui/select";
import { StatusChip } from "@/components/custom/status-chip";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@uipath/apollo-wind/components/ui/card";
import { InvoiceBpmnDiagram } from "../components/invoice-bpmn-diagram";
import { CodedBpmnDiagram } from "../components/coded-bpmn-diagram";
import { InstanceStatsBar } from "../components/instance-stats-bar";
import { InstanceTable } from "../components/instance-table";
import { Switch } from "@uipath/apollo-wind/components/ui/switch";
import { Progress } from "@uipath/apollo-wind/components/ui/progress";
import {
  incidentData,
  completedInstanceData,
  topFaultedElements,
  topActiveInstances,
  topElementsByDuration,
} from "../mock-data/incidents";
import { codedInstances, codedProcessStats } from "../mock-data/instances";
import {
  BarChart as ReBarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import {
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ArrowDown,
  Layers,
  SlidersHorizontal,
  Calendar,
  Filter,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Instance Management tab data (moved to external components)         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Monitoring tab - chart wrapper                                      */
/* ------------------------------------------------------------------ */

function FaultedBarChart({ data }: { data: { name: string; faults: number; maxFaults: number }[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const max = Math.max(...data.map((d) => d.maxFaults), 1);

  return (
    <div className="flex flex-col gap-3 relative" ref={ref}>
      {data.map((el, idx) => {
        const isHovered = hoveredIdx === idx;
        return (
          <div
            key={el.name}
            className="space-y-1"
            onMouseEnter={(e) => {
              setHoveredIdx(idx);
              const rect = ref.current?.getBoundingClientRect();
              if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseMove={(e) => {
              const rect = ref.current?.getBoundingClientRect();
              if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center justify-between text-xs">
              <span>{el.name}</span>
              <span className="text-muted-foreground tabular-nums">{el.faults} faults</span>
            </div>
            <div className="relative h-5 w-full rounded bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded transition-all duration-200"
                style={{
                  width: `${(el.faults / max) * 100}%`,
                  minWidth: el.faults > 0 ? "4px" : "0",
                  background: isHovered
                    ? "linear-gradient(90deg, #EC4899 0%, #E91E8C 100%)"
                    : "linear-gradient(90deg, #F472B6 0%, #EC4899 100%)",
                  boxShadow: isHovered ? "0 2px 8px rgba(236, 72, 153, 0.35)" : "none",
                }}
              />
            </div>
          </div>
        );
      })}

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
            <p className="text-[11px] font-semibold text-gray-900 whitespace-nowrap">{data[hoveredIdx].name}</p>
            <p className="text-[11px] text-gray-500 tabular-nums">{data[hoveredIdx].faults} of {data[hoveredIdx].maxFaults} instances faulted</p>
          </>
        )}
      </div>
    </div>
  );
}

function MonitoringBarChart({
  title,
  data,
  color,
}: {
  title: string;
  data: { date: string; value: number }[];
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <CardTitle className="mb-4 text-sm font-medium">{title}</CardTitle>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval={2}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6 }}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} maxBarSize={24} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ProcessDetailPage() {
  return (
    <Suspense>
      <ProcessDetailContent />
    </Suspense>
  );
}

function ProcessDetailContent() {
  const searchParams = useSearchParams();
  const isCoded = searchParams.get("process") === "coded";
  const processName = isCoded ? "Demo Maestro Coded Automations" : "Demo Maestro for RPA";
  const [tab, setTab] = useState("instance-management");
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader
        productName="Maestro"
        tenantName="DefaultTenant"
        userInitials="MB"
      />

      <main className="flex-1 overflow-auto">
        {/* Breadcrumb bar */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/prototypes/maestro-1/process-instances" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Processes</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{processName}</span>
            {tab === "instance-management" || tab === "monitoring" ? null : (
              <>
                <span className="ml-2 text-muted-foreground">Status</span>
                <StatusChip variant="success" size="sm">Run successful</StatusChip>
                <span className="text-xs text-muted-foreground">Updated: 17 days ago</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tab === "instance-management" || tab === "monitoring" ? (
              <>
                <Button variant="outline" size="sm">Configure filtering</Button>
                <Button size="sm">Run</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="gap-1.5 text-blue-600">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reload data
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in Process Mining
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <Tabs value={tab} onValueChange={setTab}>
            {/* Tabs row with filters on the right */}
            <div className="flex items-end justify-between">
              <TabsList className="w-auto h-auto gap-0 rounded-none bg-transparent p-0">
                {[
                  { value: "instance-management", label: "Instance management" },
                  { value: "monitoring", label: "Monitoring" },
                  { value: "optimize", label: "Optimize" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="min-w-[50px] rounded-none px-4 py-2.5 text-sm font-semibold shadow-none text-(--foreground) border-b-[4px] border-transparent hover:bg-(--surface-hover) hover:rounded-t-[3px] data-[state=active]:text-(--brand) data-[state=active]:border-(--brand) data-[state=active]:bg-transparent data-[state=active]:hover:bg-(--surface-hover) data-[state=active]:shadow-none"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex items-center gap-3 pt-3 pb-2">
                <span className="text-sm text-muted-foreground">Version:</span>
                <Select defaultValue="1.0.9">
                  <SelectTrigger className="h-8 w-[90px] border-0 bg-transparent shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0.9">1.0.9</SelectItem>
                    <SelectItem value="1.0.8">1.0.8</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Date range:</span>
                <Select defaultValue="last-month">
                  <SelectTrigger className="h-8 w-[120px] border-0 bg-transparent shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-week">Last week</SelectItem>
                    <SelectItem value="last-month">Last month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select defaultValue="all">
                  <SelectTrigger className="h-8 w-[80px] border-0 bg-transparent shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="faulted">Faulted</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Error message:</span>
                <Select defaultValue="none">
                  <SelectTrigger className="h-8 w-[90px] border-0 bg-transparent shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="timeout">Timeout</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-5 w-px bg-(--border-subtle)" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  All Filters
                </Button>
              </div>
            </div>
            <div className="border-b border-(--border-subtle)" />

            {/* ============================================ */}
            {/* Instance Management Tab                      */}
            {/* ============================================ */}
            <TabsContent value="instance-management" className="py-6">
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    {isCoded ? <CodedBpmnDiagram /> : <InvoiceBpmnDiagram />}
                  </CardContent>
                </Card>

                <InstanceStatsBar stats={isCoded ? codedProcessStats : undefined} />

                <InstanceTable instances={isCoded ? codedInstances : undefined} />
              </div>
            </TabsContent>

            {/* ============================================ */}
            {/* Monitoring Tab                               */}
            {/* ============================================ */}
            <TabsContent value="monitoring" className="py-6">
              {/* BPMN Diagram with heatmap toggle */}
              <Card>
                <CardContent className="pt-4 relative">
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Heatmap</span>
                    <Switch
                      checked={heatmapEnabled}
                      onCheckedChange={setHeatmapEnabled}
                    />
                  </div>
                  {isCoded ? <CodedBpmnDiagram showHeatmap={heatmapEnabled} /> : <InvoiceBpmnDiagram showHeatmap={heatmapEnabled} />}
                </CardContent>
              </Card>

              {/* 3. Instance stats bar */}
              <div className="mt-6">
                <InstanceStatsBar stats={isCoded ? codedProcessStats : undefined} />
              </div>

              {/* 4. Charts row */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <MonitoringBarChart
                  title="Incidents over time"
                  data={incidentData}
                  color="#F59E0B"
                />
                <Card>
                  <CardContent className="p-4">
                    <CardTitle className="mb-4 text-sm font-medium">Completed instances</CardTitle>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={completedInstanceData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#34D399" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#6EE7B7" stopOpacity={0.02} />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#9CA3AF" }}
                          axisLine={{ stroke: "#E5E7EB" }}
                          tickLine={false}
                          interval={2}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#9CA3AF" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                          domain={[0, "dataMax + 2"]}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                          cursor={{ stroke: "#D1D5DB", strokeWidth: 1, strokeDasharray: "4 4" }}
                          labelStyle={{ fontWeight: 600, fontSize: 11 }}
                        />
                        <Area
                          type="natural"
                          dataKey="value"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          fill="url(#completedGrad)"
                          filter="url(#glow)"
                          activeDot={{
                            r: 5,
                            strokeWidth: 2,
                            stroke: "#10B981",
                            fill: "#fff",
                            filter: "drop-shadow(0 0 4px rgba(16,185,129,0.5))",
                          }}
                          dot={{
                            r: 2.5,
                            fill: "#10B981",
                            strokeWidth: 0,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* 5. Analysis row */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                {/* Top faulted elements */}
                <Card>
                  <CardContent className="p-4">
                    <CardTitle className="mb-4 text-sm font-medium">Top faulted elements</CardTitle>
                    <FaultedBarChart data={topFaultedElements} />
                  </CardContent>
                </Card>

                {/* Top active instances by longest duration */}
                <Card>
                  <CardContent className="p-4">
                    <CardTitle className="mb-4 text-sm font-medium">Top active instances by longest duration</CardTitle>
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="pb-2 font-medium text-xs">Instance ID</th>
                            <th className="pb-2 font-medium text-xs">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topActiveInstances.map((row) => (
                            <tr key={row.instanceId} className="border-b last:border-0">
                              <td className="py-2 text-xs text-blue-600">{row.instanceId}</td>
                              <td className="py-2 text-xs">{row.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Top elements by longest average duration */}
                <Card>
                  <CardContent className="p-4">
                    <CardTitle className="mb-4 text-sm font-medium">Top elements by longest average duration</CardTitle>
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="pb-2 font-medium text-xs">Element</th>
                            <th className="pb-2 font-medium text-xs">Avg Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topElementsByDuration.map((row) => (
                            <tr key={row.name} className="border-b last:border-0">
                              <td className="py-2 text-xs">{row.name}</td>
                              <td className="py-2 text-xs">{row.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ============================================ */}
            {/* Optimize Tab                                 */}
            {/* ============================================ */}
            <TabsContent value="optimize" className="py-6">
              {/* Stat cards */}
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: "Number of traces", value: "2" },
                  { label: "Number of variants", value: "1" },
                  { label: "Conformance rate", value: "0%", extra: <Button variant="link" className="ml-2 h-auto p-0 text-sm text-blue-600">Dashboard</Button> },
                  { label: "Automation rate", value: "100%" },
                  { label: "Avg. trace time", value: "0.30 sec" },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <div className="mt-1 flex items-center">
                        <p className="text-2xl font-bold">{stat.value}</p>
                        {stat.extra}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Process insights */}
              <div className="mt-8">
                <h3 className="mb-4 text-base font-semibold">Process insights</h3>
                <Card className="max-w-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <StatusChip variant="default" size="sm">Deviation</StatusChip>
                      <StatusChip variant="warning" size="sm">Low</StatusChip>
                    </div>
                    <h4 className="mt-3 font-semibold">Invalid end</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Activity Invoice Created is executed as end activity
                    </p>
                    <div className="mt-4 flex gap-12">
                      <div>
                        <p className="text-xs text-muted-foreground">Traces impacted</p>
                        <p className="text-2xl font-bold">100%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg trace time</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">0.30 sec</p>
                          <span className="flex items-center gap-0.5 text-xs text-green-600">
                            <ArrowDown className="h-3 w-3" />
                            0 sec
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Take action */}
              <div className="mt-8">
                <h3 className="mb-4 text-base font-semibold">Take action</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      badge: "Assets",
                      badgeColor: "bg-blue-100 text-blue-700",
                      title: "Compare versions",
                      description: "Compare the ROI on process performance between different versions of your process.",
                    },
                    {
                      badge: "Simulate",
                      badgeColor: "bg-blue-100 text-blue-700",
                      title: "Simulate changes and measure impact",
                      description: "Simulate changes to your process and assess the potential impact before investing effort.",
                    },
                    {
                      badge: "Monitor",
                      badgeColor: "bg-red-100 text-red-700",
                      title: "Monitor conformance",
                      description: "Identify deviations in your process and decide if you want to take action.",
                    },
                  ].map((action) => (
                    <Card key={action.title} className="cursor-pointer transition-colors hover:bg-accent/50">
                      <CardContent className="flex h-full flex-col p-5">
                        <Badge className={`mb-2 w-fit ${action.badgeColor} border-none`}>
                          {action.badge}
                        </Badge>
                        <p className="text-sm font-medium">{action.title}</p>
                        <div className="my-6 flex h-16 items-center justify-center opacity-30">
                          <Layers className="h-10 w-10" />
                        </div>
                        <p className="flex-1 text-xs text-muted-foreground">
                          {action.description}
                        </p>
                        <Button variant="link" className="mt-3 h-auto self-end p-0 text-sm text-blue-600">
                          View details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
