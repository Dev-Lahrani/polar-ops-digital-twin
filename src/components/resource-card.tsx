"use client";

import { RiskLevel } from "@/types";

const statusColors: Record<RiskLevel, string> = {
  nominal: "#3fb950",
  warning: "#d29922",
  critical: "#f85149",
};

const statusBg: Record<RiskLevel, string> = {
  nominal: "#3fb95010",
  warning: "#d2992210",
  critical: "#f8514910",
};

function getStatus(daysRemaining: number): RiskLevel {
  if (daysRemaining <= 7) return "critical";
  if (daysRemaining <= 21) return "warning";
  return "nominal";
}

export interface ResourceCardProps {
  icon: string;
  name: string;
  currentAmount: string;
  unit: string;
  percent: number;
  dailyRate: string;
  daysRemaining: number;
}

export default function ResourceCard({
  icon,
  name,
  currentAmount,
  unit,
  percent,
  dailyRate,
  daysRemaining,
}: ResourceCardProps) {
  const status = getStatus(daysRemaining);
  const color = statusColors[status];

  return (
    <div
      className="rounded-lg border p-5 relative overflow-hidden"
      style={{
        borderColor: `${color}40`,
        background: statusBg[status],
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-bold uppercase tracking-wider text-[#e6edf3]">
          {name}
        </span>
      </div>

      <div className="mb-3">
        <span className="text-2xl font-bold text-[#e6edf3]">
          {currentAmount}
        </span>
        <span className="text-xs text-[#8b949e] ml-1">{unit}</span>
      </div>

      <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(percent, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-[#8b949e] mb-2">
        <span>{dailyRate}</span>
        <span
          className="font-bold"
          style={{ color }}
        >
          {percent}%
        </span>
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: "1px solid #30363d" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8b949e]">Days remaining</span>
          <span className="text-2xl font-bold" style={{ color }}>
            {daysRemaining}
          </span>
        </div>
      </div>

      <div
        className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
        style={{
          backgroundColor: `${color}20`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {status}
      </div>
    </div>
  );
}
