import { Station, SimulationInput, SimulationResult, CascadeStep, StationMetrics, RiskLevel } from "@/types";

function riskOrder(r: RiskLevel): number {
  return r === "critical" ? 2 : r === "warning" ? 1 : 0;
}

function worseRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return riskOrder(a) >= riskOrder(b) ? a : b;
}

function metricDelta(
  metric: keyof StationMetrics,
  before: StationMetrics,
  after: StationMetrics
): "worse" | "same" | "better" {
  const bv = before[metric] as number;
  const av = after[metric] as number;
  if (metric === "riskLevel") {
    return riskOrder(after.riskLevel) > riskOrder(before.riskLevel)
      ? "worse"
      : riskOrder(after.riskLevel) < riskOrder(before.riskLevel)
      ? "better"
      : "same";
  }
  // For numeric metrics, lower is worse (fuel days, water reserve, food days, power)
  return av < bv ? "worse" : av > bv ? "better" : "same";
}

function buildBeforeMetrics(station: Station): StationMetrics {
  const gen = station.subsystems.find((s) => s.id === "generator");
  const fuel = station.subsystems.find((s) => s.id === "fuel");
  const water = station.subsystems.find((s) => s.id === "water");
  const statuses = station.subsystems.map((s) => s.status);
  const hasCritical = statuses.some((s) => s === "critical");
  const hasWarning = statuses.some((s) => s === "warning");

  return {
    power: gen ? (100 - gen.loadPercent) : 50,
    fuelDays: fuel ? parseInt(fuel.details["DaysRemaining"] ?? "30", 10) : 30,
    waterReserve: water
      ? parseInt(
          (water.details["Reserve"] ?? "10000").replace(/,/g, ""),
          10
        )
      : 10000,
    foodDays: 45,
    riskLevel: hasCritical ? "critical" : hasWarning ? "warning" : "nominal",
  };
}

