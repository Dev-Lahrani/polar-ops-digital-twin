import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const station = await db.station.findUnique({
      where: { id },
      include: { subsystems: true },
    });

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    return NextResponse.json(station);
  } catch (error) {
    console.error("Failed to fetch station:", error);
    return NextResponse.json({ error: "Failed to fetch station" }, { status: 500 });
  }
}
