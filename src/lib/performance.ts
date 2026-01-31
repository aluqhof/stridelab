/**
 * Performance prediction utilities
 * Based on established running science formulas
 */

// Standard race distances in meters
export const RACE_DISTANCES = {
  "5K": 5000,
  "10K": 10000,
  "Half Marathon": 21097.5,
  "Marathon": 42195,
} as const;

/**
 * Riegel Formula for race time prediction
 * T2 = T1 × (D2/D1)^exponent
 *
 * Exponent values:
 * - 1.04-1.05: Well-trained endurance athletes (less fatigue)
 * - 1.06: Standard/average runners
 * - 1.07-1.08: Less trained runners (more fatigue)
 *
 * @param knownTime - Time in seconds for known distance
 * @param knownDistance - Known distance in meters
 * @param targetDistance - Target distance in meters
 * @param exponent - Fatigue exponent (default 1.05 for trained runners)
 * @returns Predicted time in seconds
 */
export function riegelPrediction(
  knownTime: number,
  knownDistance: number,
  targetDistance: number,
  exponent: number = 1.05 // Changed from 1.06 to 1.05 for trained runners
): number {
  return knownTime * Math.pow(targetDistance / knownDistance, exponent);
}

/**
 * Calculate VDOT (Jack Daniels' VO2max estimation)
 * Based on a race performance
 *
 * @param distanceMeters - Race distance in meters
 * @param timeSeconds - Race time in seconds
 * @returns VDOT value
 */
export function calculateVDOT(distanceMeters: number, timeSeconds: number): number {
  const timeMinutes = timeSeconds / 60;
  const velocity = distanceMeters / timeMinutes; // meters per minute

  // Oxygen cost of running at velocity v (ml/kg/min)
  const oxygenCost = -4.60 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);

  // Drop-dead formula for % VO2max sustained
  const percentVO2max =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * timeMinutes) +
    0.2989558 * Math.exp(-0.1932605 * timeMinutes);

  // VDOT = VO2max estimate
  const vdot = oxygenCost / percentVO2max;

  return Math.round(vdot * 10) / 10;
}

/**
 * Predict race time from VDOT (like Garmin does)
 * Uses Jack Daniels' tables inverted
 * This tends to be more optimistic than Riegel for trained runners
 *
 * @param vdot - VDOT value
 * @param targetDistance - Target distance in meters
 * @returns Predicted time in seconds
 */
export function predictFromVDOT(vdot: number, targetDistance: number): number {
  // Velocity at VO2max (m/min) from VDOT
  const vVO2max = (vdot + 4.60) / 0.182258;

  // Race intensity as % of vVO2max based on distance
  // These are derived from Jack Daniels' tables
  let intensity: number;

  if (targetDistance <= 5000) {
    intensity = 0.94 + (5000 - targetDistance) / 5000 * 0.04; // 94-98%
  } else if (targetDistance <= 10000) {
    intensity = 0.90 + (10000 - targetDistance) / 10000 * 0.04; // 90-94%
  } else if (targetDistance <= 21097) {
    intensity = 0.85 + (21097 - targetDistance) / 21097 * 0.05; // 85-90%
  } else {
    intensity = 0.80 + (42195 - targetDistance) / 42195 * 0.05; // 80-85%
  }

  const raceVelocity = vVO2max * intensity; // m/min
  const timeMinutes = targetDistance / raceVelocity;

  return Math.round(timeMinutes * 60); // Convert to seconds
}

/**
 * Get training paces based on VDOT
 * Returns paces in min/km
 */
