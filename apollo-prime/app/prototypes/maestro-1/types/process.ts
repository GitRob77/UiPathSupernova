export interface ProcessStats {
  total: number;
  running: number;
  paused: number;
  faulted: number;
  completed: number;
  cancelled: number;
  avgDuration: string;
}
