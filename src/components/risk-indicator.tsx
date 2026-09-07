"use client";

import { RiskLevel } from "@/types";

interface RiskIndicatorProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
}

const config: Record<
  RiskLevel,
  { dot: string; bg: string; text: string; pulse: string; glow: string }
> = {
  NOMINAL: {
    dot: "bg-emerald-400",
    bg: "bg-emerald-400/10",
    text: "text-emerald-400",
    pulse: "animate-pulse",
    glow: "",
  },
  CAUTION: {
    dot: "bg-yellow-400",
    bg: "bg-yellow-400/10",
    text: "text-yellow-400",
    pulse: "animate-pulse",
    glow: "",
  },
  WARNING: {
    dot: "bg-orange-400",
    bg: "bg-orange-400/10",
    text: "text-orange-400",
    pulse: "animate-pulse",
    glow: "",
  },
  CRITICAL: {
    dot: "bg-red-500",
    bg: "bg-red-500/10",
    text: "text-red-400",
    pulse: "animate-[pulse_0.8s_ease-in-out_infinite]",
    glow: "",
  },
  EMERGENCY: {
    dot: "bg-red-700",
    bg: "bg-red-700/10",
    text: "text-red-400",
    pulse: "animate-[pulse_0.4s_ease-in-out_infinite]",
    glow: "shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  },
};

const sizes = {
  sm: { badge: "px-2 py-0.5 text-[10px] gap-1.5", dot: "w-1.5 h-1.5" },
  md: { badge: "px-2.5 py-1 text-xs gap-1.5", dot: "w-2 h-2" },
  lg: { badge: "px-3 py-1.5 text-sm gap-2", dot: "w-2.5 h-2.5" },
};

export default function RiskIndicator({ level, size = "md" }: RiskIndicatorProps) {
  const c = config[level];
  const s = sizes[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium tracking-wider uppercase ${c.bg} ${c.text} ${s.badge}`}
    >
      <span className="relative flex shrink-0">
        <span className={`${s.dot} rounded-full ${c.dot} ${c.pulse} ${c.glow}`} />
      </span>
      {level}
    </span>
  );
}
