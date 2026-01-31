"use client";

import { useActivities } from "@/hooks/use-strava";
import { formatDistance, formatDuration } from "@/lib/utils";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";

export function RecentStats() {
  const { data, isLoading } = useActivities(100);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white animate-pulse" />
        ))}
      </div>
    );
  }

  const activities = data?.pages.flat() ?? [];
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const thisWeek = activities.filter((a) =>
    isAfter(new Date(a.start_date_local), weekStart)
  );

  const thisMonth = activities.filter((a) =>
    isAfter(new Date(a.start_date_local), monthStart)
  );

  const weekStats = {
    count: thisWeek.length,
    distance: thisWeek.reduce((sum, a) => sum + a.distance, 0),
    time: thisWeek.reduce((sum, a) => sum + a.moving_time, 0),
    elevation: thisWeek.reduce((sum, a) => sum + a.total_elevation_gain, 0),
  };

  const monthStats = {
    count: thisMonth.length,
    distance: thisMonth.reduce((sum, a) => sum + a.distance, 0),
    time: thisMonth.reduce((sum, a) => sum + a.moving_time, 0),
    elevation: thisMonth.reduce((sum, a) => sum + a.total_elevation_gain, 0),
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <span className="text-[10px] text-gray-500 uppercase">Week</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatDistance(weekStats.distance)}
        </p>
        <p className="text-[10px] text-gray-400">
          {weekStats.count} acts · {formatDuration(weekStats.time)}
        </p>
      </div>

      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] text-gray-500 uppercase">Elev. Wk</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {Math.round(weekStats.elevation)}m
        </p>
        <p className="text-[10px] text-gray-400">
          cumulative
        </p>
      </div>

      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] text-gray-500 uppercase">Month</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatDistance(monthStats.distance)}
        </p>
        <p className="text-[10px] text-gray-400">
          {monthStats.count} acts · {formatDuration(monthStats.time)}
        </p>
      </div>

      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span className="text-[10px] text-gray-500 uppercase">Elev. Mo</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {Math.round(monthStats.elevation)}m
        </p>
        <p className="text-[10px] text-gray-400">
          cumulative
        </p>
      </div>
    </div>
  );
}
