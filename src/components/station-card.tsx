"use client";

import Link from "next/link";
import { Thermometer, Wind } from "lucide-react";
import { Station } from "@/types";
import RiskIndicator from "./risk-indicator";

interface StationCardProps {
  station: Station;
}

function ResourceBar({ label, value }: { label: string; value: number }) {
  let barColor = "bg-emerald-400";
  if (value <= 20) barColor = "bg-red-500";
  else if (value <= 50) barColor = "bg-amber-400";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 uppercase tracking-wider w-10 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1 rounded-full bg-[#1e293b] overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-500 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function StationCard({ station }: StationCardProps) {
  return (
    <div className="group rounded-lg border border-[#1e293b] bg-[#111827] p-5 flex flex-col gap-4 transition-all duration-200 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)]">
      {/* Header: name + location */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{station.name}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{station.location}</p>
        </div>
        <RiskIndicator level={station.riskLevel} size="sm" />
      </div>

      {/* Crew count */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Crew</span>
        <span className="text-sm font-medium text-white">
          {station.crewCount} <span className="text-slate-500">/ {station.crewMax}</span>
        </span>
      </div>

      {/* Resource bars */}
      <div className="space-y-2">
        <ResourceBar label="PWR" value={station.resources.power} />
        <ResourceBar label="FUEL" value={station.resources.fuel} />
        <ResourceBar label="WTR" value={station.resources.water} />
        <ResourceBar label="FOOD" value={station.resources.food} />
      </div>

      {/* Environment */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Thermometer size={12} className="text-slate-500" />
          <span>{station.temperature}°C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind size={12} className="text-slate-500" />
          <span>{station.windSpeed} km/h</span>
        </div>
      </div>

      {/* View Details button */}
      <Link
        href={`/station/${station.id}`}
        className="mt-auto block text-center text-xs font-medium text-blue-400 hover:text-blue-300 rounded border border-[#1e293b] hover:border-blue-500/30 py-2 transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}
