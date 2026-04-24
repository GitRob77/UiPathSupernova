export interface IncidentDataPoint {
  date: string;
  value: number;
}

export const incidentData: IncidentDataPoint[] = [
  { date: "Feb 17", value: 1 },
  { date: "Feb 18", value: 0 },
  { date: "Feb 19", value: 2 },
  { date: "Feb 20", value: 1 },
  { date: "Feb 21", value: 0 },
  { date: "Feb 22", value: 3 },
  { date: "Feb 23", value: 0 },
  { date: "Feb 24", value: 5 },
  { date: "Feb 25", value: 1 },
  { date: "Feb 26", value: 2 },
  { date: "Feb 27", value: 0 },
  { date: "Feb 28", value: 1 },
  { date: "Mar 01", value: 0 },
  { date: "Mar 02", value: 2 },
  { date: "Mar 03", value: 1 },
  { date: "Mar 04", value: 0 },
  { date: "Mar 05", value: 4 },
  { date: "Mar 06", value: 1 },
  { date: "Mar 07", value: 0 },
  { date: "Mar 08", value: 2 },
  { date: "Mar 09", value: 1 },
];

export const completedInstanceData: IncidentDataPoint[] = [
  { date: "Mar 13", value: 1 },
  { date: "Mar 14", value: 2 },
  { date: "Mar 15", value: 4 },
  { date: "Mar 16", value: 1 },
  { date: "Mar 17", value: 3 },
  { date: "Mar 18", value: 3 },
  { date: "Mar 19", value: 1 },
  { date: "Mar 20", value: 2 },
  { date: "Mar 21", value: 1 },
  { date: "Mar 22", value: 3 },
  { date: "Mar 23", value: 2 },
  { date: "Mar 24", value: 2 },
  { date: "Mar 25", value: 1 },
  { date: "Mar 26", value: 2 },
];

export interface FaultedElement {
  name: string;
  faults: number;
  maxFaults: number;
}

export const topFaultedElements: FaultedElement[] = [
  { name: "Agent Scout", faults: 3, maxFaults: 4 },
  { name: "Internal notification", faults: 1, maxFaults: 4 },
];

export interface ActiveInstance {
  instanceId: string;
  duration: string;
}

export const topActiveInstances: ActiveInstance[] = [
  { instanceId: "#5788894", duration: "1 wk, 2 days, 19 hr, 31 min" },
  { instanceId: "#5797111", duration: "42 sec" },
  { instanceId: "#5834217", duration: "1 wk, 3 days, 6 hr, 27 min" },
  { instanceId: "#5891463", duration: "1 wk, 2 days, 18 hr, 28 min" },
];

export interface ElementDuration {
  name: string;
  duration: string;
}

export const topElementsByDuration: ElementDuration[] = [
  { name: "Agent Scout", duration: "4 days, 10 hr, 15 min" },
  { name: "Internal notification", duration: "2 min, 30 sec" },
  { name: "Start event", duration: "1 sec" },
];
