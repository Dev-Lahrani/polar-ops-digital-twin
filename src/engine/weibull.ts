export interface ComponentReliability {
  id: string;
  name: string;
  category: "power" | "life-support" | "science" | "comms" | "logistics" | "safety";
  weibullShape: number;
  weibullScale: number;
  operatingHours: number;
  mtbf: number;
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  failureRate: number;
  reliabilityScore: number;
  riskLevel: "NOMINAL" | "CAUTION" | "WARNING" | "CRITICAL";
  trendDirection: "improving" | "stable" | "degrading";
}

export interface ReliabilityCurvePoint {
  hour: number;
  reliability: number;
}

export interface MaintenanceTimelineEntry {
  componentId: string;
  componentName: string;
  scheduledDate: string;
  type: "preventive" | "corrective" | "predictive";
  urgency: "overdue" | "due-soon" | "scheduled" | "future";
  daysFromNow: number;
}

export interface WeibullResult {
  components: ComponentReliability[];
  reliabilityCurves: Record<string, ReliabilityCurvePoint[]>;
  maintenanceTimeline: MaintenanceTimelineEntry[];
  fleetReliabilityScore: number;
  overallRiskLevel: "NOMINAL" | "CAUTION" | "WARNING" | "CRITICAL";
}

const COMPONENTS_DB: Omit<ComponentReliability, "failureRate" | "reliabilityScore" | "riskLevel" | "trendDirection">[] = [
  { id: "gen_primary", name: "Primary Diesel Generator", category: "power", weibullShape: 2.5, weibullScale: 15000, operatingHours: 8760, mtbf: 13320, lastMaintenanceDate: "2026-07-15", nextScheduledMaintenance: "2026-10-15" },
  { id: "gen_secondary", name: "Secondary Diesel Generator", category: "power", weibullShape: 2.8, weibullScale: 18000, operatingHours: 6500, mtbf: 16010, lastMaintenanceDate: "2026-08-01", nextScheduledMaintenance: "2026-11-01" },
  { id: "gen_backup", name: "Emergency Backup Generator", category: "power", weibullShape: 2.2, weibullScale: 12000, operatingHours: 2100, mtbf: 10660, lastMaintenanceDate: "2026-06-20", nextScheduledMaintenance: "2026-12-20" },
  { id: "hvac_main", name: "HVAC Heating System", category: "life-support", weibullShape: 3.0, weibullScale: 20000, operatingHours: 10200, mtbf: 17900, lastMaintenanceDate: "2026-08-10", nextScheduledMaintenance: "2026-11-10" },
  { id: "water_ro", name: "RO Water Treatment Plant", category: "life-support", weibullShape: 2.0, weibullScale: 10000, operatingHours: 7800, mtbf: 8860, lastMaintenanceDate: "2026-07-01", nextScheduledMaintenance: "2026-10-01" },
  { id: "water_filters", name: "Water Filter Assembly", category: "life-support", weibullShape: 1.5, weibullScale: 3000, operatingHours: 2800, mtbf: 2000, lastMaintenanceDate: "2026-09-01", nextScheduledMaintenance: "2026-10-01" },
  { id: "comms_vsat", name: "VSAT Antenna System", category: "comms", weibullShape: 3.5, weibullScale: 25000, operatingHours: 5400, mtbf: 22490, lastMaintenanceDate: "2026-08-15", nextScheduledMaintenance: "2027-02-15" },
  { id: "comms_iridium", name: "Iridium Backup Transceiver", category: "comms", weibullShape: 2.0, weibullScale: 15000, operatingHours: 4200, mtbf: 13320, lastMaintenanceDate: "2026-07-20", nextScheduledMaintenance: "2027-01-20" },
  { id: "solar_panels", name: "Solar Panel Array", category: "power", weibullShape: 1.8, weibullScale: 22000, operatingHours: 12000, mtbf: 19630, lastMaintenanceDate: "2026-06-01", nextScheduledMaintenance: "2026-12-01" },
  { id: "battery_bank", name: "Battery Storage Bank", category: "power", weibullShape: 2.3, weibullScale: 8000, operatingHours: 7000, mtbf: 7110, lastMaintenanceDate: "2026-08-20", nextScheduledMaintenance: "2026-11-20" },
  { id: "refrigeration", name: "Cold Storage / Freezer Units", category: "life-support", weibullShape: 2.7, weibullScale: 14000, operatingHours: 9500, mtbf: 12530, lastMaintenanceDate: "2026-07-25", nextScheduledMaintenance: "2026-10-25" },
  { id: "fire_suppression", name: "Fire Suppression System", category: "safety", weibullShape: 4.0, weibullScale: 30000, operatingHours: 10200, mtbf: 27200, lastMaintenanceDate: "2026-09-01", nextScheduledMaintenance: "2027-03-01" },
];

