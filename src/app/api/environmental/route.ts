import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get("stationId") || "maitri";
  const hours = parseInt(searchParams.get("hours") || "24", 10);

  try {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const readings = await db.environmentalData.findMany({
      where: {
        stationId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(readings);
  } catch (error) {
    console.error("Failed to fetch environmental data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
