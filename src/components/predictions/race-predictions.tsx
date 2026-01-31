"use client";

import { useState } from "react";
import type { PredictionAdjustment, TrainingContext } from "@/types/strava";
import { formatRaceTime } from "@/lib/utils";

interface RacePredictionsProps {
  predictions: Record<string, number>;
  adjustments: Record<string, PredictionAdjustment>;
  trainingContext: TrainingContext;
  effortsUsed: number;
}

const RACE_DATA: Record<string, { icon: string; distance: number; color: string }> = {
  "5K": { icon: "🏃", distance: 5, color: "from-green-100 to-green-50" },
  "10K": { icon: "🏃‍♂️", distance: 10, color: "from-blue-100 to-blue-50" },
  "Half Marathon": { icon: "🥈", distance: 21.1, color: "from-teal-100 to-teal-50" },
  "Marathon": { icon: "🏅", distance: 42.2, color: "from-red-100 to-red-50" },
};

// Format pace from total seconds and distance
function formatPace(totalSeconds: number, distanceKm: number): string {
  const paceSeconds = totalSeconds / distanceKm;
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.round(paceSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function RacePredictions({
  predictions,
  adjustments,
  trainingContext,
  effortsUsed
}: RacePredictionsProps) {
  const [showInfo, setShowInfo] = useState(false);

  if (Object.keys(predictions).length === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-gray-500 text-sm">
          Not enough running data to predict times.
          <br />
          <span className="text-gray-400 text-xs">You need at least one run of 3km or more.</span>
        </p>
      </div>
    );
  }

  const weeklyKm = (trainingContext.weeklyVolume / 1000).toFixed(0);
  const longestKm = (trainingContext.longestRecentRun / 1000).toFixed(0);

  // Collect all adjustment reasons
  const allReasons: string[] = [];
  for (const adj of Object.values(adjustments)) {
    if (adj.reasons) {
      allReasons.push(...adj.reasons);
    }
  }
  const uniqueReasons = [...new Set(allReasons)];

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <h3 className="text-base text-gray-500 uppercase tracking-wider font-bold">
            Predictions
          </h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Information"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
      </div>

      
      {showInfo && (
        <div className="absolute top-14 right-4 z-10 w-72 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold text-gray-900">How is it calculated?</p>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-[11px] text-gray-500 space-y-2">
            <p><strong className="text-gray-700">Methodology (similar to Garmin):</strong></p>
            <ul className="space-y-0.5 mb-1">
              <li>- 60% VDOT (Jack Daniels)</li>
              <li>- 40% Optimized Riegel</li>
              <li>- Based on {effortsUsed} best effort{effortsUsed !== 1 ? 's' : ''}</li>
            </ul>

            <div className="border-t border-gray-200 pt-2">
              <p className="text-gray-400 mb-1">Your current context:</p>
              <ul className="space-y-1">
                <li>- TSB (form): <span className={trainingContext.tsb >= 0 ? 'text-green-500' : 'text-orange-500'}>{trainingContext.tsb > 0 ? '+' : ''}{trainingContext.tsb.toFixed(0)}</span></li>
                <li>- Volume: <span className="text-gray-700">{weeklyKm} km/week</span></li>
                <li>- Long run: <span className="text-gray-700">{longestKm} km</span></li>
                <li>- Frequency: <span className="text-gray-700">{trainingContext.runsPerWeek.toFixed(1)} runs/week</span></li>
              </ul>
            </div>

            {uniqueReasons.length > 0 && (
              <div className="border-t border-gray-200 pt-2">
                <p className="text-gray-400 mb-1">Adjustments applied:</p>
                <ul className="space-y-0.5">
                  {uniqueReasons.slice(0, 4).map((reason, i) => (
                    <li key={i} className={reason.includes('+') ? 'text-green-500' : 'text-orange-500'}>
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-2 gap-2">
        {Object.entries(predictions).map(([race, time]) => {
          const raceInfo = RACE_DATA[race] || { icon: "🏃", distance: 5, color: "from-gray-100 to-gray-50" };
          const pace = formatPace(time, raceInfo.distance);
          const speedKmh = (raceInfo.distance / (time / 3600)).toFixed(1);

          return (
            <div
              key={race}
              className={`bg-gradient-to-br ${raceInfo.color} rounded-lg p-3 border border-gray-200`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{raceInfo.icon}</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">{race}</p>
                  <p className="text-[10px] text-gray-400">{raceInfo.distance} km</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatRaceTime(time)}
              </p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">
                  <span className="text-gray-500">{pace}</span> /km
                </span>
                <span className="text-gray-400">
                  <span className="text-gray-500">{speedKmh}</span> km/h
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
