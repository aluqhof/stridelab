import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActivity } from "@/lib/strava";

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
    const activity = await getActivity(session.accessToken, activityId);
    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
