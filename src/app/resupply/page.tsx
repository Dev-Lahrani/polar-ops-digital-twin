"use client";

import { useState, useMemo } from "react";
import { getStation } from "@/data/stations";
import { runSimulation } from "@/engine/simulation";
import { calculateResupplyPriority } from "@/engine/resupply";
import { ResupplyItem, PriorityLevel } from "@/types";
import ResupplyPriorityList from "@/components/resupply-priority";

const priorityColors: Record<PriorityLevel, string> = {
  CRITICAL: "#f85149",
  HIGH: "#f0883e",
  MEDIUM: "#d29922",
  LOW: "#3fb950",
};

export default function ResupplyPage() {
  const [activeStation, setActiveStation] = useState<"maitri" | "bharati">(
    "maitri"
  );

  const station = getStation(activeStation);

  const baseResult = useMemo(() => {
    if (!station) return null;
    return runSimulation(station, {});
  }, [station]);

  const delayResult = useMemo(() => {
    if (!station) return null;
    return runSimulation(station, { resupplyDelayDays: 7 });
  }, [station]);

  const baseItems = useMemo(() => {
    if (!station || !baseResult) return [];
    return calculateResupplyPriority(station, baseResult);
  }, [station, baseResult]);

  const delayItems = useMemo(() => {
    if (!station || !delayResult) return [];
    return calculateResupplyPriority(station, delayResult);
  }, [station, delayResult]);

  if (!station || !baseResult || !delayResult) return null;

  const totalWeight = baseItems.reduce((sum, i) => sum + i.weightKg, 0);
  const breakdown = {
    CRITICAL: baseItems.filter((i) => i.priorityLevel === "CRITICAL").length,
    HIGH: baseItems.filter((i) => i.priorityLevel === "HIGH").length,
    MEDIUM: baseItems.filter((i) => i.priorityLevel === "MEDIUM").length,
    LOW: baseItems.filter((i) => i.priorityLevel === "LOW").length,
  };

  // Find priority changes between base and delay
  const priorityChanges = baseItems.map((base) => {
    const delayed = delayItems.find((d) => d.id === base.id);
    if (!delayed) return { ...base, change: 0 };
    const baseRank = baseItems.indexOf(base) + 1;
    const delayRank = delayItems.indexOf(delayed) + 1;
    return { ...base, change: baseRank - delayRank };
  });

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-wider text-[#edf2e7] uppercase">
          RESUPPLY PRIORITY ENGINE
        </h1>
        <p className="text-sm text-[#5a6b48] mt-1 font-mono">
          Optimal cargo prioritization based on current consumption and
          depletion forecasts
        </p>
      </header>

      {/* Station selector */}
      <div className="flex gap-1 p-1 rounded-lg w-fit mb-8 bg-[#101510] border border-[#2a3a1e]">
        {(["maitri", "bharati"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setActiveStation(id)}
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

      <div className="flex gap-6">
        {/* Main priority list */}
        <div className="flex-1">
          <h2 className="text-sm font-bold text-[#7c8b65] uppercase tracking-wider mb-4 font-mono">
            Priority Cargo List — {station.name}
          </h2>
          <ResupplyPriorityList items={baseItems} />
        </div>

        {/* Side panel — Cargo Manifest */}
        <div className="w-72 flex-shrink-0">
          <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-5 sticky top-6">
            <h3 className="text-sm font-bold text-[#7c8b65] uppercase tracking-wider mb-4 font-mono">
              Cargo Manifest
            </h3>

            <div className="mb-4">
              <div className="text-xs text-[#5a6b48] mb-1 font-mono">Total Weight</div>
              <div className="text-2xl font-bold text-[#edf2e7]">
                {(totalWeight / 1000).toFixed(1)}{" "}
                <span className="text-sm text-[#5a6b48]">tonnes</span>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {(
                Object.entries(breakdown) as [PriorityLevel, number][]
              ).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: priorityColors[level] }}
                    />
                    <span className="text-xs text-[#5a6b48]">{level}</span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: priorityColors[level] }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 mb-4 border-t border-[#2a3a1e]">
              <div className="text-xs text-[#5a6b48] mb-1 font-mono">
                Estimated Volume
              </div>
              <div className="text-lg font-bold text-[#edf2e7]">
                {(totalWeight / 800).toFixed(1)}{" "}
                <span className="text-xs text-[#5a6b48]">m³</span>
              </div>
            </div>

            <button className="w-full py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors font-mono text-[#7d9154] bg-[#7d9154]/10 border border-[#7d9154]/30 hover:bg-[#7d9154]/20">
              Export Manifest
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Impact section */}
      <div className="mt-10">
        <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">⏱️</span>
            <div>
              <h2 className="text-lg font-bold text-[#edf2e7] font-mono">
                Scenario Impact
              </h2>
              <p className="text-xs text-[#5a6b48]">
                What if resupply is delayed by 7 more days?
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Before */}
            <div className="flex-1">
              <h3 className="text-xs font-bold text-[#7c8b65] uppercase tracking-wider mb-3 font-mono">
                Current Priorities
              </h3>
              <div className="space-y-2">
                {baseItems.slice(0, 5).map((item, idx) => {
                  const delayed = delayItems.find((d) => d.id === item.id);
                  const delayRank = delayed
                    ? delayItems.indexOf(delayed)
                    : idx;
                  const moved = idx - delayRank;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-[#0d1424]"
                    >
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: `${priorityColors[item.priorityLevel]}20`,
                          color: priorityColors[item.priorityLevel],
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-[#edf2e7]">{item.name}</span>
                      <span className="text-xs text-[#5a6b48] font-mono">
                        {Math.round(item.priorityScore * 100)}
                      </span>
                      {moved !== 0 && (
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: moved > 0 ? "#f85149" : "#3fb950",
                          }}
                        >
                          {moved > 0 ? "▼" : "▲"} {Math.abs(moved)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <div className="text-2xl text-[#f85149]">→</div>
            </div>

            {/* After */}
            <div className="flex-1">
              <h3 className="text-xs font-bold text-[#f85149] uppercase tracking-wider mb-3 font-mono">
                With +7 Day Delay
              </h3>
              <div className="space-y-2">
                {delayItems.slice(0, 5).map((item, idx) => {
                  const baseRank = baseItems.findIndex(
                    (b) => b.id === item.id
                  );
                  const moved = baseRank - idx;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                        moved > 0
                          ? "bg-[#f8514908] border border-[#f8514920]"
                          : "bg-[#0d1424] border border-transparent"
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: `${priorityColors[item.priorityLevel]}20`,
                          color: priorityColors[item.priorityLevel],
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-[#edf2e7]">{item.name}</span>
                      <span className="text-xs text-[#5a6b48] font-mono">
                        {Math.round(item.priorityScore * 100)}
                      </span>
                      {moved !== 0 && (
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: moved > 0 ? "#f85149" : "#3fb950",
                          }}
                        >
                          {moved > 0 ? "▲" : "▼"} {Math.abs(moved)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
