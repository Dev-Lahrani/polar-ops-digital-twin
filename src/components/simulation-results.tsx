"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Layers, Cpu } from "lucide-react";
import { SimulationResult, Station, Mitigation } from "@/types";
import RiskIndicator from "./risk-indicator";
import CascadeChain from "./cascade-chain";
import CalculationDrawer from "./calculation-drawer";

interface SimulationResultsProps {
  result: SimulationResult | null;
  station: Station;
  isLoading: boolean;
}

interface DeltaCardProps {
  title: string;
  before: number;
  after: number;
  unit: string;
  lowerIsBetter: boolean;
}

function DeltaCard({ title, before, after, unit, lowerIsBetter }: DeltaCardProps) {
  const delta = after - before;
  const isZero = delta === 0;
  const isWorse = lowerIsBetter ? delta > 0 : delta < 0;
  const isBetter = lowerIsBetter ? delta < 0 : delta > 0;

  const badgeColor = isZero
    ? "text-slate-400 bg-slate-800/60 border-slate-700"
    : isWorse
    ? "text-red-400 bg-red-950/40 border-red-800/60"
    : "text-emerald-400 bg-emerald-950/40 border-emerald-800/60";

  const deltaText = isZero
    ? "±0"
    : delta > 0
    ? `+${delta.toLocaleString()}${unit === "%" ? "%" : ` ${unit}`}`
    : `${delta.toLocaleString()}${unit === "%" ? "%" : ` ${unit}`}`;

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#0c1322] p-4 flex flex-col justify-between gap-3 shadow-md font-mono">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}
        >
          {deltaText}
        </span>
      </div>

      <div className="flex items-center gap-2 text-base">
        <span className="text-slate-400 font-semibold">
          {before.toLocaleString()}
          <span className="text-xs text-slate-500 ml-0.5">{unit}</span>
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
        <span
          className={`font-black text-lg ${
            isZero ? "text-slate-100" : isWorse ? "text-red-400" : "text-emerald-400"
          }`}
        >
          {after.toLocaleString()}
          <span className="text-xs ml-0.5 font-normal">{unit}</span>
        </span>
      </div>

      <div className="h-1 w-full rounded-full bg-[#162033] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isWorse ? "bg-red-500" : isBetter ? "bg-emerald-400" : "bg-cyan-500"
          }`}
          style={{ width: `${Math.min(100, Math.max(10, (after / (before || 1)) * 50))}%` }}
        />
      </div>
    </div>
  );
}

const priorityBadgeStyles: Record<string, string> = {
  CRITICAL: "bg-red-950/60 text-red-300 border-red-800/70",
  HIGH: "bg-amber-950/60 text-amber-300 border-amber-800/70",
  MEDIUM: "bg-blue-950/60 text-blue-300 border-blue-800/70",
  LOW: "bg-slate-800/60 text-slate-300 border-slate-700",
};

export default function SimulationResults({
  result,
  station,
  isLoading,
}: SimulationResultsProps) {
  // 1. Placeholder state before simulation runs
  if (!result && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1e293b] bg-[#090e1a]/60 p-12 text-center min-h-[500px] font-mono">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111927] border border-cyan-500/20 text-cyan-400">
          <Layers className="h-8 w-8 animate-pulse" />
        </div>
        <h3 className="text-base font-bold uppercase tracking-wider text-white mb-2">
          Simulation Standby
        </h3>
        <p className="max-w-md text-xs text-slate-400 leading-relaxed">
          Adjust scenario parameters on the left and click{" "}
          <span className="text-cyan-400 font-bold">RUN SIMULATION</span> to compute
          high-fidelity cascading failure models, resource exhaustion horizons, and automated
          mitigations for {station.name} Station.
        </p>
      </div>
    );
  }

  // 2. Loading animation
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e293b] bg-[#090e1a] p-12 text-center min-h-[500px] font-mono">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Cpu className="h-8 w-8 text-cyan-400 animate-pulse" />
        </div>
        <h3 className="text-base font-bold uppercase tracking-widest text-cyan-300 mb-1">
          EXECUTING FIRST-PRINCIPLES TWIN SOLVER
        </h3>
        <p className="text-xs text-slate-400">
          Propagating thermodynamic gradients & electrical load shedding vectors...
        </p>
      </div>
    );
  }

  if (!result) return null;

  // Extract delta comparison metrics
  const genBefore = result.metricsComparison?.generatorLoad.before ?? 56;
  const genAfter = result.metricsComparison?.generatorLoad.after ?? result.after.generatorLoad ?? 68;

  const burnBefore = result.metricsComparison?.fuelBurnRate.before ?? 30;
  const burnAfter = result.metricsComparison?.fuelBurnRate.after ?? result.after.fuelBurnRate ?? 45;

  const daysBefore = result.metricsComparison?.daysToDepletion.before ?? result.before.fuelDays;
  const daysAfter = result.metricsComparison?.daysToDepletion.after ?? result.after.fuelDays;

  const gapBefore = result.metricsComparison?.resupplyGap.before ?? 0;
  const gapAfter = result.metricsComparison?.resupplyGap.after ?? 0;

  // Normalize mitigations
  const normalizedMitigations: Mitigation[] = result.mitigations.map((m, idx) => {
    if (typeof m === "string") {
      return {
        id: `mit-${idx}`,
        priority: idx === 0 ? "CRITICAL" : idx === 1 ? "HIGH" : "MEDIUM",
        action: m,
        impact: "Reduces critical vulnerability and stabilizes vital life-support margins.",
        category: "Operational Protocol",
      };
    }
    return m;
  });

  return (
    <div className="space-y-6 rounded-2xl border border-[#1e293b] bg-[#090e1a] p-6 shadow-2xl font-mono">
      {/* Top Banner: Risk Level + Show Calculations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#1e293b] bg-[#0c1322] p-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#162033] border border-[#1e293b] text-cyan-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Projected Station State
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <RiskIndicator level={result.after.riskLevel} size="lg" />
              <span className="text-xs text-slate-400">
                (Baseline: {result.before.riskLevel})
              </span>
            </div>
          </div>
        </div>

        {/* Calculation Drawer Trigger */}
        <CalculationDrawer cascadeSteps={result.steps} />
      </div>

      {/* Status Cards Row: 4 Delta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <DeltaCard
          title="Generator Load"
          before={genBefore}
          after={genAfter}
          unit="%"
          lowerIsBetter={true}
        />
        <DeltaCard
          title="Fuel Burn Rate"
          before={burnBefore}
          after={burnAfter}
          unit="L/hr"
          lowerIsBetter={true}
        />
        <DeltaCard
          title="Fuel Horizon"
          before={daysBefore}
          after={daysAfter}
          unit="days"
          lowerIsBetter={false}
        />
        <DeltaCard
          title="Resupply Deficit"
          before={gapBefore}
          after={gapAfter}
          unit="days"
          lowerIsBetter={true}
        />
      </div>

      {/* CASCADE CHAIN SECTION */}
      <div className="space-y-3 border-t border-[#1e293b] pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">
              CASCADE FAILURE CHAIN ({result.steps.length} STAGES)
            </h3>
          </div>
          <span className="text-[10px] text-cyan-400/80 font-bold">
            DOMINO EFFECT PROPAGATION
          </span>
        </div>

        <CascadeChain steps={result.steps} animate={true} />
      </div>

      {/* RECOMMENDED MITIGATIONS SECTION */}
      <div className="space-y-3 border-t border-[#1e293b] pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">
              RECOMMENDED MITIGATION PROTOCOLS ({normalizedMitigations.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">
            SORTED BY THREAT PRIORITY
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {normalizedMitigations.map((mit, i) => (
            <div
              key={mit.id || i}
              className="rounded-xl border border-[#1e293b] bg-[#0c1322] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      priorityBadgeStyles[mit.priority] || priorityBadgeStyles.LOW
                    }`}
                  >
                    {mit.priority} PRIORITY
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                    {mit.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  {mit.action}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-emerald-400 font-semibold">Impact: </span>
                  {mit.impact}
                </p>
              </div>

              <div className="self-end sm:self-center shrink-0">
                <span className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold">
                  <Sparkles className="h-3 w-3" />
                  <span>Execute SOP</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
