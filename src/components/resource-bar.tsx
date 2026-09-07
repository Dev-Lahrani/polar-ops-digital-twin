"use client";

import { RiskLevel } from "@/types";

interface ResourceBarProps {
  label: string;
  value: number;
  max?: number;
  daysRemaining?: number;
  icon: string;
  color?: "green" | "amber" | "red" | "cyan";
}

function getRiskColor(percent: number): { bar: string; text: string; bg: string } {
  if (percent <= 25) return { bar: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10" };
  if (percent <= 50) return { bar: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10" };
  return { bar: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" };
}

export default function ResourceBar({ label, value, max = 100, daysRemaining, icon, color }: ResourceBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);
  const risk = getRiskColor(percent);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{icon}</span>
          <span className="text-[11px] font-mono font-medium text-[#7c8b65] uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold ${risk.text}`}>
            {percent}%
          </span>
          {daysRemaining !== undefined && (
            <span className="text-[10px] font-mono text-[#5a6b48]">
              {daysRemaining}d
            </span>
          )}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-[#1a2518] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${risk.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
