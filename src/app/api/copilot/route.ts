import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processQuery } from "@/engine/copilot";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, stationId = "maitri" } = body as { query: string; stationId: string };

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const station = await db.station.findUnique({
      where: { id: stationId },
      include: { subsystems: true },
    });

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const stationTyped = {
      ...station,
      resources: station.resources as any,
      subsystems: station.subsystems.map((s: any) => ({
        ...s,
        details: s.details as Record<string, string>,
      })),
    } as any;

    const response = processQuery(stationTyped, query);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Copilot query failed:", error);
    return NextResponse.json({ error: "Query processing failed" }, { status: 500 });
  }
}
