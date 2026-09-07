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
    (fuel ? parseInt(fuel.details["DaysRemaining"] ?? "30", 10) : 30);
  const waterReserve =
    water && water.details["Reserve"]
      ? parseInt(water.details["Reserve"].replace(/,/g, ""), 10)
      : 15000;

  return {
    power: station.resources.power ?? (gen ? 100 - gen.loadPercent : 50),
    fuelDays,
    waterReserve,
    foodDays: station.foodDaysRemaining ?? 45,
    riskLevel: station.riskLevel ?? "NOMINAL",
    generatorLoad: station.generatorLoad ?? (gen ? gen.loadPercent : 60),
    fuelBurnRate: station.id === "maitri" ? 45 : 30,
  };
}

function getResourceCapacity(station: Station) {
  const fuel = station.subsystems.find((s) => s.id === "fuel");
  const water = station.subsystems.find((s) => s.id === "water");

  const fuelCapacity =
    station.fuelCapacityL ??
    (fuel
      ? parseInt((fuel.details["Capacity"] ?? "50000").replace(/,/g, ""), 10)
      : 50000);
  const fuelCurrent =
    station.fuelCurrentL ??
    (fuel
      ? parseInt((fuel.details["Current"] ?? "27000").replace(/,/g, ""), 10)
      : 27000);
  const waterCapacity = 20000;
  const waterCurrent = water
    ? parseInt((water.details["Reserve"] ?? "10000").replace(/,/g, ""), 10)
    : 10000;

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

  const dailyFuelBurn = fuelCapacity / Math.max(fuelDays, 1);
  const dailyWaterUse = waterCurrent / Math.max(fuelDays, 1);
  const dailyFoodUse = foodCurrent / Math.max(foodDays, 1);

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

  // Baseline variables
  const baselineTemp = station.temperature ?? -28;
  const baselineCrew = station.crewCount ?? 35;
  const maxGenerators = station.id === "maitri" ? 3 : 3;
  const genCapacityEach = station.id === "maitri" ? 166.7 : 250; // kW per generator
  const baseGeneratorLoad = before.generatorLoad ?? 56;
  const baseBurnRate = before.fuelBurnRate ?? 32;

  // Active inputs or fallbacks
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
  const delayDays = input.resupplyDelayDays ?? 0;

  // Track simulated state
  let currentGenLoad = baseGeneratorLoad;
  let currentBurnRate = baseBurnRate;
  let powerAvail = before.power;
  let fuelDays = before.fuelDays;
  let waterReserve = before.waterReserve;
  let foodDays = before.foodDays;
  let overallRisk: RiskLevel = before.riskLevel;
  const mitigations: Mitigation[] = [];

  // 1. GENERATOR CAPACITY & LOAD
  const totalGenCapacity = maxGenerators * genCapacityEach;
  const activeGenCapacity = Math.max(gensOnline * genCapacityEach, 1);
  const genCapacityLostPercent = Math.round(
    ((totalGenCapacity - activeGenCapacity) / totalGenCapacity) * 100
  );

  if (gensOnline < maxGenerators || input.failedSubsystem === "generator") {
    const offlineCount = maxGenerators - gensOnline;
    currentGenLoad = Math.min(
      Math.round((currentGenLoad * totalGenCapacity) / activeGenCapacity),
      100
    );
    powerAvail = Math.max(Math.round(powerAvail * (gensOnline / maxGenerators)), 15);
    currentBurnRate = Math.round(currentBurnRate * 1.25);
    fuelDays = Math.max(Math.round(fuelDays * 0.75), 3);
    overallRisk = worseRisk(overallRisk, gensOnline === 1 ? "CRITICAL" : "WARNING");

    steps.push({
      step: stepNum++,
      domain: "power",
      variable: "Active Generators",
      fromValue: `${maxGenerators} / ${maxGenerators}`,
      toValue: `${gensOnline} / ${maxGenerators}`,
      unit: "online",
      severity: gensOnline === 1 ? "CRITICAL" : "WARNING",
      description: `${offlineCount} generator(s) offline. Total generation headroom eliminated.`,
      explanation: `Loss of ${genCapacityLostPercent}% generating capacity increases load on remaining units.`,
      equation: [
        `Step ${stepNum - 1}: Generator Capacity Loss`,
        `active_capacity = ${gensOnline} × ${genCapacityEach} kW = ${activeGenCapacity.toFixed(1)} kW`,
        `capacity_drop = ${totalGenCapacity.toFixed(1)} kW → ${activeGenCapacity.toFixed(1)} kW (-${genCapacityLostPercent}%)`,
        `adjusted_load = (${baseGeneratorLoad}% × ${totalGenCapacity.toFixed(1)}) / ${activeGenCapacity.toFixed(1)} = ${currentGenLoad}%`,
      ].join("\n"),
    });

    steps.push({
      step: stepNum++,
      domain: "power",
      variable: "Generator Load Factor",
      fromValue: `${baseGeneratorLoad}%`,
      toValue: `${currentGenLoad}%`,
      unit: "%",
      severity: currentGenLoad >= 90 ? "CRITICAL" : "WARNING",
      description: `Surviving generators operating at elevated thermal stress profile.`,
      explanation: `Exceeding 85% continuous threshold risks catastrophic generator trip.`,
      equation: [
        `Step ${stepNum - 1}: Thermal Stress Derating`,
        `rated_max_continuous = 85%`,
        `stress_delta = ${currentGenLoad}% - 85% = +${Math.max(0, currentGenLoad - 85)}%`,
        `projected_mtbf_reduction = stress_delta × 4.2% = ${(Math.max(0, currentGenLoad - 85) * 4.2).toFixed(1)}%`,
      ].join("\n"),
    });

    mitigations.push({
      priority: "CRITICAL",
      action: "Initiate Tier-1 non-essential load shedding across auxiliary labs",
      impact: "Reduces peak generator demand by 35 kW (approx -14% load)",
      category: "Power Grid",
    });
  }

  // 2. TEMPERATURE & THERMAL DEFICIT
  const deltaT = baselineTemp - tempC; // e.g. -28 - (-40) = +12 deg drop
  if (deltaT > 0 || input.failedSubsystem === "hvac") {
    const heatKiloWattsPerDeg = station.id === "maitri" ? 1.8 : 2.4;
    const additionalHeatLoadKW = Math.round(deltaT * heatKiloWattsPerDeg);
    const addedGenLoad = Math.round((additionalHeatLoadKW / activeGenCapacity) * 100);
    currentGenLoad = Math.min(100, currentGenLoad + addedGenLoad);
    currentBurnRate = Math.round(currentBurnRate + additionalHeatLoadKW * 0.22);
    const fuelDaysDrop = Math.max(1, Math.round((deltaT / 10) * 4));
    fuelDays = Math.max(2, fuelDays - fuelDaysDrop);

    const tempSeverity: RiskLevel =
      tempC <= -38 || input.failedSubsystem === "hvac" ? "CRITICAL" : "WARNING";
    overallRisk = worseRisk(overallRisk, tempSeverity);

    steps.push({
      step: stepNum++,
      domain: "climate",
      variable: "Thermal Envelope Demand",
      fromValue: `${baselineTemp}°C`,
      toValue: `${tempC}°C`,
      unit: "ambient",
      severity: tempSeverity,
      description: `Outdoor temperature dropped by ${deltaT}°C below nominal winter rating.`,
      explanation: `Structure heat loss Q = U × A × ΔT demands exponential auxiliary heating.`,
      equation: [
        `Step ${stepNum - 1}: Thermal Envelope Infiltration`,
        `ΔT_ambient = |${tempC}°C - (${baselineTemp}°C)| = ${deltaT.toFixed(1)}°C`,
        `thermal_load_delta = ${deltaT.toFixed(1)}°C × ${heatKiloWattsPerDeg} kW/°C = +${additionalHeatLoadKW} kW`,
        `generator_impact = (+${additionalHeatLoadKW} kW / ${activeGenCapacity.toFixed(1)} kW) × 100 = +${addedGenLoad}%`,
      ].join("\n"),
    });

    steps.push({
      step: stepNum++,
      domain: "fuel",
      variable: "Specific Fuel Consumption",
      fromValue: `${baseBurnRate} L/hr`,
      toValue: `${currentBurnRate} L/hr`,
      unit: "L/hr",
      severity: currentBurnRate > 48 ? "CRITICAL" : "WARNING",
      description: `Fuel burn rate increased by ${currentBurnRate - baseBurnRate} L/hr for thermal compensation.`,
      explanation: `Thermal boilers and secondary diesel loops firing at sustained maximum duty cycle.`,
      equation: [
        `Step ${stepNum - 1}: Heating Fuel Consumption`,
        `sfc_baseline = ${baseBurnRate} L/hr`,
        `delta_fuel_burn = ${additionalHeatLoadKW} kW × 0.22 L/kWh = +${(additionalHeatLoadKW * 0.22).toFixed(1)} L/hr`,
        `total_burn_rate = ${baseBurnRate} + ${(additionalHeatLoadKW * 0.22).toFixed(1)} = ${currentBurnRate} L/hr`,
      ].join("\n"),
    });

    mitigations.push({
      priority: tempSeverity === "CRITICAL" ? "CRITICAL" : "HIGH",
      action: "Seal perimeter vestibules and reroute generator exhaust heat recovery",
      impact: "Recovers approx 18 kW thermal energy directly into main living module",
      category: "Thermal",
    });
  }

  // 3. CREW COUNT & LIFE SUPPORT
  const deltaCrew = crew - baselineCrew;
  if (Math.abs(deltaCrew) >= 3) {
    const waterDemandLPerDay = 65; // per person per day
    const crewWaterDelta = deltaCrew * waterDemandLPerDay;
    const daysReduced = Math.round((crew / baselineCrew) * 3);
    waterReserve = Math.max(1200, waterReserve - deltaCrew * 300);
    foodDays = Math.max(3, foodDays - (deltaCrew > 0 ? daysReduced : -daysReduced));

    const crewSeverity: RiskLevel =
      crew > 55 ? "CRITICAL" : crew > 42 ? "WARNING" : "CAUTION";
    overallRisk = worseRisk(overallRisk, crewSeverity);

    steps.push({
      step: stepNum++,
      domain: "water",
      variable: "Potable Water Consumption",
      fromValue: `${baselineCrew} personnel`,
      toValue: `${crew} personnel`,
      unit: "crew",
      severity: crewSeverity,
      description: `Crew size changed by ${deltaCrew > 0 ? `+${deltaCrew}` : deltaCrew} over nominal complement.`,
      explanation: `Life support water synthesis and sewage reprocessing scales linearly with headcount.`,
      equation: [
        `Step ${stepNum - 1}: Crew Demand Scaling`,
        `per_capita_daily_water = ${waterDemandLPerDay} L/day`,
        `delta_daily_water = ${deltaCrew} crew × ${waterDemandLPerDay} L = ${crewWaterDelta > 0 ? `+${crewWaterDelta}` : crewWaterDelta} L/day`,
        `effective_depletion_rate = base_water_demand + (${crewWaterDelta} L/day)`,
      ].join("\n"),
    });

    if (crew > baselineCrew) {
      mitigations.push({
        priority: "MEDIUM",
        action: "Activate greywater recycle loop for secondary ablution systems",
        impact: "Reduces net freshwater consumption rate by 22%",
        category: "Life Support",
      });
    }
  }

  // 4. SCIENTIFIC LOAD
  if (sciLoad !== 65) {
    const deltaSci = sciLoad - 65;
    const deltaSciKW = Math.round((deltaSci / 100) * 45);
    const addedLoad = Math.round((deltaSciKW / activeGenCapacity) * 100);
    currentGenLoad = Math.max(20, Math.min(100, currentGenLoad + addedLoad));

    if (sciLoad > 85) {
      steps.push({
        step: stepNum++,
        domain: "science",
        variable: "Scientific Research Load",
        fromValue: "65%",
        toValue: `${sciLoad}%`,
        unit: "grid share",
        severity: "WARNING",
        description: `High science instrumentation load draws additional ${deltaSciKW} kW from grid.`,
        explanation: `Cryo-coolers, atmospheric lidars, and radio spectrometers drawing near peak rating.`,
        equation: [
          `Step ${stepNum - 1}: Scientific Grid Draw`,
          `delta_science_pct = ${sciLoad}% - 65% = +${deltaSci}%`,
          `delta_power = (${deltaSci}% / 100) × 45 kW = +${deltaSciKW} kW`,
          `total_science_draw = 35 kW (nominal) + ${deltaSciKW} kW = ${35 + deltaSciKW} kW`,
        ].join("\n"),
      });

      mitigations.push({
        priority: "MEDIUM",
        action: "Schedule batch atmospheric radar sweeps during daytime solar/wind peak",
        impact: "Flattens nighttime base-load demand spike by 12 kW",
        category: "Scientific Load",
      });
    }
  }

  // 5. RESUPPLY DELAY & BUFFER MARGIN
  const baselineResupplyDays = station.nextResupplyDays ?? 35;
  const newResupplyDays = baselineResupplyDays + delayDays;
  const resupplyGapDays = Math.max(0, newResupplyDays - fuelDays);

  if (delayDays > 0 || input.failedSubsystem === "resupply_delay") {
    const delayVal = delayDays > 0 ? delayDays : 14;
    fuelDays = Math.max(1, fuelDays - Math.round(delayVal * 0.4));
    foodDays = Math.max(2, foodDays - delayVal);
    waterReserve = Math.max(800, waterReserve - delayVal * 300);

    const delaySeverity: RiskLevel =
      resupplyGapDays > 10 || fuelDays < 15 ? "CRITICAL" : "WARNING";
    overallRisk = worseRisk(overallRisk, delaySeverity);

    steps.push({
      step: stepNum++,
      domain: "overall",
      variable: "Supply Vessel Logistics Buffer",
      fromValue: `${baselineResupplyDays} days ETA`,
      toValue: `+${delayVal} days delayed (${newResupplyDays} d)`,
      unit: "days",
      severity: delaySeverity,
      description: `Maritime convoy delayed by pack ice consolidation in Prydz Bay.`,
      explanation: `Resupply gap exceeds nominal fuel buffer margin. Critical reserves will be tapped.`,
      equation: [
        `Step ${stepNum - 1}: Logistics Buffer Degradation`,
        `original_eta = ${baselineResupplyDays} days, delay = +${delayVal} days → new_eta = ${newResupplyDays} days`,
        `projected_fuel_days = ${fuelDays} days`,
        `resupply_gap = new_eta (${newResupplyDays} d) - fuel_reserve (${fuelDays} d) = ${resupplyGapDays} days deficit`,
      ].join("\n"),
    });

    mitigations.push({
      priority: delaySeverity === "CRITICAL" ? "CRITICAL" : "HIGH",
      action: "Issue formal request to Maitri/Bharati inter-station fuel relay protocol",
      impact: "Secures 15-day emergency airlift buffer via Dornier utility aircraft",
      category: "Logistics",
    });
  }

  // 6. FAILURE PRESET HANDLERS FOR /cascade/page.tsx
  if (input.failedSubsystem === "water_plant") {
    waterReserve = Math.max(waterReserve - 5000, 800);
    overallRisk = worseRisk(overallRisk, "CRITICAL");

    steps.push({
      step: stepNum++,
      domain: "water",
      variable: "Reverse Osmosis Desalination",
      fromValue: "2,400 L/day",
      toValue: "0 L/day (FAULT)",
      unit: "L/day",
      severity: "CRITICAL",
      description: "Water production fully halted due to intake freezing fault.",
      explanation: "Zero daily output with demand running at 2,280 L/day.",
      equation: [
        `Step ${stepNum - 1}: Potable Water Synthesis Failure`,
        `production_capacity = 0 L/day`,
        `burn_rate = 2,280 L/day`,
        `hours_to_storage_exhaustion = (${waterReserve} L / 2,280 L/d) × 24 = ${((waterReserve / 2280) * 24).toFixed(1)} hrs`,
      ].join("\n"),
    });

    mitigations.push({
      priority: "CRITICAL",
      action: "Activate emergency snow melter tank heated by generator manifold",
      impact: "Restores 1,200 L/day minimum survival water production",
      category: "Life Support",
    });
  }

  if (input.failedSubsystem === "comms") {
    overallRisk = worseRisk(overallRisk, "WARNING");

    steps.push({
      step: stepNum++,
      domain: "comms",
      variable: "Ku/Ka Band Satellite Uplink",
      fromValue: "Nominal (25 Mbps)",
      toValue: "0 Mbps (LOS)",
      unit: "bandwidth",
      severity: "CRITICAL",
      description: "Primary parabolic dish tracking drive frozen; tracking lost.",
      explanation: "Telemetry streaming and voice interconnect with mainland terminated.",
      equation: [
        `Step ${stepNum - 1}: Telemetry Downlink Blackout`,
        `bandwidth = 0 Mbps (down from 25 Mbps Ku-band)`,
        `packet_loss = 100%`,
        `failover_latency = 450 ms via low-bandwidth Iridium short-burst data`,
      ].join("\n"),
    });

    mitigations.push({
      priority: "HIGH",
      action: "Switch command telemetry to secondary Iridium satellite terminal",
      impact: "Restores vital telemetry ping and safety heartbeat channel",
      category: "Communications",
    });
  }

  // If no steps were triggered (nominal inputs), provide a baseline verification step
  if (steps.length === 0) {
    steps.push({
      step: 1,
      domain: "overall",
      variable: "Grid & Life Support State",
      fromValue: "Nominal",
      toValue: "Stable",
      unit: "state",
      severity: "NOMINAL",
      description: "Station systems operate within designated operating tolerances.",
      explanation: "Current ambient temperature and load demand present no immediate risk.",
      equation: [
        "Step 1: System Stability Verification",
        `generator_headroom = 100% - ${currentGenLoad}% = ${100 - currentGenLoad}%`,
        `fuel_burn_rate = ${currentBurnRate} L/hr (nominal margin = +${fuelDays} days)`,
        `status = STABLE`,
      ].join("\n"),
    });

    mitigations.push({
      priority: "LOW",
      action: "Maintain routine 6-hour watch officer inspection rounds",
      impact: "Continuous verification of nominal operating thresholds",
      category: "Standard Operations",
    });
  }

  // Ensure default mitigations if empty
  if (mitigations.length === 0) {
    mitigations.push({
      priority: "LOW",
      action: "Monitor ongoing resource consumption trends",
      impact: "Early detection of anomaly drift",
      category: "Standard Operations",
    });
  }

  // Sort mitigations by priority: CRITICAL > HIGH > MEDIUM > LOW
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
    power: powerAvail,
    fuelDays,
    waterReserve,
    foodDays,
    riskLevel: overallRisk,
    generatorLoad: currentGenLoad,
    fuelBurnRate: currentBurnRate,
  };

  const metricsComparison: MetricsComparison = {
    generatorLoad: {
      before: baseGeneratorLoad,
      after: currentGenLoad,
      unit: "%",
    },
    fuelBurnRate: {
      before: baseBurnRate,
      after: currentBurnRate,
      unit: "L/hr",
    },
    daysToDepletion: {
      before: before.fuelDays,
      after: fuelDays,
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
    fuelDays,
    waterReserve,
    foodDays
  );

  const nextResupplyDay = station.nextResupplyDays ?? 30;

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
