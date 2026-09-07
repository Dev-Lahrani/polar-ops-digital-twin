"use client";

import Link from "next/link";
import { Thermometer, Wind, Users, ArrowUpRight } from "lucide-react";
import { Station } from "@/types";
import RiskIndicator from "./risk-indicator";

interface StationCardProps {
  station: Station;
}

function ResourceBar({ label, value }: { label: string; value: number }) {
  let barColor = "bg-emerald-400";
  if (value <= 25) barColor = "bg-red-500";
  else if (value <= 50) barColor = "bg-amber-400";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider w-11 shrink-0 font-mono">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-300 w-9 text-right font-mono">
        {value.toLocaleString()}%
      </span>
    </div>
  );
}

export default function StationCard({ station }: StationCardProps) {
  return (
    <div className="group rounded-xl border border-[#1e293b] bg-[#111827] p-5 flex flex-col gap-4 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)]">
      {/* Header: name + location */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-wide font-mono">
              {station.name.toUpperCase()} STATION
            </h3>
            <span className="text-[10px] text-cyan-400/80 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded font-mono">
              EST. {station.established}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>📍</span> {station.location}
          </p>
        </div>
        <RiskIndicator level={station.riskLevel} size="sm" />
      </div>

      {/* Crew count */}
      <div className="flex items-center justify-between rounded-lg bg-[#0d1424] border border-[#1e293b]/60 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            Crew Onboard
          </span>
        </div>
        <span className="text-sm font-semibold text-white font-mono">
          {station.crewCount.toLocaleString()}{" "}
          <span className="text-xs text-slate-500">
            / {station.crewMax.toLocaleString()}
          </span>
        </span>
      </div>

      {/* Resource bars */}
      <div className="space-y-2.5 rounded-lg bg-[#0d1424]/60 border border-[#1e293b]/40 p-3">
        <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-1">
          Life-Support Telemetry
        </div>
        <ResourceBar label="PWR" value={station.resources.power} />
        <ResourceBar label="FUEL" value={station.resources.fuel} />
        <ResourceBar label="WATER" value={station.resources.water} />
        <ResourceBar label="FOOD" value={station.resources.food} />
      </div>

      {/* Environment */}
      <div className="flex items-center justify-between text-xs text-slate-300 font-mono px-1">
        <div className="flex items-center gap-1.5 bg-[#162033] px-2.5 py-1.5 rounded-md border border-[#1e293b]">
          <Thermometer size={14} className="text-cyan-400" />
          <span>{station.temperature}°C</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#162033] px-2.5 py-1.5 rounded-md border border-[#1e293b]">
          <Wind size={14} className="text-cyan-400" />
          <span>{station.windSpeed} km/h</span>
        </div>
      </div>

      {/* View Details button */}
      <Link
        href={`/station/${station.id}`}
        className="mt-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 rounded-lg border border-cyan-800/50 hover:border-cyan-400/60 py-2.5 transition-all duration-200"
      >
        <span>Access Station Twin</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </Link>
    </div>
  );
}