export function getTrainingPaces(vdot: number): {
  easy: { min: string; max: string };
  marathon: string;
  threshold: string;
  interval: string;
  repetition: string;
} {
  // Approximate velocity at different intensities (m/min)
  const vVO2max = (vdot + 4.60) / 0.182258; // Simplified inverse

  // Training intensities as % of vVO2max
  const easyMinVelocity = vVO2max * 0.59;
  const easyMaxVelocity = vVO2max * 0.74;
  const marathonVelocity = vVO2max * 0.75;
  const thresholdVelocity = vVO2max * 0.83;
  const intervalVelocity = vVO2max * 0.95;
  const repetitionVelocity = vVO2max * 1.0;

  const velocityToPace = (v: number): string => {
    const secPerKm = 1000 / v * 60;
    const mins = Math.floor(secPerKm / 60);
    const secs = Math.round(secPerKm % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    easy: {
      min: velocityToPace(easyMaxVelocity),
      max: velocityToPace(easyMinVelocity),
    },
    marathon: velocityToPace(marathonVelocity),
    threshold: velocityToPace(thresholdVelocity),
    interval: velocityToPace(intervalVelocity),
    repetition: velocityToPace(repetitionVelocity),
  };
}

/**
 * Estimate VO2max from heart rate and pace
 * Using the relationship between HR reserve and VO2 reserve
 *
 * @param paceSecPerKm - Pace in seconds per km
 * @param avgHR - Average heart rate during effort
 * @param maxHR - Athlete's max heart rate
 * @param restHR - Athlete's resting heart rate
 * @returns Estimated VO2max in ml/kg/min
 */
export function estimateVO2maxFromHR(
  paceSecPerKm: number,
  avgHR: number,
  maxHR: number,
  restHR: number = 60
): number {
  // HR reserve percentage
  const hrReserve = (avgHR - restHR) / (maxHR - restHR);

  // Velocity in m/min
  const velocity = 1000 / (paceSecPerKm / 60);

  // VO2 at this velocity (ml/kg/min)
  const vo2AtPace = -4.60 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);

  // VO2max estimate (assuming %HRR ≈ %VO2R)
  const vo2max = vo2AtPace / hrReserve;

  return Math.round(vo2max * 10) / 10;
}

/**
 * TRIMP (Training Impulse) calculation
 * Measures training load based on duration and HR intensity
 *
 * @param durationMinutes - Duration in minutes
 * @param avgHR - Average heart rate
 * @param maxHR - Max heart rate
 * @param restHR - Resting heart rate
 * @param gender - 'male' or 'female' for gender-specific constant
 * @returns TRIMP value
 */
export function calculateTRIMP(
  durationMinutes: number,
  avgHR: number,
  maxHR: number,
  restHR: number = 60,
  gender: "male" | "female" = "male"
): number {
  const hrReserve = (avgHR - restHR) / (maxHR - restHR);
  const y = gender === "male" ? 1.92 : 1.67;
  const trimp = durationMinutes * hrReserve * 0.64 * Math.exp(y * hrReserve);
  return Math.round(trimp);
}

/**
 * hrTSS (Heart Rate Training Stress Score)
 * Similar to power-based TSS but using heart rate
 *
 * @param durationSeconds - Duration in seconds
 * @param avgHR - Average heart rate
 * @param thresholdHR - Lactate threshold heart rate
 * @param maxHR - Max heart rate
 * @param restHR - Resting heart rate
 * @returns hrTSS value
 */
export function calculateHRTSS(
  durationSeconds: number,
  avgHR: number,
  thresholdHR: number,
  maxHR: number,
  restHR: number = 60
): number {
  const durationHours = durationSeconds / 3600;

  // Intensity Factor based on HR
  const hrReserve = (avgHR - restHR) / (maxHR - restHR);
  const lthrReserve = (thresholdHR - restHR) / (maxHR - restHR);
  const intensityFactor = hrReserve / lthrReserve;

  // hrTSS = duration (hours) × IF² × 100
  const tss = durationHours * Math.pow(intensityFactor, 2) * 100;

  return Math.round(tss);
}

/**
 * Calculate CTL (Chronic Training Load) - Fitness
 * Uses exponential weighted moving average with 42-day time constant
 */
export function calculateCTL(
  dailyTSS: number[],
  previousCTL: number = 0
): number {
  const timeConstant = 42;
  let ctl = previousCTL;

  for (const tss of dailyTSS) {
    ctl = ctl + (tss - ctl) / timeConstant;
  }

  return Math.round(ctl * 10) / 10;
}

/**
 * Calculate ATL (Acute Training Load) - Fatigue
 * Uses exponential weighted moving average with 7-day time constant
 */
export function calculateATL(
  dailyTSS: number[],
  previousATL: number = 0
): number {
  const timeConstant = 7;
  let atl = previousATL;

  for (const tss of dailyTSS) {
    atl = atl + (tss - atl) / timeConstant;
  }

  return Math.round(atl * 10) / 10;
}

