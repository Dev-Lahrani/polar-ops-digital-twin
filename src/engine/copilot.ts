import { Station } from "@/types";

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

interface QueryPattern {
  keywords: string[];
  category: CopilotResponse["category"];
  handler: (station: Station, query: string) => CopilotResponse;
}

const DAILY_FUEL_BURN_MAITRI = 1080;
const DAILY_FUEL_BURN_BHARATI = 1248;
const DAILY_WATER_USE = 2280;
const DAILY_FOOD_USE = 30;

function getStationFuelBurn(station: Station): number {
  return station.id === "maitri" ? DAILY_FUEL_BURN_MAITRI : DAILY_FUEL_BURN_BHARATI;
}

function handleFuelQuery(station: Station, _query: string): CopilotResponse {
  const fuelDays = station.fuelDaysRemaining ?? 99;
  const fuelCurrent = station.fuelCurrentL ?? 27000;
  const dailyBurn = getStationFuelBurn(station);

  let answer: string;
  const recs: CopilotRecommendation[] = [];

  if (fuelDays <= 15) {
    answer = `FUEL ALERT: ${station.name} has approximately ${fuelDays} days of diesel remaining (${fuelCurrent.toLocaleString()} L). Daily consumption is ${dailyBurn} L/day. This is critically below the 30-day polar reserve threshold. Immediate action is required.`;
    recs.push(
      { action: "Activate fuel rationing protocol — reduce non-essential heating by 25%", priority: "CRITICAL", impact: "Extends fuel endurance by ~7 days" },
      { action: "Request emergency resupply from nearest station or dispatch vessel", priority: "CRITICAL", impact: "Addresses root cause of fuel shortage" },
      { action: "Consolidate crew into fewer habitat modules to reduce thermal load", priority: "HIGH", impact: "Reduces daily fuel burn by ~150 L" }
    );
  } else if (fuelDays <= 30) {
    answer = `CAUTION: ${station.name} fuel reserve is at ${fuelDays} days (${fuelCurrent.toLocaleString()} L). Daily burn is ${dailyBurn} L/day. Approaching minimum 30-day polar reserve safety margin.`;
    recs.push(
      { action: "Schedule fuel conservation measures and monitor burn rate daily", priority: "HIGH", impact: "Prevents critical fuel shortage" },
      { action: "Confirm resupply vessel timeline with logistics command", priority: "MEDIUM", impact: "Ensures timely delivery" }
    );
  } else {
    answer = `${station.name} fuel status is nominal. ${fuelDays} days of reserve remaining (${fuelCurrent.toLocaleString()} L) at ${dailyBurn} L/day consumption. Above 30-day safety threshold.`;
    recs.push({ action: "Continue standard monitoring — no immediate action needed", priority: "LOW", impact: "Maintains current operations" });
  }

  return {
    answer,
    recommendations: recs,
    confidence: 0.95,
    sources: ["Fuel Storage Subsystem Telemetry", "Simulation Engine"],
    category: "diagnostic",
  };
}

function handleGeneratorQuery(station: Station, _query: string): CopilotResponse {
  const genLoad = station.generatorLoad ?? 60;
  const gen = station.subsystems.find(s => s.id === "generator");

  let answer: string;
  const recs: CopilotRecommendation[] = [];

  if (genLoad >= 85) {
    answer = `GENERATOR WARNING: ${station.name} generator load is at ${genLoad}%. This is above the 85% critical threshold. Risk of automatic trip or turbine damage if sustained.`;
    recs.push(
      { action: "Execute Tier-1 load shedding — disconnect non-critical loads", priority: "CRITICAL", impact: "Reduces load by ~45 kW" },
      { action: "Check if all planned generators are online", priority: "HIGH", impact: "Increases available capacity" }
    );
  } else if (genLoad >= 70) {
    answer = `${station.name} generator operating at ${genLoad}% load. Elevated but within operational limits. Monitor for upward trend.`;
    recs.push({ action: "Review scientific load scheduling to flatten peak demand", priority: "MEDIUM", impact: "Reduces peak by ~14 kW" });
  } else {
    answer = `${station.name} generators operating normally at ${genLoad}% load. ${gen?.details["ActiveUnits"] ?? "All units"}. Capacity margin adequate.`;
    recs.push({ action: "No action required — continue standard monitoring", priority: "LOW", impact: "Maintains nominal operations" });
  }

  return {
    answer,
    recommendations: recs,
    confidence: 0.92,
    sources: ["Generator Room Telemetry", "Power Distribution System"],
    category: "diagnostic",
  };
}

