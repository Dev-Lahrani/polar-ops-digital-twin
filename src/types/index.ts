export type RiskLevel = "NOMINAL" | "CAUTION" | "WARNING" | "CRITICAL" | "EMERGENCY";

export interface Subsystem {
  id: string;
  name: string;
  type: string;
  status: RiskLevel;
  loadPercent: number;
  details: Record<string, string>;
  icon: string;
}

export interface StationResources {
  power: number;
  fuel: number;
  water: number;
  food: number;
}

export interface Station {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  established: number;
  crewCount: number;
  crewMax: number;
  riskLevel: RiskLevel;
  resources: StationResources;
  temperature: number;
  windSpeed: number;
  generatorLoad?: number;
  fuelDaysRemaining?: number;
  waterDaysRemaining?: number;
  foodDaysRemaining?: number;
  nextResupplyDays?: number;
  fuelCurrentL?: number;
  fuelCapacityL?: number;
  subsystems: Subsystem[];
}

export type Domain =
  | "power"
  | "climate"
  | "water"
  | "comms"
  | "fuel"
  | "habitat"
  | "science"
  | "safety"
  | "overall";

export interface CascadeStep {
  step: number;
  domain: Domain;
  variable: string;
  fromValue: string;
  toValue: string;
  unit?: string;
  severity: RiskLevel | "info" | "warning" | "critical" | "INFO";
  description: string;
  explanation?: string;
  equation?: string;
}

export interface StationMetrics {
  power: number;
  fuelDays: number;
  waterReserve: number;
  foodDays: number;
  riskLevel: RiskLevel;
  generatorLoad?: number;
  fuelBurnRate?: number;
}

export interface Mitigation {
  id?: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  action: string;
  impact: string;
  category: string;
}

export interface SimulationInput {
  stationId?: string;
  failedSubsystem?: string;
  generatorsOnline?: number;
  temperatureC?: number;
  crewCount?: number;
  scientificLoadPercent?: number;
  resupplyDelayDays?: number;
}

export interface MetricsComparison {
  generatorLoad: { before: number; after: number; unit: string };
  fuelBurnRate: { before: number; after: number; unit: string };
  daysToDepletion: { before: number; after: number; unit: string };
  resupplyGap: { before: number; after: number; unit: string };
}

export interface ResourceTimelinePoint {
  day: number;
  fuelPct: number;
  waterPct: number;
  foodPct: number;
  fuelLitres: number;
  waterLitres: number;
  foodKg: number;
}

export interface SimulationResult {
  steps: CascadeStep[];
  before: StationMetrics;
  after: StationMetrics;
  mitigations: (Mitigation | string)[];
  metricsComparison?: MetricsComparison;
  resourceTimeline: ResourceTimelinePoint[];
  nextResupplyDay: number;
}

export type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface ResupplyItem {
  id: string;
  name: string;
  currentAmount: number;
  requiredAmount: number;
  unit: string;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  rationale: string;
  icon: string;
  weightKg: number;
}

export interface MonteCarloResult {
  confidenceBands: ConfidenceBand[];
  tailRisk: TailRisk;
  heatmap: HeatmapCell[];
  iterations: number;
  meanDepletionDay: number;
  stdDevDepletion: number;
}

export interface ConfidenceBand {
  day: number;
  fuelMedian: number;
  fuelP5: number;
  fuelP95: number;
  waterMedian: number;
  waterP5: number;
  waterP95: number;
  foodMedian: number;
  foodP5: number;
  foodP95: number;
}

export interface TailRisk {
  probDepletionIn30Days: number;
  probDepletionIn60Days: number;
  probDepletionIn90Days: number;
  expectedDepletionDay: number;
  worstCaseDay: number;
  bestCaseDay: number;
  riskValueAt95: number;
}

export interface HeatmapCell {
  tempDeviation: number;
  delayDays: number;
  riskScore: number;
  depletionDay: number;
}

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
  riskLevel: RiskLevel;
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

export interface CopilotQuery {
  text: string;
  timestamp: string;
}

