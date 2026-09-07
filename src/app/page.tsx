"use client";

import { useState, useEffect } from "react";
import { useStations } from "@/hooks/use-api";
import ResourceBar from "@/components/resource-bar";
import SystemOverview from "@/components/system-overview";
import RiskIndicator from "@/components/risk-indicator";
import { RiskLevel, Station, Subsystem } from "@/types";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Users,
  Zap,
  Fuel,
  Ship,
  Thermometer,
  Wind,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

function getRiskBorder(level: RiskLevel): string {
  switch (level) {
    case "EMERGENCY": return "border-red-700 shadow-[0_0_20px_rgba(185,28,28,0.15)]";
    case "CRITICAL": return "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
    case "WARNING": return "border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.08)]";
    case "CAUTION": return "border-yellow-500/30";
    case "NOMINAL": return "border-[#2a3a1e]";
    default: return "border-[#2a3a1e]";
  }
}

function getRiskBadgeColor(level: RiskLevel): string {
  switch (level) {
    case "EMERGENCY": return "bg-red-800 text-red-200 border-red-600";
    case "CRITICAL": return "bg-red-900/60 text-red-400 border-red-500/40";
    case "WARNING": return "bg-amber-900/40 text-amber-400 border-amber-500/30";
    case "CAUTION": return "bg-yellow-900/30 text-yellow-400 border-yellow-500/20";
    case "NOMINAL": return "bg-emerald-900/30 text-emerald-400 border-emerald-500/20";
    default: return "bg-[#141b13] text-[#7c8b65] border-[#2a3a1e]";
  }
}

