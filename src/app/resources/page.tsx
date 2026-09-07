"use client";

import { useState, useEffect } from "react";
import { useStation, runSimulation, runMonteCarlo } from "@/hooks/use-api";
import { SimulationResult, ResourceTimelinePoint, MonteCarloResult } from "@/types";
import ResourceCard from "@/components/resource-card";
import DepletionChart from "@/components/depletion-chart";
import RiskHeatmap from "@/components/risk-heatmap";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
} from "recharts";
import { EnergyBalanceEntry } from "@/types";
import { Zap, Sun, Wind, Fuel, Battery, Leaf } from "lucide-react";

const energyBalanceData: EnergyBalanceEntry[] = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const solarPeak = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI)) * 12;
  const windBase = 3 + Math.sin(i * 0.5) * 2;
  const dieselBase = 25;
  const solar = Math.round(solarPeak * 100) / 100;
  const wind = Math.round(windBase * 100) / 100;
  const diesel = Math.round((hour >= 6 && hour <= 18 ? dieselBase * 0.4 : dieselBase) * 100) / 100;
  const totalGen = Math.round((solar + wind + diesel) * 100) / 100;
  const habitat = 12 + Math.sin(hour * 0.3) * 2;
  const science = hour >= 8 && hour <= 20 ? 8 : 3;
  const hvac = 6 + (Math.abs(Math.sin(hour * 0.26)) * 3);
  const comms = 2.5;
  const totalLoad = Math.round((habitat + science + hvac + comms) * 100) / 100;
  return {
    timestamp: `${String(hour).padStart(2, "0")}:00`,
    solarGenKw: solar,
    windGenKw: wind,
    dieselGenKw: diesel,
    totalGenKw: totalGen,
    habitatLoadKw: Math.round(habitat * 100) / 100,
    scienceLoadKw: science,
    hvacLoadKw: Math.round(hvac * 100) / 100,
    commsLoadKw: comms,
    totalLoadKw: totalLoad,
    surplusDeficitKw: Math.round((totalGen - totalLoad) * 100) / 100,
    batterySoC: Math.min(100, Math.max(20, 70 + (totalGen - totalLoad) * 2)),
    renewablePercent: totalGen > 0 ? Math.round(((solar + wind) / totalGen) * 100) : 0,
  };
});

const totalSolarToday = energyBalanceData.reduce((a, e) => a + e.solarGenKw, 0).toFixed(1);
const totalWindToday = energyBalanceData.reduce((a, e) => a + e.windGenKw, 0).toFixed(1);
const totalDieselToday = energyBalanceData.reduce((a, e) => a + e.dieselGenKw, 0).toFixed(1);
const avgRenewable = Math.round(energyBalanceData.reduce((a, e) => a + e.renewablePercent, 0) / 24);
const peakLoad = Math.max(...energyBalanceData.map((e) => e.totalLoadKw)).toFixed(1);
const currentSoC = energyBalanceData[new Date().getHours()]?.batterySoC ?? 72;

