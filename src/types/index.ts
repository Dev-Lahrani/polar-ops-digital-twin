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