function handleWaterQuery(station: Station, _query: string): CopilotResponse {
  const waterDays = station.waterDaysRemaining ?? 99;
  const water = station.subsystems.find(s => s.id === "water");

  let answer: string;
  const recs: CopilotRecommendation[] = [];

  if (waterDays <= 10) {
    answer = `WATER EMERGENCY: ${station.name} has only ${waterDays} days of potable water. The RO treatment plant is operating at ${water?.loadPercent ?? 95}% capacity. Filter replacement is critically overdue.`;
    recs.push(
      { action: "Initiate water rationing: 30 L per person per day", priority: "CRITICAL", impact: "Reduces daily consumption by ~600 L" },
      { action: "Dispatch emergency filter replacement kit on next supply window", priority: "CRITICAL", impact: "Restores water production capacity" }
    );
  } else if (waterDays <= 20) {
    answer = `CAUTION: ${station.name} water reserves at ${waterDays} days. RO system under heavy load (${water?.loadPercent ?? 90}%). Filter maintenance approaching.`;
    recs.push(
      { action: "Schedule filter replacement within 7 days", priority: "HIGH", impact: "Prevents production failure" },
      { action: "Implement greywater recycling for non-potable uses", priority: "MEDIUM", impact: "Reduces consumption by ~300 L/day" }
    );
  } else {
    answer = `${station.name} water treatment nominal. ${waterDays} days of reserve. Output: ${water?.details["Output"] ?? "2,400 L/day"}. Filter age: ${water?.details["FilterAge"] ?? "42%"}.`;
    recs.push({ action: "Continue standard operations", priority: "LOW", impact: "No action needed" });
  }

  return {
    answer,
    recommendations: recs,
    confidence: 0.90,
    sources: ["Water Treatment Subsystem", "Filter Monitoring System"],
    category: "diagnostic",
  };
}

function handleResupplyQuery(station: Station, _query: string): CopilotResponse {
  const daysToResupply = station.nextResupplyDays ?? 30;
  const fuelDays = station.fuelDaysRemaining ?? 99;

  let answer: string;
  const recs: CopilotRecommendation[] = [];

  if (daysToResupply > fuelDays) {
    answer = `RESUPPLY GAP: ${station.name} resupply vessel arrives in ${daysToResupply} days, but fuel runs out in ${fuelDays} days. Gap of ${daysToResupply - fuelDays} days. Critical logistics risk.`;
    recs.push(
      { action: "Request inter-station fuel relay from Bharati/Maitri", priority: "CRITICAL", impact: "Bridges the resupply gap" },
      { action: "Implement emergency fuel rationing to extend endurance", priority: "CRITICAL", impact: "Extends fuel by ~25%" }
    );
  } else {
    const buffer = daysToResupply - fuelDays;
    answer = `${station.name} resupply in ${daysToResupply} days. Fuel endurance ${fuelDays} days. Buffer of ${buffer} days. ${buffer < 10 ? "Buffer is tight — monitor closely." : "Buffer is adequate."}`;
    recs.push({ action: "Confirm vessel departure timeline", priority: buffer < 10 ? "HIGH" : "MEDIUM", impact: "Ensures timely delivery" });
  }

  return {
    answer,
    recommendations: recs,
    confidence: 0.88,
    sources: ["Logistics System", "Resupply Priority Calculator"],
    category: "prediction",
  };
}

