"use client";

import { useState, useEffect } from "react";
import {
  SimulationResult,
  CascadeStep,
  StationMetrics,
  RiskLevel,
  Domain,
} from "@/types";
import { getMetricDelta } from "@/engine/simulation";

const severityColors: Record<string, string> = {
  NOMINAL: "#3fb950",
  CAUTION: "#eab308",
  WARNING: "#d29922",
  CRITICAL: "#f85149",
  EMERGENCY: "#b91c1c",
  nominal: "#3fb950",
  warning: "#d29922",
  critical: "#f85149",
  info: "#38bdf8",
  INFO: "#38bdf8",
};

const severityBg: Record<string, string> = {
  NOMINAL: "#3fb95015",
  CAUTION: "#eab30815",
  WARNING: "#d2992215",
  CRITICAL: "#f8514915",
  EMERGENCY: "#b91c1c15",
  nominal: "#3fb95015",
  warning: "#d2992215",
  critical: "#f8514915",
  info: "#38bdf815",
  INFO: "#38bdf815",
};

const domainColors: Record<Domain, string> = {
  power: "#f0883e",
  climate: "#79c0ff",
  water: "#58a6ff",
  comms: "#bc8cff",
  fuel: "#d29922",
  habitat: "#3fb950",
  science: "#f778ba",
  safety: "#f85149",
  overall: "#8b949e",
};

function RiskIndicator({ level }: { level: RiskLevel }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider"
      style={{
        backgroundColor: severityBg[level],
        color: severityColors[level],
        border: `2px solid ${severityColors[level]}`,
      }}
    >
      <span
        className="w-3 h-3 rounded-full status-pulse"
        style={{ backgroundColor: severityColors[level], color: severityColors[level] }}
      />
      Risk Level: {level}
    </div>
  );
}

function BeforeAfterCard({
  label,
  before,
  after,
  unit,
  delta,
}: {
  label: string;
  before: string;
  after: string;
  unit: string;
  delta: "worse" | "same" | "better";
}) {
  const color =
    delta === "worse" ? "#f85149" : delta === "better" ? "#3fb950" : "#8b949e";
  const arrow = delta === "worse" ? "↓" : delta === "better" ? "↑" : "—";

  return (
    <div
      className="rounded-lg border p-4 flex-1"
      style={{ borderColor: "#30363d", background: "#161b22" }}
    >
      <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-3">
        {label}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-center">
          <div className="text-xs text-[#8b949e] mb-1">BEFORE</div>
          <div className="text-lg font-bold text-[#e6edf3]">
            {before}
            <span className="text-xs text-[#8b949e] ml-1">{unit}</span>
          </div>
        </div>
        <div className="text-2xl mx-4" style={{ color }}>
          {arrow}
        </div>
        <div className="text-center">
          <div className="text-xs text-[#8b949e] mb-1">AFTER</div>
          <div className="text-lg font-bold" style={{ color }}>
            {after}
            <span className="text-xs ml-1" style={{ color: "#8b949e" }}>
              {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CascadeStepNode({
  step,
  visible,
  isLast,
}: {
  step: CascadeStep;
  visible: boolean;
  isLast: boolean;
}) {
  return (
    <div
      className="relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <div
        className="rounded-lg border p-4 ml-8"
        style={{
          borderColor: severityColors[step.severity],
          background: severityBg[step.severity],
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
            style={{
              backgroundColor: severityColors[step.severity],
              color: "#0d1117",
            }}
          >
            {step.step}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${domainColors[step.domain]}20`,
              color: domainColors[step.domain],
              border: `1px solid ${domainColors[step.domain]}40`,
            }}
          >
            {step.domain}
          </span>
        </div>
        <div className="font-mono text-sm mb-1">
          <span className="text-[#8b949e]">{step.variable}: </span>
          <span className="text-[#e6edf3]">{step.fromValue}</span>
          <span className="text-[#f85149] mx-2">→</span>
          <span style={{ color: severityColors[step.severity] }}>
            {step.toValue}
          </span>
        </div>
        <div className="text-xs text-[#8b949e]">{step.description}</div>
      </div>
      {!isLast && (
        <div className="absolute left-4 top-full w-0.5 h-4 bg-[#30363d]" />
      )}
    </div>
  );
}

export default function CascadeVisualizer({
  result,
}: {
  result: SimulationResult;
}) {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    setVisibleSteps(0);
    setFlashClass("");

    const interval = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev >= result.steps.length) {
          clearInterval(interval);
          // Trigger flash on completion
          const color = severityColors[result.after.riskLevel];
          setFlashClass(`flash-${result.after.riskLevel}`);
          setTimeout(() => setFlashClass(""), 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [result]);

  const powerDelta = getMetricDelta("power", result.before, result.after);
  const fuelDelta = getMetricDelta("fuelDays", result.before, result.after);
  const waterDelta = getMetricDelta(
    "waterReserve",
    result.before,
    result.after
  );
  const foodDelta = getMetricDelta("foodDays", result.before, result.after);
  const riskDelta = getMetricDelta("riskLevel", result.before, result.after);

  return (
    <div className={flashClass}>
      {/* BEFORE vs AFTER summary */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[#8b949e] uppercase tracking-wider mb-4">
          Station Impact Overview
        </h3>
        <div className="flex gap-4 flex-wrap">
          <BeforeAfterCard
            label="Power Reserve"
            before={`${result.before.power}`}
            after={`${result.after.power}`}
            unit="%"
            delta={powerDelta}
          />
          <BeforeAfterCard
            label="Fuel Days"
            before={`${result.before.fuelDays}`}
            after={`${result.after.fuelDays}`}
            unit="days"
            delta={fuelDelta}
          />
          <BeforeAfterCard
            label="Water Reserve"
            before={result.before.waterReserve.toLocaleString()}
            after={result.after.waterReserve.toLocaleString()}
            unit="L"
            delta={waterDelta}
          />
          <BeforeAfterCard
            label="Food Supply"
            before={`${result.before.foodDays}`}
            after={`${result.after.foodDays}`}
            unit="days"
            delta={foodDelta}
          />
        </div>
      </div>

      {/* Risk Level */}
      <div className="mb-8 flex justify-center">
        <RiskIndicator level={result.after.riskLevel} />
      </div>

      {/* Cascade chain */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[#8b949e] uppercase tracking-wider mb-4">
          Failure Cascade Chain
        </h3>
        <div className="space-y-0">
          {result.steps.map((step, i) => (
            <CascadeStepNode
              key={step.step}
              step={step}
              visible={i < visibleSteps}
              isLast={i === result.steps.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Mitigations */}
      <div>
        <h3 className="text-sm font-bold text-[#58a6ff] uppercase tracking-wider mb-3">
          Recommended Mitigations
        </h3>
        <div className="space-y-2">
          {result.mitigations.map((m, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-sm"
              style={{
                opacity: visibleSteps >= result.steps.length ? 1 : 0,
                transition: `opacity 0.3s ease ${i * 0.1}s`,
              }}
            >
              <span className="text-[#58a6ff] mt-0.5">▸</span>
              <span className="text-[#e6edf3]">
                {typeof m === "string" ? m : `${m.action} (${m.impact})`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
