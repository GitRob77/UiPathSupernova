import { Instance } from "../types/instance";
import { ProcessStats } from "../types/process";

export const instances: Instance[] = [
  {
    id: "[Demo MaestroRPA] Agentic Process - #5797111",
    processId: "demo-maestro-rpa",
    status: "cancelled",
    version: "1.0.0-debug.63905794738",
    startedAt: "2026-02-25 11:21:20",
    lastUpdate: "2026-02-25 11:22:02",
    duration: "42 sec",
    startedBy: "Mihai.Bozgan@uipath.com",
  },
  {
    id: "[Demo MaestroRPA] Agentic Process - #5788894",
    processId: "demo-maestro-rpa",
    status: "completed",
    version: "1.0.0-debug.63905794738",
    startedAt: "2026-03-10 09:15:02",
    lastUpdate: "2026-03-10 09:32:06",
    duration: "17 min, 4 sec",
    startedBy: "Mihai.Bozgan@uipath.com",
  },
  {
    id: "[Demo MaestroRPA] Agentic Process - #5834217",
    processId: "demo-maestro-rpa",
    status: "completed",
    version: "1.0.0-debug.63905794738",
    startedAt: "2026-02-26 09:14:33",
    lastUpdate: "2026-03-08 15:42:18",
    duration: "1 wk, 3 days, 6 hr, 27 min",
    startedBy: "Mihai.Bozgan@uipath.com",
    limitedView: true,
  },
  {
    id: "[Demo MaestroRPA] Agentic Process - #5891463",
    processId: "demo-maestro-rpa",
    status: "completed",
    version: "1.0.0-debug.63905794738",
    startedAt: "2026-02-28 14:05:12",
    lastUpdate: "2026-03-10 08:33:47",
    duration: "1 wk, 2 days, 18 hr, 28 min",
    startedBy: "Mihai.Bozgan@uipath.com",
  },
  {
    id: "[Demo MaestroRPA] Agentic Process - #5923781",
    processId: "demo-maestro-rpa",
    status: "faulted",
    version: "1.0.0-debug.63905794738",
    startedAt: "2026-03-11 09:47:03",
    lastUpdate: "2026-03-11 09:48:15",
    duration: "1 min, 12 sec",
    startedBy: "Mihai.Bozgan@uipath.com",
  },
];

/* ── Demo Maestro Coded Automations instances ──────────────────── */

export const codedInstances: Instance[] = [
  {
    id: "[Demo MaestroCoded] Agentic Process - #5797120",
    processId: "demo-maestro-coded",
    status: "completed",
    version: "1.0.0-debug.63905794738",
    startedAt: "2026-03-12 10:05:00",
    lastUpdate: "2026-03-12 10:22:14",
    duration: "17 min, 14 sec",
    startedBy: "Mihai.Bozgan@uipath.com",
  },
  {
    id: "[Demo MaestroCoded] Agentic Process - #5797129",
    processId: "demo-maestro-coded",
    status: "faulted",
    version: "1.0.0-debug.63905794738",
    startedAt: "2026-03-12 11:30:00",
    lastUpdate: "2026-03-12 11:48:33",
    duration: "18 min, 33 sec",
    startedBy: "Mihai.Bozgan@uipath.com",
  },
];

export const agenticProcessStats: ProcessStats = {
  total: 5,
  running: 0,
  paused: 0,
  faulted: 1,
  completed: 3,
  cancelled: 1,
  avgDuration: "4 days, 21 hr, 45 min, 50 sec",
};

export const codedProcessStats: ProcessStats = {
  total: 2,
  running: 0,
  paused: 0,
  faulted: 1,
  completed: 1,
  cancelled: 0,
  avgDuration: "17 min, 53 sec",
};
