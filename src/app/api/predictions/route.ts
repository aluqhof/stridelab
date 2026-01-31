import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActivities, getAthleteZones } from "@/lib/strava";
import {
  calculateWeightedVDOT,
  calculateWeightedPredictions,
  getTrainingPaces,
  buildFitnessHistory,
  findBestEfforts,
  analyzeTrainingContext,
} from "@/lib/performance";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch activities from last 90 days for fitness calculations
    const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
    const activities = await getActivities(
      session.accessToken,
      1,
      200,
      undefined,
      ninetyDaysAgo
    );

    // Fetch athlete zones to get max HR
    let maxHR = 190; // Default
    const restHR = 60; // Default
    let thresholdHR = 165; // Default

    try {
      const zones = await getAthleteZones(session.accessToken);
      if (zones.heart_rate?.zones) {
        // Max HR is the max of the last zone
        const lastZone = zones.heart_rate.zones[zones.heart_rate.zones.length - 1];
        if (lastZone && lastZone.min > 0) {
          maxHR = lastZone.min + 20; // Approximate
        }
        // Threshold HR is roughly zone 4 min
        if (zones.heart_rate.zones.length >= 4) {
          thresholdHR = zones.heart_rate.zones[3].min;
        }
      }
    } catch {
      // Use defaults if zones not available
    }

    // Find best running efforts
    const allEfforts = findBestEfforts(activities);

    // Calculate weighted VDOT from best effort per distance range
    const { vdot, confidence, effortsUsed, usedEfforts } = calculateWeightedVDOT(allEfforts);

    // Build fitness history (CTL/ATL/TSB)
    const fitnessHistory = buildFitnessHistory(
      activities.map((a) => ({
        start_date: a.start_date,
        moving_time: a.moving_time,
        average_heartrate: a.average_heartrate,
      })),
      maxHR,
      thresholdHR,
      restHR,
      90
    );

    // Get current fitness values (last day)
    const currentFitness = fitnessHistory.length > 0
      ? fitnessHistory[fitnessHistory.length - 1]
      : { ctl: 0, atl: 0, tsb: 0 };

    // Analyze training context for adjustments
    const trainingContext = analyzeTrainingContext(activities, currentFitness.tsb);

    // Calculate race predictions with training context adjustments
    const { predictions: racePredictions, adjustments } = calculateWeightedPredictions(
      allEfforts,
      trainingContext
    );

    // Get training paces based on weighted VDOT
    const trainingPaces = vdot > 0 ? getTrainingPaces(vdot) : null;

    return NextResponse.json({
      vdot,
      vdotConfidence: confidence,
      effortsUsed,
      racePredictions,
      adjustments,
      trainingContext,
      trainingPaces,
      bestEfforts: usedEfforts,
      fitnessHistory,
      currentFitness,
      maxHR,
      thresholdHR,
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to calculate predictions" },
      { status: 500 }
    );
  }
}