export function runSimulation(
  station: Station,
  input: SimulationInput
): SimulationResult {
  const steps: CascadeStep[] = [];
  let stepNum = 1;
  const before = buildBeforeMetrics(station);

  // Clone before state for simulation
  let powerAvail = before.power;
  let fuelDays = before.fuelDays;
  let waterReserve = before.waterReserve;
  let foodDays = before.foodDays;
  let overallRisk: RiskLevel = before.riskLevel;
  const mitigations: string[] = [];

  // --- Generator Failure ---
  if (input.failedSubsystem === "generator" || input.generatorsOnline === 1) {
    powerAvail = Math.max(powerAvail - 35, 10);
    overallRisk = worseRisk(overallRisk, "critical");

    steps.push({
      step: stepNum++,
      domain: "power",
      variable: "Generators Online",
      fromValue: "3 / 3",
      toValue: "1 / 3",
      severity: "critical",
      description: "Primary generator goes offline, output drops to 33%",
    });
    steps.push({
      step: stepNum++,
      domain: "power",
      variable: "Available Power",
      fromValue: `${before.power}%`,
      toValue: `${powerAvail}%`,
      severity: "critical",
      description: "Power reserves critically depleted",
    });
    steps.push({
      step: stepNum++,
      domain: "habitat",
      variable: "Habitat Systems",
      fromValue: "120 kW draw",
      toValue: "Load shedding active",
      severity: "warning",
      description: "Non-essential circuits disconnected",
    });
    steps.push({
      step: stepNum++,
      domain: "science",
      variable: "Science Lab",
      fromValue: "4 experiments active",
      toValue: "All paused",
      severity: "warning",
      description: "Lab power allocation suspended for crew safety",
    });
    steps.push({
      step: stepNum++,
      domain: "climate",
      variable: "HVAC Power Feed",
      fromValue: "85 kW heating",
      toValue: "Reduced to 40 kW",
      severity: "warning",
      description: "Heating reduced — habitat temperature dropping",
    });

    fuelDays = Math.max(fuelDays - 3, 5);
    steps.push({
      step: stepNum++,
      domain: "fuel",
      variable: "Fuel Consumption Rate",
      fromValue: "45 L/hr",
      toValue: "62 L/hr (backup engine)",
      severity: "warning",
      description: "Backup generator burns fuel less efficiently",
    });

    mitigations.push("Switch to backup generator immediately");
    mitigations.push("Reduce habitat power draw by 40%");
    mitigations.push("Request emergency fuel resupply via satellite");
    mitigations.push("Prepare manual power rationing protocol");
  }

  // --- HVAC Failure ---
  if (input.failedSubsystem === "hvac") {
    overallRisk = worseRisk(overallRisk, "critical");
    steps.push({
      step: stepNum++,
      domain: "climate",
      variable: "HVAC Status",
      fromValue: "Operational",
      toValue: "OFFLINE",
      severity: "critical",
      description: "Heating and ventilation system completely failed",
    });
    steps.push({
      step: stepNum++,
      domain: "climate",
      variable: "Habitat Temperature",
      fromValue: "22°C",
      toValue: "8°C and falling",
      severity: "critical",
      description: "Internal temperature dropping toward ambient",
    });
    steps.push({
      step: stepNum++,
      domain: "habitat",
      variable: "Crew Safety",
      fromValue: "All safe",
      toValue: "Cold stress risk",
      severity: "warning",
      description: "Crew exposed to hypothermia risk within hours",
    });
    steps.push({
      step: stepNum++,
      domain: "water",
      variable: "Pipe Temperature",
      fromValue: "Above freezing",
      toValue: "Approaching 0°C",
      severity: "warning",
      description: "Water pipes at risk of freezing and bursting",
    });
    steps.push({
      step: stepNum++,
      domain: "science",
      variable: "Lab Specimens",
      fromValue: "Properly stored",
      toValue: "Temperature excursion",
      severity: "warning",
      description: "Biological samples at risk of thaw damage",
    });

    foodDays = Math.max(foodDays - 5, 5);
    mitigations.push("Activate emergency chemical heaters");
    mitigations.push("Consolidate crew into single habitat wing");
    mitigations.push("Insulate water pipes with emergency wrap");
    mitigations.push("Evacuate non-essential modules");
  }

  // --- Water Plant Failure ---
  if (input.failedSubsystem === "water_plant") {
    waterReserve = Math.max(waterReserve - 4000, 500);
    overallRisk = worseRisk(overallRisk, "critical");

    steps.push({
      step: stepNum++,
      domain: "water",
      variable: "Treatment Plant",
      fromValue: "2,400 L/day",
      toValue: "0 L/day",
      severity: "critical",
      description: "Water treatment plant offline — no fresh water production",
    });
    steps.push({
      step: stepNum++,
      domain: "water",
      variable: "Reserve Supply",
      fromValue: `${before.waterReserve.toLocaleString()} L`,
      toValue: `${waterReserve.toLocaleString()} L`,
      severity: "warning",
      description: "Reserve depleting at 2,280 L/day demand",
    });
    steps.push({
      step: stepNum++,
      domain: "habitat",
      variable: "Water Rationing",
      fromValue: "Normal use",
      toValue: "Strict rationing",
      severity: "warning",
      description: "Crew water allocation reduced to 8L/person/day",
    });
    steps.push({
      step: stepNum++,
      domain: "safety",
      variable: "Fire Suppression",
      fromValue: "Full capacity",
      toValue: "Reduced reserves",
      severity: "warning",
      description: "Fire suppression water reserves affected",
    });

    mitigations.push("Activate emergency water rationing protocol");
    mitigations.push("Deploy backup filtration units");
    mitigations.push("Melt snow/ice for emergency water supply");
    mitigations.push("Request priority water resupply");
  }

  // --- Communications Failure ---
  if (input.failedSubsystem === "comms") {
    overallRisk = worseRisk(overallRisk, "warning");
    steps.push({
      step: stepNum++,
      domain: "comms",
      variable: "Satellite Link",
      fromValue: "Connected (10 Mbps)",
      toValue: "DISCONNECTED",
      severity: "critical",
      description: "All satellite communication links lost",
    });
    steps.push({
      step: stepNum++,
      domain: "comms",
      variable: "Data Link to Base",
      fromValue: "Active",
      toValue: "Offline",
      severity: "critical",
      description: "No telemetry or data transmission to mission control",
    });
    steps.push({
      step: stepNum++,
      domain: "safety",
      variable: "Emergency Beacon",
      fromValue: "Ready",
      toValue: "Fallback HF radio",
      severity: "warning",
      description: "Emergency communications switched to backup",
    });
    steps.push({
      step: stepNum++,
      domain: "science",
      variable: "Data Upload",
      fromValue: "Scheduled sync",
      toValue: "Paused",
      severity: "warning",
      description: "Research data cannot be transmitted",
    });

    mitigations.push("Switch to Iridium backup satellite");
    mitigations.push("Deploy portable HF radio antenna");
    mitigations.push("Store critical data locally for later upload");
    mitigations.push("Contact rescue coordination via HF frequency");
  }

  // --- Extreme Cold Event ---
  if (input.temperatureC !== undefined && input.temperatureC <= -40) {
    overallRisk = worseRisk(overallRisk, "critical");

    steps.push({
      step: stepNum++,
      domain: "climate",
      variable: "External Temperature",
      fromValue: "-28°C",
      toValue: `${input.temperatureC}°C`,
      severity: "critical",
      description: "Extreme cold event — temperature plummets",
    });
    steps.push({
      step: stepNum++,
      domain: "power",
      variable: "Heating Demand",
      fromValue: "85 kW",
      toValue: "180 kW (max capacity)",
      severity: "critical",
      description: "Heating demand exceeds generator capacity",
    });
    steps.push({
      step: stepNum++,
      domain: "climate",
      variable: "Habitat Temperature",
      fromValue: "22°C",
      toValue: "14°C and falling",
      severity: "critical",
      description: "Cannot maintain safe internal temperature",
    });
    steps.push({
      step: stepNum++,
      domain: "fuel",
      variable: "Fuel Burn Rate",
      fromValue: "45 L/hr",
      toValue: "95 L/hr",
      severity: "warning",
      description: "Fuel consumption nearly doubled",
    });
    fuelDays = Math.max(Math.floor(fuelDays * 0.4), 2);

    steps.push({
      step: stepNum++,
      domain: "fuel",
      variable: "Days Until Empty",
      fromValue: `${before.fuelDays} days`,
      toValue: `${fuelDays} days`,
      severity: "critical",
      description: "Fuel reserves critically low at increased burn rate",
    });
    steps.push({
      step: stepNum++,
      domain: "habitat",
      variable: "Crew Safety",
      fromValue: "Normal operations",
      toValue: "Emergency shelter",
      severity: "critical",
      description: "Crew confined to emergency shelter module",
    });

    mitigations.push("Activate all emergency fuel reserves");
    mitigations.push("Consolidate crew to emergency shelter module");
    mitigations.push("Reduce heating to minimum safe levels");
    mitigations.push("Request emergency evacuation if cold persists >48hrs");
  }

  // --- Resupply Delay ---
  if (input.resupplyDelayDays && input.resupplyDelayDays > 0) {
    fuelDays = Math.max(fuelDays - input.resupplyDelayDays, 1);
    foodDays = Math.max(foodDays - input.resupplyDelayDays, 1);
    waterReserve = Math.max(waterReserve - input.resupplyDelayDays * 2280, 200);
    overallRisk = worseRisk(overallRisk, "warning");

    steps.push({
      step: stepNum++,
      domain: "overall",
      variable: "Resupply ETA",
      fromValue: "Scheduled",
      toValue: `+${input.resupplyDelayDays} days delayed`,
      severity: "warning",
      description: "Ship resupply delayed due to sea ice conditions",
    });
    steps.push({
      step: stepNum++,
      domain: "fuel",
      variable: "Fuel Days Remaining",
      fromValue: `${before.fuelDays} days`,
      toValue: `${fuelDays} days`,
      severity: fuelDays < 10 ? "critical" : "warning",
      description: "Fuel reserves shrinking without resupply",
    });
    steps.push({
      step: stepNum++,
      domain: "water",
      variable: "Water Reserve",
      fromValue: `${before.waterReserve.toLocaleString()} L`,
      toValue: `${waterReserve.toLocaleString()} L`,
      severity: waterReserve < 5000 ? "critical" : "warning",
      description: "Water reserves depleting without replenishment",
    });
    steps.push({
      step: stepNum++,
      domain: "habitat",
      variable: "Food Supply",
      fromValue: `${before.foodDays} days`,
      toValue: `${foodDays} days`,
      severity: foodDays < 15 ? "critical" : "warning",
      description: "Food stockpile reduced without resupply",
    });

    if (fuelDays < 10) {
      mitigations.push("Implement strict fuel rationing immediately");
    }
    if (waterReserve < 5000) {
      mitigations.push("Deploy water conservation measures");
    }
    if (foodDays < 15) {
      mitigations.push("Reduce crew food rations by 20%");
    }
    mitigations.push("Request aerial resupply if sea route blocked");
    mitigations.push("Contact nearest friendly station for emergency shares");
  }

  // Ensure we have at least one mitigation
  if (mitigations.length === 0) {
    mitigations.push("Monitor situation closely");
    mitigations.push("Review contingency protocols");
  }

  const after: StationMetrics = {
    power: powerAvail,
    fuelDays,
    waterReserve,
    foodDays,
    riskLevel: overallRisk,
  };

  return { steps, before, after, mitigations };
}

export function getMetricDelta(
  metric: keyof StationMetrics,
  before: StationMetrics,
  after: StationMetrics
): "worse" | "same" | "better" {
  return metricDelta(metric, before, after);
}
