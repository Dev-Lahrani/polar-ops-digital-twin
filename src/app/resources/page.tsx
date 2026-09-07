"use client";

import { BarChart3, Database, HardDrive, Droplets, Flame, Cpu } from "lucide-react";
import { stations } from "@/data/stations";
import StatusGauge from "@/components/status-gauge";

export default function ResourcesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="rounded-2xl border border-[#1e293b] bg-gradient-to-r from-[#0c1322] via-[#0f172a] to-[#0c1322] p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">
            STRATEGIC RESOURCE INTELLIGENCE
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
          <BarChart3 className="h-7 w-7 text-cyan-400" />
          Resource Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Longitudinal consumption telemetry, storage depletion vectors, and synthesis tracking
        </p>
      </div>

      {/* Station Resource Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map((st) => (
          <div
            key={st.id}
            className="rounded-2xl border border-[#1e293b] bg-[#090e1a] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                {st.name} Telemetry Allocation
              </h2>
              <span className="text-[10px] text-cyan-400 uppercase font-semibold bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                Real-time feed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatusGauge
                label="Power Grid"
                value={st.resources.power}
                max={100}
                unit="%"
                warningThreshold={60}
                criticalThreshold={40}
                icon={Cpu}
              />
              <StatusGauge
                label="Fuel Stores"
                value={st.fuelCurrentL ?? 35000}
                max={st.fuelCapacityL ?? 60000}
                unit="L"
                warningThreshold={40}
                criticalThreshold={25}
                icon={Flame}
              />
              <StatusGauge
                label="Freshwater"
                value={st.resources.water}
                max={100}
                unit="%"
                warningThreshold={40}
                criticalThreshold={20}
                icon={Droplets}
              />
              <StatusGauge
                label="Provisions"
                value={st.resources.food}
                max={100}
                unit="%"
                warningThreshold={50}
                criticalThreshold={25}
                icon={HardDrive}
              />
            </div>

            <div className="rounded-xl border border-[#1e293b] bg-[#0d1424] p-3 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Estimated Fuel Depletion Horizon:</span>
                <span className="font-bold text-white">{st.fuelDaysRemaining} days</span>
              </div>
              <div className="flex justify-between">
                <span>Water Filtration Demand Margin:</span>
                <span className="font-bold text-white">{st.waterDaysRemaining} days</span>
              </div>
              <div className="flex justify-between">
                <span>Next Scheduled Resupply Window:</span>
                <span className="font-bold text-cyan-400">{st.nextResupplyDays} days</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