export interface CopilotResponse {
  answer: string;
  recommendations: CopilotRecommendation[];
  confidence: number;
  sources: string[];
  category: "diagnostic" | "optimization" | "prediction" | "alert" | "general";
}

export interface CopilotRecommendation {
  action: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  impact: string;
}

export interface WeatherData {
  stationId: string;
  temperatureC: number;
  windSpeedKmh: number;
  windChillC: number;
  humidity: number;
  visibility: number;
  pressureHPA: number;
  timestamp: string;
  source: "live" | "simulated";
  conditions: string;
  uvIndex: number;
  solarRadiation: number;
}

export interface WeatherForecast {
  hourly: WeatherData[];
  trend: "worsening" | "stable" | "improving";
  nextSevereWindow: string | null;
  windChillWarning: boolean;
}

export type AuthRole = "admin" | "engineer" | "viewer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  station: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "fuel" | "food" | "medical" | "spare-parts" | "science" | "general";
  quantity: number;
  unit: string;
  minRequired: number;
  location: string;
  expiryDate?: string;
  lastUpdated: string;
  status: "adequate" | "low" | "critical" | "expiring";
}

export interface CargoManifest {
  id: string;
  vesselName: string;
  departureDate: string;
  estimatedArrival: string;
  status: "planned" | "in-transit" | "arrived" | "delayed";
  totalWeightKg: number;
  maxCapacityKg: number;
  items: CargoItem[];
  iceConditions?: string;
  route?: string;
}

export interface CargoItem {
  id: string;
  inventoryItemId: string;
  name: string;
  weightKg: number;
  priority: PriorityLevel;
  coldChain: boolean;
  temperatureRangeC?: { min: number; max: number };
  packed: boolean;
  mcdaScore?: number;
}

export interface VesselSchedule {
  id: string;
  vesselName: string;
  vesselType: "icebreaker" | "cargo" | "survey";
  departurePort: string;
  destinationStation: string;
  departureDate: string;
  estimatedArrival: string;
  seaIceExtentKm2: number;
  seaIceAnomaly: number;
  routeStatus: "clear" | "moderate-ice" | "heavy-ice" | "blocked";
}

export interface SeaIceData {
  date: string;
  extentKm2: number;
  anomaly: number;
  concentration: number;
  thicknessM: number;
}

export interface EnvironmentalReading {
  timestamp: string;
  temperatureC: number;
  humidity: number;
  windSpeedKmh: number;
  windDirection: number;
  pressureHPA: number;
  uvIndex: number;
  solarRadiationWm2: number;
  snowDepthCm: number;
  visibilityKm: number;
  ozoneDobson: number;
  pm25: number;
  seaIceExtentKm2: number;
  seaIceConcentration: number;
}

export interface EnvironmentalTrend {
  parameter: string;
  unit: string;
  currentValue: number;
  avg30Day: number;
  minRecorded: number;
  maxRecorded: number;
  trend: "increasing" | "decreasing" | "stable";
  anomalyPercent: number;
}

export interface EnergyBalanceEntry {
  timestamp: string;
  solarGenKw: number;
  windGenKw: number;
  dieselGenKw: number;
  totalGenKw: number;
  habitatLoadKw: number;
  scienceLoadKw: number;
  hvacLoadKw: number;
  commsLoadKw: number;
  totalLoadKw: number;
  surplusDeficitKw: number;
  batterySoC: number;
  renewablePercent: number;
}

export interface Alert {
  id: string;
  type: "cold-chain-breach" | "low-stock" | "expiry-warning" | "vessel-delay" | "environmental" | "system";
  severity: RiskLevel;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  stationId: string;
}

export interface MCDAInput {
  name: string;
  weightKg: number;
  priority: PriorityLevel;
  coldChain: boolean;
  expiryDays?: number;
  stockLevel: "adequate" | "low" | "critical" | "expiring";
}
export interface MCDAOutput extends MCDAInput {
  score: number;
  rank: number;
}
