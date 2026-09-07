import { NextResponse } from "next/server";
import { getStation } from "@/data/stations";
import { runSimulation } from "@/engine/simulation";
import { calculateResupplyPriority } from "@/engine/resupply";
import { SimulationInput } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stationId, input } = body as {
      stationId: string;
      input: SimulationInput;
    };

    const station = getStation(stationId);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const simulation = runSimulation(station, input);
    const resupply = calculateResupplyPriority(station, simulation);

    return NextResponse.json({ simulation, resupply, station });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
