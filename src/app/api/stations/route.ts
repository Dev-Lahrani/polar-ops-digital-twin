import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stations = await db.station.findMany({
      include: { subsystems: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(stations);
  } catch (error) {
    console.error("Failed to fetch stations:", error);
    return NextResponse.json({ error: "Failed to fetch stations" }, { status: 500 });
  }
}
