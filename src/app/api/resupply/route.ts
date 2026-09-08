import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateResupplyPriority } from "@/engine/resupply";
import { runSimulation } from "@/engine/simulation";
import type { SimulationInput } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stationId = "maitri", ...simInput } = body as SimulationInput & { stationId: string };

    const station = await db.station.findUnique({
      where: { id: stationId },
      include: { subsystems: true },
    });

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const stationTyped = {
      ...station,
      resources: (station as any).resources,
      subsystems: station.subsystems.map((s: any) => ({
        ...s,
        details: s.details as Record<string, string>,
      })),
    } as any;

    const simResult = runSimulation(stationTyped, simInput as SimulationInput);
    const resupplyItems = calculateResupplyPriority(stationTyped, simResult);

    return NextResponse.json({ items: resupplyItems, simulation: simResult });
  } catch (error) {
    console.error("Resupply calculation failed:", error);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
