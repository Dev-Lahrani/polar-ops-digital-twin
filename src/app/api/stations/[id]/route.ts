import { NextResponse } from "next/server";
import { getStation } from "@/data/stations";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const station = getStation(params.id);
  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }
  return NextResponse.json(station);
}
