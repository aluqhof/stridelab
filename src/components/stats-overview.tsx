"use client";

import { useStats } from "@/hooks/use-strava";
import { formatDistance, formatDuration, formatElevation } from "@/lib/utils";

export function StatsOverview() {
  const { data: stats, isLoading, error } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-red-400">Error loading statistics</p>
      </div>
    );
  }

  const ytdTotals = {
    distance:
      stats.ytd_ride_totals.distance +
      stats.ytd_run_totals.distance +
      stats.ytd_swim_totals.distance,
    time:
      stats.ytd_ride_totals.moving_time +
      stats.ytd_run_totals.moving_time +
      stats.ytd_swim_totals.moving_time,
    elevation:
      stats.ytd_ride_totals.elevation_gain +
      stats.ytd_run_totals.elevation_gain,
    activities:
      stats.ytd_ride_totals.count +
      stats.ytd_run_totals.count +
      stats.ytd_swim_totals.count,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <span className="text-[10px] text-gray-500 uppercase">Year Distance</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatDistance(ytdTotals.distance)}
        </p>
        <p className="text-[10px] text-gray-400">
          {ytdTotals.activities} activities
        </p>
      </div>

      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] text-gray-500 uppercase">Year Time</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatDuration(ytdTotals.time)}
        </p>
        <p className="text-[10px] text-gray-400">
          moving time
        </p>
      </div>

      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] text-gray-500 uppercase">Year Elevation</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatElevation(ytdTotals.elevation)}
        </p>
        <p className="text-[10px] text-gray-400">
          cumulative
        </p>
      </div>

      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span className="text-[10px] text-gray-500 uppercase">By Sport</span>
        </div>
        <div className="space-y-1">
          {stats.ytd_run_totals.count > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">🏃 Running</span>
              <span className="text-gray-900 font-semibold">{formatDistance(stats.ytd_run_totals.distance)}</span>
            </div>
          )}
          {stats.ytd_ride_totals.count > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">🚴 Cycling</span>
              <span className="text-gray-900 font-semibold">{formatDistance(stats.ytd_ride_totals.distance)}</span>
            </div>
          )}
          {stats.ytd_swim_totals.count > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">🏊 Swimming</span>
              <span className="text-gray-900 font-semibold">{formatDistance(stats.ytd_swim_totals.distance)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
