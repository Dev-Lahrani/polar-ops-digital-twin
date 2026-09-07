"use client";

import { useState, useMemo } from "react";
import {
  CloudSun, Wind, Thermometer, Droplets, Eye, Gauge, Sun, Snowflake,
  TrendingUp, TrendingDown, Minus, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { EnvironmentalTrend } from "@/types";
import { useEnvironmentalData } from "@/hooks/use-api";

const fallbackHourlyData = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${String(i).padStart(2, "0")}:00`,
  temperatureC: -28 + Math.sin(i / 3.8) * 8 + (Math.random() - 0.5) * 3,
  humidity: 65 + Math.sin(i / 4) * 15 + (Math.random() - 0) * 5,
  windSpeedKmh: 35 + Math.sin(i / 5) * 20 + (Math.random() - 0.5) * 10,
  windDirection: (180 + i * 15) % 360,
  pressureHPA: 998 + Math.sin(i / 6) * 8,
  uvIndex: Math.max(0, Math.sin((i - 6) / 12 * Math.PI) * 6),
  solarRadiationWm2: Math.max(0, Math.sin((i - 7) / 10 * Math.PI) * 850),
  snowDepthCm: 142 + Math.sin(i / 8) * 2,
  visibilityKm: 8 + Math.sin(i / 5) * 4,
  ozoneDobson: 280 + Math.sin(i / 10) * 15,
  pm25: 8 + Math.random() * 5,
  seaIceExtentKm2: 1820000 + Math.sin(i / 12) * 5000,
  seaIceConcentration: 0.72 + Math.sin(i / 8) * 0.05,
}));

const trendData: EnvironmentalTrend[] = [
  { parameter: "Temperature", unit: "°C", currentValue: -28.3, avg30Day: -31.2, minRecorded: -52.1, maxRecorded: 2.8, trend: "increasing", anomalyPercent: 9.3 },
  { parameter: "Wind Speed", unit: "km/h", currentValue: 42.1, avg30Day: 38.5, minRecorded: 0, maxRecorded: 180, trend: "increasing", anomalyPercent: 9.4 },
  { parameter: "Humidity", unit: "%", currentValue: 68.2, avg30Day: 72.1, minRecorded: 15, maxRecorded: 100, trend: "decreasing", anomalyPercent: -5.4 },
  { parameter: "Pressure", unit: "hPa", currentValue: 998.4, avg30Day: 1001.2, minRecorded: 960, maxRecorded: 1040, trend: "decreasing", anomalyPercent: -2.8 },
  { parameter: "UV Index", unit: "UVI", currentValue: 4.2, avg30Day: 3.8, minRecorded: 0, maxRecorded: 11, trend: "stable", anomalyPercent: 10.5 },
  { parameter: "Ozone", unit: "DU", currentValue: 285, avg30Day: 278, minRecorded: 180, maxRecorded: 400, trend: "increasing", anomalyPercent: 2.5 },
  { parameter: "PM2.5", unit: "µg/m³", currentValue: 10.2, avg30Day: 12.5, minRecorded: 2, maxRecorded: 45, trend: "decreasing", anomalyPercent: -18.4 },
  { parameter: "Sea Ice Extent", unit: "M km²", currentValue: 1.82, avg30Day: 1.78, minRecorded: 0.29, maxRecorded: 3.2, trend: "increasing", anomalyPercent: 2.2 },
  { parameter: "Visibility", unit: "km", currentValue: 9.8, avg30Day: 8.5, minRecorded: 0.1, maxRecorded: 30, trend: "stable", anomalyPercent: 15.3 },
  { parameter: "Snow Depth", unit: "cm", currentValue: 143, avg30Day: 138, minRecorded: 5, maxRecorded: 350, trend: "increasing", anomalyPercent: 3.6 },
];

const monthlyTempData = [
  { month: "Jan", avg: 1.2, min: -5, max: 8 },
  { month: "Feb", avg: 0.5, min: -8, max: 6 },
  { month: "Mar", avg: -4.2, min: -18, max: 3 },
  { month: "Apr", avg: -10.5, min: -28, max: -2 },
  { month: "May", avg: -18.8, min: -38, max: -8 },
  { month: "Jun", avg: -22.1, min: -45, max: -12 },
  { month: "Jul", avg: -25.6, min: -52, max: -15 },
  { month: "Aug", avg: -26.3, min: -50, max: -14 },
  { month: "Sep", avg: -23.8, min: -48, max: -10 },
  { month: "Oct", avg: -16.2, min: -35, max: -4 },
  { month: "Nov", avg: -8.5, min: -22, max: 2 },
  { month: "Dec", avg: -1.8, min: -12, max: 6 },
];

const correlationData = monthlyTempData.map((d) => ({
  temp: d.avg,
  wind: 30 + Math.abs(d.avg) * 0.8 + (Math.random() - 0.5) * 10,
  pressure: 1005 + d.avg * 0.3,
  size: Math.abs(d.avg) + 20,
}));

const radarData = trendData.slice(0, 8).map((t) => ({
  parameter: t.parameter.substring(0, 8),
  current: Math.abs(t.anomalyPercent),
  avg: 10,
}));

const TREND_ICON = { increasing: TrendingUp, decreasing: TrendingDown, stable: Minus };
const TREND_COLOR = { increasing: "text-amber-400", decreasing: "text-blue-400", stable: "text-emerald-400" };

export default function EnvironmentPage() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const hours = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
  const { readings, isLoading } = useEnvironmentalData("maitri", hours);

  const hourlyData = useMemo(() => {
    if (readings && readings.length > 0) {
      return readings.map((r) => ({
        timestamp: new Date(r.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        temperatureC: r.temperature,
        humidity: r.humidity,
        windSpeedKmh: r.windSpeed,
        windDirection: typeof r.windDirection === "number" ? r.windDirection : 0,
        pressureHPA: r.pressure,
        uvIndex: r.uvIndex,
        solarRadiationWm2: 0,
        snowDepthCm: r.snowDepth ?? 0,
        visibilityKm: r.visibility,
        ozoneDobson: 0,
        pm25: 0,
        seaIceExtentKm2: 0,
        seaIceConcentration: r.seaIceConcentration ?? 0,
      }));
    }
    return fallbackHourlyData;
  }, [readings]);

  const avgTemp = useMemo(() => hourlyData.reduce((s, d) => s + d.temperatureC, 0) / hourlyData.length, [hourlyData]);
  const avgWind = useMemo(() => hourlyData.reduce((s, d) => s + d.windSpeedKmh, 0) / hourlyData.length, [hourlyData]);
  const maxWind = useMemo(() => Math.max(...hourlyData.map((d) => d.windSpeedKmh)), [hourlyData]);
  const avgPressure = useMemo(() => hourlyData.reduce((s, d) => s + d.pressureHPA, 0) / hourlyData.length, [hourlyData]);

  const statCards = [
    { label: "Temperature", value: `${avgTemp.toFixed(1)}°C`, icon: Thermometer, color: "text-blue-400" },
    { label: "Avg Wind", value: `${avgWind.toFixed(0)} km/h`, icon: Wind, color: "text-cyan-400" },
    { label: "Max Gust", value: `${maxWind.toFixed(0)} km/h`, icon: Wind, color: "text-red-400" },
    { label: "Pressure", value: `${avgPressure.toFixed(0)} hPa`, icon: Gauge, color: "text-purple-400" },
    { label: "UV Index", value: "4.2", icon: Sun, color: "text-amber-400" },
    { label: "Visibility", value: "9.8 km", icon: Eye, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-[#edf2e7] uppercase">Environmental Monitoring</h1>
          <p className="text-xs text-[#7c8b65] font-mono tracking-wide mt-1">
            {isLoading ? "Loading..." : readings && readings.length > 0 ? `Live data · ${readings.length} readings` : "Simulated data"} &bull; Weather &bull; Sea Ice &bull; Ozone &bull; PM2.5 &bull; Trend Analysis &bull; Correlation
          </p>
        </div>
        <div className="flex gap-1 rounded border border-[#2a3a1e] bg-[#0b100b] p-0.5">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded px-3 py-1 text-[10px] font-mono uppercase transition-colors ${
                timeRange === range
                  ? "bg-[#7d9154]/20 text-[#7d9154]"
                  : "text-[#5a6b48] hover:text-[#7c8b65]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                <span className="text-[9px] font-mono text-[#5a6b48] uppercase">{stat.label}</span>
              </div>
              <p className={`text-lg font-black font-mono ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
          <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Temperature & Wind (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a1e" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 9, fill: "#5a6b48" }} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: "#5a6b48" }} />
              <Tooltip contentStyle={{ backgroundColor: "#101510", border: "1px solid #2a3a1e", borderRadius: 6, fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="temperatureC" stroke="#3b82f6" fill="#3b82f620" name="Temp (°C)" />
              <Area type="monotone" dataKey="windSpeedKmh" stroke="#06b6d4" fill="#06b6d420" name="Wind (km/h)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
          <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Pressure & Humidity (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a1e" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 9, fill: "#5a6b48" }} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: "#5a6b48" }} />
              <Tooltip contentStyle={{ backgroundColor: "#101510", border: "1px solid #2a3a1e", borderRadius: 6, fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="pressureHPA" stroke="#8b5cf6" fill="#8b5cf620" name="Pressure (hPa)" />
              <Area type="monotone" dataKey="humidity" stroke="#f59e0b" fill="#f59e0b20" name="Humidity (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
          <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Solar Radiation & UV (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a1e" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 9, fill: "#5a6b48" }} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: "#5a6b48" }} />
              <Tooltip contentStyle={{ backgroundColor: "#101510", border: "1px solid #2a3a1e", borderRadius: 6, fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="solarRadiationWm2" stroke="#f97316" fill="#f9731620" name="Solar (W/m²)" />
              <Area type="monotone" dataKey="uvIndex" stroke="#eab308" fill="#eab30820" name="UV Index" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
          <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Temperature Anomaly Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a3a1e" />
              <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 9, fill: "#5a6b48" }} />
              <PolarRadiusAxis tick={{ fontSize: 8, fill: "#3a4a2e" }} />
              <Radar name="Anomaly %" dataKey="current" stroke="#f59e0b" fill="#f59e0b30" />
              <Radar name="Baseline" dataKey="avg" stroke="#5a6b48" fill="#5a6b4810" />
              <Tooltip contentStyle={{ backgroundColor: "#101510", border: "1px solid #2a3a1e", borderRadius: 6, fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
        <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Monthly Temperature Profile (Bharati Station)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyTempData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3a1e" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#5a6b48" }} />
            <YAxis tick={{ fontSize: 10, fill: "#5a6b48" }} tickFormatter={(v: number) => `${v}°`} />
            <Tooltip contentStyle={{ backgroundColor: "#101510", border: "1px solid #2a3a1e", borderRadius: 6, fontSize: 11 }} formatter={(v: unknown) => [`${v}°C`]} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Max" />
            <Line type="monotone" dataKey="avg" stroke="#7d9154" strokeWidth={2} dot={{ fill: "#7d9154", r: 3 }} name="Average" />
            <Line type="monotone" dataKey="min" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Min" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
          <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Temp vs Wind Correlation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a1e" />
              <XAxis dataKey="temp" name="Temp (°C)" tick={{ fontSize: 9, fill: "#5a6b48" }} />
              <YAxis dataKey="wind" name="Wind (km/h)" tick={{ fontSize: 9, fill: "#5a6b48" }} />
              <ZAxis dataKey="size" range={[40, 400]} />
              <Tooltip contentStyle={{ backgroundColor: "#101510", border: "1px solid #2a3a1e", borderRadius: 6, fontSize: 10 }} />
              <Scatter data={correlationData} fill="#7d9154" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
          <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Parameter Trends</h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {trendData.map((t) => {
              const TrendIcon = TREND_ICON[t.trend];
              return (
                <div key={t.parameter} className="flex items-center justify-between rounded border border-[#2a3a1e] bg-[#0b100b] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <TrendIcon className={`h-3 w-3 ${TREND_COLOR[t.trend]}`} />
                    <span className="text-xs text-[#edf2e7]">{t.parameter}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="text-[#edf2e7]">{t.currentValue} {t.unit}</span>
                    <span className={`${
                      t.anomalyPercent > 5 ? "text-amber-400" : t.anomalyPercent < -5 ? "text-blue-400" : "text-[#5a6b48]"
                    }`}>
                      {t.anomalyPercent > 0 ? "+" : ""}{t.anomalyPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
