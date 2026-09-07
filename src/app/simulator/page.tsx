"use client";

import { useState } from "react";
import { useStation } from "@/hooks/use-api";
import { runSimulation } from "@/hooks/use-api";
import { SimulationInput, SimulationResult } from "@/types";
import SimulationPanel from "@/components/simulation-panel";
import SimulationResults from "@/components/simulation-results";
import { FlaskConical, Cpu, Info } from "lucide-react";

export default function SimulatorPage() {
  const [selectedStationId, setSelectedStationId] = useState<string>("bharati");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { station: currentStation, isLoading: stationLoading } = useStation(selectedStationId);

  const handleSimulate = async (input: SimulationInput) => {
    setIsLoading(true);
    try {
      const result = await runSimulation(selectedStationId, input as unknown as Record<string, unknown>);
      setSimulationResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStationChange = (id: string) => {
    setSelectedStationId(id);
    setSimulationResult(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Top Header */}
      <div className="rounded-2xl border border-[#2a3a1e] bg-gradient-to-r from-[#0d1424] via-[#101510] to-[#0d1424] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2 w-2 rounded-full bg-[#7d9154] animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#7d9154]">
                PROBABILISTIC CASCADE PREDICTION ENGINE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#edf2e7] uppercase flex items-center gap-2.5">
              <FlaskConical className="h-7 w-7 text-[#7d9154]" />
              WHAT-IF DIGITAL TWIN SIMULATOR
            </h1>
            <p className="text-xs text-[#7c8b65] mt-1">
              Test extreme thermal anomalies, generator trips, and logistics blackout scenarios
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#2a3a1e] bg-[#0d1424] px-3.5 py-2 flex items-center gap-2.5 text-xs text-[#7c8b65]">
              <Cpu className="h-4 w-4 text-[#7d9154]" />
              <div>
                <div className="text-[9px] text-[#5a6b48] uppercase">Solver Mode</div>
                <div className="font-bold text-[#edf2e7]">Nonlinear Cascade v2.4</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="flex items-center gap-2 rounded-xl border border-[#7d9154]/20 bg-[#7d9154]/5 px-4 py-2.5 text-xs text-[#a9b97a]">
        <Info className="h-4 w-4 shrink-0 text-[#7d9154]" />
        <span>
          Simulations evaluate inter-subsystem dependencies across Electrical, Thermal, Life Support, and Logistics domains using deterministic first-principles modeling.
        </span>
      </div>

      {/* Two-Column Layout (40% Left, 60% Right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 40% (5 cols on 12-col grid) */}
        <div className="lg:col-span-5">
          <SimulationPanel
            stationId={selectedStationId}
            onStationChange={handleStationChange}
            onSimulate={handleSimulate}
          />
        </div>

        {/* Right Column: 60% (7 cols on 12-col grid) */}
        <div className="lg:col-span-7">
          <SimulationResults
            result={simulationResult}
            station={currentStation}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
