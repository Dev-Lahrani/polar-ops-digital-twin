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
