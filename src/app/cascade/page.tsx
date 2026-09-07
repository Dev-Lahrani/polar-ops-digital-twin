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
        <h1
          className="text-2xl font-bold tracking-wider"
          style={{ color: "#f85149" }}
        >
          FAILURE CASCADE SIMULATOR
        </h1>
        <p className="text-sm text-[#8b949e] mt-1">
          Simulate equipment failures and observe system-wide impact
        </p>
      </header>

      {/* Station selector tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-lg w-fit" style={{ background: "#161b22" }}>
        {(["maitri", "bharati"] as const).map((id) => (
          <button
            key={id}
            onClick={() => {
              setActiveStation(id);
              setResult(null);
              setSelectedPreset(null);
            }}
            className="px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background:
                activeStation === id ? "#1a2332" : "transparent",
              color:
                activeStation === id ? "#58a6ff" : "#8b949e",
              border:
                activeStation === id
                  ? "1px solid #58a6ff40"
                  : "1px solid transparent",
            }}
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
            className="text-left rounded-lg border p-5 transition-all hover:scale-[1.02]"
            style={{
              borderColor:
                selectedPreset === preset.id ? preset.color : "#30363d",
              background:
                selectedPreset === preset.id
                  ? `${preset.color}10`
                  : "#161b22",
              boxShadow:
                selectedPreset === preset.id
                  ? `0 0 20px ${preset.color}20`
                  : "none",
            }}
          >
            <div className="text-3xl mb-3">{preset.icon}</div>
            <div
              className="text-sm font-bold mb-1"
              style={{ color: preset.color }}
            >
              {preset.label}
            </div>
            <div className="text-xs text-[#8b949e]">
              {preset.description}
            </div>
          </button>
        ))}
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-lg border p-6" style={{ borderColor: "#30363d", background: "#0d1117" }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">
              {failurePresets.find((p) => p.id === selectedPreset)?.icon}
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#e6edf3]">
                {failurePresets.find((p) => p.id === selectedPreset)?.label} —{" "}
                {station?.name}
              </h2>
              <p className="text-xs text-[#8b949e]">
                Cascade propagation simulation results
              </p>
            </div>
          </div>
          <CascadeVisualizer result={result} />
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div
          className="rounded-lg border p-12 text-center"
          style={{ borderColor: "#30363d", background: "#161b22" }}
        >
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-[#8b949e] text-sm">
            Select a failure scenario above to begin the cascade simulation
          </p>
        </div>
      )}
    </div>
  );
}
