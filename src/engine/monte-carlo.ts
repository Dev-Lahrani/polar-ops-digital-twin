import { Station, SimulationInput } from "@/types";

export interface MonteCarloConfig {
  iterations: number;
  timeHorizonDays: number;
  tempStdDev: number;
  consumptionStdDev: number;
  resupplyStdDev: number;
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

export interface MonteCarloResult {
  confidenceBands: ConfidenceBand[];
  tailRisk: TailRisk;
  heatmap: HeatmapCell[];
  iterations: number;
  meanDepletionDay: number;
  stdDevDepletion: number;
}

const DEFAULT_CONFIG: MonteCarloConfig = {
  iterations: 10000,
  timeHorizonDays: 90,
  tempStdDev: 4,
  consumptionStdDev: 0.15,
  resupplyStdDev: 5,
};

function boxMullerRandom(): number {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function simulateOneRun(
  station: Station,
  input: SimulationInput,
  config: MonteCarloConfig
): number {
  const tempC = (input.temperatureC ?? station.temperature)
    + boxMullerRandom() * config.tempStdDev;

  const consumptionMultiplier = 1 + boxMullerRandom() * config.consumptionStdDev;

  const baselineTemp = station.temperature;
  const deltaT = Math.max(0, baselineTemp - tempC);
  const thermalCoeff = 0.8;
  const baselineHeating = station.id === "maitri" ? 85.0 : 67.2;
  const totalHeating = baselineHeating + deltaT * thermalCoeff;

  const baselineElectrical = station.id === "maitri" ? 80.0 : 65.0;
  const totalElectrical = baselineElectrical + 39;
  const totalPower = totalHeating + totalElectrical;

  const sfc = 0.28;
  const hourlyFuelBurn = totalPower * sfc * consumptionMultiplier;
  const dailyFuelBurn = hourlyFuelBurn * 24;

  const fuelCurrent = station.fuelCurrentL ?? 27000;
  const daysToDepletion = Math.max(1, Math.floor(fuelCurrent / Math.max(dailyFuelBurn, 1)));

  return daysToDepletion;
}

export function runMonteCarlo(
  station: Station,
  input: SimulationInput,
  config: Partial<MonteCarloConfig> = {}
): MonteCarloResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const depletionDays: number[] = [];

  for (let i = 0; i < cfg.iterations; i++) {
    depletionDays.push(simulateOneRun(station, input, cfg));
  }

  depletionDays.sort((a, b) => a - b);

  const meanDepletionDay = depletionDays.reduce((s, d) => s + d, 0) / cfg.iterations;
  const variance = depletionDays.reduce((s, d) => s + (d - meanDepletionDay) ** 2, 0) / cfg.iterations;
  const stdDevDepletion = Math.sqrt(variance);

  const p5Index = Math.floor(cfg.iterations * 0.05);
  const p50Index = Math.floor(cfg.iterations * 0.50);
  const p95Index = Math.floor(cfg.iterations * 0.95);

  const tailRisk: TailRisk = {
    probDepletionIn30Days: depletionDays.filter(d => d <= 30).length / cfg.iterations,
    probDepletionIn60Days: depletionDays.filter(d => d <= 60).length / cfg.iterations,
    probDepletionIn90Days: depletionDays.filter(d => d <= 90).length / cfg.iterations,
    expectedDepletionDay: Math.round(meanDepletionDay),
    worstCaseDay: depletionDays[p5Index],
    bestCaseDay: depletionDays[p95Index],
    riskValueAt95: depletionDays[p5Index],
  };

  const confidenceBands: ConfidenceBand[] = [];
  const fuelCapacity = station.fuelCapacityL ?? 50000;
  const fuelCurrent = station.fuelCurrentL ?? 27000;

  for (let day = 0; day <= cfg.timeHorizonDays; day++) {
    const dailyBurnMedian = fuelCurrent / Math.max(meanDepletionDay, 1);
    const dailyBurnP5 = fuelCurrent / Math.max(depletionDays[p5Index], 1);
    const dailyBurnP95 = fuelCurrent / Math.max(depletionDays[p95Index], 1);

    const fuelMedian = Math.max(0, fuelCurrent - dailyBurnMedian * day);
    const fuelP5 = Math.max(0, fuelCurrent - dailyBurnP5 * day);
    const fuelP95 = Math.max(0, fuelCurrent - dailyBurnP95 * day);

    const waterReserve = 15000;
    const waterDailyBurn = waterReserve / 65;
    const waterVariance = 0.1;
    const waterMedian = Math.max(0, waterReserve - waterDailyBurn * day);
    const waterP5 = Math.max(0, waterReserve - waterDailyBurn * (1 + waterVariance) * day);
    const waterP95 = Math.max(0, waterReserve - waterDailyBurn * (1 - waterVariance) * day);

    const foodDaily = 30;
    const foodCurrent = Math.round((station.foodDaysRemaining ?? 75) / 90 * 3000);
    const foodVariance = 0.1;
    const foodMedian = Math.max(0, foodCurrent - foodDaily * day);
    const foodP5 = Math.max(0, foodCurrent - foodDaily * (1 + foodVariance) * day);
    const foodP95 = Math.max(0, foodCurrent - foodDaily * (1 - foodVariance) * day);

    confidenceBands.push({
      day,
      fuelMedian: Math.round((fuelMedian / fuelCapacity) * 100),
      fuelP5: Math.round((fuelP5 / fuelCapacity) * 100),
      fuelP95: Math.round((fuelP95 / fuelCapacity) * 100),
      waterMedian: Math.round((waterMedian / 20000) * 100),
      waterP5: Math.round((waterP5 / 20000) * 100),
      waterP95: Math.round((waterP95 / 20000) * 100),
      foodMedian: Math.round((foodMedian / 3000) * 100),
      foodP5: Math.round((foodP5 / 3000) * 100),
      foodP95: Math.round((foodP95 / 3000) * 100),
    });
  }

  const heatmap: HeatmapCell[] = [];
  const tempDeviations = [-10, -5, 0, 5, 10];
  const delayOptions = [0, 7, 14, 21, 28];

  for (const tempDev of tempDeviations) {
    for (const delay of delayOptions) {
      const simInput: SimulationInput = {
        ...input,
        temperatureC: (input.temperatureC ?? station.temperature) + tempDev,
        resupplyDelayDays: (input.resupplyDelayDays ?? 0) + delay,
      };
      const depletionDaysHeat: number[] = [];
      for (let i = 0; i < 1000; i++) {
        depletionDaysHeat.push(simulateOneRun(station, simInput, cfg));
      }
      depletionDaysHeat.sort((a, b) => a - b);
      const medianIdx = Math.floor(depletionDaysHeat.length * 0.5);
      const depDay = depletionDaysHeat[medianIdx];
      const riskScore = depDay <= 15 ? 1.0 : depDay <= 30 ? 0.8 : depDay <= 45 ? 0.6 : depDay <= 60 ? 0.4 : depDay <= 75 ? 0.2 : 0.05;

      heatmap.push({
        tempDeviation: tempDev,
        delayDays: delay,
        riskScore,
        depletionDay: depDay,
      });
    }
  }

  return {
    confidenceBands,
    tailRisk,
    heatmap,
    iterations: cfg.iterations,
    meanDepletionDay: Math.round(meanDepletionDay),
    stdDevDepletion: Math.round(stdDevDepletion),
  };
}
