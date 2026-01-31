import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActivities, getAthleteZones, getActivity } from "@/lib/strava";
import type { StravaActivity } from "@/types/strava";
import {
  calculateACWR,
  calculateAerobicEfficiency,
  getEfficiencyTrend,
  analyzeTrainingDistribution,
  calculateStreaks,
} from "@/lib/performance";
import type { StravaBestEffort, PersonalRecord } from "@/types/strava";

// Standard distances we care about
const STANDARD_DISTANCES = [
  "400m",
  "1/2 mile",
  "1k",
  "1 mile",
  "2 mile",
  "5k",
  "10k",
  "15k",
  "10 mile",
  "20k",
  "Half-Marathon",
  "30k",
  "Marathon",
];

async function fetchBestEfforts(
  accessToken: string,
  runActivities: Array<{ id: number; name: string }>
): Promise<PersonalRecord[]> {
  // Fetch detailed activities to get best_efforts (limit to avoid rate limits)
  const detailedActivities = await Promise.all(
    runActivities.slice(0, 25).map(async (a) => {
      try {
        return await getActivity(accessToken, a.id);
      } catch {
        return null;
      }
    })
  );

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
    if (!STANDARD_DISTANCES.includes(distanceName)) continue;

    const existing = prsByDistance.get(distanceName);
    if (!existing || effort.moving_time < existing.moving_time) {
      prsByDistance.set(distanceName, effort);
    }
  }

  // Convert to array and sort by distance
  return Array.from(prsByDistance.entries())
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
}

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse date range from query params
    const url = new URL(request.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");

    // Calculate timestamp filters
    let afterTimestamp: number;
    let beforeTimestamp: number | undefined;

    if (fromParam) {
      afterTimestamp = Math.floor(new Date(fromParam).getTime() / 1000);
    } else {
      // Default: last 90 days
      afterTimestamp = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
    }

    if (toParam) {
      // Add 1 day to include the end date
      beforeTimestamp = Math.floor(new Date(toParam).getTime() / 1000) + 86400;
    }

    // Fetch activities with date filtering
    const recentActivities = await getActivities(
      session.accessToken,
      1,
      200,
      beforeTimestamp,
      afterTimestamp
    );

    // Get athlete zones for max HR
    let maxHR = 190;
    let thresholdHR = 165;

    try {
      const zones = await getAthleteZones(session.accessToken);
      if (zones.heart_rate?.zones) {
        const lastZone = zones.heart_rate.zones[zones.heart_rate.zones.length - 1];
        if (lastZone && lastZone.min > 0) {
          maxHR = lastZone.min + 20;
        }
        if (zones.heart_rate.zones.length >= 4) {
          thresholdHR = zones.heart_rate.zones[3].min;
        }
      }
    } catch {
      // Use defaults
    }

    // Filter for runs to get best efforts
    const runActivities = recentActivities.filter(
      (a) => a.type === "Run" || a.type === "VirtualRun"
    );

    // Fetch personal records from best_efforts
    const personalRecords = await fetchBestEfforts(
      session.accessToken,
      runActivities.map((a) => ({ id: a.id, name: a.name }))
    );

    const injuryRisk = calculateACWR(
      recentActivities.map((a) => ({
        start_date: a.start_date,
        moving_time: a.moving_time,
        average_heartrate: a.average_heartrate,
      })),
      maxHR,
      thresholdHR
    );

    const efficiencyData = calculateAerobicEfficiency(recentActivities);
    const efficiencyTrend = getEfficiencyTrend(efficiencyData);

    const trainingDistribution = analyzeTrainingDistribution(
      recentActivities.map((a) => ({
        moving_time: a.moving_time,
        average_heartrate: a.average_heartrate,
      })),
      maxHR
    );

    const streaks = calculateStreaks(
      recentActivities.map((a) => ({ start_date: a.start_date }))
    );

    // Month comparison
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthActivities = recentActivities.filter(
      (a) => new Date(a.start_date) >= thisMonthStart
    );
    const lastMonthActivities = recentActivities.filter((a) => {
      const d = new Date(a.start_date);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });

    const thisMonth = {
      distance: thisMonthActivities.reduce((s, a) => s + a.distance, 0),
      time: thisMonthActivities.reduce((s, a) => s + a.moving_time, 0),
      activities: thisMonthActivities.length,
    };

    const lastMonth = {
      distance: lastMonthActivities.reduce((s, a) => s + a.distance, 0),
      time: lastMonthActivities.reduce((s, a) => s + a.moving_time, 0),
      activities: lastMonthActivities.length,
    };

    const monthComparison = {
      current: thisMonth,
      previous: lastMonth,
      distanceChange: lastMonth.distance > 0
        ? Math.round(((thisMonth.distance - lastMonth.distance) / lastMonth.distance) * 100)
        : 0,
      timeChange: lastMonth.time > 0
        ? Math.round(((thisMonth.time - lastMonth.time) / lastMonth.time) * 100)
        : 0,
      activitiesChange: lastMonth.activities > 0
        ? Math.round(((thisMonth.activities - lastMonth.activities) / lastMonth.activities) * 100)
        : 0,
    };

    return NextResponse.json({
      personalRecords,
      injuryRisk,
      efficiencyData,
      efficiencyTrend,
      trainingDistribution,
      streaks,
      monthComparison,
    });
  } catch (error) {
    console.error("Error fetching premium stats:", error);
    return NextResponse.json(
      { error: "Failed to calculate premium stats" },
      { status: 500 }
    );
  }
}
