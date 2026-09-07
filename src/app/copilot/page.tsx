"use client";

import { useState, useEffect } from "react";
import CopilotChat from "@/components/copilot-chat";
import RiskHeatmap from "@/components/risk-heatmap";
import { useStation, runMonteCarlo } from "@/hooks/use-api";
import { BrainCircuit } from "lucide-react";
import { MonteCarloResult } from "@/types";

export default function CopilotPage() {
  const [selectedStation, setSelectedStation] = useState("maitri");
  const { station } = useStation(selectedStation);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);

  useEffect(() => {
    if (!station) return;
    let cancelled = false;
    runMonteCarlo(selectedStation, {}).then((res) => {
      if (!cancelled) setMcResult(res);
    }).catch(console.error);
    return () => { cancelled = true; };
  }, [station?.id, selectedStation]);

  return (
    <div className="min-h-screen bg-[#0b100b] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-[#7d9154]" />
            <div>
              <h1 className="text-2xl font-mono text-[#edf2e7] tracking-wider uppercase">AI OPS COPILOT</h1>
              <p className="text-sm text-[#5a6b48] mt-1 font-mono">Natural language station diagnostics &amp; recommendations</p>
            </div>
          </div>
          <div className="flex gap-2">
            {["maitri", "bharati"].map(id => (
              <button
                key={id}
                onClick={() => setSelectedStation(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase border transition-colors ${
                  selectedStation === id
                    ? "bg-[#7d9154]/20 border-[#7d9154]/50 text-[#a9b97a]"
                    : "border-[#2a3a1e] text-[#5a6b48] hover:border-[#7c8b65]"
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
              <div className="bg-[#101510] border border-[#2a3a1e] rounded-lg p-4">
                <div className="text-xs font-mono text-[#5a6b48] mb-3 uppercase tracking-wider">STATION SNAPSHOT</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#0d1424] rounded-md p-2.5">
                    <div className="text-[#5a6b48]">Crew</div>
                    <div className="text-[#edf2e7] font-mono">{station.crewCount}/{station.crewMax}</div>
                  </div>
                  <div className="bg-[#0d1424] rounded-md p-2.5">
                    <div className="text-[#5a6b48]">Temp</div>
                    <div className="text-[#edf2e7] font-mono">{station.temperature}°C</div>
                  </div>
                  <div className="bg-[#0d1424] rounded-md p-2.5">
                    <div className="text-[#5a6b48]">Generator</div>
                    <div className="text-[#edf2e7] font-mono">{station.generatorLoad}%</div>
                  </div>
                  <div className="bg-[#0d1424] rounded-md p-2.5">
                    <div className="text-[#5a6b48]">Fuel</div>
                    <div className="text-[#edf2e7] font-mono">{station.fuelDaysRemaining}d</div>
                  </div>
                  <div className="bg-[#0d1424] rounded-md p-2.5">
                    <div className="text-[#5a6b48]">Water</div>
                    <div className="text-[#edf2e7] font-mono">{station.waterDaysRemaining}d</div>
                  </div>
                  <div className="bg-[#0d1424] rounded-md p-2.5">
                    <div className="text-[#5a6b48]">Risk</div>
                    <div className="text-[#edf2e7] font-mono">{station.riskLevel}</div>
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
