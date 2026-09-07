"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getStation } from "@/data/stations";
import StationSvg from "@/components/station-svg";
import RiskIndicator from "@/components/risk-indicator";
import { RiskLevel } from "@/types";

const statusColors: Record<RiskLevel, string> = {
  NOMINAL: "#3fb950",
  CAUTION: "#eab308",
  WARNING: "#d29922",
  CRITICAL: "#f85149",
  EMERGENCY: "#b91c1c",
};

const statusBg: Record<RiskLevel, string> = {
  NOMINAL: "#3fb9501a",
  CAUTION: "#eab3081a",
  WARNING: "#d299221a",
  CRITICAL: "#f851491a",
  EMERGENCY: "#b91c1c1a",
};

function GaugeBar({ percent }: { percent: number }) {
  const color =
    percent > 90 ? "#f85149" : percent > 70 ? "#d29922" : "#3fb950";
  return (
    <div className="w-full h-3 bg-[#1a2518] rounded-full overflow-hidden mt-1">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function StationPage() {
  const params = useParams();
  const id = params.id as string;
  const station = getStation(id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#f85149] mb-2">404</h1>
          <p className="text-[#7c8b65]">
            Station &quot;{id}&quot; not found
          </p>
        </div>
      </div>
    );
  }

  const selectedSubsystem = station.subsystems.find(
    (s) => s.id === selectedId
  );

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider text-[#edf2e7] uppercase">
            {station.name}
          </h1>
          <span className="text-xs text-[#7c8b65]">—</span>
          <span className="text-xs text-[#7d9154] font-mono">DIGITAL TWIN</span>
          <RiskIndicator level={station.riskLevel} size="sm" />
        </div>
        <p className="text-sm text-[#5a6b48] mt-1 font-mono">
          {station.location} &middot; {station.latitude}°S, {station.longitude}°E
          &middot; Est. {station.established}
        </p>
      </header>

      <div className="flex gap-6">
        {/* Main SVG area */}
        <div className="flex-1 rounded-lg border border-[#2a3a1e] overflow-hidden bg-[#101510]">
          <StationSvg
            subsystems={station.subsystems}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Right sidebar - detail panel */}
        <div
          className="w-80 rounded-lg border border-[#2a3a1e] bg-[#101510] p-5 flex-shrink-0"
          style={{ minHeight: 500 }}
        >
          {selectedSubsystem ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{selectedSubsystem.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-[#edf2e7]">
                    {selectedSubsystem.name}
                  </h2>
                  <span className="text-xs text-[#5a6b48] uppercase tracking-wider font-mono">
                    {selectedSubsystem.type}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono mb-4 border"
                style={{
                  backgroundColor: statusBg[selectedSubsystem.status],
                  color: statusColors[selectedSubsystem.status],
                  borderColor: `${statusColors[selectedSubsystem.status]}40`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: statusColors[selectedSubsystem.status],
                  }}
                />
                {selectedSubsystem.status}
              </div>

              {/* Load gauge */}
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#5a6b48] uppercase tracking-wider font-mono">
                    System Load
                  </span>
                  <span className="text-[#edf2e7] font-bold font-mono">
                    {selectedSubsystem.loadPercent}%
                  </span>
                </div>
                <GaugeBar percent={selectedSubsystem.loadPercent} />
              </div>

              {/* Detail readout */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 text-[#7d9154] border-b border-[#2a3a1e] font-mono">
                  System Readout
                </h3>
                <div className="space-y-2">
                  {Object.entries(selectedSubsystem.details).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-xs font-mono"
                      >
                        <span className="text-[#5a6b48]">{key}</span>
                        <span className="text-[#edf2e7]">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <p className="text-[#7c8b65] text-sm mb-2 font-mono">
                  Click a module to inspect
                </p>
                <p className="text-[#5a6b48] text-xs">
                  Select any subsystem node on the station schematic
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
