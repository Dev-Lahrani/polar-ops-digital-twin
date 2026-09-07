import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeReliability } from "@/engine/weibull";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = analyzeReliability();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Predictive analysis failed:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
