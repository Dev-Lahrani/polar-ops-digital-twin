import { Station, SimulationResult, ResupplyItem } from "@/types";

export function calculateResupplyPriority(
  station: Station,
  simulationResult: SimulationResult
): ResupplyItem[] {
  const items: ResupplyItem[] = [];

  const addResource = (
    resource: string,
    current_amount: number,
    daily_consumption: number,
    days_remaining: number,
    safety_threshold: number,
    criticality_weight: number,
    unit: string
  ) => {
    let priority_score = (1 - days_remaining / safety_threshold) * criticality_weight;
    priority_score = Math.max(0, Math.min(1, priority_score));

    const required_amount = Math.max(0, daily_consumption * safety_threshold - current_amount);
    
    let priority_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (priority_score > 0.7) priority_level = "CRITICAL";
    else if (priority_score > 0.5) priority_level = "HIGH";
    else if (priority_score > 0.3) priority_level = "MEDIUM";

    let rationale = "";
    if (days_remaining < simulationResult.days_to_resupply) {
      rationale = `${resource} depletes in ${Math.round(days_remaining)} days — ${Math.round(simulationResult.days_to_resupply - days_remaining)} day deficit before resupply.`;
    } else {
      rationale = `${resource} levels are at ${Math.round((current_amount / (daily_consumption * safety_threshold)) * 100)}% of safety threshold.`;
    }

    items.push({
      resource,
      current_amount,
      required_amount,
      unit,
      priority_score,
      priority_level,
      rationale,
    });
  };

  addResource(
    "Fuel",
    station.fuel.current_litres,
    simulationResult.fuel_burn_rate_lpd,
    simulationResult.days_to_fuel_depletion,
    60,
    1.0,
    "L"
  );

  addResource(
    "Water",
    station.water.current_litres,
    station.water.current_litres / simulationResult.days_to_water_depletion,
    simulationResult.days_to_water_depletion,
    40,
    0.9,
    "L"
  );

  addResource(
    "Food",
    station.food.current_kg,
    station.food.current_kg / simulationResult.days_to_food_depletion,
    simulationResult.days_to_food_depletion,
    50,
    0.8,
    "kg"
  );

  addResource(
    "Medical Supplies",
    station.medical.current_units,
    station.medical.daily_consumption_units,
    station.medical.current_units / station.medical.daily_consumption_units,
    90,
    0.85,
    "units"
  );

  addResource(
    "Spare Parts",
    100, // mock current amount
    1, // mock daily consumption
    120, // mock days remaining
    120,
    0.6,
    "kg"
  );

  return items.sort((a, b) => b.priority_score - a.priority_score);
}
