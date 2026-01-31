import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAthleteStats } from "@/lib/strava";
import type { StravaStats } from "@/types/strava";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats: StravaStats = await getAthleteStats(
      session.accessToken,
      session.athlete.id
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
