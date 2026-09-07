"use client";

import { useState, useEffect } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { CascadeStep } from "@/types";

interface CascadeChainProps {
  steps: CascadeStep[];
  animate?: boolean;
}

const severityConfig: Record<
  string,
  { border: string; bg: string; text: string; badgeBg: string; badgeText: string }
> = {
  CRITICAL: {
    border: "border-l-red-500",
    bg: "bg-red-950/15",
    text: "text-red-400",
    badgeBg: "bg-red-950/60",
    badgeText: "text-red-300 border-red-800/60",
  },
  critical: {
    border: "border-l-red-500",
    bg: "bg-red-950/15",
    text: "text-red-400",
    badgeBg: "bg-red-950/60",
    badgeText: "text-red-300 border-red-800/60",
  },
  EMERGENCY: {
    border: "border-l-red-700",
    bg: "bg-red-950/25",
    text: "text-red-400",
    badgeBg: "bg-red-950/80",
    badgeText: "text-red-300 border-red-700/80",
  },
  emergency: {
    border: "border-l-red-700",
    bg: "bg-red-950/25",
    text: "text-red-400",
    badgeBg: "bg-red-950/80",
    badgeText: "text-red-300 border-red-700/80",
  },
  WARNING: {
    border: "border-l-amber-500",
    bg: "bg-amber-950/15",
    text: "text-amber-400",
    badgeBg: "bg-amber-950/60",
    badgeText: "text-amber-300 border-amber-800/60",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-950/15",
    text: "text-amber-400",
    badgeBg: "bg-amber-950/60",
    badgeText: "text-amber-300 border-amber-800/60",
  },
  CAUTION: {
    border: "border-l-yellow-400",
    bg: "bg-yellow-950/15",
    text: "text-yellow-400",
    badgeBg: "bg-yellow-950/60",
    badgeText: "text-yellow-300 border-yellow-800/60",
  },
  caution: {
    border: "border-l-yellow-400",
    bg: "bg-yellow-950/15",
    text: "text-yellow-400",
    badgeBg: "bg-yellow-950/60",
    badgeText: "text-yellow-300 border-yellow-800/60",
  },
  NOMINAL: {
    border: "border-l-emerald-400",
    bg: "bg-emerald-950/15",
    text: "text-emerald-400",
    badgeBg: "bg-emerald-950/60",
    badgeText: "text-emerald-300 border-emerald-800/60",
  },
  nominal: {
    border: "border-l-emerald-400",
    bg: "bg-emerald-950/15",
    text: "text-emerald-400",
    badgeBg: "bg-emerald-950/60",
    badgeText: "text-emerald-300 border-emerald-800/60",
  },
  INFO: {
    border: "border-l-blue-500",
    bg: "bg-blue-950/15",
    text: "text-blue-400",
    badgeBg: "bg-blue-950/60",
    badgeText: "text-blue-300 border-blue-800/60",
  },
  info: {
    border: "border-l-blue-500",
    bg: "bg-blue-950/15",
    text: "text-blue-400",
    badgeBg: "bg-blue-950/60",
    badgeText: "text-blue-300 border-blue-800/60",
  },
};

const domainBadges: Record<string, { bg: string; text: string; border: string }> = {
  power: { bg: "bg-amber-950/40", text: "text-amber-400", border: "border-amber-800/40" },
  climate: { bg: "bg-sky-950/40", text: "text-sky-400", border: "border-sky-800/40" },
  water: { bg: "bg-blue-950/40", text: "text-blue-400", border: "border-blue-800/40" },
  fuel: { bg: "bg-orange-950/40", text: "text-orange-400", border: "border-orange-800/40" },
  habitat: { bg: "bg-emerald-950/40", text: "text-emerald-400", border: "border-emerald-800/40" },
  science: { bg: "bg-purple-950/40", text: "text-purple-400", border: "border-purple-800/40" },
  safety: { bg: "bg-red-950/40", text: "text-red-400", border: "border-red-800/40" },
  comms: { bg: "bg-indigo-950/40", text: "text-indigo-400", border: "border-indigo-800/40" },
  overall: { bg: "bg-slate-800/40", text: "text-slate-300", border: "border-slate-700/40" },
};

export default function CascadeChain({ steps, animate = true }: CascadeChainProps) {
  const [visibleCount, setVisibleCount] = useState<number>(animate ? 0 : steps.length);

  useEffect(() => {
    if (!animate) {
      setVisibleCount(steps.length);
      return;
    }

    setVisibleCount(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= steps.length) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [steps, animate]);

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs font-mono">
        No cascade steps simulated yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 font-mono">
      {/* Vertical Connecting Line */}
      <div className="absolute left-2.5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyan-500/50 via-slate-700 to-red-500/50" />

      {steps.map((step, index) => {
        const isVisible = index < visibleCount;
        const config = severityConfig[step.severity] ?? severityConfig.INFO;
        const domain = domainBadges[step.domain] ?? domainBadges.overall;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={`${step.step}-${index}`}
            className="relative transition-all duration-300"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            {/* Step Node Marker on Vertical Line */}
            <div
              className={`absolute -left-6 top-4 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border bg-[#0a0a0f] text-[10px] font-bold ${
                config.text
              } ${config.border.replace("border-l-", "border-")}`}
            >
              {step.step}
            </div>

            {/* Step Card */}
            <div
              className={`rounded-xl border border-[#1e293b] ${config.bg} p-4 border-l-4 ${config.border} shadow-lg transition-all hover:border-[#334155]`}
            >
              {/* Header: domain badge, variable name, severity */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${domain.bg} ${domain.text} ${domain.border}`}
                  >
                    {step.domain}
                  </span>
                  <span className="text-xs font-bold text-white tracking-wide">
                    {step.variable}
                  </span>
                </div>

                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${config.badgeBg} ${config.badgeText}`}
                >
                  {step.severity}
                </span>
              </div>

              {/* From -> To Transition */}
              <div className="flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-md bg-[#080d1a]/80 border border-[#1e293b]/60 mb-2">
                <span className="text-slate-400 font-medium">{step.fromValue}</span>
                <ArrowRight className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className={`font-bold ${config.text}`}>{step.toValue}</span>
                {step.unit && (
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({step.unit})
                  </span>
                )}
              </div>

              {/* Explanation or Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {step.explanation || step.description}
              </p>
            </div>

            {/* Connecting Arrow Icon */}
            {!isLast && (
              <div className="flex justify-start pl-0 -mb-2 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <ArrowDown className="h-3 w-3 text-cyan-500/70 animate-bounce" />
                  <span className="text-[9px] tracking-widest text-slate-600 uppercase">
                    propagates to
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
