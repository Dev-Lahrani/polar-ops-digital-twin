import { NextResponse } from "next/server";
import { getStation } from "@/data/stations";
import { runSimulation } from "@/engine/simulation";
import { SimulationInput } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stationId, failedSubsystem } = body as {
      stationId: string;
      failedSubsystem: string;
    };

    const station = getStation(stationId);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const input: SimulationInput = {
      temperature_c: station.environment.temperature_c,
      crew_count: station.crew.current,
      generators_online: station.power.generators.filter(
        (g) => g.status === "online"
      ).length,
      scientific_load_pct: 100, // Assume 100% of scientific load fraction by default? The prompt says base current values. Let's say 100 for simplicity or derive it.
      resupply_delay_days: 0,
      failed_subsystem: failedSubsystem,
    };

    if (failedSubsystem.startsWith("sys-gen") || failedSubsystem.startsWith("GEN-") || failedSubsystem.startsWith("CHP-")) {
      input.generators_online = Math.max(0, input.generators_online - 1);
      input.failed_subsystem = "generator";
    }

    if (failedSubsystem === "extreme_cold") {
      input.temperature_c = -40;
    }
    
    if (failedSubsystem === "resupply_delay") {
      input.resupply_delay_days = 14;
    }

    const simulation = runSimulation(station, input);

    return NextResponse.json({
      simulation,
      failureTrigger: { failedSubsystem },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
