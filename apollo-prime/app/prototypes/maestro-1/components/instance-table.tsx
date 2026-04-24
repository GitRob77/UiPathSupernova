"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@uipath/apollo-wind/components/ui/table";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import { instances as defaultInstances } from "../mock-data/instances";
import type { Instance, InstanceStatus } from "../types/instance";
import { XCircle, CheckCircle, AlertCircle, Pause, Play, EyeOff } from "lucide-react";

const statusConfig: Record<InstanceStatus, { icon: typeof XCircle; color: string; bg: string }> = {
  cancelled: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-100" },
  completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  faulted: { icon: AlertCircle, color: "text-pink-600", bg: "bg-pink-100" },
  paused: { icon: Pause, color: "text-yellow-600", bg: "bg-yellow-100" },
  running: { icon: Play, color: "text-blue-600", bg: "bg-blue-100" },
};

function extractInstanceNumber(id: string): string | null {
  const match = id.match(/#(\d+)/);
  return match ? match[1] : null;
}

export function InstanceTable({ instances = defaultInstances }: { instances?: Instance[] }) {
  const router = useRouter();

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-xs font-medium w-10">Status</TableHead>
            <TableHead className="text-xs font-medium">Process instance name</TableHead>
            <TableHead className="text-xs font-medium">Version</TableHead>
            <TableHead className="text-xs font-medium">Started at</TableHead>
            <TableHead className="text-xs font-medium">Last update</TableHead>
            <TableHead className="text-xs font-medium">Duration</TableHead>
            <TableHead className="text-xs font-medium">Started by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instances.map((instance) => {
            const config = statusConfig[instance.status];
            const Icon = config.icon;
            const instanceNum = extractInstanceNumber(instance.id);
            return (
              <TableRow
                key={instance.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (instanceNum) {
                    router.push(`/prototypes/maestro-1/process-detail/${instanceNum}`);
                  }
                }}
              >
                <TableCell>
                  <Badge variant="outline" className={`${config.bg} ${config.color} border-none gap-1 text-xs`}>
                    <Icon size={12} />
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">{instance.id}</span>
                    {instance.limitedView && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400" title="Limited view">
                        <EyeOff size={12} />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-500 font-mono">{instance.version}</TableCell>
                <TableCell className="text-xs text-gray-600">{instance.startedAt}</TableCell>
                <TableCell className="text-xs text-gray-600">{instance.lastUpdate}</TableCell>
                <TableCell className="text-xs text-gray-600">{instance.duration}</TableCell>
                <TableCell className="text-xs text-gray-500">{instance.startedBy}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