/**
 * Calculate TSB (Training Stress Balance) - Form
 * TSB = CTL - ATL
 * Positive = fresh/recovered, Negative = fatigued
 */
export function calculateTSB(ctl: number, atl: number): number {
  return Math.round((ctl - atl) * 10) / 10;
}

/**
 * Build fitness/freshness data from activities
 * Returns daily CTL, ATL, TSB values
 */
export interface FitnessData {
  date: string;
  tss: number;
  ctl: number;
  atl: number;
  tsb: number;
}

export function buildFitnessHistory(
  activities: Array<{
    start_date: string;
    moving_time: number;
    average_heartrate?: number;
  }>,
  maxHR: number = 190,
  thresholdHR: number = 165,
  restHR: number = 60,
  daysBack: number = 90
): FitnessData[] {
  // Create a map of date -> total TSS
  const tssMap = new Map<string, number>();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Initialize all days with 0 TSS
  for (let i = 0; i <= daysBack; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    tssMap.set(dateStr, 0);
  }

  // Add activity TSS to corresponding days
  for (const activity of activities) {
    const dateStr = activity.start_date.split("T")[0];
    if (tssMap.has(dateStr) && activity.average_heartrate) {
      const tss = calculateHRTSS(
        activity.moving_time,
        activity.average_heartrate,
        thresholdHR,
        maxHR,
        restHR
      );
      tssMap.set(dateStr, (tssMap.get(dateStr) || 0) + tss);
    }
  }

  // Calculate CTL, ATL, TSB for each day
  const result: FitnessData[] = [];
  let ctl = 0;
  let atl = 0;

  const sortedDates = Array.from(tssMap.keys()).sort();

  for (const date of sortedDates) {
    const tss = tssMap.get(date) || 0;

    // Update CTL and ATL
    ctl = ctl + (tss - ctl) / 42;
    atl = atl + (tss - atl) / 7;
    const tsb = ctl - atl;

    result.push({
      date,
      tss,
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round(tsb * 10) / 10,
    });
  }

  return result;
}

/**
 * Find best effort from activities for a given distance
 */
export interface BestEffort {
  activityId: number;
  activityName: string;
  date: string;
  distance: number;
  time: number;
  pace: number; // sec/km
}

export function findBestEfforts(
  activities: Array<{
    id: number;
    name: string;
    start_date: string;
    distance: number;
    moving_time: number;
    type: string;
  }>,
  minDistance: number = 3000
): BestEffort[] {
  // Filter running activities with sufficient distance
  const runActivities = activities
    .filter(
      (a) =>
        (a.type === "Run" || a.type === "VirtualRun") &&
        a.distance >= minDistance
    )
    .map((a) => ({
      activityId: a.id,
      activityName: a.name,
      date: a.start_date,
      distance: a.distance,
      time: a.moving_time,
      pace: a.moving_time / (a.distance / 1000),
    }))
    .sort((a, b) => a.pace - b.pace); // Sort by pace (fastest first)

  return runActivities.slice(0, 10); // Top 10 best efforts
}

// Distance ranges for grouping efforts
const DISTANCE_RANGES = [
  { name: "5K", min: 4000, max: 6000, weight: 1 },
  { name: "10K", min: 9000, max: 12000, weight: 1.5 },
  { name: "15K", min: 14000, max: 17000, weight: 2 },
  { name: "21K", min: 20000, max: 23000, weight: 3 },
  { name: "30K", min: 28000, max: 35000, weight: 3.5 },
  { name: "42K", min: 40000, max: 44000, weight: 4 },
];

/**
 * Get the best effort for each distance range
 * This ensures we use PRs, not diluted by training runs
 */
