"use client";

import { useState, useEffect } from "react";
import { ResupplyItem, PriorityLevel } from "@/types";

const priorityColors: Record<PriorityLevel, string> = {
  CRITICAL: "#f85149",
  HIGH: "#f0883e",
  MEDIUM: "#d29922",
  LOW: "#3fb950",
};

const priorityBg: Record<PriorityLevel, string> = {
  CRITICAL: "#f8514915",
  HIGH: "#f0883e15",
  MEDIUM: "#d2992215",
  LOW: "#3fb95015",
};

function PriorityBar({ score, animate }: { score: number; animate: boolean }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(score * 100), 100);
      return () => clearTimeout(timer);
    }
    setWidth(score * 100);
  }, [score, animate]);

  const color =
    score >= 0.8
      ? "#f85149"
      : score >= 0.55
      ? "#f0883e"
      : score >= 0.3
      ? "#d29922"
      : "#3fb950";

  return (
    <div className="w-full h-3 bg-[#21262d] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${width}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

export default function ResupplyPriorityList({
  items,
  animate = true,
}: {
  items: ResupplyItem[];
  animate?: boolean;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const color = priorityColors[item.priorityLevel];
        return (
          <div
            key={item.id}
            className="rounded-lg border p-4 transition-all"
            style={{
              borderColor: idx === 0 ? `${color}60` : "#30363d",
              background: idx === 0 ? priorityBg[item.priorityLevel] : "#161b22",
              boxShadow: idx === 0 ? `0 0 20px ${color}15` : "none",
            }}
          >
            <div className="flex items-center gap-4">
              {/* Priority rank */}
              <div className="flex-shrink-0 text-center">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: `${color}20`,
                    color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {idx + 1}
                </div>
                <span
                  className="text-[10px] font-bold uppercase mt-1 block"
                  style={{ color }}
                >
                  {item.priorityLevel}
                </span>
              </div>

              {/* Resource info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-bold text-[#e6edf3] text-sm">
                    {item.name}
                  </span>
                </div>
                <div className="text-xs text-[#8b949e] mb-2">
                  Current:{" "}
                  <span className="text-[#e6edf3]">
                    {item.currentAmount.toLocaleString()} {item.unit}
                  </span>{" "}
                  / Required:{" "}
                  <span className="text-[#e6edf3]">
                    {item.requiredAmount.toLocaleString()} {item.unit}
                  </span>
                </div>
                <PriorityBar score={item.priorityScore} animate={animate} />
                <div className="text-xs text-[#8b949e] mt-2 italic">
                  {item.rationale}
                </div>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-right">
                <div className="text-xl font-bold font-mono" style={{ color }}>
                  {Math.round(item.priorityScore * 100)}
                </div>
                <div className="text-[10px] text-[#8b949e]">priority</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
