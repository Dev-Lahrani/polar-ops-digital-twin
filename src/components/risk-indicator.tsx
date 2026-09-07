"use client";

import { RiskLevel } from "@/types";

interface RiskIndicatorProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
}

const config: Record<
  RiskLevel,
  { dot: string; bg: string; text: string; pulse: string; glow: string; border: string }
> = {
  NOMINAL: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    pulse: "",
    glow: "",
    border: "border-emerald-500/30",
  },
  CAUTION: {
    dot: "bg-yellow-500",
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    pulse: "",
    glow: "",
    border: "border-yellow-500/30",
  },
  WARNING: {
    dot: "bg-amber-500",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    pulse: "animate-pulse",
    glow: "",
    border: "border-amber-500/30",
  },
  CRITICAL: {
    dot: "bg-red-500",
    bg: "bg-red-500/15",
    text: "text-red-400",
    pulse: "animate-[pulse_0.8s_ease-in-out_infinite]",
    glow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]",
    border: "border-red-500/40",
  },
  EMERGENCY: {
    dot: "bg-red-700",
    bg: "bg-red-800/20",
    text: "text-red-300",
    pulse: "animate-[pulse_0.4s_ease-in-out_infinite]",
    glow: "shadow-[0_0_12px_rgba(185,28,28,0.6)]",
    border: "border-red-700/60",
  },
};

const sizes = {
  sm: { badge: "px-2 py-0.5 text-[10px] gap-1.5", dot: "w-1.5 h-1.5" },
  md: { badge: "px-2.5 py-1 text-xs gap-1.5", dot: "w-2 h-2" },
  lg: { badge: "px-3 py-1.5 text-sm gap-2", dot: "w-2.5 h-2.5" },
};

export default function RiskIndicator({ level, size = "md" }: RiskIndicatorProps) {
  const c = config[level] || config.NOMINAL;
  const s = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-bold tracking-wider uppercase border ${c.bg} ${c.text} ${c.border} ${c.glow} ${s.badge}`}
    >
      <span className="relative flex shrink-0">
        <span className={`${s.dot} rounded-full ${c.dot} ${c.pulse}`} />
      </span>
      {level}
    </span>
  );
}
