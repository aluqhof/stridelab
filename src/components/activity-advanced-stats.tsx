"use client";

import type { StravaActivity, StravaActivityStream } from "@/types/strava";
import { formatPace, formatDuration } from "@/lib/utils";

interface ActivityAdvancedStatsProps {
  activity: StravaActivity;
  streams?: Record<string, StravaActivityStream>;
}

export function ActivityAdvancedStats({ activity, streams }: ActivityAdvancedStatsProps) {
  const splits = activity.splits_metric || [];
  const hrStream = streams?.heartrate?.data || [];

  const isRun = activity.sport_type === "Run" || activity.sport_type === "VirtualRun";

  if (splits.length < 2 && hrStream.length === 0) {
    return null;
  }

  const splitPaces = splits.map(s => s.moving_time / (s.distance / 1000));
  const bestSplitIndex = splitPaces.indexOf(Math.min(...splitPaces.filter(p => p > 0)));
  const worstSplitIndex = splitPaces.indexOf(Math.max(...splitPaces));
  const bestSplit = splits[bestSplitIndex];
  const worstSplit = splits[worstSplitIndex];

  const halfIndex = Math.floor(splits.length / 2);
  const firstHalfTime = splits.slice(0, halfIndex).reduce((sum, s) => sum + s.moving_time, 0);
  const secondHalfTime = splits.slice(halfIndex, halfIndex * 2).reduce((sum, s) => sum + s.moving_time, 0);
  const firstHalfDist = splits.slice(0, halfIndex).reduce((sum, s) => sum + s.distance, 0);
  const secondHalfDist = splits.slice(halfIndex, halfIndex * 2).reduce((sum, s) => sum + s.distance, 0);

  const firstHalfPace = firstHalfDist > 0 ? firstHalfTime / (firstHalfDist / 1000) : 0;
  const secondHalfPace = secondHalfDist > 0 ? secondHalfTime / (secondHalfDist / 1000) : 0;
  const splitDiff = secondHalfPace - firstHalfPace;
  const isNegativeSplit = splitDiff < -3;
  const isPositiveSplit = splitDiff > 3;

  const avgPace = splitPaces.reduce((a, b) => a + b, 0) / splitPaces.length;
  const paceVariance = splitPaces.reduce((sum, p) => sum + Math.pow(p - avgPace, 2), 0) / splitPaces.length;
  const paceStdDev = Math.sqrt(paceVariance);
  const paceConsistency = avgPace > 0 ? 100 - (paceStdDev / avgPace) * 100 : 0;

  let gap = 0;
  if (activity.total_elevation_gain > 0 && activity.distance > 0 && isRun) {
    const avgGradient = (activity.total_elevation_gain / activity.distance) * 100;
    const adjustmentFactor = avgGradient > 0 ? 0.033 : -0.015;
    const paceSeconds = activity.moving_time / (activity.distance / 1000);
    gap = paceSeconds / (1 + avgGradient * adjustmentFactor);
  }

  let cardiacDrift = 0;
  let earlyHR = 0;
  let finalHR = 0;
  if (hrStream.length > 100) {
    const warmupEnd = Math.floor(hrStream.length * 0.15);
    const earlyEnd = Math.floor(hrStream.length * 0.40);
    const finalStart = Math.floor(hrStream.length * 0.75);

    const earlySegment = hrStream.slice(warmupEnd, earlyEnd).filter(hr => hr > 0);
    const finalSegment = hrStream.slice(finalStart).filter(hr => hr > 0);

    if (earlySegment.length > 0 && finalSegment.length > 0) {
      earlyHR = earlySegment.reduce((a, b) => a + b, 0) / earlySegment.length;
      finalHR = finalSegment.reduce((a, b) => a + b, 0) / finalSegment.length;
      cardiacDrift = ((finalHR - earlyHR) / earlyHR) * 100;
    }
  }

  let trainingLoad = 0;
  if (activity.average_heartrate && activity.moving_time) {
    const estimatedMaxHR = activity.max_heartrate || 190;
    const hrIntensity = activity.average_heartrate / estimatedMaxHR;
    const durationHours = activity.moving_time / 3600;
    trainingLoad = Math.round(durationHours * hrIntensity * hrIntensity * 100);
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-purple-500 rounded-full" />
        Performance Analysis
      </h2>

      <div className="space-y-4">
        {splits.length >= 4 && (
          <div className={`rounded-xl p-4 ${
            isNegativeSplit ? "bg-green-50 border border-green-200" :
            isPositiveSplit ? "bg-amber-50 border border-amber-200" :
            "bg-gray-50 border border-gray-200"
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {isNegativeSplit ? "✅ Negative Split" : isPositiveSplit ? "⚠️ Positive Split" : "➡️ Even Split"}
                </h3>
                <p className="text-xs text-gray-500">
                  {isNegativeSplit
                    ? "You ran the second half faster. This is the ideal race strategy."
                    : isPositiveSplit
                    ? "The second half was slower. Try starting more conservatively."
                    : "You maintained a similar pace in both halves."}
                </p>
              </div>
              <div className={`text-right px-3 py-1 rounded-full text-sm font-bold ${
                isNegativeSplit ? "bg-green-100 text-green-700" :
                isPositiveSplit ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {splitDiff > 0 ? "+" : ""}{Math.round(splitDiff)}s/km
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 rounded-lg p-2">
                <p className="text-[10px] text-gray-500 uppercase">First half</p>
                <p className="text-lg font-bold text-gray-700">{formatDuration(firstHalfTime)}</p>
                <p className="text-xs text-gray-400">{Math.floor(firstHalfPace/60)}:{String(Math.round(firstHalfPace%60)).padStart(2,'0')}/km</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2">
                <p className="text-[10px] text-gray-500 uppercase">Second half</p>
                <p className={`text-lg font-bold ${isNegativeSplit ? "text-green-600" : isPositiveSplit ? "text-amber-600" : "text-gray-700"}`}>
                  {formatDuration(secondHalfTime)}
                </p>
                <p className="text-xs text-gray-400">{Math.floor(secondHalfPace/60)}:{String(Math.round(secondHalfPace%60)).padStart(2,'0')}/km</p>
              </div>
            </div>
          </div>
        )}

        {bestSplit && worstSplit && splits.length > 2 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🚀</span>
                <h3 className="text-sm font-semibold text-gray-900">Best kilometer</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mb-1">
                {formatPace(bestSplit.average_speed, activity.sport_type)}
              </p>
              <p className="text-xs text-gray-500">
                Kilometer {bestSplitIndex + 1} of {splits.length}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🐢</span>
                <h3 className="text-sm font-semibold text-gray-900">Slowest kilometer</h3>
              </div>
              <p className="text-2xl font-bold text-gray-600 mb-1">
                {formatPace(worstSplit.average_speed, activity.sport_type)}
              </p>
              <p className="text-xs text-gray-500">
                Kilometer {worstSplitIndex + 1} of {splits.length}
              </p>
            </div>
          </div>
        )}

        {splits.length >= 3 && (
          <div className={`rounded-xl p-4 ${
            paceConsistency >= 95 ? "bg-green-50 border border-green-200" :
            paceConsistency >= 90 ? "bg-blue-50 border border-blue-200" :
            "bg-amber-50 border border-amber-200"
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  📊 Pace consistency: {paceConsistency.toFixed(0)}%
                </h3>
                <p className="text-xs text-gray-500">
                  {paceConsistency >= 95
                    ? "Excellent pace control. You ran very evenly."
                    : paceConsistency >= 90
                    ? "Good pacing control. Minor variations are normal."
                    : "Irregular pace. Try to maintain a more consistent effort to save energy."}
                </p>
              </div>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  paceConsistency >= 95 ? "bg-green-500" :
                  paceConsistency >= 90 ? "bg-blue-500" :
                  "bg-amber-500"
                }`}
                style={{ width: `${paceConsistency}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>Irregular</span>
              <span>Perfect</span>
            </div>
          </div>
        )}

        {cardiacDrift !== 0 && (
          <div className={`rounded-xl p-4 ${
            Math.abs(cardiacDrift) < 5 ? "bg-green-50 border border-green-200" :
            cardiacDrift > 10 ? "bg-red-50 border border-red-200" :
            "bg-amber-50 border border-amber-200"
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  ❤️ Cardiac drift: {cardiacDrift > 0 ? "+" : ""}{cardiacDrift.toFixed(1)}%
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  {Math.abs(cardiacDrift) < 5
                    ? "Your heart stayed stable during the effort. Sign of good aerobic fitness and proper hydration."
                    : cardiacDrift > 10
                    ? "Your HR increased significantly at the same effort. May indicate accumulated fatigue, dehydration, or heat."
                    : "Normal drift. Your HR increased moderately during the activity, which is physiological."}
                </p>
                <p className="text-[10px] text-gray-400 mb-3 italic">
                  * Compares post-warmup HR vs final segment (excludes initial warmup)
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">Post-warmup</p>
                    <p className="text-lg font-bold text-gray-600">{Math.round(earlyHR)}</p>
                    <p className="text-[10px] text-gray-400">bpm</p>
                  </div>
                  <div className="flex-1 flex items-center">
                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                    <svg className={`w-4 h-4 mx-1 ${cardiacDrift > 5 ? "text-red-500" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">Final segment</p>
                    <p className={`text-lg font-bold ${cardiacDrift > 5 ? "text-red-500" : "text-gray-700"}`}>{Math.round(finalHR)}</p>
                    <p className="text-[10px] text-gray-400">bpm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {gap > 0 && isRun && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⛰️</span>
                <h3 className="text-sm font-semibold text-gray-900">Grade Adjusted Pace (GAP)</h3>
              </div>
              <p className="text-2xl font-bold text-cyan-600 mb-1">
                {Math.floor(gap / 60)}:{String(Math.round(gap % 60)).padStart(2, '0')}/km
              </p>
              <p className="text-xs text-gray-500">
                Your pace if you had run on flat ground. Useful for comparing workouts with different elevation.
              </p>
            </div>
          )}

          {trainingLoad > 0 && (
            <div className={`rounded-xl p-4 ${
              trainingLoad > 150 ? "bg-red-50 border border-red-200" :
              trainingLoad > 100 ? "bg-amber-50 border border-amber-200" :
              "bg-gray-50 border border-gray-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💪</span>
                <h3 className="text-sm font-semibold text-gray-900">Training Load</h3>
              </div>
              <p className={`text-2xl font-bold mb-1 ${
                trainingLoad > 150 ? "text-red-500" :
                trainingLoad > 100 ? "text-amber-600" :
                "text-gray-700"
              }`}>
                {trainingLoad} points
              </p>
              <p className="text-xs text-gray-500">
                {trainingLoad < 50 ? "Active recovery session." :
                 trainingLoad < 80 ? "Easy session. Good for aerobic base." :
                 trainingLoad < 120 ? "Moderate session. Maintenance training." :
                 trainingLoad < 150 ? "Hard session. You'll need recovery." :
                 "Very demanding session. Rest well tomorrow."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
