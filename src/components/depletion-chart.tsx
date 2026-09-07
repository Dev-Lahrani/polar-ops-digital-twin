"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ResourceTimelinePoint } from "@/types";

interface DepletionChartProps {
  data: ResourceTimelinePoint[];
  resupplyDay: number;
  title: string;
  comparisonData?: ResourceTimelinePoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-lg border p-3 text-xs font-mono"
      style={{
        background: "#161b22",
        borderColor: "#30363d",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <div className="text-[#8b949e] mb-2">Day {label}</div>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#8b949e]">{entry.name}:</span>
          <span className="text-[#e6edf3] font-bold">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function DepletionChart({
  data,
  resupplyDay,
  title,
  comparisonData,
}: DepletionChartProps) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: "#30363d", background: "#161b22" }}
    >
      <h3 className="text-sm font-bold text-[#8b949e] uppercase tracking-wider mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d29922" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#d29922" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="foodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3fb950" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
            </linearGradient>
            {comparisonData && (
              <>
                <linearGradient id="fuelComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d29922" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#d29922" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="waterComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="foodComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3fb950" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
                </linearGradient>
              </>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            dataKey="day"
            stroke="#8b949e"
            fontSize={11}
            tickLine={false}
            label={{
              value: "Days",
              position: "insideBottomRight",
              offset: -5,
              fill: "#8b949e",
              fontSize: 11,
            }}
          />
          <YAxis
            stroke="#8b949e"
            fontSize={11}
            tickLine={false}
            domain={[0, 100]}
            label={{
              value: "% Capacity",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "#8b949e",
              fontSize: 11,
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Threshold lines */}
          <ReferenceLine
            y={30}
            stroke="#d29922"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: "Warning 30%",
              position: "right",
              fill: "#d29922",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={15}
            stroke="#f85149"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: "Critical 15%",
              position: "right",
              fill: "#f85149",
              fontSize: 10,
            }}
          />

          {/* Resupply line */}
          <ReferenceLine
            x={resupplyDay}
            stroke="#bc8cff"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{
              value: "Resupply",
              position: "top",
              fill: "#bc8cff",
              fontSize: 10,
            }}
          />

          {/* Main data series */}
          <Area
            type="monotone"
            dataKey="fuelPct"
            name="Fuel"
            stroke="#d29922"
            strokeWidth={2}
            fill="url(#fuelGrad)"
          />
          <Area
            type="monotone"
            dataKey="waterPct"
            name="Water"
            stroke="#58a6ff"
            strokeWidth={2}
            fill="url(#waterGrad)"
          />
          <Area
            type="monotone"
            dataKey="foodPct"
            name="Food"
            stroke="#3fb950"
            strokeWidth={2}
            fill="url(#foodGrad)"
          />

          {/* Comparison data (dashed) */}
          {comparisonData && (
            <>
              <Area
                type="monotone"
                data={comparisonData}
                dataKey="fuelPct"
                name="Fuel (Scenario)"
                stroke="#d29922"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#fuelComp)"
              />
              <Area
                type="monotone"
                data={comparisonData}
                dataKey="waterPct"
                name="Water (Scenario)"
                stroke="#58a6ff"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#waterComp)"
              />
              <Area
                type="monotone"
                data={comparisonData}
                dataKey="foodPct"
                name="Food (Scenario)"
                stroke="#3fb950"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#foodComp)"
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
