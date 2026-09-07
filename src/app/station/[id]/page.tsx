"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getStation } from "@/data/stations";
import StationSvg from "@/components/station-svg";
import { RiskLevel } from "@/types";

const statusLabels: Record<RiskLevel, string> = {
  nominal: "NOMINAL",
  warning: "WARNING",
  critical: "CRITICAL",
};

const statusColors: Record<RiskLevel, string> = {
  nominal: "#3fb950",
  warning: "#d29922",
  critical: "#f85149",
};

const statusBg: Record<RiskLevel, string> = {
  nominal: "#3fb9501a",
  warning: "#d299221a",
  critical: "#f851491a",
};

function GaugeBar({ percent }: { percent: number }) {
  const color =
    percent > 90 ? "#f85149" : percent > 70 ? "#d29922" : "#3fb950";
  return (
    <div className="w-full h-3 bg-[#21262d] rounded-full overflow-hidden mt-1">
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
          <h1 className="text-4xl font-bold text-red mb-2">404</h1>
          <p className="text-[#8b949e]">
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
        <h1 className="text-2xl font-bold tracking-wider" style={{ color: "#58a6ff" }}>
          {station.name} — DIGITAL TWIN
        </h1>
        <p className="text-sm text-[#8b949e] mt-1">
          {station.location} &middot; {station.latitude}°S, {station.longitude}°E
          &middot; Est. {station.established}
        </p>
      </header>

      <div className="flex gap-6">
        {/* Main SVG area */}
        <div
          className="flex-1 rounded-lg border overflow-hidden"
          style={{ borderColor: "#30363d", background: "#0d1117" }}
        >
          <StationSvg
            subsystems={station.subsystems}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Right sidebar - detail panel */}
        <div
          className="w-80 rounded-lg border p-5 flex-shrink-0"
          style={{
            borderColor: "#30363d",
            background: "#161b22",
            minHeight: 500,
          }}
        >
          {selectedSubsystem ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{selectedSubsystem.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-[#e6edf3]">
                    {selectedSubsystem.name}
                  </h2>
                  <span className="text-xs text-[#8b949e] uppercase tracking-wider">
                    {selectedSubsystem.type}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                style={{
                  backgroundColor: statusBg[selectedSubsystem.status],
                  color: statusColors[selectedSubsystem.status],
                  border: `1px solid ${statusColors[selectedSubsystem.status]}40`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: statusColors[selectedSubsystem.status],
                  }}
                />
                {statusLabels[selectedSubsystem.status]}
              </div>

              {/* Load gauge */}
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8b949e] uppercase tracking-wider">
                    System Load
                  </span>
                  <span className="text-[#e6edf3] font-bold">
                    {selectedSubsystem.loadPercent}%
                  </span>
                </div>
                <GaugeBar percent={selectedSubsystem.loadPercent} />
              </div>

              {/* Detail readout */}
              <div>
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-3 pb-2"
                  style={{
                    color: "#58a6ff",
                    borderBottom: "1px solid #30363d",
                  }}
                >
                  System Readout
                </h3>
                <div className="space-y-2">
                  {Object.entries(selectedSubsystem.details).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-xs font-mono"
                      >
                        <span className="text-[#8b949e]">{key}</span>
                        <span className="text-[#e6edf3]">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <p className="text-[#8b949e] text-sm mb-2">
                  Click a module to inspect
                </p>
                <p className="text-[#30363d] text-xs">
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