export default function ResourcesPage() {
  const [activeStation, setActiveStation] = useState<"maitri" | "bharati">(
    "maitri"
  );
  const [showComparison, setShowComparison] = useState(false);

  const { station, isLoading: stationLoading } = useStation(activeStation);

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<SimulationResult | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);

  // Fetch simulation results asynchronously
  useEffect(() => {
    if (!station) return;
    setResult(null);
    runSimulation(activeStation, {}).then(setResult);
  }, [station, activeStation]);

  // Fetch comparison results asynchronously
  useEffect(() => {
    if (!station || !showComparison) {
      setComparisonResult(null);
      return;
    }
    runSimulation(activeStation, {
      temperatureC: -30,
      resupplyDelayDays: 7,
    }).then(setComparisonResult);
  }, [station, activeStation, showComparison]);

  // Fetch Monte Carlo results asynchronously
  useEffect(() => {
    if (!station) return;
    setMcResult(null);
    runMonteCarlo(activeStation, {}).then(setMcResult);
  }, [station, activeStation]);

  if (stationLoading || !station || !result) return null;

  const fuel = station.subsystems.find((s: Record<string, unknown>) => (s.subsystemId as string) === "fuel");
  const water = station.subsystems.find((s: Record<string, unknown>) => (s.subsystemId as string) === "water");

  const fuelDetails = (fuel?.details ?? {}) as Record<string, string>;
  const waterDetails = (water?.details ?? {}) as Record<string, string>;

  const fuelCurrent = parseInt((fuelDetails["Current"] ?? "27000").replace(/,/g, ""), 10);
  const fuelCapacity = parseInt((fuelDetails["Capacity"] ?? "50000").replace(/,/g, ""), 10);
  const waterReserve = parseInt((waterDetails["Reserve"] ?? "10000").replace(/,/g, ""), 10);

  const resourceCards = [
    {
      icon: "\u26FD",
      name: "Fuel",
      currentAmount: fuelCurrent.toLocaleString(),
      unit: "L",
      percent: Math.round((fuelCurrent / fuelCapacity) * 100),
      dailyRate: "1,080 L/day",
      daysRemaining: result.after.fuelDays,
    },
    {
      icon: "\uD83D\uDCA7",
      name: "Water",
      currentAmount: waterReserve.toLocaleString(),
      unit: "L",
      percent: Math.round((waterReserve / 20000) * 100),
      dailyRate: "2,280 L/day",
      daysRemaining: Math.round(waterReserve / 2280),
    },
    {
      icon: "\uD83C\uDF7D\uFE0F",
      name: "Food",
      currentAmount: "1,350",
      unit: "kg",
      percent: 45,
      dailyRate: "30 kg/day",
      daysRemaining: result.after.foodDays,
    },
    {
      icon: "\uD83C\uDFE5",
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
        <h1 className="text-2xl font-bold tracking-wider text-[#edf2e7] uppercase">
          RESOURCE INTELLIGENCE
        </h1>
        <p className="text-sm text-[#5a6b48] mt-1 font-mono">
          Depletion forecasts and supply chain monitoring
        </p>
      </header>

      {/* Station selector + comparison toggle */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1 p-1 rounded-lg bg-[#101510] border border-[#2a3a1e]">
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

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
            className="w-4 h-4 accent-[#7d9154]"
          />
          <span className="text-xs text-[#7c8b65] font-mono">
            Show worst-case scenario (temp=-30\u00B0C, +7 day delay)
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
          <div className="lg:col-span-2 rounded-lg border border-[#2a3a1e] bg-[#101510] p-5">
            <h3 className="text-sm font-bold text-[#7c8b65] uppercase tracking-wider mb-1 font-mono">
              Monte Carlo Confidence Bands
            </h3>
            <p className="text-[11px] text-[#5a6b48] mb-4">
              {mcResult.iterations.toLocaleString()} simulations \u00B7 90% confidence interval (P5\u2013P95)
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2518" />
                <XAxis dataKey="day" stroke="#5a6b48" fontSize={11} tickLine={false} />
                <YAxis stroke="#5a6b48" fontSize={11} tickLine={false} domain={[0, "auto"]}
                  label={{ value: "% Capacity", angle: -90, position: "insideLeft", offset: 10, fill: "#5a6b48", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#101510", border: "1px solid #2a3a1e", borderRadius: 8, fontSize: 11, fontFamily: "monospace", color: "#edf2e7" }}
                  labelFormatter={(v) => `Day ${v}`}
                  formatter={(v, name) => [`${Number(v ?? 0).toFixed(1)}%`, String(name)]}
                />
                <Area type="monotone" dataKey="fuelP95" name="P95 (Best)" stroke="#d2992266" strokeWidth={1} fill="none" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="fuelMedian" name="Median Fuel" stroke="#d29922" strokeWidth={2} fill="url(#mcFuelBand)" />
                <Area type="monotone" dataKey="fuelP5" name="P5 (Worst)" stroke="#f8514966" strokeWidth={1} fill="none" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
              <h3 className="text-xs font-bold text-[#7c8b65] uppercase tracking-wider mb-3 font-mono">Tail Risk Analysis</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5a6b48]">P(depletion in 30d)</span>
                  <span className="font-mono font-bold" style={{ color: mcResult.tailRisk.probDepletionIn30Days > 0.5 ? "#f85149" : mcResult.tailRisk.probDepletionIn30Days > 0.2 ? "#d29922" : "#3fb950" }}>
                    {(mcResult.tailRisk.probDepletionIn30Days * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5a6b48]">P(depletion in 60d)</span>
                  <span className="font-mono font-bold" style={{ color: mcResult.tailRisk.probDepletionIn60Days > 0.5 ? "#f85149" : mcResult.tailRisk.probDepletionIn60Days > 0.2 ? "#d29922" : "#3fb950" }}>
                    {(mcResult.tailRisk.probDepletionIn60Days * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5a6b48]">P(depletion in 90d)</span>
                  <span className="font-mono font-bold" style={{ color: mcResult.tailRisk.probDepletionIn90Days > 0.5 ? "#f85149" : mcResult.tailRisk.probDepletionIn90Days > 0.2 ? "#d29922" : "#3fb950" }}>
                    {(mcResult.tailRisk.probDepletionIn90Days * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="border-t border-[#2a3a1e] pt-2 mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#5a6b48]">Expected depletion</span>
                    <span className="font-mono text-[#edf2e7] font-bold">Day {mcResult.tailRisk.expectedDepletionDay}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#5a6b48]">Best case</span>
                    <span className="font-mono text-green-400">Day {mcResult.tailRisk.bestCaseDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5a6b48]">Worst case (P5)</span>
                    <span className="font-mono text-red-400">Day {mcResult.tailRisk.worstCaseDay}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
              <h3 className="text-xs font-bold text-[#7c8b65] uppercase tracking-wider mb-2 font-mono">Simulation Stats</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5a6b48]">Mean depletion</span>
                  <span className="font-mono text-[#edf2e7]">Day {mcResult.meanDepletionDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5a6b48]">Std deviation</span>
                  <span className="font-mono text-[#edf2e7]">{mcResult.stdDevDepletion}d</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5a6b48]">Iterations</span>
                  <span className="font-mono text-[#edf2e7]">{mcResult.iterations.toLocaleString()}</span>
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

      {/* Energy Balance Dashboard */}
      <section className="mb-8 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-3.5 w-3.5 text-[#7d9154]" />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#7c8b65] font-mono">
            Energy Balance \u2014 24h Profile
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { icon: Sun, label: "SOLAR TODAY", value: `${totalSolarToday} kWh`, color: "#d29922" },
            { icon: Wind, label: "WIND TODAY", value: `${totalWindToday} kWh`, color: "#7d9154" },
            { icon: Fuel, label: "DIESEL TODAY", value: `${totalDieselToday} kWh`, color: "#8b946e" },
            { icon: Leaf, label: "RENEWABLE %", value: `${avgRenewable}%`, color: "#3fb950" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className="h-3 w-3" style={{ color: s.color }} />
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#5a6b48]">{s.label}</span>
              </div>
              <div className="text-lg font-bold font-mono text-[#edf2e7]">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
            <h3 className="text-xs font-bold text-[#7c8b65] uppercase tracking-wider mb-3 font-mono">Generation vs Load</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={energyBalanceData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d29922" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d29922" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7d9154" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7d9154" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDiesel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b946e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b946e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2518" />
                <XAxis dataKey="timestamp" stroke="#5a6b48" fontSize={10} tickLine={false} interval={3} />
                <YAxis stroke="#5a6b48" fontSize={10} tickLine={false} unit=" kW" />
                <Tooltip contentStyle={{ background: "#101510", border: "1px solid #2a3a1e", borderRadius: 8, fontSize: 10, fontFamily: "monospace", color: "#edf2e7" }} />
                <Area type="monotone" dataKey="solarGenKw" name="Solar" stroke="#d29922" fill="url(#gradSolar)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="windGenKw" name="Wind" stroke="#7d9154" fill="url(#gradWind)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="dieselGenKw" name="Diesel" stroke="#8b946e" fill="url(#gradDiesel)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="totalLoadKw" name="Load" stroke="#f85149" fill="none" strokeWidth={2} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
            <h3 className="text-xs font-bold text-[#7c8b65] uppercase tracking-wider mb-3 font-mono">Load Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={energyBalanceData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2518" />
                <XAxis dataKey="timestamp" stroke="#5a6b48" fontSize={10} tickLine={false} interval={3} />
                <YAxis stroke="#5a6b48" fontSize={10} tickLine={false} unit=" kW" />
                <Tooltip contentStyle={{ background: "#101510", border: "1px solid #2a3a1e", borderRadius: 8, fontSize: 10, fontFamily: "monospace", color: "#edf2e7" }} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }} />
                <Bar dataKey="habitatLoadKw" name="Habitat" stackId="load" fill="#7d9154" />
                <Bar dataKey="scienceLoadKw" name="Science" stackId="load" fill="#5a6b48" />
                <Bar dataKey="hvacLoadKw" name="HVAC" stackId="load" fill="#2a3a1e" />
                <Bar dataKey="commsLoadKw" name="Comms" stackId="load" fill="#3d4f2e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Battery className="h-3 w-3 text-[#3fb950]" />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#5a6b48]">BATTERY SOC</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#edf2e7]">{currentSoC}%</div>
            <div className="mt-1.5 h-1.5 bg-[#1a2518] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${currentSoC}%`, backgroundColor: currentSoC > 50 ? "#3fb950" : currentSoC > 20 ? "#d29922" : "#f85149" }} />
            </div>
          </div>
          <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-3 w-3 text-[#d29922]" />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#5a6b48]">PEAK LOAD</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#edf2e7]">{peakLoad} kW</div>
          </div>
          <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Leaf className="h-3 w-3 text-[#3fb950]" />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#5a6b48]">CARBON OFFSET</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#edf2e7]">{(parseFloat(totalSolarToday) * 0.92 + parseFloat(totalWindToday) * 0.012).toFixed(1)} kg</div>
            <span className="text-[10px] text-[#5a6b48] font-mono">CO\u2082 avoided today</span>
          </div>
        </div>
      </section>

      {/* Resource comparison table */}
      <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] overflow-hidden">
        <div className="p-4 border-b border-[#2a3a1e]">
          <h3 className="text-sm font-bold text-[#7c8b65] uppercase tracking-wider font-mono">
            Resource Status Table
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-[#2a3a1e]">
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
                    className="px-4 py-3 text-left text-xs font-bold text-[#7c8b65] uppercase tracking-wider"
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
                    className="border-b border-[#1a2518] hover:bg-[#141b13] transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-[#edf2e7]">
                      {row.resource}
                    </td>
                    <td className="px-4 py-3 text-[#edf2e7] font-mono">
                      {row.current}
                    </td>
                    <td className="px-4 py-3 text-[#5a6b48] font-mono">
                      {row.dailyUse}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: statusColor }}>
                      {row.daysLeft}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                        style={{
                          backgroundColor: `${statusColor}20`,
                          color: statusColor,
                          borderColor: `${statusColor}40`,
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
