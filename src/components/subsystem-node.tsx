"use client";

import { Subsystem, RiskLevel } from "@/types";

interface SubsystemNodeProps {
  subsystem: Subsystem;
  position: { x: number; y: number };
  size: { w: number; h: number };
  isSelected: boolean;
  onClick: () => void;
}

const statusColors: Record<RiskLevel, string> = {
  NOMINAL: "#3fb950",
  CAUTION: "#eab308",
  WARNING: "#d29922",
  CRITICAL: "#f85149",
  EMERGENCY: "#b91c1c",
};

const statusBorders: Record<RiskLevel, string> = {
  NOMINAL: "#3fb950",
  CAUTION: "#eab308",
  WARNING: "#d29922",
  CRITICAL: "#f85149",
  EMERGENCY: "#b91c1c",
};

export default function SubsystemNode({
  subsystem,
  position,
  size,
  isSelected,
  onClick,
}: SubsystemNodeProps) {
  const borderColor = isSelected
    ? "#58a6ff"
    : statusBorders[subsystem.status];
  const statusColor = statusColors[subsystem.status];

  return (
    <g
      className={`subsystem-node ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={position.x}
        y={position.y}
        width={size.w}
        height={size.h}
        rx={8}
        ry={8}
        fill="#1a2332"
        stroke={borderColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      <text
        x={position.x + size.w / 2}
        y={position.y + size.h / 2 - 6}
        textAnchor="middle"
        fontSize={22}
        dominantBaseline="central"
      >
        {subsystem.icon}
      </text>
      <text
        x={position.x + size.w / 2}
        y={position.y + size.h / 2 + 18}
        textAnchor="middle"
        fill="#e6edf3"
        fontSize={11}
        fontFamily="'JetBrains Mono', monospace"
      >
        {subsystem.name}
      </text>
      <circle
        cx={position.x + size.w - 10}
        cy={position.y + 10}
        r={5}
        fill={statusColor}
        className="status-pulse"
        style={{ color: statusColor }}
      />
    </g>
  );
}
