"use client";

import { useState } from "react";
import CopilotChat from "@/components/copilot-chat";
import RiskHeatmap from "@/components/risk-heatmap";
import { runMonteCarlo } from "@/engine/monte-carlo";
import { getStation } from "@/data/stations";
import { useMemo } from "react";
import { BrainCircuit } from "lucide-react";

export default function CopilotPage() {
  const [selectedStation, setSelectedStation] = useState("maitri");
  const station = getStation(selectedStation);

  const mcResult = useMemo(() => {
    if (!station) return null;
    return runMonteCarlo(station, {});
  }, [station]);

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-[var(--accent)]" />
            <div>
              <h1 className="text-2xl font-mono text-white tracking-wider">AI OPS COPILOT</h1>
              <p className="text-sm text-slate-400 mt-1">Natural language station diagnostics &amp; recommendations</p>
            </div>
          </div>
          <div className="flex gap-2">
            {["maitri", "bharati"].map(id => (
              <button
                key={id}
                onClick={() => setSelectedStation(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase border transition-colors ${
                  selectedStation === id
                    ? "bg-[var(--accent)]/20 border-[var(--accent)]/50 text-[var(--accent)]"
                    : "border-[#334155] text-slate-400 hover:border-slate-500"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-[600px]">
            {station && <CopilotChat station={station} />}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {station && (
              <div className="bg-[var(--surface)] border border-[#1e293b] rounded-lg p-4">
                <div className="text-xs font-mono text-slate-500 mb-3">STATION SNAPSHOT</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#0d1117] rounded-md p-2.5">
                    <div className="text-slate-500">Crew</div>
                    <div className="text-white font-mono">{station.crewCount}/{station.crewMax}</div>
                  </div>
                  <div className="bg-[#0d1117] rounded-md p-2.5">
                    <div className="text-slate-500">Temp</div>
                    <div className="text-white font-mono">{station.temperature}°C</div>
                  </div>
                  <div className="bg-[#0d1117] rounded-md p-2.5">
                    <div className="text-slate-500">Generator</div>
                    <div className="text-white font-mono">{station.generatorLoad}%</div>
                  </div>
                  <div className="bg-[#0d1117] rounded-md p-2.5">
                    <div className="text-slate-500">Fuel</div>
                    <div className="text-white font-mono">{station.fuelDaysRemaining}d</div>
                  </div>
                  <div className="bg-[#0d1117] rounded-md p-2.5">
                    <div className="text-slate-500">Water</div>
                    <div className="text-white font-mono">{station.waterDaysRemaining}d</div>
                  </div>
                  <div className="bg-[#0d1117] rounded-md p-2.5">
                    <div className="text-slate-500">Risk</div>
                    <div className="text-white font-mono">{station.riskLevel}</div>
                  </div>
                </div>
              </div>
            )}

            {mcResult && (
              <RiskHeatmap data={mcResult.heatmap} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
