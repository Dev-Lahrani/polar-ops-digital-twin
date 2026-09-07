"use client";

import { useState, useMemo } from "react";
import {
  Ship, Package, AlertTriangle, CheckCircle, Clock, Thermometer,
  Download, Filter, ChevronDown, ChevronUp, Box, Truck, Snowflake,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  InventoryItem, CargoManifest, VesselSchedule, SeaIceData, MCDAInput, MCDAOutput, Alert,
} from "@/types";
import { useSession } from "next-auth/react";

const PRIORITY_COLORS = { CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#3b82f6", LOW: "#6b7280" };

const inventoryData: InventoryItem[] = [
  { id: "inv-1", name: "Diesel Fuel (Arctic Grade)", category: "fuel", quantity: 27000, unit: "L", minRequired: 15000, location: "Tank B-1", lastUpdated: "2026-09-06T08:00:00Z", status: "adequate" },
  { id: "inv-2", name: "AVGas (Jet Fuel)", category: "fuel", quantity: 8200, unit: "L", minRequired: 5000, location: "Tank A-3", lastUpdated: "2026-09-06T08:00:00Z", status: "adequate" },
  { id: "inv-3", name: "Freeze-Dried Meals", category: "food", quantity: 480, unit: "kg", minRequired: 300, location: "Store F-1", expiryDate: "2027-03-15", lastUpdated: "2026-09-05T14:00:00Z", status: "adequate" },
  { id: "inv-4", name: "Fresh Vegetables", category: "food", quantity: 12, unit: "kg", minRequired: 20, location: "Cold Store F-2", expiryDate: "2026-09-12", lastUpdated: "2026-09-06T06:00:00Z", status: "critical" },
  { id: "inv-5", name: "Generator Oil Filters", category: "spare-parts", quantity: 4, unit: "pcs", minRequired: 6, location: "Workshop S-1", lastUpdated: "2026-09-04T10:00:00Z", status: "low" },
  { id: "inv-6", name: "First Aid Kits", category: "medical", quantity: 15, unit: "kits", minRequired: 10, location: "Med Bay M-1", lastUpdated: "2026-09-01T12:00:00Z", status: "adequate" },
  { id: "inv-7", name: "VSAT Spare Antenna", category: "spare-parts", quantity: 1, unit: "pcs", minRequired: 1, location: "Comms Room C-1", lastUpdated: "2026-08-28T09:00:00Z", status: "adequate" },
  { id: "inv-8", name: "Batteries (Li-Ion 18650)", category: "spare-parts", quantity: 48, unit: "pcs", minRequired: 50, location: "Store S-2", lastUpdated: "2026-09-06T07:00:00Z", status: "low" },
  { id: "inv-9", name: "Science Sample Containers", category: "science", quantity: 120, unit: "pcs", minRequired: 50, location: "Lab L-1", lastUpdated: "2026-09-05T16:00:00Z", status: "adequate" },
  { id: "inv-10", name: "Water Purification Tablets", category: "general", quantity: 200, unit: "tabs", minRequired: 100, location: "Store G-1", lastUpdated: "2026-09-03T11:00:00Z", status: "adequate" },
];

const vesselData: VesselSchedule[] = [
  { id: "vs-1", vesselName: "MV Vasiliy Golovnin", vesselType: "icebreaker", departurePort: "Cape Town", destinationStation: "Maitri", departureDate: "2026-10-15", estimatedArrival: "2026-11-02", seaIceExtentKm2: 1820000, seaIceAnomaly: 5.2, routeStatus: "moderate-ice" },
  { id: "vs-2", vesselName: "Sagar Nidhi", vesselType: "cargo", departurePort: "Mumbai", destinationStation: "Bharati", departureDate: "2026-11-01", estimatedArrival: "2026-11-28", seaIceExtentKm2: 1950000, seaIceAnomaly: 8.1, routeStatus: "heavy-ice" },
  { id: "vs-3", vesselName: "INS Dhruv", vesselType: "survey", departurePort: "Kochi", destinationStation: "Maitri", departureDate: "2026-12-05", estimatedArrival: "2026-12-25", seaIceExtentKm2: 1650000, seaIceAnomaly: -2.3, routeStatus: "clear" },
];

const seaIceData: SeaIceData[] = [
  { date: "Aug 2026", extentKm2: 1650000, anomaly: 3.1, concentration: 0.72, thicknessM: 1.2 },
  { date: "Jul 2026", extentKm2: 1480000, anomaly: 1.8, concentration: 0.65, thicknessM: 1.0 },
  { date: "Jun 2026", extentKm2: 1220000, anomaly: -0.5, concentration: 0.55, thicknessM: 0.8 },
  { date: "May 2026", extentKm2: 980000, anomaly: -2.1, concentration: 0.48, thicknessM: 0.6 },
  { date: "Apr 2026", extentKm2: 750000, anomaly: 0.8, concentration: 0.42, thicknessM: 0.5 },
  { date: "Mar 2026", extentKm2: 520000, anomaly: 1.2, concentration: 0.35, thicknessM: 0.4 },
  { date: "Feb 2026", extentKm2: 380000, anomaly: -0.3, concentration: 0.30, thicknessM: 0.3 },
  { date: "Jan 2026", extentKm2: 290000, anomaly: -1.5, concentration: 0.25, thicknessM: 0.2 },
];

const alertsData: Alert[] = [
  { id: "a1", type: "low-stock", severity: "WARNING", title: "Fresh Vegetables Running Low", message: "12 kg remaining (20 kg minimum). Next resupply in 28 days.", timestamp: "2026-09-06T06:00:00Z", acknowledged: false, stationId: "maitri" },
  { id: "a2", type: "low-stock", severity: "CAUTION", title: "Generator Oil Filters Below Threshold", message: "4 units remaining (6 minimum). Order placed for next vessel.", timestamp: "2026-09-04T10:00:00Z", acknowledged: false, stationId: "maitri" },
  { id: "a3", type: "cold-chain-breach", severity: "WARNING", title: "Cold Store Temperature Rising", message: "Cold Store F-2 at -12°C (target: -18°C). Check compressor.", timestamp: "2026-09-06T04:30:00Z", acknowledged: false, stationId: "maitri" },
  { id: "a4", type: "vessel-delay", severity: "CAUTION", title: "MV Vasiliy Golovnin Delay Risk", message: "Sea ice anomaly +5.2% may cause 2-3 day delay.", timestamp: "2026-09-05T18:00:00Z", acknowledged: true, stationId: "maitri" },
];

function runMCDA(inputs: MCDAInput[]): MCDAOutput[] {
  const scored = inputs.map((item) => {
    let score = 0;
    const priorityWeight = { CRITICAL: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    score += priorityWeight[item.priority] || 10;
    if (item.stockLevel === "critical") score += 30;
    else if (item.stockLevel === "low") score += 20;
    else if (item.stockLevel === "adequate") score += 5;
    if (item.coldChain) score += 10;
    if (item.expiryDays !== undefined && item.expiryDays < 14) score += 15;
    else if (item.expiryDays !== undefined && item.expiryDays < 30) score += 8;
    score += Math.min(item.weightKg / 100, 15);
    return { ...item, score, rank: 0 };
  });
  scored.sort((a, b) => b.score - a.score);
  scored.forEach((item, i) => { item.rank = i + 1; });
  return scored;
}

const STATUS_ICON: Record<string, typeof CheckCircle> = {
  adequate: CheckCircle,
  low: AlertTriangle,
  critical: AlertTriangle,
  expiring: Clock,
};

const STATUS_COLOR: Record<string, string> = {
  adequate: "text-emerald-400",
  low: "text-amber-400",
  critical: "text-red-400",
  expiring: "text-orange-400",
};

const STATUS_BG: Record<string, string> = {
  adequate: "bg-emerald-900/20 border-emerald-800/30",
  low: "bg-amber-900/20 border-amber-800/30",
  critical: "bg-red-900/20 border-red-800/30",
  expiring: "bg-orange-900/20 border-orange-800/30",
};

export default function LogisticsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState<"inventory" | "cargo" | "vessels" | "alerts">("inventory");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredInventory = useMemo(() => {
    if (categoryFilter === "all") return inventoryData;
    return inventoryData.filter((i) => i.category === categoryFilter);
  }, [categoryFilter]);

  const mcdaResults = useMemo(() => {
    const inputs: MCDAInput[] = inventoryData.map((i) => ({
      name: i.name,
      weightKg: i.quantity,
      priority: i.status === "critical" ? "CRITICAL" : i.status === "low" ? "HIGH" : "MEDIUM",
      coldChain: i.location.includes("Cold"),
      expiryDays: i.expiryDate ? Math.max(0, Math.floor((new Date(i.expiryDate).getTime() - Date.now()) / 86400000)) : undefined,
      stockLevel: i.status,
    }));
    return runMCDA(inputs);
  }, []);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    inventoryData.forEach((i) => { counts[i.category] = (counts[i.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const CATEGORY_COLORS = ["#7d9154", "#5a8a3c", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  const tabs = [
    { id: "inventory" as const, label: "Inventory", icon: Package },
    { id: "cargo" as const, label: "Cargo Packing (MCDA)", icon: Box },
    { id: "vessels" as const, label: "Vessel Schedule", icon: Ship },
    { id: "alerts" as const, label: "Cold-Chain Alerts", icon: AlertTriangle },
  ];

  const activeAlerts = alertsData.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-[#edf2e7] uppercase">Logistics</h1>
          <p className="text-xs text-[#7c8b65] font-mono tracking-wide mt-1">
            Inventory &bull; Cargo Packing &bull; Vessel Scheduling &bull; Sea Ice &bull; Cold Chain
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-1.5 rounded border border-amber-800/30 bg-amber-900/20 px-2.5 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-mono text-amber-400">{activeAlerts.length} ACTIVE</span>
            </div>
          )}
          {user?.role === "ADMIN" && (
            <button className="flex items-center gap-1.5 rounded bg-[#7d9154]/20 border border-[#7d9154]/30 px-3 py-1.5 text-[10px] font-mono text-[#7d9154] hover:bg-[#7d9154]/30 transition-colors">
              <Download className="h-3 w-3" />
              EXPORT MANIFEST
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-[#2a3a1e]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider border-b-2 transition-colors ${
                isActive
                  ? "border-[#7d9154] text-[#7d9154] bg-[#141b13]"
                  : "border-transparent text-[#5a6b48] hover:text-[#7c8b65]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.id === "alerts" && activeAlerts.length > 0 && (
                <span className="ml-1 rounded-full bg-amber-900/40 px-1.5 py-0.5 text-[9px] text-amber-400">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Filter className="h-3.5 w-3.5 text-[#5a6b48]" />
            <div className="flex gap-1.5">
              {["all", "fuel", "food", "medical", "spare-parts", "science", "general"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    categoryFilter === cat
                      ? "bg-[#7d9154]/20 border border-[#7d9154]/30 text-[#7d9154]"
                      : "border border-[#2a3a1e] text-[#5a6b48] hover:text-[#7c8b65]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2">
              {filteredInventory.map((item) => {
                const Icon = STATUS_ICON[item.status];
                const isExpanded = expandedItem === item.id;
                const stockPercent = Math.min(100, (item.quantity / item.minRequired) * 100);
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border ${STATUS_BG[item.status]} p-3.5 transition-all cursor-pointer`}
                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${STATUS_COLOR[item.status]}`} />
                        <div>
                          <p className="text-sm font-semibold text-[#edf2e7]">{item.name}</p>
                          <p className="text-[10px] font-mono text-[#5a6b48]">
                            {item.location} &bull; {item.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-mono text-[#edf2e7]">
                            {item.quantity.toLocaleString()} <span className="text-[#5a6b48] text-[10px]">{item.unit}</span>
                          </p>
                          <p className="text-[9px] font-mono text-[#5a6b48]">
                            min: {item.minRequired.toLocaleString()} {item.unit}
                          </p>
                        </div>
                        <div className="w-20">
                          <div className="h-1.5 rounded-full bg-[#1a2518] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                stockPercent > 80 ? "bg-emerald-500" : stockPercent > 50 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(100, stockPercent)}%` }}
                            />
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-[#5a6b48]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#5a6b48]" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[#2a3a1e] grid grid-cols-3 gap-3 text-[10px] font-mono text-[#7c8b65]">
                        <div>Last Updated: {new Date(item.lastUpdated).toLocaleDateString()}</div>
                        {item.expiryDate && <div>Expiry: {item.expiryDate}</div>}
                        <div>Stock Level: <span className={STATUS_COLOR[item.status]}>{item.status.toUpperCase()}</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
                <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                      {categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#101510", border: "1px solid #2a3a1e", borderRadius: 6, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
                <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Stock Summary</h3>
                <div className="space-y-2">
                  {Object.entries({ adequate: 0, low: 0, critical: 0 }).map(([status, _]) => {
                    const count = inventoryData.filter((i) => i.status === status).length;
                    return (
                      <div key={status} className="flex items-center justify-between text-[10px] font-mono">
                        <span className={STATUS_COLOR[status]}>{status.toUpperCase()}</span>
                        <span className="text-[#edf2e7]">{count} items</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "cargo" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
            <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-1">
              MCDA-Based Cargo Packing Priority
            </h3>
            <p className="text-[10px] text-[#5a6b48] mb-4">
              Multi-Criteria Decision Analysis ranks cargo items by urgency, stock level, cold-chain requirements, expiry proximity, and weight
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mcdaResults.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a1e" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#5a6b48" }} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 10, fill: "#7c8b65" }} />
                <Tooltip contentStyle={{ backgroundColor: "#101510", border: "1px solid #2a3a1e", borderRadius: 6, fontSize: 11 }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {mcdaResults.slice(0, 8).map((entry, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[entry.priority]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
            <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Packing Order</h3>
            <div className="space-y-2">
              {mcdaResults.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded border border-[#2a3a1e] bg-[#0b100b] px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-[#7d9154]/20 text-[10px] font-mono font-bold text-[#7d9154]">
                      #{item.rank}
                    </span>
                    <div>
                      <p className="text-xs text-[#edf2e7]">{item.name}</p>
                      <p className="text-[9px] font-mono text-[#5a6b48]">{item.weightKg} kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.coldChain && (
                      <span className="flex items-center gap-1 rounded bg-blue-900/20 border border-blue-800/30 px-1.5 py-0.5 text-[9px] text-blue-400">
                        <Snowflake className="h-2.5 w-2.5" /> COLD
                      </span>
                    )}
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${
                      item.priority === "CRITICAL" ? "bg-red-900/20 text-red-400" :
                      item.priority === "HIGH" ? "bg-amber-900/20 text-amber-400" :
                      "bg-blue-900/20 text-blue-400"
                    }`}>
                      {item.priority}
                    </span>
                    <span className="text-[10px] font-mono text-[#5a6b48]">Score: {item.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "vessels" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vesselData.map((vessel) => (
              <div key={vessel.id} className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-[#7d9154]" />
                    <h3 className="text-sm font-semibold text-[#edf2e7]">{vessel.vesselName}</h3>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[9px] font-mono uppercase ${
                    vessel.routeStatus === "clear" ? "bg-emerald-900/20 text-emerald-400 border border-emerald-800/30" :
                    vessel.routeStatus === "moderate-ice" ? "bg-amber-900/20 text-amber-400 border border-amber-800/30" :
                    vessel.routeStatus === "heavy-ice" ? "bg-red-900/20 text-red-400 border border-red-800/30" :
                    "bg-gray-900/20 text-gray-400 border border-gray-800/30"
                  }`}>
                    {vessel.routeStatus}
                  </span>
                </div>
                <div className="space-y-1.5 text-[10px] font-mono text-[#7c8b65]">
                  <div className="flex justify-between">
                    <span>Type</span>
                    <span className="text-[#edf2e7]">{vessel.vesselType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>From</span>
                    <span className="text-[#edf2e7]">{vessel.departurePort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To</span>
                    <span className="text-[#edf2e7]">{vessel.destinationStation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Departure</span>
                    <span className="text-[#edf2e7]">{vessel.departureDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ETA</span>
                    <span className="text-[#edf2e7]">{vessel.estimatedArrival}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#2a3a1e]">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-[#5a6b48]">Sea Ice Extent</span>
                    <span className="text-[#edf2e7]">{(vessel.seaIceExtentKm2 / 1000000).toFixed(2)}M km²</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-[#5a6b48]">Anomaly</span>
                    <span className={vessel.seaIceAnomaly > 0 ? "text-amber-400" : "text-emerald-400"}>
                      {vessel.seaIceAnomaly > 0 ? "+" : ""}{vessel.seaIceAnomaly}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[#2a3a1e] bg-[#101510] p-4">
            <h3 className="text-[11px] font-mono text-[#7c8b65] uppercase tracking-wider mb-3">Sea Ice Extent Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={seaIceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a1e" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#5a6b48" }} />
                <YAxis tick={{ fontSize: 10, fill: "#5a6b48" }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ backgroundColor: "#101510", border: "1px solid #2a3a1e", borderRadius: 6, fontSize: 11 }} formatter={(v: unknown) => [`${(Number(v) / 1000000).toFixed(2)}M km²`, "Extent"]} />
                <Line type="monotone" dataKey="extentKm2" stroke="#7d9154" strokeWidth={2} dot={{ fill: "#7d9154", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="space-y-3">
          {alertsData.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-4 ${
                alert.acknowledged
                  ? "border-[#2a3a1e] bg-[#101510] opacity-60"
                  : alert.severity === "WARNING"
                  ? "border-amber-800/30 bg-amber-900/10"
                  : "border-[#2a3a1e] bg-[#101510]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                    alert.severity === "WARNING" ? "text-amber-400" : "text-[#7c8b65]"
                  }`} />
                  <div>
                    <p className="text-sm font-semibold text-[#edf2e7]">{alert.title}</p>
                    <p className="text-xs text-[#7c8b65] mt-1">{alert.message}</p>
                    <p className="text-[9px] font-mono text-[#5a6b48] mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[9px] font-mono ${
                    alert.severity === "WARNING" ? "bg-amber-900/20 text-amber-400" : "bg-[#1a2518] text-[#7c8b65]"
                  }`}>
                    {alert.severity}
                  </span>
                  {alert.acknowledged && (
                    <span className="rounded bg-emerald-900/20 px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                      ACK
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
