"use client";

import { agenticProcessStats } from "../mock-data/instances";
import type { ProcessStats } from "../types/process";

export function InstanceStatsBar({ stats = agenticProcessStats }: { stats?: ProcessStats }) {
  const statItems = [
    { label: "Instances", value: stats.total, bg: "#E9F1FA", text: "#1665B3" },
    { label: "Running", value: stats.running, bg: "#E9F1FA", text: "#1665B3" },
    { label: "Paused", value: stats.paused, bg: "#E9F1FA", text: "#1665B3" },
    { label: "Faulted", value: stats.faulted, bg: "#FFF0F1", text: "#A6040A" },
    { label: "Completed", value: stats.completed, bg: "#EEFFE5", text: "#038108" },
    { label: "Cancelled", value: stats.cancelled, bg: "#F4F5F7", text: "#273139" },
  ];

  return (
    <div className="flex items-center gap-6 flex-wrap py-3 px-4 bg-gray-50 rounded-lg border">
      {statItems.map((stat) => (
        <div key={stat.label} className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">{stat.label}:</span>
          <span
            className="text-sm font-semibold min-w-[20px] text-center px-4 py-0.5 rounded-full leading-5"
            style={{ background: stat.bg, color: stat.text }}
          >
            {stat.value}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Avg duration:</span>
        <span className="text-sm font-medium text-gray-700">{stats.avgDuration}</span>
      </div>
    </div>
  );
}
