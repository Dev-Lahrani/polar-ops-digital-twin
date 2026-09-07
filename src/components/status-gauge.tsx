"use client";

import { LucideIcon } from "lucide-react";

interface StatusGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  warningThreshold: number;
  criticalThreshold: number;
  icon: LucideIcon;
  showPercentage?: boolean;
}

export default function StatusGauge({
  label,
  value,
  max,
  unit,
  warningThreshold,
  criticalThreshold,
  icon: Icon,
  showPercentage = true,
}: StatusGaugeProps) {
  const pct = Math.min((value / max) * 100, 100);

  let barColor = "bg-emerald-400";
  if (pct <= criticalThreshold) {
    barColor = "bg-red-500";
  } else if (pct <= warningThreshold) {
    barColor = "bg-amber-400";
  }

  let valueColor = "text-white";
  if (pct <= criticalThreshold) {
    valueColor = "text-red-400";
  } else if (pct <= warningThreshold) {
    valueColor = "text-amber-400";
  }

  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#111827] p-4 flex flex-col gap-3">
      {/* Header: icon + label */}
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-slate-500" />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>

      {/* Large value */}
      <p className={`text-2xl font-bold tracking-tight ${valueColor}`}>
        {value.toLocaleString()} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </p>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-[#1e293b] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Percentage */}
      {showPercentage && (
        <p className="text-[10px] text-slate-500 tracking-wider">
          {pct.toFixed(1)}%
        </p>
      )}
    </div>
  );
}
