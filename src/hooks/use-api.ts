import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
});

export function useStations() {
  const { data, error, isLoading, mutate } = useSWR("/api/stations", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000,
  });
  return { stations: data, error, isLoading, refresh: mutate };
}

export function useStation(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/stations/${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { station: data, error, isLoading, refresh: mutate };
}

export function useInventory(stationId?: string) {
  const url = stationId
    ? `/api/inventory?stationId=${stationId}`
    : "/api/inventory";
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000,
  });
  return { items: data, error, isLoading, refresh: mutate };
}

export interface EnvironmentalReading {
  id: string;
  stationId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  snowDepth: number;
  seaIceConcentration: number;
}

export function useEnvironmentalData(stationId = "maitri", hours = 24) {
  const { data, error, isLoading, mutate } = useSWR<EnvironmentalReading[]>(
    `/api/environmental?stationId=${stationId}&hours=${hours}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 10000,
    }
  );
  return { readings: data, error, isLoading, refresh: mutate };
}

export interface PredictiveComponent {
  id: string;
  name: string;
  category: string;
  reliabilityScore: number;
  mtbf: number;
  operatingHours: number;
  trendDirection: string;
  riskLevel: string;
}

export interface MaintenanceEntry {
  componentName: string;
  type: string;
  urgency: string;
  scheduledDate: string;
  daysFromNow: number;
}

export interface PredictiveAnalysis {
  overallRiskLevel: string;
  fleetReliabilityScore: number;
  components: PredictiveComponent[];
  maintenanceTimeline: MaintenanceEntry[];
}

export function usePredictiveAnalysis() {
  const { data, error, isLoading, mutate } = useSWR<PredictiveAnalysis>("/api/predictive", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 300000,
  });
  return { analysis: data, error, isLoading, refresh: mutate };
}

export async function runMonteCarlo(
  stationId: string,
  input: Record<string, unknown>
) {
  const res = await fetch("/api/monte-carlo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationId, ...input }),
  });
  if (!res.ok) throw new Error(`Monte Carlo failed: ${res.status}`);
  return res.json();
}

export async function sendCopilotQuery(
  query: string,
  stationId: string
) {
  const res = await fetch("/api/copilot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, stationId }),
  });
  if (!res.ok) throw new Error(`Copilot failed: ${res.status}`);
  return res.json();
}

export async function runSimulation(
  stationId: string,
  input: Record<string, unknown>
) {
  const res = await fetch("/api/simulation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationId, ...input }),
  });
  if (!res.ok) throw new Error(`Simulation failed: ${res.status}`);
  return res.json();
}

export async function runResupply(
  stationId: string,
  input: Record<string, unknown>
) {
  const res = await fetch("/api/resupply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationId, ...input }),
  });
  if (!res.ok) throw new Error(`Resupply calc failed: ${res.status}`);
  return res.json();
}
