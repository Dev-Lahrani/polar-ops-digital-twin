"use client";

import { useState } from "react";
import { getStation, stations } from "@/data/stations";
import { runSimulation } from "@/engine/simulation";
import { SimulationInput, SimulationResult, Station } from "@/types";
import SimulationPanel from "@/components/simulation-panel";
import SimulationResults from "@/components/simulation-results";
import { FlaskConical, Cpu, Info } from "lucide-react";

export default function SimulatorPage() {
  const [selectedStationId, setSelectedStationId] = useState<string>("bharati");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentStation: Station = getStation(selectedStationId) || stations[0];

  const handleSimulate = (input: SimulationInput) => {
    setIsLoading(true);

    // Brief simulation compute latency for realistic digital-twin solver feel
    setTimeout(() => {
      const station = getStation(selectedStationId) || stations[0];
      const result = runSimulation(station, input);
      setSimulationResult(result);
      setIsLoading(false);
    }, 450);
  };

  const handleStationChange = (id: string) => {
    setSelectedStationId(id);
    // Clear previous results when switching station
    setSimulationResult(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Top Header */}
      <div className="rounded-2xl border border-[#1e293b] bg-gradient-to-r from-[#0c1322] via-[#0f172a] to-[#0c1322] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">
                PROBABILISTIC CASCADE PREDICTION ENGINE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
              <FlaskConical className="h-7 w-7 text-cyan-400" />
              WHAT-IF DIGITAL TWIN SIMULATOR
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Test extreme thermal anomalies, generator trips, and logistics blackout scenarios
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#1e293b] bg-[#090d16] px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-300">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Solver Mode</div>
                <div className="font-bold text-white">Nonlinear Cascade v2.4</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-2.5 text-xs text-cyan-300">
        <Info className="h-4 w-4 shrink-0 text-cyan-400" />
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
