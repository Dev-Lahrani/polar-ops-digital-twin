"use client";

import { useMemo } from "react";
import { analyzeReliability } from "@/engine/weibull";
import { AlertTriangle, CheckCircle, Clock, TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function PredictiveMaintenancePage() {
  const result = useMemo(() => analyzeReliability(), []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "CRITICAL": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "WARNING": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "CAUTION": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "degrading": return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
      case "improving": return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Minus className="w-3.5 h-3.5 text-[#5a6b48]" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "overdue": return "border-red-500 bg-red-500/10";
      case "due-soon": return "border-orange-500 bg-orange-500/10";
      case "scheduled": return "border-[#7d9154] bg-[#7d9154]/10";
      default: return "border-[#2a3a1e] bg-[#1a2518]";
    }
  };

  return (
    <div className="min-h-screen bg-[#0b100b] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono text-[#edf2e7] tracking-wider uppercase">PREDICTIVE MAINTENANCE</h1>
            <p className="text-sm text-[#5a6b48] mt-1 font-mono">Weibull reliability analysis &amp; MTBF forecasting</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getRiskColor(result.overallRiskLevel)}`}>
            <AlertTriangle className="w-4 h-4" />
            <span className="font-mono text-sm font-bold">{result.overallRiskLevel}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#101510] border border-[#2a3a1e] rounded-lg p-4">
            <div className="text-xs font-mono text-[#5a6b48] mb-1">FLEET RELIABILITY</div>
            <div className="text-3xl font-mono text-[#edf2e7]">{result.fleetReliabilityScore}%</div>
            <div className="mt-2 h-2 bg-[#1a2518] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  result.fleetReliabilityScore >= 70 ? "bg-emerald-500" :
                  result.fleetReliabilityScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${result.fleetReliabilityScore}%` }}
              />
            </div>
          </div>
          <div className="bg-[#101510] border border-[#2a3a1e] rounded-lg p-4">
            <div className="text-xs font-mono text-[#5a6b48] mb-1">COMPONENTS MONITORED</div>
            <div className="text-3xl font-mono text-[#edf2e7]">{result.components.length}</div>
            <div className="text-xs text-[#7c8b65] mt-1 font-mono">
              {result.components.filter(c => c.riskLevel === "CRITICAL").length} critical,{" "}
              {result.components.filter(c => c.riskLevel === "WARNING").length} warning
            </div>
          </div>
          <div className="bg-[#101510] border border-[#2a3a1e] rounded-lg p-4">
            <div className="text-xs font-mono text-[#5a6b48] mb-1">UPCOMING MAINTENANCE</div>
            <div className="text-3xl font-mono text-[#edf2e7]">
              {result.maintenanceTimeline.filter(m => m.urgency === "overdue" || m.urgency === "due-soon").length}
            </div>
            <div className="text-xs text-[#7c8b65] mt-1 font-mono">
              {result.maintenanceTimeline.filter(m => m.urgency === "overdue").length} overdue
            </div>
          </div>
        </div>

        <div className="bg-[#101510] border border-[#2a3a1e] rounded-lg p-4">
          <h2 className="font-mono text-sm text-[#7c8b65] mb-4 uppercase tracking-wider">COMPONENT RELIABILITY MATRIX</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2a3a1e]">
                  <th className="px-3 py-2 text-left text-[#5a6b48]">Component</th>
                  <th className="px-3 py-2 text-left text-[#5a6b48]">Category</th>
                  <th className="px-3 py-2 text-center text-[#5a6b48]">Reliability</th>
                  <th className="px-3 py-2 text-center text-[#5a6b48]">MTBF (hrs)</th>
                  <th className="px-3 py-2 text-center text-[#5a6b48]">Hours Run</th>
                  <th className="px-3 py-2 text-center text-[#5a6b48]">Trend</th>
                  <th className="px-3 py-2 text-center text-[#5a6b48]">Risk</th>
                </tr>
              </thead>
              <tbody>
                {result.components.sort((a, b) => a.reliabilityScore - b.reliabilityScore).map(comp => (
                  <tr key={comp.id} className="border-b border-[#2a3a1e]/50 hover:bg-[#141b13] transition-colors">
                    <td className="px-3 py-2 text-[#edf2e7]">{comp.name}</td>
                    <td className="px-3 py-2 text-[#7c8b65]">{comp.category}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={comp.reliabilityScore < 50 ? "text-red-400" : comp.reliabilityScore < 70 ? "text-yellow-400" : "text-emerald-400"}>
                        {comp.reliabilityScore}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-[#edf2e7]">{comp.mtbf.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center text-[#edf2e7]">{comp.operatingHours.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">{getTrendIcon(comp.trendDirection)}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${getRiskColor(comp.riskLevel)}`}>
                        {comp.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#101510] border border-[#2a3a1e] rounded-lg p-4">
          <h2 className="font-mono text-sm text-[#7c8b65] mb-4 uppercase tracking-wider">MAINTENANCE TIMELINE</h2>
          <div className="space-y-2">
            {result.maintenanceTimeline.slice(0, 8).map((entry, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded border ${getUrgencyColor(entry.urgency)}`}>
                {entry.urgency === "overdue" ? (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                ) : entry.urgency === "due-soon" ? (
                  <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-[#5a6b48] shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-sm text-[#edf2e7]">{entry.componentName}</div>
                  <div className="text-xs text-[#7c8b65] font-mono">
                    {entry.type} maintenance — {entry.scheduledDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-mono font-bold ${
                    entry.daysFromNow < 0 ? "text-red-400" :
                    entry.daysFromNow < 30 ? "text-orange-400" :
                    entry.daysFromNow < 90 ? "text-yellow-400" : "text-[#5a6b48]"
                  }`}>
                    {entry.daysFromNow < 0 ? `${Math.abs(entry.daysFromNow)}d overdue` : `in ${entry.daysFromNow}d`}
                  </div>
                  <div className="text-[10px] text-[#5a6b48] uppercase">{entry.urgency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
