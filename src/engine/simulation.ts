import {
  Station,
  SimulationInput,
  SimulationResult,
  CascadeStep,
  StationMetrics,
  RiskLevel,
  Mitigation,
  MetricsComparison,
  ResourceTimelinePoint,
} from "@/types";

const THERMAL_COEFFICIENT = 0.8; // kW/°C
const SPECIFIC_FUEL_CONSUMPTION = 0.28; // L/kWh
const GENERATOR_UNIT_KW = 80; // 3 x 100 kVA @ 0.8 pf = 240 kW total

function riskRank(r: RiskLevel | string): number {
  switch (r.toUpperCase()) {
    case "EMERGENCY":
      return 4;
    case "CRITICAL":
      return 3;
    case "WARNING":
      return 2;
    case "CAUTION":
      return 1;
    default:
      return 0;
  }
}

function worseRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return riskRank(a) >= riskRank(b) ? a : b;
}

export function getMetricDelta(
  metric: keyof StationMetrics,
  before: StationMetrics,
  after: StationMetrics
): "worse" | "same" | "better" {
  const bv = before[metric];
  const av = after[metric];
  if (metric === "riskLevel") {
    return riskRank(after.riskLevel) > riskRank(before.riskLevel)
      ? "worse"
      : riskRank(after.riskLevel) < riskRank(before.riskLevel)
      ? "better"
      : "same";
  }
  const bNum = typeof bv === "number" ? bv : 0;
  const aNum = typeof av === "number" ? av : 0;
  return aNum < bNum ? "worse" : aNum > bNum ? "better" : "same";
}

function buildBeforeMetrics(station: Station): StationMetrics {
  const gen = station.subsystems.find((s) => s.id === "generator");
  const fuel = station.subsystems.find((s) => s.id === "fuel");
  const water = station.subsystems.find((s) => s.id === "water");

  const fuelDays =
    station.fuelDaysRemaining ??
    (fuel ? parseInt(fuel.details["DaysRemaining"] ?? "80", 10) : 80);
  const waterReserve =
    water && water.details["Reserve"]
      ? parseInt(water.details["Reserve"].replace(/,/g, ""), 10)
      : 15000;

  return {
    power: station.resources.power ?? (gen ? 100 - gen.loadPercent : 50),
    fuelDays,
    waterReserve,
    foodDays: station.foodDaysRemaining ?? 75,
    riskLevel: station.riskLevel ?? "NOMINAL",
    generatorLoad: station.generatorLoad ?? (gen ? gen.loadPercent : 56),
    fuelBurnRate: station.id === "maitri" ? 45 : 30,
  };
}

function getResourceCapacity(station: Station) {
  const fuel = station.subsystems.find((s) => s.id === "fuel");
  const water = station.subsystems.find((s) => s.id === "water");

  const fuelCapacity =
    station.fuelCapacityL ??
    (fuel
      ? parseInt((fuel.details["Capacity"] ?? "204000").replace(/,/g, ""), 10)
      : 204000);
  const fuelCurrent =
    station.fuelCurrentL ??
    (fuel
      ? parseInt((fuel.details["Current"] ?? "204000").replace(/,/g, ""), 10)
      : 204000);
  const waterCapacity = 20000;
  const waterCurrent = water
    ? parseInt((water.details["Reserve"] ?? "15000").replace(/,/g, ""), 10)
    : 15000;

  return { fuelCapacity, fuelCurrent, waterCapacity, waterCurrent };
}