export default function MissionControlDashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const { stations: stationData, isLoading } = useStations();
  const stations: Station[] = stationData ?? [];

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const globalRisk: RiskLevel = stations.some(
    (s: Station) => s.riskLevel === "EMERGENCY" || s.riskLevel === "CRITICAL"
  )
    ? "CRITICAL"
    : stations.some((s: Station) => s.riskLevel === "WARNING")
    ? "WARNING"
    : stations.some((s: Station) => s.riskLevel === "CAUTION")
    ? "CAUTION"
    : "NOMINAL";

  const totalCrew = stations.reduce((acc: number, s: Station) => acc + s.crewCount, 0);
  const maxCrew = stations.reduce((acc: number, s: Station) => acc + s.crewMax, 0);
  const avgGenLoad = Math.round(
    stations.reduce((acc: number, s: Station) => acc + (s.generatorLoad ?? 65), 0) / (stations.length || 1)
  );
  const daysToNextResupply = Math.min(...stations.map((s: Station) => s.nextResupplyDays ?? 30));

  const alerts: Array<{
    id: string;
    station: string;
    severity: "CRITICAL" | "WARNING" | "CAUTION";
    message: string;
  }> = [];

  stations.forEach((st: Station) => {
    if ((st.fuelDaysRemaining ?? 99) <= 30) {
      alerts.push({
        id: `${st.id}-fuel`,
        station: st.name,
        severity: (st.fuelDaysRemaining ?? 99) <= 15 ? "CRITICAL" : "WARNING",
        message: `${st.name} fuel at ${st.resources.fuel}% — ${st.fuelDaysRemaining}d remaining`,
      });
    }
    if ((st.waterDaysRemaining ?? 99) <= 20) {
      alerts.push({
        id: `${st.id}-water`,
        station: st.name,
        severity: (st.waterDaysRemaining ?? 99) <= 10 ? "CRITICAL" : "WARNING",
        message: `${st.name} water at ${st.resources.water}% — ${st.waterDaysRemaining}d remaining`,
      });
    }
    st.subsystems.forEach((sub: Subsystem) => {
      if (sub.status === "CRITICAL" || sub.status === "EMERGENCY") {
        alerts.push({
          id: `${st.id}-${sub.id}`,
          station: st.name,
          severity: "CRITICAL",
          message: `${st.name} ${sub.name} ${sub.status} (${sub.loadPercent}%)`,
        });
      }
    });
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#7d9154] h-8 w-8" />
        <span className="ml-3 text-sm font-mono text-[#5a6b48]">Loading station telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Institutional Header */}
      <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#1a2518] border border-[#2a3a1e]">
            <span className="text-[10px] font-black text-[#7d9154] font-mono">MoES</span>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#7c8b65]">Ministry of Earth Sciences, Government of India</p>
            <p className="text-[10px] font-mono text-[#5a6b48]">National Centre for Polar & Ocean Research (NCPOR)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-[#5a6b48]">
          <span>Indian Antarctic Programme</span>
          <span className="text-[#2a3a1e]">|</span>
          <span>Maitri-II · Bharati</span>
          <span className="text-[#2a3a1e]">|</span>
          <span className="text-[#7d9154]">Digital Twin v2.0</span>
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#7c8b65]">
              NATIONAL CENTRE FOR POLAR & OCEAN RESEARCH
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#edf2e7] font-mono uppercase">
            POLAR-OPS MISSION CONTROL
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-[#2a3a1e] bg-[#101510] px-3 py-1.5">
            <Clock className="h-3.5 w-3.5 text-[#7d9154]" />
            <span className="text-[10px] font-mono text-[#edf2e7]">
              {mounted ? currentTime || "SYNC..." : "SYNC..."}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-[#2a3a1e] bg-[#101510] px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#7c8b65]" />
            <RiskIndicator level={globalRisk} size="sm" />
          </div>
        </div>
      </header>

      {/* Station Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#7c8b65] font-mono">
            Station Telemetry
          </h2>
          <span className="text-[10px] text-[#5a6b48] font-mono">
            {stations.length} stations linked
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {stations.map((station: Station) => (
            <div
              key={station.id}
              className={`rounded-xl border bg-[#101510] p-5 transition-all hover:bg-[#141b13] ${getRiskBorder(station.riskLevel)}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Link href={`/station/${station.id}`} className="text-sm font-bold text-[#edf2e7] font-mono uppercase hover:text-[#a9b97a] transition-colors">
                      {station.name}
                    </Link>
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${getRiskBadgeColor(station.riskLevel)}`}>
                      {station.riskLevel}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5a6b48] font-mono">{station.location}</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-[#7c8b65]">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {station.crewCount}/{station.crewMax}
                  </span>
                  <span className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    {station.temperature}°C
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {station.windSpeed}km/h
                  </span>
                </div>
              </div>

              {/* Resource Bars */}
              <div className="space-y-2.5 mb-4">
                <ResourceBar
                  label="Fuel"
                  value={station.resources.fuel}
                  icon="⛽"
                  daysRemaining={station.fuelDaysRemaining}
                />
                <ResourceBar
                  label="Water"
                  value={station.resources.water}
                  icon="💧"
                  daysRemaining={station.waterDaysRemaining}
                />
                <ResourceBar
                  label="Food"
                  value={station.resources.food}
                  icon="📦"
                  daysRemaining={station.foodDaysRemaining}
                />
                <ResourceBar
                  label="Power"
                  value={station.resources.power}
                  icon="⚡"
                />
              </div>

              {/* System Overview + Link */}
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <SystemOverview subsystems={station.subsystems} />
                </div>
                <Link
                  href={`/station/${station.id}`}
                  className="ml-3 flex items-center gap-1 text-[10px] font-mono text-[#7d9154] hover:text-[#a9b97a] transition-colors shrink-0"
                >
                  Details <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alerts Grid */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#7c8b65] font-mono">
            Active Alerts ({alerts.length})
          </h2>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-[#101510] p-4 text-center text-xs text-emerald-400 font-mono">
            All systems nominal
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {alerts.map((alert) => {
              const isCrit = alert.severity === "CRITICAL";
              return (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 font-mono ${
                    isCrit
                      ? "border-red-500/30 bg-red-950/20 text-red-300"
                      : "border-amber-500/20 bg-amber-950/15 text-amber-300"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${isCrit ? "bg-red-500" : "bg-amber-500"}`} />
                  <span className="text-[11px]">{alert.message}</span>
                  <span className={`ml-auto text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    isCrit
                      ? "border-red-500/40 bg-red-500/10 text-red-400"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-[#7d9154]" />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#7c8b65] font-mono">
            Fleet Metrics
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "PERSONNEL", value: `${totalCrew}/${maxCrew}`, sub: "crew", icon: Users },
            { label: "GEN LOAD", value: `${avgGenLoad}%`, sub: "average", icon: Zap },
            { label: "FUEL", value: `${Math.round(stations.reduce((a: number, s: Station) => a + s.resources.fuel, 0) / stations.length)}%`, sub: "average", icon: Fuel },
            { label: "RESUPPLY", value: `${daysToNextResupply}d`, sub: "nearest", icon: Ship },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className="h-3 w-3 text-[#7d9154]" />
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#5a6b48]">{stat.label}</span>
              </div>
              <div className="text-lg font-bold font-mono text-[#edf2e7]">{stat.value}</div>
              <span className="text-[10px] font-mono text-[#5a6b48]">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