function weibullReliability(t: number, shape: number, scale: number): number {
  if (t < 0) return 1;
  return Math.exp(-Math.pow(t / scale, shape));
}

function weibullHazard(t: number, shape: number, scale: number): number {
  if (t <= 0 || scale <= 0) return 0;
  return (shape / scale) * Math.pow(t / scale, shape - 1);
}

function getRiskLevel(reliability: number, hoursToNextMaintenance: number): ComponentReliability["riskLevel"] {
  if (reliability < 0.3 || hoursToNextMaintenance < 100) return "CRITICAL";
  if (reliability < 0.5 || hoursToNextMaintenance < 500) return "WARNING";
  if (reliability < 0.7 || hoursToNextMaintenance < 2000) return "CAUTION";
  return "NOMINAL";
}

function getTrend(shape: number, operatingHours: number, scale: number): ComponentReliability["trendDirection"] {
  const normalized = operatingHours / scale;
  if (shape < 2 && normalized < 0.5) return "improving";
  if (shape > 3 && normalized > 0.6) return "degrading";
  return "stable";
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function analyzeReliability(): WeibullResult {
  const components: ComponentReliability[] = COMPONENTS_DB.map(comp => {
    const reliability = weibullReliability(comp.operatingHours, comp.weibullShape, comp.weibullScale);
    const failureRate = weibullHazard(comp.operatingHours, comp.weibullShape, comp.weibullScale);
    const hoursToNext = Math.max(0, daysUntil(comp.nextScheduledMaintenance) * 24);

    return {
      ...comp,
      failureRate,
      reliabilityScore: Math.round(reliability * 1000) / 10,
      riskLevel: getRiskLevel(reliability, hoursToNext),
      trendDirection: getTrend(comp.weibullShape, comp.operatingHours, comp.weibullScale),
    };
  });

  const reliabilityCurves: Record<string, ReliabilityCurvePoint[]> = {};
  components.forEach(comp => {
    const points: ReliabilityCurvePoint[] = [];
    const maxHours = comp.weibullScale * 2;
    for (let h = 0; h <= maxHours; h += Math.max(1, Math.round(maxHours / 100))) {
      points.push({
        hour: h,
        reliability: Math.round(weibullReliability(h, comp.weibullShape, comp.weibullScale) * 1000) / 10,
      });
    }
    reliabilityCurves[comp.id] = points;
  });

  const now = new Date();
  const maintenanceTimeline: MaintenanceTimelineEntry[] = components.map(comp => {
    const daysFromNow = daysUntil(comp.nextScheduledMaintenance);
    let urgency: MaintenanceTimelineEntry["urgency"];
    if (daysFromNow < 0) urgency = "overdue";
    else if (daysFromNow < 30) urgency = "due-soon";
    else if (daysFromNow < 90) urgency = "scheduled";
    else urgency = "future";

    const entry: MaintenanceTimelineEntry = {
      componentId: comp.id,
      componentName: comp.name,
      scheduledDate: comp.nextScheduledMaintenance,
      type: "predictive" as const,
      urgency,
      daysFromNow,
    };
    return entry;
  }).sort((a, b) => a.daysFromNow - b.daysFromNow);

  const fleetScore = components.reduce((s, c) => s + c.reliabilityScore, 0) / components.length;

  const criticalCount = components.filter(c => c.riskLevel === "CRITICAL").length;
  const warningCount = components.filter(c => c.riskLevel === "WARNING").length;

  let overallRisk: WeibullResult["overallRiskLevel"] = "NOMINAL";
  if (criticalCount > 0) overallRisk = "CRITICAL";
  else if (warningCount > 2) overallRisk = "WARNING";
  else if (warningCount > 0 || fleetScore < 70) overallRisk = "CAUTION";

  return {
    components,
    reliabilityCurves,
    maintenanceTimeline,
    fleetReliabilityScore: Math.round(fleetScore * 10) / 10,
    overallRiskLevel: overallRisk,
  };
}