function generateTimeline(
  station: Station,
  fuelDays: number,
  waterReserve: number,
  foodDays: number
): ResourceTimelinePoint[] {
  const { fuelCapacity, fuelCurrent, waterCapacity, waterCurrent } =
    getResourceCapacity(station);
  const foodCapacity = 3000;
  const foodCurrent = Math.round((foodDays / 90) * foodCapacity);

  const safeFuelDays = Math.max(fuelDays, 1);
  const dailyFuelBurn = fuelCurrent / safeFuelDays;
  const safeWaterDays = Math.max(Math.round(waterCurrent / 2280), 1);
  const dailyWaterUse = waterCurrent / safeWaterDays;
  const safeFoodDays = Math.max(foodDays, 1);
  const dailyFoodUse = foodCurrent / safeFoodDays;

  const timeline: ResourceTimelinePoint[] = [];
  for (let day = 0; day <= 90; day++) {
    const fuelLitres = Math.max(0, fuelCurrent - dailyFuelBurn * day);
    const waterLitres = Math.max(0, waterCurrent - dailyWaterUse * day);
    const foodKg = Math.max(0, foodCurrent - dailyFoodUse * day);

    timeline.push({
      day,
      fuelPct: Math.round((fuelLitres / fuelCapacity) * 100),
      waterPct: Math.round((waterLitres / waterCapacity) * 100),
      foodPct: Math.round((foodKg / foodCapacity) * 100),
      fuelLitres: Math.round(fuelLitres),
      waterLitres: Math.round(waterLitres),
      foodKg: Math.round(foodKg),
    });
  }
  return timeline;
}