export function getBestEffortsByDistance(efforts: BestEffort[]): {
  efforts: (BestEffort & { rangeName: string; rangeWeight: number })[];
  ranges: string[];
} {
  const bestByRange: Map<string, BestEffort & { rangeName: string; rangeWeight: number }> = new Map();

  for (const effort of efforts) {
    // Find which range this effort belongs to
    const range = DISTANCE_RANGES.find(
      r => effort.distance >= r.min && effort.distance <= r.max
    );

    if (range) {
      const existing = bestByRange.get(range.name);
      // Keep the faster one (lower pace)
      if (!existing || effort.pace < existing.pace) {
        bestByRange.set(range.name, {
          ...effort,
          rangeName: range.name,
          rangeWeight: range.weight,
        });
      }
    }
  }

  return {
    efforts: Array.from(bestByRange.values()),
    ranges: Array.from(bestByRange.keys()),
  };
}

/**
 * Calculate weighted average VDOT from best efforts per distance
 * Uses only the best mark for each distance range (not all runs)
 */
export function calculateWeightedVDOT(efforts: BestEffort[]): {
  vdot: number;
  confidence: number;
  effortsUsed: number;
  usedEfforts: BestEffort[];
} {
  if (efforts.length === 0) {
    return { vdot: 0, confidence: 0, effortsUsed: 0, usedEfforts: [] };
  }

  // Get best effort for each distance range
  const { efforts: bestEfforts, ranges } = getBestEffortsByDistance(efforts);

  if (bestEfforts.length === 0) {
    return { vdot: 0, confidence: 0, effortsUsed: 0, usedEfforts: [] };
  }

  let totalWeight = 0;
  let weightedVdotSum = 0;

  for (const effort of bestEfforts) {
    // Calculate VDOT for this effort
    const vdot = calculateVDOT(effort.distance, effort.time);

    // Weight by distance reliability (longer races = more reliable)
    const weight = effort.rangeWeight;
    totalWeight += weight;
    weightedVdotSum += vdot * weight;
  }

  const avgVdot = weightedVdotSum / totalWeight;

  // Confidence based on number of distance ranges covered
  const confidence = Math.min(100, bestEfforts.length * 25);

  return {
    vdot: Math.round(avgVdot * 10) / 10,
    confidence,
    effortsUsed: bestEfforts.length,
    usedEfforts: bestEfforts,
  };
}

// ============================================
// TRAINING CONTEXT ANALYSIS
// ============================================

export interface TrainingContext {
  // TSB (Training Stress Balance) - positive = fresh, negative = fatigued
  tsb: number;
  // Average weekly distance in meters (last 4 weeks)
  weeklyVolume: number;
  // Longest run in last 3 weeks (meters)
  longestRecentRun: number;
  // Number of runs per week (average last 4 weeks)
  runsPerWeek: number;
}

/**
 * Analyze recent training to get context for predictions
 */
export function analyzeTrainingContext(
  activities: Array<{
    start_date: string;
    distance: number;
    moving_time: number;
    type: string;
  }>,
  currentTSB: number
): TrainingContext {
  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

  // Filter to runs only
  const runs = activities.filter(
    a => (a.type === "Run" || a.type === "VirtualRun")
  );

  // Last 4 weeks runs
  const last4WeeksRuns = runs.filter(
    a => new Date(a.start_date) >= fourWeeksAgo
  );

  // Last 3 weeks for long run check
  const last3WeeksRuns = runs.filter(
    a => new Date(a.start_date) >= threeWeeksAgo
  );

  // Calculate weekly volume (average over 4 weeks)
  const totalDistance = last4WeeksRuns.reduce((sum, a) => sum + a.distance, 0);
  const weeklyVolume = totalDistance / 4;

  // Find longest run in last 3 weeks
  const longestRecentRun = last3WeeksRuns.reduce(
    (max, a) => Math.max(max, a.distance),
    0
  );

  // Runs per week
  const runsPerWeek = last4WeeksRuns.length / 4;

  return {
    tsb: currentTSB,
    weeklyVolume,
    longestRecentRun,
    runsPerWeek,
  };
}

/**
 * Calculate adjustment factors based on training context
 * Returns multipliers for each race distance (< 1 = faster, > 1 = slower)
 *
 * NOTE: These adjustments are now more balanced - less aggressive with penalties
 * and more generous with bonuses, similar to how Garmin approaches predictions.
 * Assumes race-day readiness by default.
 */
