import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActivities, getActivity } from "@/lib/strava";
import type { StravaBestEffort } from "@/types/strava";

// Standard distances we care about (km only, no miles)
const STANDARD_DISTANCES = [
  "400m",
  "1k",
  "5k",
  "10k",
  "15k",
  "20k",
  "Half-Marathon",
  "30k",
  "Marathon",
];

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get run activities from the last year
    const oneYearAgo = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;

    // Fetch activities
    const activities = await getActivities(
      session.accessToken,
      1,
      200,
      undefined,
      oneYearAgo
    );

    // Filter for runs only, prioritize longer runs (more likely to have PRs)
    const runActivities = activities
      .filter((a) => a.type === "Run" || a.sport_type === "Run" || a.type === "VirtualRun")
      .sort((a, b) => b.distance - a.distance); // Longest runs first

    // Fetch detailed activities in small batches to avoid rate limits
    const activitiesToFetch = runActivities.slice(0, 30);
    const detailedActivities: (Awaited<ReturnType<typeof getActivity>> | null)[] = [];

    // Batch in groups of 5
    for (let i = 0; i < activitiesToFetch.length; i += 5) {
      const batch = activitiesToFetch.slice(i, i + 5);
      const results = await Promise.all(
        batch.map(async (a) => {
          try {
            return await getActivity(session.accessToken, a.id);
          } catch (e) {
            console.error(`Failed to fetch activity ${a.id}:`, e);
            return null;
          }
        })
      );
      detailedActivities.push(...results);
    }

    // Collect all best efforts
    const allBestEfforts: (StravaBestEffort & { activityName: string })[] = [];

    for (const activity of detailedActivities) {
      if (activity?.best_efforts) {
        for (const effort of activity.best_efforts) {
          allBestEfforts.push({
            ...effort,
            activityName: activity.name,
          });
        }
      }
    }

    // Group by distance and find the fastest for each
    const prsByDistance = new Map<string, StravaBestEffort & { activityName: string }>();

    for (const effort of allBestEfforts) {
      const distanceName = effort.name;

      // Only track standard distances
      if (!STANDARD_DISTANCES.includes(distanceName)) continue;

      const existing = prsByDistance.get(distanceName);
      if (!existing || effort.moving_time < existing.moving_time) {
        prsByDistance.set(distanceName, effort);
      }
    }

    // Convert to array and sort by distance
    const personalRecords = Array.from(prsByDistance.entries())
      .map(([distance, effort]) => ({
        distance,
        distanceMeters: effort.distance,
        time: effort.moving_time,
        elapsedTime: effort.elapsed_time,
        date: effort.start_date_local,
        activityId: effort.activity.id,
        activityName: effort.activityName,
        isPR: effort.pr_rank === 1,
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return NextResponse.json({
      personalRecords,
      activitiesScanned: detailedActivities.filter(Boolean).length,
    });
  } catch (error) {
    console.error("Error fetching best efforts:", error);
    return NextResponse.json(
      { error: "Failed to fetch best efforts" },
      { status: 500 }
    );
  }
}
