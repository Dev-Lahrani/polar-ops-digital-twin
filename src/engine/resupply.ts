import { Station, ResupplyItem, SimulationResult } from "@/types";

function priorityLevel(score: number): ResupplyItem["priorityLevel"] {
  if (score >= 0.8) return "CRITICAL";
  if (score >= 0.55) return "HIGH";
  if (score >= 0.3) return "MEDIUM";
  return "LOW";
}

function daysLeft(current: number, dailyRate: number): number {
  return dailyRate > 0 ? Math.round(current / dailyRate) : 999;
}

export function calculateResupplyPriority(
  station: Station,
  result: SimulationResult
): ResupplyItem[] {
  const fuel = station.subsystems.find((s) => s.id === "fuel");
  const water = station.subsystems.find((s) => s.id === "water");

  const fuelCurrent = fuel
    ? parseInt((fuel.details["Current"] ?? "27000").replace(/,/g, ""), 10)
    : 27000;
  const fuelCapacity = fuel
    ? parseInt((fuel.details["Capacity"] ?? "50000").replace(/,/g, ""), 10)
    : 50000;
  const waterReserve = water
    ? parseInt((water.details["Reserve"] ?? "10000").replace(/,/g, ""), 10)
    : 10000;

  const dailyFuelBurn = 1080;
  const dailyWaterUse = 2280;
  const dailyFoodUse = 30;
  const dailyMedUse = 0.5;

  const fuelDaysLeft = daysLeft(fuelCurrent, dailyFuelBurn);
  const waterDaysLeft = daysLeft(waterReserve, dailyWaterUse);
  const foodDaysLeft = result.after.foodDays;
  const medDaysLeft = 164;

  const resupplyWindow = result.nextResupplyDay ?? station.nextResupplyDays ?? 30;

  const items: ResupplyItem[] = [
    {
      id: "fuel",
      name: "Diesel Fuel",
      currentAmount: fuelCurrent,
      requiredAmount: fuelCapacity,
      unit: "L",
      priorityScore: Math.min(
        1,
        Math.max(0, 1 - fuelDaysLeft / (resupplyWindow * 1.5))
      ),
      priorityLevel: "CRITICAL",
      rationale: `Only ${fuelDaysLeft} days remaining. Station consumes ${dailyFuelBurn} L/day. Power generation at risk.`,
      icon: "⛽",
      weightKg: fuelCurrent * 0.85,
    },
    {
      id: "water_filters",
      name: "Water Filter Cartridges",
      currentAmount: 3,
      requiredAmount: 12,
      unit: "units",
      priorityScore: 0.92,
      priorityLevel: "CRITICAL",
      rationale: "Water treatment at 95% load. Filter replacement overdue. Backup filtration limited.",
      icon: "🔧",
      weightKg: 18,
    },
    {
      id: "water",
      name: "Potable Water",
      currentAmount: waterReserve,
      requiredAmount: 20000,
      unit: "L",
      priorityScore: Math.min(
        1,
        Math.max(0, 1 - waterDaysLeft / (resupplyWindow * 1.5))
      ),
      priorityLevel: "HIGH",
      rationale: `${waterDaysLeft} days of reserve at ${dailyWaterUse} L/day consumption. Rationing may be needed.`,
      icon: "💧",
      weightKg: waterReserve,
    },
    {
      id: "food",
      name: "Dry Rations & Frozen Provisions",
      currentAmount: Math.round(foodDaysLeft * dailyFoodUse),
      requiredAmount: 3000,
      unit: "kg",
      priorityScore: Math.min(
        1,
        Math.max(0, 1 - foodDaysLeft / (resupplyWindow * 2))
      ),
      priorityLevel: "HIGH",
      rationale: `${foodDaysLeft} days of food at ${dailyFoodUse} kg/day. Crew of 25 needs consistent supply.`,
      icon: "🍽️",
      weightKg: Math.round(foodDaysLeft * dailyFoodUse),
    },
    {
      id: "generator_parts",
      name: "Generator Spare Parts",
      currentAmount: 1,
      requiredAmount: 5,
      unit: "kits",
      priorityScore: 0.65,
      priorityLevel: "HIGH",
      rationale: "One generator offline. Spare parts needed for repairs. Current service interval approaching.",
      icon: "⚙️",
      weightKg: 45,
    },
    {
      id: "medical",
      name: "Medical Supplies",
      currentAmount: 82,
      requiredAmount: 100,
      unit: "units",
      priorityScore: 0.35,
      priorityLevel: "MEDIUM",
      rationale: "Adequate for now but winter season approaching. Stockpile for potential emergencies.",
      icon: "🏥",
      weightKg: 25,
    },
    {
      id: "heating_fuel",
      name: "Emergency Heating Canisters",
      currentAmount: 8,
      requiredAmount: 20,
      unit: "canisters",
      priorityScore: 0.28,
      priorityLevel: "MEDIUM",
      rationale: "Backup heating for extreme cold events. Current stock below recommended levels.",
      icon: "🔥",
      weightKg: 40,
    },
    {
      id: "comms_equipment",
      name: "Satellite Comms Equipment",
      currentAmount: 1,
      requiredAmount: 1,
      unit: "set",
      priorityScore: 0.12,
      priorityLevel: "LOW",
      rationale: "Current VSAT link operational. Backup Iridium available. Replace only if degradation noted.",
      icon: "📡",
      weightKg: 15,
    },
  ];

  // Recalculate scores based on actual days remaining
  items.forEach((item) => {
    item.priorityLevel = priorityLevel(item.priorityScore);
  });

  return items.sort((a, b) => b.priorityScore - a.priorityScore);
}
