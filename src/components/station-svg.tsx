"use client";

import { Subsystem, RiskLevel } from "@/types";
import SubsystemNode from "./subsystem-node";

interface StationSvgProps {
  subsystems: Subsystem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

interface ModuleLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Connection {
  from: string;
  to: string;
  label: string;
  fromAnchor: { x: number; y: number };
  toAnchor: { x: number; y: number };
}

const MODULES: ModuleLayout[] = [
  { id: "fuel", x: 40, y: 200, w: 120, h: 80 },
  { id: "generator", x: 210, y: 200, w: 140, h: 80 },
  { id: "habitat", x: 380, y: 180, w: 180, h: 120 },
  { id: "hvac", x: 400, y: 40, w: 140, h: 70 },
  { id: "water", x: 600, y: 40, w: 140, h: 70 },
  { id: "comms", x: 420, y: -30, w: 100, h: 55 },
  { id: "science", x: 620, y: 180, w: 140, h: 80 },
  { id: "emergency", x: 400, y: 360, w: 150, h: 70 },
];

const CONNECTIONS: Connection[] = [
  {
    from: "fuel",
    to: "generator",
    label: "fuel flow",
    fromAnchor: { x: 160, y: 240 },
    toAnchor: { x: 210, y: 240 },
  },
  {
    from: "generator",
    to: "habitat",
    label: "power",
    fromAnchor: { x: 350, y: 240 },
    toAnchor: { x: 380, y: 240 },
  },
  {
    from: "generator",
    to: "hvac",
    label: "power",
    fromAnchor: { x: 280, y: 200 },
    toAnchor: { x: 470, y: 110 },
  },
  {
    from: "hvac",
    to: "habitat",
    label: "heating",
    fromAnchor: { x: 470, y: 110 },
    toAnchor: { x: 470, y: 180 },
  },
  {
    from: "water",
    to: "habitat",
    label: "water supply",
    fromAnchor: { x: 620, y: 75 },
    toAnchor: { x: 560, y: 180 },
  },
  {
    from: "comms",
    to: "habitat",
    label: "data link",
    fromAnchor: { x: 470, y: 25 },
    toAnchor: { x: 470, y: 180 },
  },
];

const statusColor = (status: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    nominal: "#3fb950",
    warning: "#d29922",
    critical: "#f85149",
  };
  return map[status];
};

export default function StationSvg({
  subsystems,
  selectedId,
  onSelect,
}: StationSvgProps) {
  const getSubsystem = (id: string) =>
    subsystems.find((s) => s.id === id);

  return (
    <svg
      viewBox="0 0 820 460"
      className="w-full h-full"
      style={{ minWidth: 800, minHeight: 500, background: "#0d1117" }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#58a6ff" />
        </marker>
      </defs>

      {/* Grid background */}
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path
          d="M 40 0 L 0 0 0 40"
          fill="none"
          stroke="#21262d"
          strokeWidth="0.5"
        />
      </pattern>
      <rect width="820" height="460" fill="url(#grid)" />

      {/* Connection lines */}
      {CONNECTIONS.map((conn) => {
        const fromSub = getSubsystem(conn.from);
        const toSub = getSubsystem(conn.to);
        const color =
          fromSub && toSub
            ? statusColor(
                fromSub.status === "critical" || toSub.status === "critical"
                  ? "critical"
                  : fromSub.status === "warning" || toSub.status === "warning"
                  ? "warning"
                  : "nominal"
              )
            : "#58a6ff";

        const midX = (conn.fromAnchor.x + conn.toAnchor.x) / 2;
        const midY = (conn.fromAnchor.y + conn.toAnchor.y) / 2;

        return (
          <g key={`${conn.from}-${conn.to}`}>
            <line
              x1={conn.fromAnchor.x}
              y1={conn.fromAnchor.y}
              x2={conn.toAnchor.x}
              y2={conn.toAnchor.y}
              stroke={color}
              strokeWidth={1.5}
              className="flow-line"
              markerEnd="url(#arrow)"
              opacity={0.7}
            />
            <text
              x={midX}
              y={midY - 6}
              textAnchor="middle"
              fill="#8b949e"
              fontSize={9}
              fontFamily="'JetBrains Mono', monospace"
            >
              {conn.label}
            </text>
          </g>
        );
      })}

      {/* Module nodes */}
      {MODULES.map((mod) => {
        const sub = getSubsystem(mod.id);
        if (!sub) return null;
        return (
          <SubsystemNode
            key={mod.id}
            subsystem={sub}
            position={{ x: mod.x, y: mod.y }}
            size={{ w: mod.w, h: mod.h }}
            isSelected={selectedId === mod.id}
            onClick={() =>
              onSelect(selectedId === mod.id ? null : mod.id)
            }
          />
        );
      })}
    </svg>
  );
}
