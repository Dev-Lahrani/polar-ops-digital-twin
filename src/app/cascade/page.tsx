"use client";

import { useState } from "react";
import { getStation } from "@/data/stations";
import { runSimulation } from "@/engine/simulation";
import { SimulationResult } from "@/types";
import CascadeVisualizer from "@/components/cascade-visualizer";

const failurePresets = [
  {
    id: "generator",
    label: "Generator Failure",
    icon: "⚡",
    description: "Primary generator goes offline",
    color: "#f85149",
    input: { failedSubsystem: "generator" as const },
  },
  {
    id: "hvac",
    label: "HVAC System Failure",
    icon: "🌡️",
    description: "Heating/ventilation system fails",
    color: "#f0883e",
    input: { failedSubsystem: "hvac" as const },
  },
  {
    id: "water_plant",
    label: "Water Plant Failure",
    icon: "💧",
    description: "Water treatment plant offline",
    color: "#58a6ff",
    input: { failedSubsystem: "water_plant" as const },
  },
  {
    id: "comms",
    label: "Communications Failure",
    icon: "📡",
    description: "Satellite comms link lost",
    color: "#bc8cff",
    input: { failedSubsystem: "comms" as const },
  },
  {
    id: "extreme_cold",
    label: "Extreme Cold Event",
    icon: "❄️",
    description: "Temperature drops to -40°C",
    color: "#79c0ff",
    input: { temperatureC: -40 },
  },
  {
    id: "resupply_delay",
    label: "Resupply Delay",
    icon: "🚢",
    description: "Resupply delayed by 14 days",
    color: "#d29922",
    input: { resupplyDelayDays: 14 },
  },
];

export default function CascadePage() {
  const [activeStation, setActiveStation] = useState<"maitri" | "bharati">(
    "maitri"
  );
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const station = getStation(activeStation);

  const handlePresetClick = (presetId: string) => {
    if (!station) return;
    const preset = failurePresets.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    const simResult = runSimulation(station, preset.input);
    setResult(simResult);
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-wider text-[#edf2e7] uppercase">
          FAILURE CASCADE SIMULATOR
        </h1>
        <p className="text-sm text-[#5a6b48] mt-1 font-mono">
          Simulate equipment failures and observe system-wide impact
        </p>
      </header>

      {/* Station selector tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-lg w-fit bg-[#101510] border border-[#2a3a1e]">
        {(["maitri", "bharati"] as const).map((id) => (
          <button
            key={id}
            onClick={() => {
              setActiveStation(id);
              setResult(null);
              setSelectedPreset(null);
            }}
            className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all font-mono ${
              activeStation === id
                ? "bg-[#1a2518] text-[#a9b97a] border border-[#7d9154]/40"
                : "text-[#5a6b48] border border-transparent hover:text-[#7c8b65]"
            }`}
          >
            {id === "maitri" ? "Maitri" : "Bharati"}
          </button>
        ))}
      </div>

      {/* Failure preset cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {failurePresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.id)}
            className={`text-left rounded-lg border p-5 transition-all hover:scale-[1.02] ${
              selectedPreset === preset.id
                ? "shadow-lg"
                : "border-[#2a3a1e] bg-[#101510]"
            }`}
            style={{
              borderColor:
                selectedPreset === preset.id ? preset.color : undefined,
              background:
                selectedPreset === preset.id
                  ? `${preset.color}10`
                  : undefined,
              boxShadow:
                selectedPreset === preset.id
                  ? `0 0 20px ${preset.color}20`
                  : undefined,
            }}
          >
            <div className="text-3xl mb-3">{preset.icon}</div>
            <div
              className="text-sm font-bold mb-1 font-mono"
              style={{ color: preset.color }}
            >
              {preset.label}
            </div>
            <div className="text-xs text-[#7c8b65]">
              {preset.description}
            </div>
          </button>
        ))}
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">
              {failurePresets.find((p) => p.id === selectedPreset)?.icon}
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#edf2e7] font-mono">
                {failurePresets.find((p) => p.id === selectedPreset)?.label} —{" "}
                {station?.name}
              </h2>
              <p className="text-xs text-[#5a6b48]">
                Cascade propagation simulation results
              </p>
            </div>
          </div>
          <CascadeVisualizer result={result} />
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-12 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-[#7c8b65] text-sm font-mono">
            Select a failure scenario above to begin the cascade simulation
          </p>
        </div>
      )}
    </div>
  );
}