export function calculateAdjustmentFactors(
  context: TrainingContext
): Record<string, { factor: number; reasons: string[] }> {
  const adjustments: Record<string, { factor: number; reasons: string[] }> = {};

  for (const [raceName, raceDistance] of Object.entries(RACE_DISTANCES)) {
    let factor = 1.0;
    const reasons: string[] = [];

    // 1. TSB Adjustment (freshness) - More generous bonuses
    if (context.tsb > 15) {
      factor *= 0.98; // 2% faster when very fresh (race ready!)
      reasons.push("Ready to race (+2%)");
    } else if (context.tsb > 5) {
      factor *= 0.99; // 1% faster when fresh
      reasons.push("Good form (+1%)");
    } else if (context.tsb < -25) {
      factor *= 1.015; // Only 1.5% slower when very fatigued (reduced from 3%)
      reasons.push("Somewhat fatigued (-1.5%)");
    }
    // Note: Removed penalty for moderate fatigue (-10 to -25)

    // 2. Volume Adjustment - Only for very low volume
    const weeklyKm = context.weeklyVolume / 1000;

    if (raceDistance >= 21097) { // Half marathon and longer
      if (weeklyKm < 20) { // Only penalize very low volume (was 30)
        factor *= 1.02; // Reduced from 5% to 2%
        reasons.push("Low volume (-2%)");
      } else if (weeklyKm >= 50) {
        factor *= 0.98; // 2% faster with good volume
        reasons.push("Good volume (+2%)");
      }
    }

    if (raceDistance >= 42195) { // Marathon
      if (weeklyKm < 40) { // Reduced threshold from 50
        factor *= 1.02; // Reduced from 5% to 2%
        reasons.push("Marathon prep improvable (-2%)");
      } else if (weeklyKm >= 70) {
        factor *= 0.97; // 3% faster with high volume
        reasons.push("Excellent marathon prep (+3%)");
      }
    }

    // 3. Long Run Adjustment - Less aggressive
    const longestKm = context.longestRecentRun / 1000;

    if (raceDistance >= 21097) { // Half marathon
      if (longestKm < 12) { // Reduced from 15
        factor *= 1.02; // Reduced from 4% to 2%
        reasons.push("Long runs recommended (-2%)");
      } else if (longestKm >= 16) {
        factor *= 0.99; // 1% faster
        reasons.push("Good long runs (+1%)");
      }
    }

    if (raceDistance >= 42195) { // Marathon
      if (longestKm < 20) { // Reduced from 25
        factor *= 1.03; // Reduced from 6% to 3%
        reasons.push("Need 20km+ long runs (-3%)");
      } else if (longestKm >= 28) {
        factor *= 0.98; // 2% faster
        reasons.push("Optimal long runs (+2%)");
      }
    }

    // 4. Consistency Adjustment - Only bonus, no penalty
    if (context.runsPerWeek >= 5) {
      factor *= 0.99; // 1% faster with good consistency
      reasons.push("Good consistency (+1%)");
    } else if (context.runsPerWeek >= 4) {
      factor *= 0.995; // 0.5% faster
      reasons.push("Consistent (+0.5%)");
    }
    // Removed penalty for low frequency

    adjustments[raceName] = { factor, reasons };
  }

  return adjustments;
}

/**
 * Calculate race predictions from best efforts per distance
 * Uses a blend of Riegel formula and VDOT-based predictions (like Garmin)
 * Now includes adjustments based on training context
 */
