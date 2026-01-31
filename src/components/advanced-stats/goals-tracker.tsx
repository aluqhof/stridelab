"use client";

import { useState } from "react";
import type { TrainingGoal } from "@/types/strava";

interface GoalsTrackerProps {
  goals: TrainingGoal[];
}

function formatValue(value: number, type: TrainingGoal["type"]): string {
  switch (type) {
    case "weekly_distance":
    case "monthly_distance":
      return `${(value / 1000).toFixed(1)} km`;
    case "weekly_time":
      const hours = Math.floor(value / 3600);
      const mins = Math.floor((value % 3600) / 60);
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    case "weekly_activities":
      return value.toString();
    default:
      return value.toString();
  }
}

function getGoalIcon(type: TrainingGoal["type"]): string {
  switch (type) {
    case "weekly_distance":
    case "monthly_distance":
      return "📏";
    case "weekly_time":
      return "⏱️";
    case "weekly_activities":
      return "🏃";
    default:
      return "🎯";
  }
}

function getGoalColor(progress: number): string {
  if (progress >= 100) return "bg-green-500";
  if (progress >= 75) return "bg-blue-500";
  if (progress >= 50) return "bg-yellow-500";
  return "bg-cyan-500";
}

export function GoalsTracker({ goals }: GoalsTrackerProps) {
  const [showInfo, setShowInfo] = useState(false);

  if (!goals || goals.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">No goals configured</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 h-full flex flex-col relative">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-cyan-500" />
        <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
          Goals
        </h3>
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
        <div className="absolute top-12 left-4 z-10 w-64 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold text-gray-900">How are they calculated?</p>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mb-2">
            Goals are automatically generated based on your recent activity:
          </p>
          <ul className="text-[11px] text-gray-500 space-y-1">
            <li className="flex gap-2">
              <span className="text-cyan-600">•</span>
              <span>Average of the last 4 weeks</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">•</span>
              <span>+10% to encourage progressive improvement</span>
            </li>
          </ul>
        </div>
      )}

      <div className="flex-1 space-y-3">
        {goals.map((goal) => {
          const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
          const isCompleted = progress >= 100;

          return (
            <div
              key={goal.id}
              className={`rounded-lg p-3 transition-all ${
                isCompleted
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">{getGoalIcon(goal.type)}</span>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase">{goal.period}</p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {goal.type === "weekly_distance" && "Distance"}
                      {goal.type === "weekly_time" && "Time"}
                      {goal.type === "weekly_activities" && "Activities"}
                      {goal.type === "monthly_distance" && "Monthly distance"}
                    </p>
                  </div>
                </div>
                {isCompleted && <span className="text-lg">✅</span>}
              </div>

              
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${getGoalColor(progress)}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-900 font-semibold">
                  {formatValue(goal.current, goal.type)}
                </span>
                <span className="text-gray-500">
                  / {formatValue(goal.target, goal.type)}
                </span>
                <span
                  className={`font-semibold ${
                    isCompleted ? "text-green-500" : progress >= 75 ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      
      {goals.some((g) => (g.current / g.target) * 100 < 50) && (
        <div className="mt-3 p-2 bg-cyan-50 rounded-lg">
          <p className="text-[10px] sm:text-xs text-cyan-600">
            Come on! You still have time to reach your goals this week.
          </p>
        </div>
      )}

      {goals.every((g) => (g.current / g.target) * 100 >= 100) && (
        <div className="mt-3 p-2 bg-green-50 rounded-lg">
          <p className="text-[10px] sm:text-xs text-green-600">
            Amazing! You've completed all your goals.
          </p>
        </div>
      )}
    </div>
  );
}
