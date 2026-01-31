import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActivities } from "@/lib/strava";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "30");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  let afterTimestamp: number | undefined;
  let beforeTimestamp: number | undefined;

  if (fromParam) {
    afterTimestamp = Math.floor(new Date(fromParam).getTime() / 1000);
  }
  if (toParam) {
    beforeTimestamp = Math.floor(new Date(toParam).getTime() / 1000) + 86400;
  }

  try {
    const activities = await getActivities(
      session.accessToken,
      page,
      perPage,
      beforeTimestamp,
      afterTimestamp,
    );
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}