export function calculateWeightedPredictions(
  efforts: BestEffort[],
  trainingContext?: TrainingContext
): { predictions: Record<string, number>; adjustments: Record<string, { factor: number; reasons: string[] }> } {
  if (efforts.length === 0) return { predictions: {}, adjustments: {} };

  // Get best effort for each distance range
  const { efforts: bestEfforts } = getBestEffortsByDistance(efforts);
  if (bestEfforts.length === 0) return { predictions: {}, adjustments: {} };

  const riegelPredictions: Record<string, number> = {};
  const vdotPredictions: Record<string, number> = {};

  // Initialize predictions for each distance
  for (const name of Object.keys(RACE_DISTANCES)) {
    riegelPredictions[name] = 0;
    vdotPredictions[name] = 0;
  }

  let totalWeight = 0;
  let totalVdot = 0;

  for (const effort of bestEfforts) {
    const weight = effort.rangeWeight;
    totalWeight += weight;

    // Calculate VDOT from this effort
    const effortVdot = calculateVDOT(effort.distance, effort.time);
    totalVdot += effortVdot * weight;

    // Calculate Riegel prediction from this effort for each race distance
    // Using 1.05 exponent for trained runners
    for (const [name, targetDistance] of Object.entries(RACE_DISTANCES)) {
      const predictedTime = riegelPrediction(effort.time, effort.distance, targetDistance, 1.05);
      riegelPredictions[name] += predictedTime * weight;
    }
  }

  // Normalize Riegel predictions
  for (const name of Object.keys(riegelPredictions)) {
    riegelPredictions[name] = riegelPredictions[name] / totalWeight;
  }

  // Calculate weighted average VDOT and use it for VDOT-based predictions
  const avgVdot = totalVdot / totalWeight;
  for (const [name, targetDistance] of Object.entries(RACE_DISTANCES)) {
    vdotPredictions[name] = predictFromVDOT(avgVdot, targetDistance);
  }

  // Blend Riegel and VDOT predictions
  // VDOT tends to be more optimistic for trained runners (like Garmin)
  // Use 60% VDOT + 40% Riegel for a balanced but optimistic prediction
  const predictions: Record<string, number> = {};
  for (const name of Object.keys(RACE_DISTANCES)) {
    predictions[name] = Math.round(
      vdotPredictions[name] * 0.6 + riegelPredictions[name] * 0.4
    );
  }

  // Apply training context adjustments if available
  let adjustments: Record<string, { factor: number; reasons: string[] }> = {};

  if (trainingContext) {
    adjustments = calculateAdjustmentFactors(trainingContext);

    for (const [name, adjustment] of Object.entries(adjustments)) {
      if (predictions[name]) {
        predictions[name] = Math.round(predictions[name] * adjustment.factor);
      }
    }
  }

  return { predictions, adjustments };
}

// ============================================
// PERSONAL RECORDS
// ============================================

export const PR_DISTANCES = {
  "1K": 1000,
  "1 Milla": 1609.34,
  "5K": 5000,
  "10K": 10000,
  "Media": 21097.5,
  "Marathon": 42195,
} as const;

export interface PersonalRecord {
  distance: string;
  distanceMeters: number;
  time: number;
  pace: number;
  activityId: number;
  activityName: string;
  date: string;
}

export function findPersonalRecords(
  activities: Array<{
    id: number;
    name: string;
    start_date: string;
    distance: number;
    moving_time: number;
    type: string;
  }>
): PersonalRecord[] {
  const records: PersonalRecord[] = [];

  const runActivities = activities.filter(
    (a) => a.type === "Run" || a.type === "VirtualRun"
  );

  // Tolerance ranges for each distance (min%, max%)
  const tolerances: Record<string, [number, number]> = {
    "1K": [0.95, 1.15],      // 950m - 1150m
    "1 Milla": [0.95, 1.15], // ~1530m - 1850m
    "5K": [0.95, 1.10],      // 4750m - 5500m
    "10K": [0.95, 1.10],     // 9500m - 11000m
    "Media": [0.98, 1.05],   // ~20700m - 22150m
    "Marathon": [0.98, 1.03], // ~41350m - 43460m
  };

  for (const [name, targetDistance] of Object.entries(PR_DISTANCES)) {
    const [minPct, maxPct] = tolerances[name] || [0.95, 1.10];
    const minDistance = targetDistance * minPct;
    const maxDistance = targetDistance * maxPct;

    // Find activities within the distance range for this PR
    const qualifying = runActivities
      .filter((a) => a.distance >= minDistance && a.distance <= maxDistance)
      .map((a) => {
        // Use actual time, adjusted proportionally to exact distance
        const adjustedTime = a.moving_time * (targetDistance / a.distance);
        return {
          distance: name,
          distanceMeters: targetDistance,
          time: Math.round(adjustedTime),
          pace: adjustedTime / (targetDistance / 1000),
          activityId: a.id,
          activityName: a.name,
          date: a.start_date,
        };
      })
      .sort((a, b) => a.time - b.time);

    if (qualifying.length > 0) {
      records.push(qualifying[0]);
    }
  }

  return records;
}

// ============================================
// INJURY RISK - ACUTE:CHRONIC WORKLOAD RATIO
// ============================================

