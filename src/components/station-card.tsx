"use client";

import Link from "next/link";
import { Thermometer, Wind, Users, ArrowUpRight } from "lucide-react";
import { Station } from "@/types";
import RiskIndicator from "./risk-indicator";
import ResourceBar from "./resource-bar";
import SystemOverview from "./system-overview";

interface StationCardProps {
  station: Station;
}

function getRiskBorder(level: string): string {
  switch (level) {
    case "EMERGENCY": return "border-red-700 shadow-[0_0_20px_rgba(185,28,28,0.15)]";
    case "CRITICAL": return "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
    case "WARNING": return "border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.08)]";
    case "CAUTION": return "border-yellow-500/30";
    case "NOMINAL": return "border-[#2a3a1e]";
    default: return "border-[#2a3a1e]";
  }
}

export default function StationCard({ station }: StationCardProps) {
  return (
    <div className={`group rounded-xl border bg-[#101510] p-5 flex flex-col gap-4 transition-all duration-300 hover:bg-[#141b13] ${getRiskBorder(station.riskLevel)}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/station/${station.id}`} className="text-base font-bold text-[#edf2e7] tracking-wide font-mono uppercase hover:text-[#a9b97a] transition-colors">
              {station.name}
            </Link>
            <span className="text-[10px] text-[#7d9154] bg-[#7d9154]/10 border border-[#7d9154]/20 px-1.5 py-0.5 rounded font-mono">
              EST. {station.established}
            </span>
            <RiskIndicator level={station.riskLevel} size="sm" />
          </div>
          <p className="text-[11px] text-[#5a6b48] mt-1 flex items-center gap-1 font-mono">
            <span>📍</span> {station.location}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-[#0d1424] border border-[#2a3a1e]/60 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-[#7c8b65]">
          <Users className="h-3.5 w-3.5 text-[#7d9154]" />
          <span className="text-[10px] text-[#7c8b65] uppercase tracking-wider font-mono">
            Crew Onboard
          </span>
        </div>
        <span className="text-sm font-semibold text-[#edf2e7] font-mono">
          {station.crewCount.toLocaleString()}{" "}
          <span className="text-xs text-[#5a6b48]">
            / {station.crewMax.toLocaleString()}
          </span>
        </span>
      </div>

      <div className="space-y-2.5 rounded-lg bg-[#0d1424]/60 border border-[#2a3a1e]/40 p-3">
        <div className="text-[10px] font-mono uppercase text-[#7c8b65] tracking-wider mb-1">
          Life-Support Telemetry
        </div>
        <ResourceBar label="PWR" value={station.resources.power} icon="⚡" />
        <ResourceBar label="FUEL" value={station.resources.fuel} icon="⛽" daysRemaining={station.fuelDaysRemaining} />
        <ResourceBar label="WATER" value={station.resources.water} icon="💧" daysRemaining={station.waterDaysRemaining} />
        <ResourceBar label="FOOD" value={station.resources.food} icon="📦" daysRemaining={station.foodDaysRemaining} />
      </div>

      <div className="flex items-center justify-between text-xs text-[#edf2e7] font-mono px-1">
        <div className="flex items-center gap-1.5 bg-[#141b13] px-2.5 py-1.5 rounded-md border border-[#2a3a1e]">
          <Thermometer size={14} className="text-[#7d9154]" />
          <span>{station.temperature}°C</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#141b13] px-2.5 py-1.5 rounded-md border border-[#2a3a1e]">
          <Wind size={14} className="text-[#7d9154]" />
          <span>{station.windSpeed} km/h</span>
        </div>
      </div>

      <div className="mt-auto">
        <SystemOverview subsystems={station.subsystems} />
      </div>

      <Link
        href={`/station/${station.id}`}
        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#7d9154] bg-[#7d9154]/10 hover:bg-[#7d9154]/20 rounded-lg border border-[#7d9154]/30 hover:border-[#7d9154]/50 py-2.5 transition-all duration-200"
      >
        <span>Access Station Twin</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-[#7d9154] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </Link>
    </div>
  );
}
