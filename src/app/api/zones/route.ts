import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAthleteZones } from "@/lib/strava";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const zones = await getAthleteZones(session.accessToken);
    return NextResponse.json(zones);
  } catch (error) {
    console.error("Error fetching zones:", error);
    return NextResponse.json(
      { error: "Failed to fetch zones" },
      { status: 500 }
    );
  }
}
