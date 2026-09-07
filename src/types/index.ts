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

export interface SimulationResult {
  steps: CascadeStep[];
  before: StationMetrics;
  after: StationMetrics;
  mitigations: string[];
}
