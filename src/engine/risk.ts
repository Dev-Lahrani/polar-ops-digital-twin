export function calculateRisk(
  generatorLoadPct: number,
  fuelGapDays: number,
  waterDayRemaining: number,
  foodDaysRemaining: number,
  daysToFuelDepletion: number
): "NOMINAL" | "CAUTION" | "WARNING" | "CRITICAL" | "EMERGENCY" {
  if (
    generatorLoadPct > 95 ||
    fuelGapDays < -7 ||
    daysToFuelDepletion < 5
  ) {
    return "EMERGENCY";
  }

  if (
    fuelGapDays < 0 ||
    daysToFuelDepletion < 14 ||
    waterDayRemaining < 10 ||
    generatorLoadPct > 90
  ) {
    return "CRITICAL";
  }

  if (
    daysToFuelDepletion < 30 ||
    waterDayRemaining < 20 ||
    foodDaysRemaining < 15 ||
    generatorLoadPct > 85
  ) {
    return "WARNING";
  }

  if (
    daysToFuelDepletion < 45 ||
    waterDayRemaining < 30 ||
    foodDaysRemaining < 25
  ) {
    return "CAUTION";
  }

  return "NOMINAL";
}
