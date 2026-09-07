"use client";

import { useState, useMemo } from "react";
import { getStation } from "@/data/stations";
import { runSimulation } from "@/engine/simulation";
import { runMonteCarlo } from "@/engine/monte-carlo";
import { SimulationResult, ResourceTimelinePoint, MonteCarloResult } from "@/types";
import ResourceCard from "@/components/resource-card";
import DepletionChart from "@/components/depletion-chart";
import RiskHeatmap from "@/components/risk-heatmap";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ResourcesPage() {
  const [activeStation, setActiveStation] = useState<"maitri" | "bharati">(
    "maitri"
  );
  const [showComparison, setShowComparison] = useState(false);

  const station = getStation(activeStation);

  const result = useMemo(() => {
    if (!station) return null;
    return runSimulation(station, {});
  }, [station]);

  const comparisonResult = useMemo(() => {
    if (!station || !showComparison) return null;
    return runSimulation(station, {
      temperatureC: -30,
      resupplyDelayDays: 7,
    });
  }, [station, showComparison]);

  const mcResult = useMemo(() => {
    if (!station) return null;
    return runMonteCarlo(station, {});
  }, [station]);

  if (!station || !result) return null;

  const fuel = station.subsystems.find((s) => s.id === "fuel");
  const water = station.subsystems.find((s) => s.id === "water");

  const fuelCurrent = fuel
    ? parseInt((fuel.details["Current"] ?? "27000").replace(/,/g, ""), 10)
    : 27000;
  const fuelCapacity = fuel
    ? parseInt((fuel.details["Capacity"] ?? "50000").replace(/,/g, ""), 10)
    : 50000;
  const waterReserve = water
    ? parseInt((water.details["Reserve"] ?? "10000").replace(/,/g, ""), 10)
    : 10000;

  const resourceCards = [
    {
      icon: "⛽",
      name: "Fuel",
      currentAmount: fuelCurrent.toLocaleString(),
      unit: "L",
      percent: Math.round((fuelCurrent / fuelCapacity) * 100),
      dailyRate: "1,080 L/day",
      daysRemaining: result.after.fuelDays,
    },
    {
      icon: "💧",
      name: "Water",
      currentAmount: waterReserve.toLocaleString(),
      unit: "L",
      percent: Math.round((waterReserve / 20000) * 100),
      dailyRate: "2,280 L/day",
      daysRemaining: Math.round(waterReserve / 2280),
    },
    {
      icon: "🍽️",
      name: "Food",
      currentAmount: "1,350",
      unit: "kg",
      percent: 45,
      dailyRate: "30 kg/day",
      daysRemaining: result.after.foodDays,
    },
    {
      icon: "🏥",
      name: "Medical",
      currentAmount: "82",
      unit: "units",
      percent: 82,
      dailyRate: "~0.5 units/day",
      daysRemaining: 164,
    },
  ];

  const tableRows = [
    {
      resource: "Fuel",
      current: `${fuelCurrent.toLocaleString()} L`,
      dailyUse: "1,080 L/day",
      daysLeft: result.after.fuelDays,
      gapToResupply: result.after.fuelDays - result.nextResupplyDay,
    },
    {
      resource: "Water",
      current: `${waterReserve.toLocaleString()} L`,
      dailyUse: "2,280 L/day",
      daysLeft: Math.round(waterReserve / 2280),
      gapToResupply: Math.round(waterReserve / 2280) - result.nextResupplyDay,
    },
    {
      resource: "Food",
      current: "1,350 kg",
      dailyUse: "30 kg/day",
      daysLeft: result.after.foodDays,
      gapToResupply: result.after.foodDays - result.nextResupplyDay,
    },
    {
      resource: "Medical",
      current: "82 units",
      dailyUse: "~0.5 units/day",
      daysLeft: 164,
      gapToResupply: 164 - result.nextResupplyDay,
    },
  ];

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1
          className="text-2xl font-bold tracking-wider"
          style={{ color: "#58a6ff" }}
        >
          RESOURCE INTELLIGENCE
        </h1>
        <p className="text-sm text-[#8b949e] mt-1">
          Depletion forecasts and supply chain monitoring
        </p>
      </header>

      {/* Station selector + comparison toggle */}
      <div className="flex items-center justify-between mb-8">
        <div
          className="flex gap-1 p-1 rounded-lg"
          style={{ background: "#161b22" }}
        >
          {(["maitri", "bharati"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setActiveStation(id)}
              className="px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all"
              style={{
                background: activeStation === id ? "#1a2332" : "transparent",
                color: activeStation === id ? "#58a6ff" : "#8b949e",
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

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
            className="w-4 h-4 accent-[#58a6ff]"
          />
          <span className="text-xs text-[#8b949e]">
            Show worst-case scenario (temp=-30°C, +7 day delay)
          </span>
        </label>
      </div>

      {/* Resource cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {resourceCards.map((card) => (
          <ResourceCard key={card.name} {...card} />
        ))}
      </div>

      {/* Depletion chart */}
      <div className="mb-8">
        <DepletionChart
          data={result.resourceTimeline}
          resupplyDay={result.nextResupplyDay}
          title="90-Day Depletion Forecast"
          comparisonData={comparisonResult?.resourceTimeline}
        />
      </div>

      {/* Monte Carlo Confidence Bands */}
      {mcResult && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-lg border p-5" style={{ borderColor: "#30363d", background: "#161b22" }}>
            <h3 className="text-sm font-bold text-[#8b949e] uppercase tracking-wider mb-1">
              Monte Carlo Confidence Bands
            </h3>
            <p className="text-[11px] text-[#8b949e]/60 mb-4">
              {mcResult.iterations.toLocaleString()} simulations · 90% confidence interval (P5–P95)
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={mcResult.confidenceBands}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="mcFuelBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d29922" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d29922" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="day" stroke="#8b949e" fontSize={11} tickLine={false} />
                <YAxis stroke="#8b949e" fontSize={11} tickLine={false} domain={[0, "auto"]}
                  label={{ value: "% Capacity", angle: -90, position: "insideLeft", offset: 10, fill: "#8b949e", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
                  labelFormatter={(v) => `Day ${v}`}
                  formatter={(v, name) => [`${Number(v).toFixed(1)}%`, name]}
                />
                <Area type="monotone" dataKey="fuelP95" name="P95 (Best)" stroke="#d2992266" strokeWidth={1} fill="none" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="fuelMedian" name="Median Fuel" stroke="#d29922" strokeWidth={2} fill="url(#mcFuelBand)" />
                <Area type="monotone" dataKey="fuelP5" name="P5 (Worst)" stroke="#f8514966" strokeWidth={1} fill="none" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border p-4" style={{ borderColor: "#30363d", background: "#161b22" }}>
              <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3">Tail Risk Analysis</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8b949e]">P(depletion in 30d)</span>
                  <span className="font-mono font-bold" style={{ color: mcResult.tailRisk.probDepletionIn30Days > 0.5 ? "#f85149" : mcResult.tailRisk.probDepletionIn30Days > 0.2 ? "#d29922" : "#3fb950" }}>
                    {(mcResult.tailRisk.probDepletionIn30Days * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8b949e]">P(depletion in 60d)</span>
                  <span className="font-mono font-bold" style={{ color: mcResult.tailRisk.probDepletionIn60Days > 0.5 ? "#f85149" : mcResult.tailRisk.probDepletionIn60Days > 0.2 ? "#d29922" : "#3fb950" }}>
                    {(mcResult.tailRisk.probDepletionIn60Days * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8b949e]">P(depletion in 90d)</span>
                  <span className="font-mono font-bold" style={{ color: mcResult.tailRisk.probDepletionIn90Days > 0.5 ? "#f85149" : mcResult.tailRisk.probDepletionIn90Days > 0.2 ? "#d29922" : "#3fb950" }}>
                    {(mcResult.tailRisk.probDepletionIn90Days * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="border-t border-[#30363d] pt-2 mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8b949e]">Expected depletion</span>
                    <span className="font-mono text-[#e6edf3] font-bold">Day {mcResult.tailRisk.expectedDepletionDay}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8b949e]">Best case</span>
                    <span className="font-mono text-green-400">Day {mcResult.tailRisk.bestCaseDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b949e]">Worst case (P5)</span>
                    <span className="font-mono text-red-400">Day {mcResult.tailRisk.worstCaseDay}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4" style={{ borderColor: "#30363d", background: "#161b22" }}>
              <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2">Simulation Stats</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8b949e]">Mean depletion</span>
                  <span className="font-mono text-[#e6edf3]">Day {mcResult.meanDepletionDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8b949e]">Std deviation</span>
                  <span className="font-mono text-[#e6edf3]">{mcResult.stdDevDepletion}d</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8b949e]">Iterations</span>
                  <span className="font-mono text-[#e6edf3]">{mcResult.iterations.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Heatmap */}
      {mcResult && (
        <div className="mb-8">
          <RiskHeatmap data={mcResult.heatmap} />
        </div>
      )}

      {/* Resource comparison table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: "#30363d", background: "#161b22" }}
      >
        <div className="p-4" style={{ borderBottom: "1px solid #30363d" }}>
          <h3 className="text-sm font-bold text-[#8b949e] uppercase tracking-wider">
            Resource Status Table
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #30363d" }}>
                {[
                  "Resource",
                  "Current",
                  "Daily Use",
                  "Days Left",
                  "Status",
                  "Gap to Resupply",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold text-[#8b949e] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                const status =
                  row.daysLeft <= 7
                    ? "critical"
                    : row.daysLeft <= 21
                    ? "warning"
                    : "nominal";
                const statusColor =
                  status === "critical"
                    ? "#f85149"
                    : status === "warning"
                    ? "#d29922"
                    : "#3fb950";
                const gapColor =
                  row.gapToResupply < 0 ? "#f85149" : "#3fb950";
                const gapPrefix = row.gapToResupply >= 0 ? "+" : "";

                return (
                  <tr
                    key={row.resource}
                    style={{ borderBottom: "1px solid #21262d" }}
                  >
                    <td className="px-4 py-3 font-bold text-[#e6edf3]">
                      {row.resource}
                    </td>
                    <td className="px-4 py-3 text-[#e6edf3] font-mono">
                      {row.current}
                    </td>
                    <td className="px-4 py-3 text-[#8b949e] font-mono">
                      {row.dailyUse}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: statusColor }}>
                      {row.daysLeft}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        style={{
                          backgroundColor: `${statusColor}20`,
                          color: statusColor,
                          border: `1px solid ${statusColor}40`,
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: gapColor }}>
                      {gapPrefix}{row.gapToResupply} days
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
