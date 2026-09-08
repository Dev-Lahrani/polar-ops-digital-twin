import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runMonteCarlo } from "@/engine/monte-carlo";
import type { SimulationInput } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stationId = "maitri", ...input } = body as SimulationInput & { stationId: string };

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

    const result = runMonteCarlo(stationTyped, input);

    await db.simulation.create({
      data: {
        stationId,
        type: "MONTE_CARLO",
        input: input as any,
        result: result as any,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Monte Carlo simulation failed:", error);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
