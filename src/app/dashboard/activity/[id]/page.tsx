"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  useActivity,
  useActivityStreams,
  useActivityZones,
  useActivities,
} from "@/hooks/use-strava";
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatDateTime,
  getActivityIcon,
} from "@/lib/utils";
import { HeartRateZones } from "@/components/charts/heart-rate-zones";
import { ActivityStreamsChart } from "@/components/charts/activity-streams-chart";
import { ActivitySplits } from "@/components/activity-splits";
import { ActivityMap } from "@/components/activity-map";
import { ActivityAdvancedStats } from "@/components/activity-advanced-stats";

export default function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const activityId = parseInt(id);

  const { data: activity, isLoading: loadingActivity } = useActivity(activityId);
  const { data: streams, isLoading: loadingStreams } = useActivityStreams(activityId);
  const { data: zones, isLoading: loadingZones } = useActivityZones(activityId);
  const { data: activitiesData } = useActivities(100);
  const [showHRInfo, setShowHRInfo] = useState(false);

  // Find previous and next activities
  const allActivities = activitiesData?.pages?.flat() ?? [];
  const currentIndex = allActivities.findIndex(a => a.id === activityId);
  const prevActivity = currentIndex > 0 ? allActivities[currentIndex - 1] : null;
  const nextActivity = currentIndex < allActivities.length - 1 ? allActivities[currentIndex + 1] : null;

  if (loadingActivity) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-white rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Activity not found</p>
        <Link
          href="/dashboard/activities"
          className="text-cyan-600 hover:underline mt-2 inline-block"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isRun = activity.sport_type === "Run" || activity.sport_type === "VirtualRun";
  const isRide = activity.sport_type === "Ride" || activity.sport_type === "VirtualRide";

  // Calculate derived stats
  const pausedTime = activity.elapsed_time - activity.moving_time;
  const hasPausedTime = pausedTime > 60;
  const maxPaceOrSpeed = activity.max_speed > 0
    ? formatPace(activity.max_speed, activity.sport_type)
    : null;

  // Efficiency: meters per heartbeat (if HR data available)
  const efficiency = activity.average_heartrate && activity.average_heartrate > 0
    ? (activity.distance / (activity.average_heartrate * (activity.moving_time / 60))).toFixed(2)
    : null;

  // Vertical ratio: elevation gain per km
  const verticalRatio = activity.distance > 0 && activity.total_elevation_gain > 0
    ? ((activity.total_elevation_gain / (activity.distance / 1000))).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/dashboard/activities"
          className="inline-flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-gray-900 transition-colors text-xs sm:text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Activities</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {nextActivity ? (
            <Link
              href={`/dashboard/activity/${nextActivity.id}`}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors text-xs sm:text-sm cursor-pointer"
              title={nextActivity.name}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs sm:text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </span>
          )}
          {prevActivity ? (
            <Link
              href={`/dashboard/activity/${prevActivity.id}`}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors text-xs sm:text-sm cursor-pointer"
              title={prevActivity.name}
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs sm:text-sm">
              <span className="hidden sm:inline">Next</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>

      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl sm:text-2xl">
            {getActivityIcon(activity.sport_type)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {activity.name}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm truncate">
              {formatDateTime(activity.start_date_local)}
              {activity.device_name && (
                <span className="text-gray-400 hidden sm:inline"> · {activity.device_name}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {activity.achievement_count > 0 && (
              <span className="text-xs sm:text-sm text-yellow-500">🏆 {activity.achievement_count}</span>
            )}
            {activity.kudos_count > 0 && (
              <span className="text-xs sm:text-sm text-cyan-600">👍 {activity.kudos_count}</span>
            )}
          </div>
        </div>

        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          
          <div className="col-span-1 sm:col-span-2 bg-gray-100 rounded-lg p-2 sm:p-3">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Distance</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {formatDistance(activity.distance)}
            </p>
          </div>
          <div className="col-span-1 sm:col-span-2 bg-gray-100 rounded-lg p-2 sm:p-3">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Time</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {formatDuration(activity.moving_time)}
            </p>
            {hasPausedTime && (
              <p className="text-[9px] sm:text-[10px] text-gray-400">+{formatDuration(pausedTime)} paused</p>
            )}
          </div>
          <div className="col-span-1 sm:col-span-2 bg-gray-100 rounded-lg p-2 sm:p-3">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Pace</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {formatPace(activity.average_speed, activity.sport_type)}
            </p>
            {maxPaceOrSpeed && (
              <p className="text-[9px] sm:text-[10px] text-gray-400">Max: {maxPaceOrSpeed}</p>
            )}
          </div>
          <div className="col-span-1 sm:col-span-2 bg-gray-100 rounded-lg p-2 sm:p-3">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Elevation</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {Math.round(activity.total_elevation_gain)}m
            </p>
            {verticalRatio && (
              <p className="text-[9px] sm:text-[10px] text-gray-400">{verticalRatio} m/km</p>
            )}
          </div>

          
          {activity.average_heartrate && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Avg HR</p>
              <p className="text-lg font-bold text-red-500">
                {Math.round(activity.average_heartrate)}
              </p>
              <p className="text-[9px] text-gray-400">bpm</p>
            </div>
          )}
          {activity.max_heartrate && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Max HR</p>
              <p className="text-lg font-bold text-red-400">
                {Math.round(activity.max_heartrate)}
              </p>
              <p className="text-[9px] text-gray-400">bpm</p>
            </div>
          )}
          {activity.average_cadence && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Cadence</p>
              <p className="text-lg font-bold text-blue-500">
                {Math.round(isRun ? activity.average_cadence * 2 : activity.average_cadence)}
              </p>
              <p className="text-[9px] text-gray-400">{isRun ? 'ppm' : 'rpm'}</p>
            </div>
          )}
          {activity.average_watts && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Power</p>
              <p className="text-lg font-bold text-yellow-500">
                {Math.round(activity.average_watts)}
              </p>
              <p className="text-[9px] text-gray-400">W</p>
            </div>
          )}
          {activity.weighted_average_watts && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">NP</p>
              <p className="text-lg font-bold text-yellow-400">
                {Math.round(activity.weighted_average_watts)}
              </p>
              <p className="text-[9px] text-gray-400">W</p>
            </div>
          )}
          {activity.suffer_score && activity.suffer_score > 0 && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Effort</p>
              <p className="text-lg font-bold text-purple-500">
                {activity.suffer_score}
              </p>
              <p className="text-[9px] text-gray-400">RE</p>
            </div>
          )}
          {activity.kilojoules && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Energy</p>
              <p className="text-lg font-bold text-green-500">
                {Math.round(activity.kilojoules)}
              </p>
              <p className="text-[9px] text-gray-400">kJ</p>
            </div>
          )}
          {efficiency && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Efficiency</p>
              <p className="text-lg font-bold text-cyan-500">
                {efficiency}
              </p>
              <p className="text-[9px] text-gray-400">m/lat</p>
            </div>
          )}
          {activity.calories && activity.calories > 0 && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Calories</p>
              <p className="text-lg font-bold text-cyan-600">
                {Math.round(activity.calories)}
              </p>
              <p className="text-[9px] text-gray-400">kcal</p>
            </div>
          )}
          {activity.average_temp !== undefined && activity.average_temp !== null && (
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Temp</p>
              <p className="text-lg font-bold text-sky-500">
                {activity.average_temp}
              </p>
              <p className="text-[9px] text-gray-400">°C</p>
            </div>
          )}
        </div>
      </div>

      
      {(activity.map?.summary_polyline || (activity.best_efforts && activity.best_efforts.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {activity.map?.summary_polyline && (
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-cyan-500 rounded-full" />
                Route
              </h2>
              <ActivityMap polyline={activity.map.summary_polyline} />
            </div>
          )}

          
          {activity.best_efforts && activity.best_efforts.filter(e => !e.name.toLowerCase().includes('mile')).length > 0 && (
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-yellow-500 rounded-full" />
                Best Efforts
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activity.best_efforts.filter(e => !e.name.toLowerCase().includes('mile')).map((effort) => (
                  <div
                    key={effort.id}
                    className={`rounded-lg p-3 text-center ${
                      effort.pr_rank === 1
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p className="text-[10px] text-gray-500 uppercase truncate">{effort.name}</p>
                    <p
                      className={`text-lg font-bold ${effort.pr_rank === 1 ? 'text-yellow-500' : 'text-gray-900'}`}
                    >
                      {formatDuration(effort.moving_time)}
                    </p>
                    {effort.pr_rank === 1 && (
                      <span className="text-[9px] text-yellow-500">🏆 PR</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 relative">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-red-500 rounded-full" />
            Heart Rate Analysis
          </h2>
          <button
            onClick={() => setShowHRInfo(!showHRInfo)}
            className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Information"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </div>

        
        {showHRInfo && (
          <div className="absolute top-12 right-4 z-20 w-80 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">Heart Rate Analysis</p>
              <button onClick={() => setShowHRInfo(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-500">
              <div>
                <p className="font-medium text-gray-700 mb-1">HR Distribution</p>
                <p>Histogram showing how much time you spent in each heart rate range, colored by the corresponding zone.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">% of Max</p>
                <p>Percentage of your max HR reached during the activity. Useful for evaluating the real intensity of the effort.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Aerobic vs Anaerobic</p>
                <p><span className="text-green-600 font-medium">Aerobic (Z1-Z3)</span>: burns fat, improves base endurance. <span className="text-red-600 font-medium">Anaerobic (Z4-Z5)</span>: improves speed and max power.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">The 5 Zones</p>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  <div className="text-center">
                    <div className="w-full h-2 rounded bg-gray-400 mb-1"></div>
                    <span className="text-[9px]">Z1</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-2 rounded bg-green-500 mb-1"></div>
                    <span className="text-[9px]">Z2</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-2 rounded bg-yellow-500 mb-1"></div>
                    <span className="text-[9px]">Z3</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-2 rounded bg-orange-500 mb-1"></div>
                    <span className="text-[9px]">Z4</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-2 rounded bg-red-500 mb-1"></div>
                    <span className="text-[9px]">Z5</span>
                  </div>
                </div>
                <p className="mt-1 text-[10px]">80% of your training should be in Z1-Z2 for a solid base.</p>
              </div>
            </div>
          </div>
        )}

        {loadingZones ? (
          <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ) : zones && zones.length > 0 ? (
          <HeartRateZones zones={zones} streams={streams || undefined} compact />
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No zone data available</p>
        )}
      </div>

      
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-cyan-500 rounded-full" />
          Activity Profile
        </h2>
        {loadingStreams ? (
          <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ) : streams ? (
          <ActivityStreamsChart streams={streams} compact />
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No profile data available</p>
        )}
      </div>

      
      {activity.splits_metric && activity.splits_metric.length > 0 && (
        <ActivitySplits splits={activity.splits_metric} sportType={activity.sport_type} />
      )}

      
      <ActivityAdvancedStats activity={activity} streams={streams || undefined} />

      
      {activity.description && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-gray-400 rounded-full" />
            Description
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.description}</p>
        </div>
      )}

      
      <a
        href={`https://www.strava.com/activities/${activity.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-gray-500 hover:text-cyan-600 transition-colors cursor-pointer"
      >
        View on Strava →
      </a>
    </div>
  );
}
