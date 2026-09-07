import { NextResponse } from "next/server";
import { stations } from "@/data/stations";

export async function GET() {
  return NextResponse.json(stations);
}
