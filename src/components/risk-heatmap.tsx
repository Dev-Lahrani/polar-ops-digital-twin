"use client";

import { HeatmapCell } from "@/types";

interface RiskHeatmapProps {
  data: HeatmapCell[];
}

export default function RiskHeatmap({ data }: RiskHeatmapProps) {
  const tempDeviations = Array.from(new Set(data.map(d => d.tempDeviation))).sort((a, b) => a - b);
  const delayDays = Array.from(new Set(data.map(d => d.delayDays))).sort((a, b) => a - b);

  const getRiskColor = (score: number): string => {
    if (score >= 0.8) return "bg-red-500/80 text-white";
    if (score >= 0.6) return "bg-orange-500/70 text-white";
    if (score >= 0.4) return "bg-yellow-500/60 text-slate-900";
    if (score >= 0.2) return "bg-yellow-400/40 text-slate-300";
    return "bg-green-500/30 text-slate-300";
  };

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-sm text-slate-300">RISK HEATMAP</span>
        <span className="text-[10px] font-mono text-slate-500">Temperature Deviation vs Resupply Delay</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left text-slate-500 border-b border-[#1e293b]">
                Temp Δ / Delay →
              </th>
              {delayDays.map(d => (
                <th key={d} className="px-2 py-1.5 text-center text-slate-500 border-b border-[#1e293b]">
                  {d}d
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tempDeviations.map(temp => (
              <tr key={temp}>
                <td className="px-2 py-1.5 text-slate-400 border-b border-[#1e293b]/50">
                  {temp > 0 ? "+" : ""}{temp}°C
                </td>
                {delayDays.map(delay => {
                  const cell = data.find(d => d.tempDeviation === temp && d.delayDays === delay);
                  if (!cell) return <td key={delay} className="px-2 py-1.5" />;
                  return (
                    <td key={delay} className="px-2 py-1.5 text-center border-b border-[#1e293b]/50">
                      <div
                        className={`rounded px-1.5 py-1 ${getRiskColor(cell.riskScore)}`}
                        title={`Risk: ${Math.round(cell.riskScore * 100)}% | Depletion: Day ${cell.depletionDay}`}
                      >
                        <div className="font-bold">{Math.round(cell.riskScore * 100)}%</div>
                        <div className="text-[9px] opacity-70">Day {cell.depletionDay}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-slate-500">
        <span>Risk Level:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/30" /><span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-400/40" /><span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500/70" /><span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/80" /><span>Critical</span>
        </div>
      </div>
    </div>
  );
}
