import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get("stationId");

  try {
    const where = stationId ? { stationId } : {};
    const items = await db.inventoryItem.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}
