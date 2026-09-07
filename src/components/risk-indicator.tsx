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
    dot: "bg-[#22c55e]",
    bg: "bg-[#22c55e]/15",
    text: "text-[#22c55e]",
    pulse: "animate-pulse",
    glow: "",
  },
  CAUTION: {
    dot: "bg-[#eab308]",
    bg: "bg-[#eab308]/15",
    text: "text-[#eab308]",
    pulse: "animate-pulse",
    glow: "",
  },
  WARNING: {
    dot: "bg-[#f97316]",
    bg: "bg-[#f97316]/15",
    text: "text-[#f97316]",
    pulse: "animate-pulse",
    glow: "",
  },
  CRITICAL: {
    dot: "bg-[#ef4444]",
    bg: "bg-[#ef4444]/15",
    text: "text-[#ef4444]",
    pulse: "animate-[pulse_0.8s_ease-in-out_infinite]",
    glow: "",
  },
  EMERGENCY: {
    dot: "bg-[#dc2626]",
    bg: "bg-[#dc2626]/20",
    text: "text-red-400",
    pulse: "animate-[pulse_0.4s_ease-in-out_infinite]",
    glow: "shadow-[0_0_10px_rgba(220,38,38,0.7)]",
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
      className={`inline-flex items-center rounded-full font-medium tracking-wider uppercase ${c.bg} ${c.text} ${s.badge}`}
    >
      <span className="relative flex shrink-0">
        <span className={`${s.dot} rounded-full ${c.dot} ${c.pulse} ${c.glow}`} />
      </span>
      {level}
    </span>
  );
}
