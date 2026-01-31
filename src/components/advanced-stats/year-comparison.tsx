"use client";

import type { YearComparison } from "@/types/strava";

interface YearComparisonProps {
  data: YearComparison;
}

function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(0);
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
}

export function YearComparisonCard({ data }: YearComparisonProps) {
  const { thisYear, lastYear } = data;

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const stats = [
    {
      label: "Distance",
      current: formatDistance(thisYear.distance) + " km",
      previous: formatDistance(lastYear.distance) + " km",
      change: calculateChange(thisYear.distance, lastYear.distance),
      icon: "📏",
    },
    {
      label: "Time",
      current: formatTime(thisYear.time),
      previous: formatTime(lastYear.time),
      change: calculateChange(thisYear.time, lastYear.time),
      icon: "⏱️",
    },
    {
      label: "Activities",
      current: thisYear.activities.toString(),
      previous: lastYear.activities.toString(),
      change: calculateChange(thisYear.activities, lastYear.activities),
      icon: "🏃",
    },
    {
      label: "Elevation",
      current: Math.round(thisYear.elevation) + " m",
      previous: Math.round(lastYear.elevation) + " m",
      change: calculateChange(thisYear.elevation, lastYear.elevation),
      icon: "⛰️",
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-purple-500" />
        <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
          {currentYear} vs {currentYear - 1}
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
                <p className="text-[9px] sm:text-[10px] text-gray-400">{currentYear}</p>
              </div>
              <div className="text-right">
                <p className="text-sm sm:text-base text-gray-500">{stat.previous}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-400">{currentYear - 1}</p>
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
