"use client";

import type { StravaActivity } from "@/types/strava";
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatDateTime,
  getActivityIcon,
} from "@/lib/utils";
import Link from "next/link";

interface ActivityCardProps {
  activity: StravaActivity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const isRun = activity.sport_type === "Run" || activity.sport_type === "VirtualRun";
  const isRide = activity.sport_type === "Ride" || activity.sport_type === "VirtualRide";

  const pausedTime = activity.elapsed_time - activity.moving_time;
  const hasPausedTime = pausedTime > 60;

  const maxPaceOrSpeed = activity.max_speed > 0
    ? formatPace(activity.max_speed, activity.sport_type)
    : null;

  return (
    <Link
      href={`/dashboard/activity/${activity.id}`}
      className="group block relative bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-200 overflow-hidden hover:shadow-md"
    >
      
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-3 pl-4">
        <div className="flex items-center gap-3">
          
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            {getActivityIcon(activity.sport_type)}
          </div>

          <div className="flex-1 min-w-0">
            
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-cyan-600 transition-colors">
                {activity.name}
              </h3>
              <span className="flex-shrink-0 text-[10px] text-gray-500">
                {formatDateTime(activity.start_date_local)}
              </span>
            </div>

            
            <div className="flex items-center gap-2 sm:gap-3 text-xs mb-1.5 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">📏</span>
                <span className="font-semibold text-gray-900">{formatDistance(activity.distance)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">⏱️</span>
                <span className="font-semibold text-gray-900">{formatDuration(activity.moving_time)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">{isRide ? '⚡' : '👟'}</span>
                <span className="font-semibold text-gray-900">{formatPace(activity.average_speed, activity.sport_type)}</span>
              </div>
              {activity.total_elevation_gain > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">⛰️</span>
                  <span className="font-semibold text-gray-900">{Math.round(activity.total_elevation_gain)}m</span>
                </div>
              )}
            </div>

            
            <div className="flex items-center gap-2 flex-wrap">
              
              {activity.average_heartrate && (
                <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[10px] text-gray-500">
                    {Math.round(activity.average_heartrate)}
                    {activity.max_heartrate && (
                      <span className="text-gray-400">/{Math.round(activity.max_heartrate)}</span>
                    )}
                    <span className="text-gray-400 ml-0.5">bpm</span>
                  </span>
                </div>
              )}

              
              {activity.average_cadence && (
                <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-gray-500">
                    {Math.round(isRun ? activity.average_cadence * 2 : activity.average_cadence)}
                    <span className="text-gray-400 ml-0.5">{isRun ? 'ppm' : 'rpm'}</span>
                  </span>
                </div>
              )}

              
              {maxPaceOrSpeed && (
                <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <span className="text-[10px] text-gray-500">
                    max {maxPaceOrSpeed}
                  </span>
                </div>
              )}

              
              {activity.average_watts && (
                <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <span className="text-[10px] text-gray-500">
                    {Math.round(activity.average_watts)}
                    {activity.max_watts && (
                      <span className="text-gray-400">/{Math.round(activity.max_watts)}</span>
                    )}
                    <span className="text-gray-400 ml-0.5">W</span>
                  </span>
                </div>
              )}

              
              {activity.suffer_score && activity.suffer_score > 0 && (
                <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="text-[10px] text-gray-500">
                    {activity.suffer_score}
                    <span className="text-gray-400 ml-0.5">SS</span>
                  </span>
                </div>
              )}

              
              {hasPausedTime && (
                <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span className="text-[10px] text-gray-400">
                    +{formatDuration(pausedTime)} paused
                  </span>
                </div>
              )}

              
              {(activity.kudos_count > 0 || activity.achievement_count > 0) && (
                <div className="flex items-center gap-1.5 ml-auto">
                  {activity.achievement_count > 0 && (
                    <span className="text-[10px] text-yellow-500">
                      🏆 {activity.achievement_count}
                    </span>
                  )}
                  {activity.kudos_count > 0 && (
                    <span className="text-[10px] text-cyan-600">
                      👍 {activity.kudos_count}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
