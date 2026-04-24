"use client";

import { Fragment, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@uipath/apollo-wind/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@uipath/apollo-wind/components/ui/card";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import { StatusChip } from "@/components/custom/status-chip";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@uipath/apollo-wind/components/ui/toggle-group";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@uipath/apollo-wind/components/ui/tabs";
import {
  Zap,
  Gem,
  Shield,
  Plus,
  SlidersHorizontal,
  ExternalLink,
  CheckCircle2,
  List,
  LayoutList,
  Loader2,
  ChevronRight,
  ChevronDown,
  FileBox,
  Package,
  Pin,
} from "lucide-react";

function ActionCard({
  icon: Icon,
  title,
  description,
  highlighted = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-accent ${
        highlighted ? "border-primary bg-primary/5" : ""
      }`}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            highlighted
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function JobSuccessBar() {
  const segments = [
    { color: "bg-(--color-chart-green)", label: "Successful", count: 27 },
    { color: "bg-(--color-chart-pink)", label: "Faulted", count: 8 },
    { color: "bg-(--color-chart-yellow)", label: "Stopped", count: 2 },
    { color: "bg-(--color-chart-blue-secondary)", label: "Running", count: 7 },
  ];
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-2.5">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={seg.color}
            style={{ width: `${(seg.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span className={`h-2 w-2 rounded-full ${seg.color}`} />
            {seg.label}{" "}
            <span className="font-medium text-foreground">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recent Solutions data & expandable table
// ---------------------------------------------------------------------------

type SolutionStatus = "Active" | "Inactive" | "N/A";
type OperationType = "Install" | "Upgrade / Downgrade" | "Configuration change";
type ProcessType = "RPA workflow" | "Agentic process" | "Agent" | "Case management";

interface SubProcess {
  name: string;
  type: ProcessType;
  dotColor: string;
  successRate: number;
  jobs: number;
}

interface RecentSolution {
  name: string;
  version: string;
  activationStatus: SolutionStatus;
  successRate: number | null;
  processes: string;
  stages: number[];
  lastOperation: { type: OperationType; time: string; dotColor: string };
  folderPath: string;
  subProcesses: SubProcess[];
}

const recentSolutionsData: RecentSolution[] = [
  { name: "invoice-automation-prod", version: "v1.1.3", activationStatus: "Active", successRate: 78, processes: "5 processes", stages: [1, 1, 1, 1, 0], lastOperation: { type: "Install", time: "5 hours ago", dotColor: "bg-green-500" }, folderPath: "Finance / Invoicing", subProcesses: [
    { name: "Main", type: "RPA workflow", dotColor: "bg-green-500", successRate: 100, jobs: 1 },
    { name: "InvoiceParser", type: "RPA workflow", dotColor: "bg-green-500", successRate: 100, jobs: 2 },
    { name: "InvoiceClassifier", type: "Agentic process", dotColor: "bg-blue-500", successRate: 50, jobs: 4 },
    { name: "ApprovalAgent", type: "Agent", dotColor: "bg-green-500", successRate: 50, jobs: 2 },
    { name: "DisputeHandler", type: "Case management", dotColor: "bg-blue-500", successRate: 50, jobs: 2 },
  ] },
  { name: "invoice-automation-staging", version: "v1.1.3", activationStatus: "Active", successRate: 0, processes: "2 processes", stages: [1, 1, 1, 1, 0], lastOperation: { type: "Install", time: "5 days ago", dotColor: "bg-green-500" }, folderPath: "Finance / Invoicing", subProcesses: [
    { name: "Main", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
    { name: "InvoiceParser", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
  ] },
  { name: "candidate-screening-staging", version: "v2.0.0", activationStatus: "Active", successRate: 100, processes: "4 processes", stages: [1, 1, 1, 1, 0], lastOperation: { type: "Install", time: "3 months ago", dotColor: "bg-green-500" }, folderPath: "HR / Recruiting", subProcesses: [
    { name: "ScreeningBot", type: "RPA workflow", dotColor: "bg-green-500", successRate: 100, jobs: 3 },
    { name: "ResumeParser", type: "Agentic process", dotColor: "bg-blue-500", successRate: 100, jobs: 5 },
    { name: "InterviewScheduler", type: "Agent", dotColor: "bg-green-500", successRate: 100, jobs: 2 },
    { name: "OfferGenerator", type: "RPA workflow", dotColor: "bg-green-500", successRate: 100, jobs: 1 },
  ] },
  { name: "qa-integration-tests", version: "v3.0.5", activationStatus: "N/A", successRate: 0, processes: "4 processes", stages: [1, 1, 0, 0, 0], lastOperation: { type: "Install", time: "4 months ago", dotColor: "bg-red-500" }, folderPath: "Ops / Testing", subProcesses: [
    { name: "SmokeTests", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
    { name: "RegressionSuite", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
    { name: "LoadRunner", type: "Agent", dotColor: "bg-blue-500", successRate: 0, jobs: 0 },
    { name: "APIValidator", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
  ] },
  { name: "qa-regression-tests", version: "v3.0.2", activationStatus: "Inactive", successRate: 100, processes: "1 process", stages: [1, 1, 1, 1, 0], lastOperation: { type: "Install", time: "2 months ago", dotColor: "bg-green-500" }, folderPath: "Ops / Testing", subProcesses: [
    { name: "RegressionRunner", type: "RPA workflow", dotColor: "bg-green-500", successRate: 100, jobs: 1 },
  ] },
  { name: "qa-test-runner-upgrade", version: "v3.0.3", activationStatus: "Inactive", successRate: 0, processes: "0 processes", stages: [0.5, 1, 0, 0, 0], lastOperation: { type: "Upgrade / Downgrade", time: "2 months ago", dotColor: "bg-green-500" }, folderPath: "Ops / Testing", subProcesses: [] },
  { name: "order-processing-prod", version: "v3.2.1", activationStatus: "Active", successRate: 71, processes: "3 processes", stages: [1, 1, 1, 1, 0], lastOperation: { type: "Install", time: "4 hours ago", dotColor: "bg-green-500" }, folderPath: "Ops / Operations", subProcesses: [
    { name: "OrderIntake", type: "RPA workflow", dotColor: "bg-green-500", successRate: 90, jobs: 5 },
    { name: "PaymentProcessor", type: "Agentic process", dotColor: "bg-blue-500", successRate: 60, jobs: 3 },
    { name: "ShippingAgent", type: "Agent", dotColor: "bg-green-500", successRate: 65, jobs: 4 },
  ] },
  { name: "tax-filing-deploy", version: "v2.1.0", activationStatus: "N/A", successRate: 0, processes: "2 processes", stages: [1, 1, 1, 0, 0], lastOperation: { type: "Install", time: "3 days ago", dotColor: "bg-red-500" }, folderPath: "Finance / Tax Reporting", subProcesses: [
    { name: "TaxCalculator", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
    { name: "FilingSubmitter", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
  ] },
  { name: "invoice-automation-v2", version: "v1.2.0", activationStatus: "Active", successRate: 0, processes: "0 processes", stages: [1, 1, 0, 0, 0], lastOperation: { type: "Configuration change", time: "2 months ago", dotColor: "bg-green-500" }, folderPath: "Finance / Invoicing", subProcesses: [] },
  { name: "qa-load-tests", version: "v3.0.0", activationStatus: "N/A", successRate: 0, processes: "0 processes", stages: [1, 1, 1, 0, 0], lastOperation: { type: "Install", time: "4 months ago", dotColor: "bg-red-500" }, folderPath: "Ops / Testing", subProcesses: [] },
  { name: "enterprise-platform-prod", version: "v4.0.2", activationStatus: "Active", successRate: 80, processes: "5 processes", stages: [0.5, 1, 1, 1, 0], lastOperation: { type: "Upgrade / Downgrade", time: "3 days ago", dotColor: "bg-green-500" }, folderPath: "Enterprise Platform", subProcesses: [
    { name: "UserManager", type: "RPA workflow", dotColor: "bg-green-500", successRate: 95, jobs: 3 },
    { name: "TenantProvisioner", type: "Agentic process", dotColor: "bg-blue-500", successRate: 80, jobs: 2 },
    { name: "LicenseValidator", type: "RPA workflow", dotColor: "bg-green-500", successRate: 70, jobs: 4 },
    { name: "AuditLogger", type: "Agent", dotColor: "bg-green-500", successRate: 100, jobs: 1 },
    { name: "ConfigSync", type: "RPA workflow", dotColor: "bg-green-500", successRate: 60, jobs: 2 },
  ] },
  { name: "enterprise-platform-staging", version: "v4.0.0", activationStatus: "Active", successRate: 0, processes: "2 processes", stages: [1, 1, 1, 1, 0], lastOperation: { type: "Install", time: "1 month ago", dotColor: "bg-green-500" }, folderPath: "Enterprise Platform", subProcesses: [
    { name: "UserManager", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
    { name: "TenantProvisioner", type: "Agentic process", dotColor: "bg-blue-500", successRate: 0, jobs: 0 },
  ] },
  { name: "invoice-automation", version: "v1.2.0", activationStatus: "Active", successRate: 0, processes: "4 processes", stages: [1, 1, 1, 1, 0], lastOperation: { type: "Install", time: "just now", dotColor: "bg-green-500" }, folderPath: "Finance / Invoicing / invoice-automation", subProcesses: [
    { name: "Main", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
    { name: "InvoiceParser", type: "RPA workflow", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
    { name: "Classifier", type: "Agentic process", dotColor: "bg-blue-500", successRate: 0, jobs: 0 },
    { name: "Approver", type: "Agent", dotColor: "bg-green-500", successRate: 0, jobs: 0 },
  ] },
];

function StagesIndicator({ stages }: { stages: number[] }) {
  return (
    <div className="flex items-center gap-1">
      {stages.map((s, i) => (
        <div
          key={i}
          className={`h-[3px] w-5 rounded-full ${
            s === 1 ? "bg-teal-400" : s === 0.5 ? "bg-gray-300" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function SuccessRateBar({ value }: { value: number | null }) {
  if (value === null || value === 0) {
    return <span className="text-sm text-muted-foreground">0%</span>;
  }
  const color =
    value === 100
      ? "bg-green-500"
      : value >= 70
        ? "bg-orange-400"
        : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm">{value}%</span>
    </div>
  );
}

function StatusDot({ status }: { status: SolutionStatus }) {
  const color =
    status === "Active"
      ? "text-green-500"
      : status === "Inactive"
        ? "text-gray-400"
        : "text-red-500";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg leading-none ${color}`}>&bull;</span>
      <span className="text-sm">{status}</span>
    </div>
  );
}

function RecentSolutionsTable() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) =>
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader className="bg-(--color-background-secondary)">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8 px-2 py-0" />
            <TableHead className="min-w-[220px] px-4 py-0 h-10">Name</TableHead>
            <TableHead className="w-[140px] px-4 py-0 h-10">Activation status</TableHead>
            <TableHead className="w-[140px] px-4 py-0 h-10">Success rate</TableHead>
            <TableHead className="w-[110px] px-4 py-0 h-10">Processes</TableHead>
            <TableHead className="w-[110px] px-4 py-0 h-10">Stages</TableHead>
            <TableHead className="min-w-[180px] px-4 py-0 h-10">Last operation</TableHead>
            <TableHead className="w-[200px] px-4 py-0 h-10">Folder path</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentSolutionsData.map((sol, idx) => {
            const isExpanded = expanded[idx];
            return (
              <Fragment key={sol.name}>
                {/* Parent row */}
                <TableRow
                  className="cursor-pointer"
                  onClick={() => toggle(idx)}
                >
                  <TableCell className="h-12 px-2 py-0">
                    {sol.subProcesses.length > 0 ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : null}
                  </TableCell>
                  <TableCell className="h-12 px-4 py-0">
                    <div className="flex items-center gap-2">
                      <FileBox className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{sol.name}</span>
                      <span className="text-xs text-muted-foreground">{sol.version}</span>
                    </div>
                  </TableCell>
                  <TableCell className="h-12 px-4 py-0">
                    <StatusDot status={sol.activationStatus} />
                  </TableCell>
                  <TableCell className="h-12 px-4 py-0">
                    <SuccessRateBar value={sol.successRate} />
                  </TableCell>
                  <TableCell className="h-12 px-4 py-0 text-sm">{sol.processes}</TableCell>
                  <TableCell className="h-12 px-4 py-0">
                    <StagesIndicator stages={sol.stages} />
                  </TableCell>
                  <TableCell className="h-12 px-4 py-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${sol.lastOperation.dotColor}`} />
                      <span className="truncate text-sm">{sol.lastOperation.type}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">&middot; {sol.lastOperation.time}</span>
                    </div>
                  </TableCell>
                  <TableCell className="h-12 px-4 py-0 text-sm">{sol.folderPath}</TableCell>
                </TableRow>

                {/* Sub-process rows */}
                {isExpanded &&
                  sol.subProcesses.map((proc) => (
                    <TableRow
                      key={`${sol.name}-${proc.name}`}
                      className="bg-muted/30 hover:bg-muted/50"
                    >
                      <TableCell className="h-10 px-2 py-0" />
                      <TableCell className="h-10 py-0 pl-10 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${proc.dotColor}`} />
                          <span className="font-medium text-sm">{proc.name}</span>
                          <span className="text-xs text-muted-foreground">{proc.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="h-10 px-4 py-0" />
                      <TableCell className="h-10 px-4 py-0">
                        <SuccessRateBar value={proc.successRate} />
                      </TableCell>
                      <TableCell className="h-10 px-4 py-0 text-sm">
                        {proc.jobs} {proc.jobs === 1 ? "job" : "jobs"}
                      </TableCell>
                      <TableCell className="h-10 px-4 py-0" />
                      <TableCell className="h-10 px-4 py-0" />
                      <TableCell className="h-10 px-4 py-0" />
                    </TableRow>
                  ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Solution Packages data
// ---------------------------------------------------------------------------

interface SolutionPackage {
  name: string;
  version: string;
  publishedAt: string;
  pinned: boolean;
}

const solutionPackagesData: SolutionPackage[] = [
  { name: "invoice-automation", version: "1.2.0", publishedAt: "2 months ago", pinned: false },
  { name: "candidate-screening", version: "2.0.1", publishedAt: "3 months ago", pinned: false },
  { name: "qa-test-runner", version: "3.1.0", publishedAt: "5 months ago", pinned: false },
  { name: "order-processing", version: "3.2.1", publishedAt: "1 week ago", pinned: true },
  { name: "tax-filing-engine", version: "2.1.0", publishedAt: "3 days ago", pinned: false },
  { name: "enterprise-platform", version: "4.0.2", publishedAt: "3 days ago", pinned: true },
];

export function DashboardContent() {
  const [timePeriod, setTimePeriod] = useState("7d");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground">All</p>
        </div>
        <Button variant="ghost" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Row 1: Action cards */}
      <div className="grid grid-cols-4 gap-4">
        <ActionCard
          icon={Zap}
          title="Deploy a solution"
          description="Publish & run automations"
          highlighted
        />
        <ActionCard
          icon={Gem}
          title="Add package"
          description="Browse & add packages"
        />
        <ActionCard
          icon={Shield}
          title="Manage access"
          description="Roles & permissions"
        />
        <ActionCard
          icon={Plus}
          title="Add component"
          description="Queues, triggers & more"
        />
      </div>

      {/* Row 2: Stats */}
      <div className="grid grid-cols-4 gap-4">
        {/* Active solutions */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold">8</span>
              <span className="text-xl text-muted-foreground">/ 13</span>
            </div>
            <p className="text-sm text-muted-foreground">active solutions</p>
            <p className="pt-1 text-xs text-muted-foreground">
              order-processing-prod install &middot; 4 hours ago
            </p>
            <StatusChip variant="error">7 with errors</StatusChip>
          </CardContent>
        </Card>

        {/* Healthy connections */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold">21</span>
              <span className="text-xl text-muted-foreground">/ 28</span>
            </div>
            <p className="text-sm text-muted-foreground">
              healthy connections
            </p>
          </CardContent>
        </Card>

        {/* Job success */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-semibold">61%</span>
              <ToggleGroup
                type="single"
                value={timePeriod}
                onValueChange={(v) => v && setTimePeriod(v)}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="7d" className="px-2.5 text-xs">
                  7D
                </ToggleGroupItem>
                <ToggleGroupItem value="30d" className="px-2.5 text-xs">
                  30D
                </ToggleGroupItem>
                <ToggleGroupItem value="90d" className="px-2.5 text-xs">
                  90D
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-muted-foreground">Job success</p>
              <span className="text-xs font-medium text-(--color-chart-green)">+5%</span>
            </div>
            <JobSuccessBar />
          </CardContent>
        </Card>

        {/* Latest Jobs */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-medium">Latest Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <div>
                  <p className="text-sm font-medium">IncidentResponder</p>
                  <p className="text-xs text-muted-foreground">Running</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">12:05</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">TelemetryCollector</p>
                  <p className="text-xs text-muted-foreground">Success</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">12:00</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Solutions data grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold">Recent Solutions</h2>
            <Tabs defaultValue="tree">
              <TabsList className="h-8">
                <TabsTrigger value="tree" className="gap-1.5 px-2.5 text-xs">
                  <LayoutList className="h-3.5 w-3.5" />
                  Tree
                </TabsTrigger>
                <TabsTrigger value="flat" className="gap-1.5 px-2.5 text-xs">
                  <List className="h-3.5 w-3.5" />
                  Flat
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            Explore all
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
        <RecentSolutionsTable />
      </div>

      {/* Row 4: Solution Packages */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-base font-semibold">Solution Packages</h2>
          <Badge variant="secondary" className="rounded-full text-xs">
            {solutionPackagesData.length}
          </Badge>
        </div>
        <Card>
          <CardContent className="px-5 py-0">
            <div className="divide-y">
              {solutionPackagesData.map((pkg) => (
                <div
                  key={pkg.name}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{pkg.name}</span>
                      <Badge
                        variant="outline"
                        className="rounded-full border-green-300 bg-green-50 px-2 text-[11px] font-semibold text-green-700"
                      >
                        {pkg.version}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Published {pkg.publishedAt}
                    </span>
                  </div>
                  {pkg.pinned && (
                    <Pin className="h-4 w-4 rotate-45 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            <p className="flex items-center gap-1.5 border-t py-3 text-xs text-muted-foreground">
              <span className="inline-block h-3.5 w-3.5 rounded-full border border-muted-foreground text-center text-[9px] leading-[13px]">
                i
              </span>
              Publish packages from UiPath Studio for the recommended workflow
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
