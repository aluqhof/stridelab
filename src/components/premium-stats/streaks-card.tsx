"use client";

import { useState } from "react";
import type { StreakData, PeriodComparison } from "@/types/strava";

interface StreaksCardProps {
  streaks: StreakData;
  comparison: PeriodComparison;
}

export function StreaksCard({ streaks, comparison }: StreaksCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <h3 className="text-base text-gray-500 uppercase tracking-wider font-bold">
            Consistency
          </h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
      </div>

      {showInfo && (
        <div className="absolute top-14 right-4 z-10 w-56 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold text-gray-900">Consistency Score</p>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="text-[11px] text-gray-500 space-y-1.5">
            <li>Measures your <strong className="text-gray-700">training regularity</strong></li>
            <li>Based on frequency and streaks</li>
            <li className="pt-1 border-t border-gray-200">
              <span className="text-green-500">75+</span> Excellent
            </li>
            <li><span className="text-yellow-500">50-74</span> Good</li>
            <li><span className="text-red-500">&lt;50</span> Needs Work</li>
          </ul>
        </div>
      )}

      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Streak</p>
          <p className="text-lg sm:text-xl font-bold text-cyan-600">
            {streaks.currentStreak}
          </p>
          <p className="text-[9px] sm:text-[10px] text-gray-400">days</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Record</p>
          <p className="text-lg sm:text-xl font-bold text-yellow-500">
            {streaks.longestStreak}
          </p>
          <p className="text-[9px] sm:text-[10px] text-gray-400">days</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Week</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {streaks.thisWeekActivities}
          </p>
          <p className="text-[9px] sm:text-[10px] text-gray-400">acts</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Score</p>
          <p
            className={`text-lg sm:text-xl font-bold ${streaks.consistencyScore >= 75 ? 'text-green-500' : streaks.consistencyScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}
          >
            {streaks.consistencyScore}
          </p>
          <p className="text-[9px] sm:text-[10px] text-gray-400">/100</p>
        </div>
      </div>

      
      <div className="border-t border-gray-200 pt-3">
        <p className="text-[10px] text-gray-500 uppercase mb-2">vs Last Month</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Distance</p>
            <p className={`text-sm font-semibold ${comparison.distanceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {comparison.distanceChange >= 0 ? '+' : ''}{comparison.distanceChange}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Time</p>
            <p className={`text-sm font-semibold ${comparison.timeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {comparison.timeChange >= 0 ? '+' : ''}{comparison.timeChange}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Activities</p>
            <p className={`text-sm font-semibold ${comparison.activitiesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {comparison.activitiesChange >= 0 ? '+' : ''}{comparison.activitiesChange}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