export function runSimulation(
  station: Station,
  input: SimulationInput
): SimulationResult {
  const steps: CascadeStep[] = [];
  let stepNum = 1;
  const before = buildBeforeMetrics(station);

  // Baselines from Station Model
  const baselineTemp = station.id === "maitri" ? -32 : -18;
  const baselineCrew = station.id === "maitri" ? 25 : 35;
  const maxGenerators = 3;
  const baselineHeatingKW = station.id === "maitri" ? 85.0 : 67.2;
  const baselineBaseElectricalKW = station.id === "maitri" ? 80.0 : 65.0;

  // Active inputs
  const tempC = input.temperatureC !== undefined ? input.temperatureC : baselineTemp;
  const crew = input.crewCount !== undefined ? input.crewCount : baselineCrew;
  const gensOnline =
    input.generatorsOnline !== undefined
      ? input.generatorsOnline
      : input.failedSubsystem === "generator"
      ? 1
      : maxGenerators;
  const sciLoad =
    input.scientificLoadPercent !== undefined ? input.scientificLoadPercent : 65;
  const delayDays = Math.max(
    0,
    input.resupplyDelayDays ?? (input.failedSubsystem === "resupply_delay" ? 14 : 0)
  );

  // 1. THERMAL HEATING CALCULATION
  const deltaT = Math.max(0, baselineTemp - tempC); // e.g. -18 - (-35) = 17°C
  const heatingIncreaseKW = deltaT * THERMAL_COEFFICIENT;
  const totalHeatingKW = baselineHeatingKW + heatingIncreaseKW;

  steps.push({
    step: stepNum++,
    domain: "climate",
    variable: "Heating Load",
    fromValue: `${baselineHeatingKW.toFixed(1)} kW`,
    toValue: `${totalHeatingKW.toFixed(1)} kW`,
    unit: "kW",
    severity: deltaT >= 20 ? "CRITICAL" : deltaT >= 10 ? "WARNING" : "NOMINAL",
    description: `External temperature ${tempC}°C creates ΔT of ${deltaT.toFixed(1)}°C from baseline ${baselineTemp}°C.`,
    explanation: `Thermal envelope infiltration demands extra ${heatingIncreaseKW.toFixed(1)} kW heating power.`,
    equation: [
      `Step 1: Heating Load`,
      `heating_increase = ΔT × ${THERMAL_COEFFICIENT} kW/°C`,
      `heating_increase = ${deltaT.toFixed(1)} × ${THERMAL_COEFFICIENT} = ${heatingIncreaseKW.toFixed(1)} kW`,
      `total_heating = ${baselineHeatingKW.toFixed(1)} + ${heatingIncreaseKW.toFixed(1)} = ${totalHeatingKW.toFixed(1)} kW`,
    ].join("\n"),
  });

  // 2. ELECTRICAL & SCIENTIFIC DEMAND
  const deltaCrew = crew - baselineCrew;
  const crewElectricalKW = deltaCrew * 0.3; // 300W per extra crew
  const sciPowerKW = (sciLoad / 100) * 60; // 60 kW rating for science
  const totalElectricalKW = baselineBaseElectricalKW + crewElectricalKW + sciPowerKW;
  const totalPowerDemandKW = totalHeatingKW + totalElectricalKW;

  steps.push({
    step: stepNum++,
    domain: "power",
    variable: "Total Power Demand",
    fromValue: `${(baselineHeatingKW + baselineBaseElectricalKW + 39).toFixed(1)} kW`,
    toValue: `${totalPowerDemandKW.toFixed(1)} kW`,
    unit: "kW",
    severity: totalPowerDemandKW > 220 ? "CRITICAL" : totalPowerDemandKW > 190 ? "WARNING" : "NOMINAL",
    description: `Aggregated station load: ${totalHeatingKW.toFixed(1)} kW heating + ${totalElectricalKW.toFixed(1)} kW electrical.`,
    explanation: `Combined habitat base load, ${crew} personnel life-support, and ${sciLoad}% science research instrumentation.`,
    equation: [
      `Step 2: Total Station Power Demand`,
      `total_electrical = base (${baselineBaseElectricalKW.toFixed(1)} kW) + crew (${crewElectricalKW.toFixed(1)} kW) + science (${sciPowerKW.toFixed(1)} kW) = ${totalElectricalKW.toFixed(1)} kW`,
      `total_power = total_heating (${totalHeatingKW.toFixed(1)} kW) + total_electrical (${totalElectricalKW.toFixed(1)} kW) = ${totalPowerDemandKW.toFixed(1)} kW`,
    ].join("\n"),
  });

  // 3. GENERATOR LOAD & CAPACITY
  const totalCapacityKW = gensOnline * GENERATOR_UNIT_KW;
  const rawGenLoad = (totalPowerDemandKW / Math.max(totalCapacityKW, 1)) * 100;
  const genLoadPercent = Math.round(rawGenLoad);
  const isOverload = genLoadPercent > 100;

  steps.push({
    step: stepNum++,
    domain: "power",
    variable: "Generator Load",
    fromValue: `${gensOnline < 3 ? "240 kW cap" : "75%" }`,
    toValue: `${genLoadPercent}% (${totalCapacityKW} kW cap)`,
    unit: "%",
    severity: isOverload ? "EMERGENCY" : genLoadPercent >= 85 ? "CRITICAL" : genLoadPercent >= 70 ? "WARNING" : "NOMINAL",
    description: isOverload
      ? `CRITICAL OVERLOAD: Demand ${totalPowerDemandKW.toFixed(1)} kW exceeds ${totalCapacityKW} kW available capacity!`
      : `Operating ${gensOnline} generators (${totalCapacityKW} kW total capacity) at ${genLoadPercent}% duty load.`,
    explanation: isOverload
      ? `Immediate automatic load-shedding mandatory to prevent catastrophic turbine trip.`
      : `Operating within sustained thermal envelope.`,
    equation: [
      `Step 3: Generator Load Factor`,
      `generator_capacity = ${gensOnline} × ${GENERATOR_UNIT_KW} kW = ${totalCapacityKW} kW`,
      `generator_load = (${totalPowerDemandKW.toFixed(1)} kW / ${totalCapacityKW} kW) × 100 = ${genLoadPercent}%`,
    ].join("\n"),
  });

  // 4. FUEL BURN RATE & DEPLETION
  const hourlyFuelBurnL = totalPowerDemandKW * SPECIFIC_FUEL_CONSUMPTION;
  const dailyFuelBurnL = Math.round(hourlyFuelBurnL * 24);
  const { fuelCurrent } = getResourceCapacity(station);
  let daysToDepletion = Math.max(1, Math.floor(fuelCurrent / Math.max(dailyFuelBurnL, 1)));

  if (delayDays > 0) {
    daysToDepletion = Math.max(1, daysToDepletion - Math.round(delayDays * 0.35));
  }

  steps.push({
    step: stepNum++,
    domain: "fuel",
    variable: "Fuel Burn Rate & Horizon",
    fromValue: `~1,100 L/day`,
    toValue: `${dailyFuelBurnL.toLocaleString()} L/day (${daysToDepletion} days)`,
    unit: "L/day",
    severity: daysToDepletion < 30 ? "CRITICAL" : daysToDepletion < 60 ? "WARNING" : "NOMINAL",
    description: `Fuel consumption running at ${hourlyFuelBurnL.toFixed(1)} L/hr (${dailyFuelBurnL.toLocaleString()} L/day).`,
    explanation: `Station stores ${fuelCurrent.toLocaleString()} L total diesel reserve at current depletion vector.`,
    equation: [
      `Step 4: Fuel Consumption & Depletion Horizon`,
      `hourly_fuel_burn = ${totalPowerDemandKW.toFixed(1)} kW × ${SPECIFIC_FUEL_CONSUMPTION} L/kWh = ${hourlyFuelBurnL.toFixed(1)} L/hr`,
      `daily_fuel_burn = ${hourlyFuelBurnL.toFixed(1)} L/hr × 24 = ${dailyFuelBurnL.toLocaleString()} L/day`,
      `days_to_depletion = ${fuelCurrent.toLocaleString()} L / ${dailyFuelBurnL.toLocaleString()} L/day = ${daysToDepletion} days`,
    ].join("\n"),
  });

  // 5. RESUPPLY LOGISTICS BUFFER
  const baseResupplyDays = station.nextResupplyDays ?? (station.id === "maitri" ? 28 : 45);
  const effectiveResupplyArrivalDays = baseResupplyDays + delayDays;
  const resupplyGapDays = Math.max(0, effectiveResupplyArrivalDays - daysToDepletion);

  if (delayDays > 0 || resupplyGapDays > 0) {
    steps.push({
      step: stepNum++,
      domain: "overall",
      variable: "Resupply Gap & Arrival",
      fromValue: `${baseResupplyDays} days ETA`,
      toValue: `+${delayDays}d delay (${effectiveResupplyArrivalDays}d ETA)`,
      unit: "days",
      severity: resupplyGapDays > 0 ? "EMERGENCY" : delayDays >= 10 ? "WARNING" : "CAUTION",
      description: resupplyGapDays > 0
        ? `DEFICIT DETECTED: Fuel reserve exhausts ${resupplyGapDays} days before supply vessel arrives!`
        : `Maritime resupply convoy delayed by ${delayDays} days. Reserve margin remains positive.`,
      explanation: `Pack ice consolidation in approach channels extending navigation transit window.`,
      equation: [
        `Step 5: Resupply Buffer Margin`,
        `projected_resupply_arrival = ${baseResupplyDays} + ${delayDays} = ${effectiveResupplyArrivalDays} days`,
        `fuel_depletion_day = ${daysToDepletion} days`,
        `resupply_gap = max(0, ${effectiveResupplyArrivalDays} - ${daysToDepletion}) = ${resupplyGapDays} days deficit`,
      ].join("\n"),
    });
  }

  // 6. SPECIAL PRESET FAULTS (HVAC, Water, Comms)
  if (input.failedSubsystem === "water_plant") {
    steps.push({
      step: stepNum++,
      domain: "water",
      variable: "RO Water Treatment Plant",
      fromValue: "2,400 L/day",
      toValue: "0 L/day (OFFLINE)",
      unit: "L/day",
      severity: "CRITICAL",
      description: "Desalination and melt plant intake frozen; production halted.",
      explanation: "Water reserves draining at 2,280 L/day baseline demand.",
      equation: [
        `Step ${stepNum - 1}: Potable Water Synthesis Fault`,
        `daily_production = 0 L/day`,
        `reserve_depletion_rate = 2,280 L/day`,
        `hours_to_empty = (15,000 L / 2,280 L/d) × 24 = 157.9 hrs (6.5 days)`,
      ].join("\n"),
    });
  }

  if (input.failedSubsystem === "comms") {
    steps.push({
      step: stepNum++,
      domain: "comms",
      variable: "Ku-Band Satellite Downlink",
      fromValue: "25 Mbps",
      toValue: "0 Mbps (LOS)",
      unit: "Mbps",
      severity: "CRITICAL",
      description: "Parabolic tracking head ice-locked; mainland telemetry lost.",
      explanation: "Failover to auxiliary Iridium low-bandwidth transceiver.",
      equation: [
        `Step ${stepNum - 1}: Telemetry Downlink Blackout`,
        `primary_bandwidth = 0 Mbps`,
        `packet_loss = 100%`,
        `failover_mode = Iridium SBD (2.4 kbps burst)`,
      ].join("\n"),
    });
  }

  // Determine overall risk level
  let overallRisk: RiskLevel = "NOMINAL";
  if (isOverload || (tempC <= -40 && gensOnline === 1) || resupplyGapDays > 10) {
    overallRisk = "EMERGENCY";
  } else if (genLoadPercent >= 85 || daysToDepletion < 30 || tempC <= -38 || input.failedSubsystem === "water_plant") {
    overallRisk = "CRITICAL";
  } else if (genLoadPercent >= 70 || deltaT >= 10 || delayDays > 0 || input.failedSubsystem === "comms") {
    overallRisk = "WARNING";
  } else if (deltaT > 0 || crew > baselineCrew) {
    overallRisk = "CAUTION";
  }

  // Recommended Mitigations sorted by Priority
  const mitigations: Mitigation[] = [];

  if (isOverload || gensOnline === 1) {
    mitigations.push({
      priority: "CRITICAL",
      action: "Execute Tier-1 load shedding: Disconnect auxiliary laboratories and non-critical heaters",
      impact: "Sheds 45 kW demand, dropping generator load to sustainable rating",
      category: "Power Grid",
    });
  }

  if (deltaT >= 12) {
    mitigations.push({
      priority: deltaT >= 17 ? "CRITICAL" : "HIGH",
      action: "Consolidate crew into Central Habitat Module and engage heat recovery louvers",
      impact: "Conserves 18.5 kW thermal loss by reducing perimeter air envelope volume",
      category: "Thermal",
    });
  }

  if (delayDays > 0) {
    mitigations.push({
      priority: resupplyGapDays > 0 ? "CRITICAL" : "HIGH",
      action: "Activate fuel rationing protocol and request inter-station relay from Maitri",
      impact: "Extends station fuel endurance by up to 25 operating days",
      category: "Logistics",
    });
  }

  if (crew > 40) {
    mitigations.push({
      priority: "MEDIUM",
      action: "Enforce scheduled water rationing (45 L/person/day) and greywater recycling",
      impact: "Reduces daily potable water drain by 850 L/day",
      category: "Life Support",
    });
  }

  if (sciLoad > 75) {
    mitigations.push({
      priority: "LOW",
      action: "Reschedule deep-space radio astronomy scans to daytime hours",
      impact: "Flattens peak nighttime generation curve by 14 kW",
      category: "Science",
    });
  }

  if (mitigations.length === 0) {
    mitigations.push({
      priority: "LOW",
      action: "Maintain standard 4-hour watch officer environmental sweep",
      impact: "Continuous monitoring confirms nominal life-support telemetry",
      category: "Standard Operations",
    });
  }

  const priorityOrder: Record<string, number> = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  };
  mitigations.sort(
    (a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
  );

  const after: StationMetrics = {
    power: Math.max(10, Math.round(100 - genLoadPercent)),
    fuelDays: daysToDepletion,
    waterReserve: Math.max(1200, before.waterReserve - deltaCrew * 300),
    foodDays: Math.max(5, before.foodDays - delayDays),
    riskLevel: overallRisk,
    generatorLoad: genLoadPercent,
    fuelBurnRate: Math.round(hourlyFuelBurnL),
  };

  const metricsComparison: MetricsComparison = {
    generatorLoad: {
      before: before.generatorLoad ?? 56,
      after: genLoadPercent,
      unit: "%",
    },
    fuelBurnRate: {
      before: Math.round(before.fuelBurnRate ?? 32),
      after: Math.round(hourlyFuelBurnL),
      unit: "L/hr",
    },
    daysToDepletion: {
      before: before.fuelDays,
      after: daysToDepletion,
      unit: "days",
    },
    resupplyGap: {
      before: 0,
      after: resupplyGapDays,
      unit: "days",
    },
  };

  const resourceTimeline = generateTimeline(
    station,
    daysToDepletion,
    after.waterReserve,
    after.foodDays
  );

  const nextResupplyDay = effectiveResupplyArrivalDays;

  return {
    steps,
    before,
    after,
    mitigations,
    metricsComparison,
    resourceTimeline,
    nextResupplyDay,
  };
}
