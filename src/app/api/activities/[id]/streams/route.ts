import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActivityStreams } from "@/lib/strava";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
  }

  try {
    const streams = await getActivityStreams(session.accessToken, activityId);
    return NextResponse.json(streams);
  } catch (error) {
    console.error("Error fetching activity streams:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity streams" },
      { status: 500 }
    );
  }
}
