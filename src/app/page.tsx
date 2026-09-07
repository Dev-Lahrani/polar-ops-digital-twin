"use client";

import { useState, useEffect } from "react";
import { stations } from "@/data/stations";
import StationCard from "@/components/station-card";
import StatusGauge from "@/components/status-gauge";
import RiskIndicator from "@/components/risk-indicator";
import { RiskLevel } from "@/types";
import {
  Users,
  Zap,
  Fuel,
  Ship,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Activity,
} from "lucide-react";

export default function MissionControlDashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toUTCString().replace("GMT", "UTC");
      const iso = now.toISOString().split(".")[0].replace("T", " ");
      setCurrentTime(`${iso} UTC`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Global Risk
  const globalRisk: RiskLevel = stations.some(
    (s) => s.riskLevel === "EMERGENCY" || s.riskLevel === "CRITICAL"
  )
    ? "CRITICAL"
    : stations.some((s) => s.riskLevel === "WARNING")
    ? "WARNING"
    : stations.some((s) => s.riskLevel === "CAUTION")
    ? "CAUTION"
    : "NOMINAL";

  // Calculate Quick Stats
  const totalCrew = stations.reduce((acc, s) => acc + s.crewCount, 0);
  const maxCrew = stations.reduce((acc, s) => acc + s.crewMax, 0);

  const avgGenLoad = Math.round(
    stations.reduce((acc, s) => acc + (s.generatorLoad ?? 65), 0) /
      (stations.length || 1)
  );

  const totalFuelL = stations.reduce(
    (acc, s) => acc + (s.fuelCurrentL ?? (s.resources.fuel / 100) * 60000),
    0
  );
  const maxFuelL = stations.reduce(
    (acc, s) => acc + (s.fuelCapacityL ?? 65000),
    0
  );

  const daysToNextResupply = Math.min(
    ...stations.map((s) => s.nextResupplyDays ?? 30)
  );

  // Generate Resource & System Alerts
  const alerts: Array<{
    id: string;
    station: string;
    severity: "CRITICAL" | "WARNING" | "CAUTION";
    message: string;
    detail: string;
  }> = [];

  stations.forEach((st) => {
    if ((st.fuelDaysRemaining ?? 99) <= 30) {
      alerts.push({
        id: `${st.id}-fuel`,
        station: st.name,
        severity: (st.fuelDaysRemaining ?? 99) <= 15 ? "CRITICAL" : "WARNING",
        message: `${st.name} fuel reserve at ${st.resources.fuel}% — ${st.fuelDaysRemaining} days remaining`,
        detail: "Below standard 30-day polar reserve safety threshold. Consolidate non-essential heating.",
      });
    }

    if ((st.waterDaysRemaining ?? 99) <= 20) {
      alerts.push({
        id: `${st.id}-water`,
        station: st.name,
        severity: (st.waterDaysRemaining ?? 99) <= 10 ? "CRITICAL" : "WARNING",
        message: `${st.name} water treatment at ${st.resources.water}% — ${st.waterDaysRemaining} days remaining`,
        detail: "RO filtration duty cycle exceeding safe pressure limits. Maintenance window required.",
      });
    }

    if (st.resources.food <= 40 || (st.foodDaysRemaining ?? 99) <= 45) {
      alerts.push({
        id: `${st.id}-food`,
        station: st.name,
        severity: "CAUTION",
        message: `${st.name} food stocks at ${st.resources.food}% — ${st.foodDaysRemaining} days remaining`,
        detail: "Caloric buffer intact. Projected resupply window must hold without delay.",
      });
    }

    // Subsystem specific alerts
    st.subsystems.forEach((sub) => {
      if (sub.status === "CRITICAL" || sub.status === "EMERGENCY") {
        alerts.push({
          id: `${st.id}-${sub.id}`,
          station: st.name,
          severity: "CRITICAL",
          message: `${st.name} ${sub.name} is ${sub.status} (load ${sub.loadPercent}%)`,
          detail: Object.entries(sub.details)
            .slice(0, 2)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | "),
        });
      } else if (sub.status === "WARNING" && sub.loadPercent >= 75) {
        alerts.push({
          id: `${st.id}-${sub.id}`,
          station: st.name,
          severity: "WARNING",
          message: `${st.name} ${sub.name} running at elevated load (${sub.loadPercent}%)`,
          detail: Object.entries(sub.details)
            .slice(0, 2)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | "),
        });
      }
    });
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* TOP SECTION: Title, Live Clock, Global Risk */}
      <header className="rounded-2xl border border-[#1e293b] bg-gradient-to-r from-[#0d1424] via-[#0f172a] to-[#0d1424] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                NATIONAL CENTRE FOR POLAR & OCEAN RESEARCH (NCPOR)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-mono uppercase">
              POLAR-OPS MISSION CONTROL
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Live Digital Twin Command & Decision Support Center
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-5">
            {/* Live Clock */}
            <div className="flex items-center gap-2.5 rounded-lg border border-[#1e293b] bg-[#090d16] px-3.5 py-2">
              <Clock className="h-4 w-4 text-cyan-400 animate-spin-slow" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                  Mission Time
                </span>
                <span className="text-xs font-mono font-bold text-slate-100 tracking-wider">
                  {mounted ? currentTime || "SYNCHRONIZING..." : "SYNCHRONIZING..."}
                </span>
              </div>
            </div>

            {/* Global Risk Indicator */}
            <div className="flex items-center gap-2.5 rounded-lg border border-[#1e293b] bg-[#090d16] px-3.5 py-2">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                  Global Fleet Risk
                </span>
                <div className="mt-0.5">
                  <RiskIndicator level={globalRisk} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN GRID: Two large StationCard components side-by-side */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              Antarctic Station Telemetry Nodes
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            2 of 2 Stations Telemetry Linked
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stations.map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      </section>

      {/* ALERTS SECTION: Resources & Systems below warning thresholds */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
            Active System & Resource Dispatches ({alerts.length})
          </h2>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 text-center text-xs text-emerald-400 font-mono">
            ✓ All station resources and life support telemetry within nominal parameters.
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert) => {
              const isCrit = alert.severity === "CRITICAL";
              const isWarn = alert.severity === "WARNING";

              return (
                <div
                  key={alert.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border p-3.5 transition-all font-mono ${
                    isCrit
                      ? "border-red-500/40 bg-red-950/20 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.08)]"
                      : isWarn
                      ? "border-amber-500/40 bg-amber-950/20 text-amber-300"
                      : "border-yellow-500/30 bg-yellow-950/15 text-yellow-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">
                      {isCrit ? "🚨" : "⚠"}
                    </span>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold tracking-wide">
                        {alert.message}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {alert.detail}
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center shrink-0">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                        isCrit
                          ? "border-red-500/50 bg-red-500/10 text-red-400"
                          : "border-amber-500/50 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM SECTION: Quick stats row using StatusGauge */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
            Consolidated Polar Fleet Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatusGauge
            label="Total Personnel"
            value={totalCrew}
            max={maxCrew}
            unit="crew"
            warningThreshold={85}
            criticalThreshold={95}
            icon={Users}
            showPercentage={true}
          />
          <StatusGauge
            label="Avg Generator Load"
            value={avgGenLoad}
            max={100}
            unit="%"
            warningThreshold={75}
            criticalThreshold={85}
            icon={Zap}
            showPercentage={true}
          />
          <StatusGauge
            label="Total Fuel Reserve"
            value={totalFuelL}
            max={maxFuelL}
            unit="L"
            warningThreshold={40}
            criticalThreshold={25}
            icon={Fuel}
            showPercentage={true}
          />
          <StatusGauge
            label="Nearest Resupply"
            value={daysToNextResupply}
            max={90}
            unit="days"
            warningThreshold={30}
            criticalThreshold={15}
            icon={Ship}
            showPercentage={false}
          />
        </div>
      </section>
    </div>
  );
}
