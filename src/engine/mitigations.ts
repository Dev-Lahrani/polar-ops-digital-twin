import { Mitigation } from "@/types";

export function generateMitigations(
  generatorLoadPct: number,
  fuelGapDays: number,
  daysToFuelDepletion: number,
  daysToWaterDepletion: number,
  daysToFoodDepletion: number,
  failedSubsystem?: string
): Mitigation[] {
  const mitigations: Mitigation[] = [];

  if (generatorLoadPct > 85) {
    mitigations.push({
      priority: 1,
      action: "Reduce non-critical electrical load (labs, non-essential lighting)",
      impact: "Estimated 8-12% load reduction",
      category: "power",
    });
  }

  if (generatorLoadPct > 90) {
    mitigations.push({
      priority: 1,
      action: "Activate emergency power conservation protocol",
      impact: "Prevents generator overload and cascade failure",
      category: "power",
    });
  }

  if (fuelGapDays < 0) {
    mitigations.push({
      priority: 1,
      action: "Initiate emergency fuel conservation — reduce generator output to critical-only loads",
      impact: "Extends fuel timeline by 15-20%",
      category: "fuel",
    });
    mitigations.push({
      priority: 2,
      action: "Escalate resupply request to NCPOR operations — request emergency air cargo",
      impact: "Accelerates resupply delivery",
      category: "fuel",
    });
  }

  if (fuelGapDays < 5 && fuelGapDays > 0) {
    mitigations.push({
      priority: 2,
      action: "Optimize generator scheduling — alternate units to reduce wear and consumption",
      impact: "Improves fuel efficiency by 3-5%",
      category: "fuel",
    });
  }

  if (daysToFuelDepletion < 30) {
    mitigations.push({
      priority: 3,
      action: "Prioritize heating zones — close non-essential habitat sections",
      impact: "Reduces thermal load on generators",
      category: "operational",
    });
  }

  if (daysToWaterDepletion < 20) {
    mitigations.push({
      priority: 2,
      action: "Implement water rationing protocol — reduce to 15L per person per day",
      impact: "Extends water reserves significantly",
      category: "water",
    });
  }

  if (daysToFoodDepletion < 20) {
    mitigations.push({
      priority: 3,
      action: "Switch to emergency ration schedule",
      impact: "Extends food reserves",
      category: "food",
    });
  }

  if (failedSubsystem === "generator") {
    mitigations.push({
      priority: 1,
      action: "Redistribute load across remaining generators — shed non-critical systems first",
      impact: "Prevents secondary generator failure",
      category: "power",
    });
  } else if (failedSubsystem === "hvac") {
    mitigations.push({
      priority: 1,
      action: "Activate backup heating — consolidate crew to heated zones",
      impact: "Maintains habitable temperature in core zones",
      category: "operational",
    });
  } else if (failedSubsystem === "water_plant") {
    mitigations.push({
      priority: 1,
      action: "Switch to emergency water reserves — melt ice for supplemental supply",
      impact: "Maintains minimum potable water supply",
      category: "water",
    });
  } else if (failedSubsystem === "comms") {
    mitigations.push({
      priority: 1,
      action: "Activate autonomous operations protocol — no external communication for minimum 72 hours",
      impact: "Ensures station safety during blackout",
      category: "emergency",
    });
  }

  // Ensure we have at least 3 mitigations
  if (mitigations.length < 3) {
    mitigations.push({
      priority: 4,
      action: "Conduct standard preventative maintenance on critical systems",
      impact: "Maintains optimal efficiency",
      category: "operational",
    });
    if (mitigations.length < 3) {
      mitigations.push({
        priority: 5,
        action: "Review resource consumption logs",
        impact: "Identifies potential optimization areas",
        category: "operational",
      });
    }
  }

  return mitigations.sort((a, b) => a.priority - b.priority);
}
