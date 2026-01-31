"use client";

import type { MonthComparison } from "@/types/strava";

interface MonthComparisonProps {
  data: MonthComparison;
}

function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(0);
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
}

export function MonthComparisonCard({ data }: MonthComparisonProps) {
  const { thisMonth, lastMonth } = data;

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const now = new Date();
  const currentMonthName = now.toLocaleDateString("en-US", { month: "short" });
  const lastMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("en-US", { month: "short" });

  const stats = [
    {
      label: "Distance",
      current: formatDistance(thisMonth.distance) + " km",
      previous: formatDistance(lastMonth.distance) + " km",
      change: calculateChange(thisMonth.distance, lastMonth.distance),
      icon: "📏",
    },
    {
      label: "Time",
      current: formatTime(thisMonth.time),
      previous: formatTime(lastMonth.time),
      change: calculateChange(thisMonth.time, lastMonth.time),
      icon: "⏱️",
    },
    {
      label: "Activities",
      current: thisMonth.activities.toString(),
      previous: lastMonth.activities.toString(),
      change: calculateChange(thisMonth.activities, lastMonth.activities),
      icon: "🏃",
    },
    {
      label: "Elevation",
      current: Math.round(thisMonth.elevation) + " m",
      previous: Math.round(lastMonth.elevation) + " m",
      change: calculateChange(thisMonth.elevation, lastMonth.elevation),
      icon: "⛰️",
    },
  ];

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-purple-500" />
        <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
          {currentMonthName} vs {lastMonthName}
        </h3>
      </div>

      <div className="flex-1 space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-lg p-2 sm:p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{stat.icon}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase">{stat.label}</span>
              </div>
              <span
                className={`text-xs sm:text-sm font-semibold ${
                  stat.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.change >= 0 ? "+" : ""}{stat.change.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {stat.current}
                </p>
                <p className="text-[9px] sm:text-[10px] text-gray-400">{currentMonthName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm sm:text-base text-gray-500">{stat.previous}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-400">{lastMonthName}</p>
              </div>
            </div>

            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${stat.change >= 0 ? "bg-green-500" : "bg-red-500"}`}
                style={{
                  width: `${Math.min(100, Math.abs(stat.change))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