export interface InjuryRiskData {
  acwr: number;
  riskLevel: "low" | "moderate" | "high" | "very_high";
  weeklyLoad: number;
  chronicLoad: number;
  recommendation: string;
}

export function calculateACWR(
  activities: Array<{
    start_date: string;
    moving_time: number;
    average_heartrate?: number;
  }>,
  maxHR: number = 190,
  thresholdHR: number = 165
): InjuryRiskData {
  const now = new Date();

  // Calculate weekly load (last 7 days)
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Calculate chronic load (last 28 days average per week)
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 28);

  let weeklyTSS = 0;
  let monthlyTSS = 0;

  for (const activity of activities) {
    const actDate = new Date(activity.start_date);
    if (!activity.average_heartrate) continue;

    const tss = calculateHRTSS(
      activity.moving_time,
      activity.average_heartrate,
      thresholdHR,
      maxHR,
      60
    );

    if (actDate >= weekAgo) {
      weeklyTSS += tss;
    }
    if (actDate >= monthAgo) {
      monthlyTSS += tss;
    }
  }

  const chronicLoad = monthlyTSS / 4; // Average weekly load over 4 weeks
  const acwr = chronicLoad > 0 ? weeklyTSS / chronicLoad : 0;

  let riskLevel: InjuryRiskData["riskLevel"];
  let recommendation: string;

  if (acwr < 0.8) {
    riskLevel = "low";
    recommendation = "Low load. You can gradually increase volume.";
  } else if (acwr <= 1.3) {
    riskLevel = "moderate";
    recommendation = "Optimal zone. Maintain this load level.";
  } else if (acwr <= 1.5) {
    riskLevel = "high";
    recommendation = "High load. Consider reducing intensity.";
  } else {
    riskLevel = "very_high";
    recommendation = "Alert! High injury risk. Reduce the load.";
  }

  return {
    acwr: Math.round(acwr * 100) / 100,
    riskLevel,
    weeklyLoad: Math.round(weeklyTSS),
    chronicLoad: Math.round(chronicLoad),
    recommendation,
  };
}

// ============================================
// AEROBIC EFFICIENCY
// ============================================

export interface EfficiencyData {
  date: string;
  activityName: string;
  pace: number; // sec/km
  avgHR: number;
  efficiency: number; // meters per heartbeat
  paceHRRatio: number;
}