function handleWeatherQuery(station: Station, _query: string): CopilotResponse {
  const temp = station.temperature;
  const wind = station.windSpeed;

  let answer: string;
  const recs: CopilotRecommendation[] = [];

  if (temp <= -40) {
    answer = `EXTREME WEATHER: ${station.name} experiencing severe conditions. Temperature ${temp}°C, wind ${wind} km/h. Wind chill factor significantly increases heating demand. Outdoor operations suspended.`;
    recs.push(
      { action: "Consolidate all crew into central habitat module", priority: "CRITICAL", impact: "Reduces thermal envelope exposure" },
      { action: "Increase generator output to meet heating surge", priority: "HIGH", impact: "Maintains habitable temperature" }
    );
  } else if (temp <= -35) {
    answer = `${station.name} conditions: ${temp}°C, wind ${wind} km/h. Cold weather increasing heating demand. Monitor for deterioration.`;
    recs.push({ action: "Pre-position backup heating canisters", priority: "MEDIUM", impact: "Prepares for further temperature drops" });
  } else {
    answer = `${station.name} weather: ${temp}°C, wind ${wind} km/h. Within normal operational range for this season.`;
    recs.push({ action: "Standard environmental monitoring", priority: "LOW", impact: "No action needed" });
  }

  return {
    answer,
    recommendations: recs,
    confidence: 0.85,
    sources: ["Weather Station Telemetry", "HVAC Load Calculator"],
    category: "alert",
  };
}

function handleGeneralQuery(station: Station, query: string): CopilotResponse {
  const fuelDays = station.fuelDaysRemaining ?? 99;
  const waterDays = station.waterDaysRemaining ?? 99;
  const genLoad = station.generatorLoad ?? 60;

  return {
    answer: `${station.name} Station Status Summary: Crew ${station.crewCount}/${station.crewMax}, Temperature ${station.temperature}°C, Wind ${station.windSpeed} km/h, Generator ${genLoad}%, Fuel ${fuelDays}d, Water ${waterDays}d, Risk Level: ${station.riskLevel}. How can I help you with specific systems?`,
    recommendations: [
      { action: "Ask about fuel, generators, water, resupply, or weather for detailed diagnostics", priority: "LOW", impact: "Provides targeted analysis" }
    ],
    confidence: 0.80,
    sources: ["All Station Telemetry"],
    category: "general",
  };
}

const QUERY_PATTERNS: QueryPattern[] = [
  { keywords: ["fuel", "diesel", "oil", "burn", "depletion"], category: "diagnostic", handler: handleFuelQuery },
  { keywords: ["generator", "power", "electric", "load", "watt"], category: "diagnostic", handler: handleGeneratorQuery },
  { keywords: ["water", "ro", "filter", "treatment", "drink"], category: "diagnostic", handler: handleWaterQuery },
  { keywords: ["resupply", "ship", "vessel", "supply", "delivery"], category: "prediction", handler: handleResupplyQuery },
  { keywords: ["weather", "temperature", "wind", "cold", "storm", "wind chill"], category: "alert", handler: handleWeatherQuery },
];

export function processQuery(station: Station, query: string): CopilotResponse {
  const lowerQuery = query.toLowerCase();

  for (const pattern of QUERY_PATTERNS) {
    if (pattern.keywords.some(kw => lowerQuery.includes(kw))) {
      return pattern.handler(station, query);
    }
  }

  return handleGeneralQuery(station, query);
}

export function getSuggestedQueries(station: Station): string[] {
  const suggestions: string[] = [];

  if ((station.fuelDaysRemaining ?? 99) <= 30) {
    suggestions.push("What's our fuel status?");
    suggestions.push("How do we extend fuel endurance?");
  }

  if ((station.generatorLoad ?? 0) >= 70) {
    suggestions.push("Why is the generator load so high?");
    suggestions.push("What loads can we shed?");
  }

  if ((station.waterDaysRemaining ?? 99) <= 20) {
    suggestions.push("Water treatment status?");
    suggestions.push("When are filters due for replacement?");
  }

  suggestions.push("When is the next resupply?");
  suggestions.push("Current weather conditions?");
  suggestions.push("Give me a full station status report");

  return suggestions;
}
