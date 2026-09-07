"use client";

import { Subsystem } from "@/types";

interface SystemOverviewProps {
  subsystems: Subsystem[];
}

function getStatusColor(status: Subsystem["status"]): string {
  switch (status) {
    case "NOMINAL": return "bg-emerald-500";
    case "CAUTION": return "bg-yellow-500";
    case "WARNING": return "bg-amber-500";
    case "CRITICAL": return "bg-red-500";
    case "EMERGENCY": return "bg-red-700 animate-pulse";
    default: return "bg-[#7c8b65]";
  }
}

function getStatusGlow(status: Subsystem["status"]): string {
  switch (status) {
    case "CRITICAL":
    case "EMERGENCY":
      return "shadow-[0_0_6px_rgba(239,68,68,0.4)]";
    case "WARNING":
      return "shadow-[0_0_6px_rgba(245,158,11,0.3)]";
    default:
      return "";
  }
}

export default function SystemOverview({ subsystems }: SystemOverviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-medium text-[#7c8b65] uppercase tracking-wider">
          System Status
        </span>
        <span className="text-[10px] font-mono text-[#5a6b48]">
          {Array.from(new Set(subsystems.filter(s => s.status === "NOMINAL").map(s => s.id))).length}/{subsystems.length} nominal
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {subsystems.map((sub) => (
          <div
            key={sub.id}
            className="flex flex-col items-center gap-1 rounded-md bg-[#101510] border border-[#2a3a1e] p-2 group cursor-pointer hover:border-[#34432a] transition-colors"
            title={`${sub.name}: ${sub.status} (${sub.loadPercent}%)`}
          >
            <span className={`h-2 w-2 rounded-full ${getStatusColor(sub.status)} ${getStatusGlow(sub.status)}`} />
            <span className="text-[9px] font-mono text-[#7c8b65] text-center leading-tight truncate w-full">
              {sub.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