export function calculateAerobicEfficiency(
  activities: Array<{
    id: number;
    name: string;
    start_date: string;
    distance: number;
    moving_time: number;
    average_heartrate?: number;
    type: string;
  }>
): EfficiencyData[] {
  return activities
    .filter(
      (a) =>
        (a.type === "Run" || a.type === "VirtualRun") &&
        a.average_heartrate &&
        a.average_heartrate > 0 &&
        a.distance >= 3000 // At least 3km
    )
    .map((a) => {
      const pace = a.moving_time / (a.distance / 1000);
      const avgHR = a.average_heartrate!;
      // Efficiency: meters covered per heartbeat
      const totalHeartbeats = avgHR * (a.moving_time / 60);
      const efficiency = a.distance / totalHeartbeats;
      // Pace:HR ratio (lower is better - faster pace at lower HR)
      const paceHRRatio = pace / avgHR;

      return {
        date: a.start_date,
        activityName: a.name,
        pace,
        avgHR,
        efficiency: Math.round(efficiency * 100) / 100,
        paceHRRatio: Math.round(paceHRRatio * 100) / 100,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-20); // Last 20 runs
}

export interface EfficiencyTrend {
  current: number;
  previous: number;
  change: number;
  improving: boolean;
}

export function getEfficiencyTrend(data: EfficiencyData[]): EfficiencyTrend | null {
  if (data.length < 6) return null;

  const recent = data.slice(-5);
  const older = data.slice(-10, -5);

  if (older.length === 0) return null;

  const recentAvg = recent.reduce((sum, d) => sum + d.efficiency, 0) / recent.length;
  const olderAvg = older.reduce((sum, d) => sum + d.efficiency, 0) / older.length;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  return {
    current: Math.round(recentAvg * 100) / 100,
    previous: Math.round(olderAvg * 100) / 100,
    change: Math.round(change * 10) / 10,
    improving: change > 0,
  };
}

// ============================================
// TRAINING DISTRIBUTION (Polarized Check)
// ============================================

export interface TrainingDistribution {
  zone1_2: number; // Easy (Z1-Z2)
  zone3: number;   // Moderate (Z3)
  zone4_5: number; // Hard (Z4-Z5)
  isPolarized: boolean;
  recommendation: string;
}

export function analyzeTrainingDistribution(
  activities: Array<{
    moving_time: number;
    average_heartrate?: number;
  }>,
  maxHR: number = 190
): TrainingDistribution {
  let easyTime = 0;
  let moderateTime = 0;
  let hardTime = 0;

  // Zone boundaries as % of max HR
  const z2Max = maxHR * 0.75;
  const z3Max = maxHR * 0.85;

  for (const activity of activities) {
    if (!activity.average_heartrate) continue;

    const hr = activity.average_heartrate;
    const time = activity.moving_time;

    if (hr < z2Max) {
      easyTime += time;
    } else if (hr < z3Max) {
      moderateTime += time;
    } else {
      hardTime += time;
    }
  }

  const totalTime = easyTime + moderateTime + hardTime;
  if (totalTime === 0) {
    return {
      zone1_2: 0,
      zone3: 0,
      zone4_5: 0,
      isPolarized: false,
      recommendation: "Not enough heart rate data.",
    };
  }

  const easyPct = (easyTime / totalTime) * 100;
  const moderatePct = (moderateTime / totalTime) * 100;
  const hardPct = (hardTime / totalTime) * 100;

  // Polarized: ~80% easy, ~20% hard, minimal moderate
  const isPolarized = easyPct >= 75 && moderatePct <= 15;

  let recommendation: string;
  if (isPolarized) {
    recommendation = "Polarized distribution. Excellent for aerobic improvements.";
  } else if (moderatePct > 30) {
    recommendation = "Too much time in gray zone (Z3). Train easier or harder.";
  } else if (easyPct < 70) {
    recommendation = "Consider adding more easy volume for better recovery.";
  } else {
    recommendation = "Good distribution. Keep it up.";
  }

  return {
    zone1_2: Math.round(easyPct),
    zone3: Math.round(moderatePct),
    zone4_5: Math.round(hardPct),
    isPolarized,
    recommendation,
  };
}

// ============================================
// STREAKS AND CONSISTENCY
// ============================================

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  thisWeekActivities: number;
  thisMonthActivities: number;
  consistencyScore: number; // 0-100
}

export function calculateStreaks(
  activities: Array<{ start_date: string }>
): StreakData {
  if (activities.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      thisWeekActivities: 0,
      thisMonthActivities: 0,
      consistencyScore: 0,
    };
  }

  // Get unique activity dates
  const dates = [...new Set(
    activities.map((a) => a.start_date.split("T")[0])
  )].sort();

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Check if last activity was today or yesterday
  const lastDate = dates[dates.length - 1];
  if (lastDate === today || lastDate === yesterday) {
    currentStreak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const curr = new Date(dates[i + 1]);
      const prev = new Date(dates[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / 86400000;

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i - 1]);
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000;

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // This week and month counts
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const thisWeekActivities = activities.filter(
    (a) => new Date(a.start_date) >= weekAgo
  ).length;

  const thisMonthActivities = activities.filter(
    (a) => new Date(a.start_date) >= monthAgo
  ).length;

  // Consistency score (based on activities per week over last month)
  const weeksInMonth = 4;
  const idealPerWeek = 4; // 4 activities per week is ideal
  const avgPerWeek = thisMonthActivities / weeksInMonth;
  const consistencyScore = Math.min(100, Math.round((avgPerWeek / idealPerWeek) * 100));

  return {
    currentStreak,
    longestStreak,
    thisWeekActivities,
    thisMonthActivities,
    consistencyScore,
  };
}

// ============================================
// COMPARISON (Month over Month, Year over Year)
// ============================================

export interface PeriodComparison {
  current: { distance: number; time: number; activities: number };
  previous: { distance: number; time: number; activities: number };
  distanceChange: number;
  timeChange: number;
  activitiesChange: number;
}
