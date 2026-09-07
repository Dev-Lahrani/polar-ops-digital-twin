export type RiskLevel = "nominal" | "warning" | "critical";

export interface Subsystem {
  id: string;
  name: string;
  type: string;
  status: RiskLevel;
  loadPercent: number;
  details: Record<string, string>;
  icon: string;
}

export interface Station {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  established: number;
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
  severity: RiskLevel;
  description: string;
}

export interface StationMetrics {
  power: number;
  fuelDays: number;
  waterReserve: number;
  foodDays: number;
  riskLevel: RiskLevel;
}

export interface SimulationInput {
  failedSubsystem?: string;
  generatorsOnline?: number;
  temperatureC?: number;
  resupplyDelayDays?: number;
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
  mitigations: string[];
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
