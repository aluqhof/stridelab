"use client";

import { useBestEfforts } from "@/hooks/use-strava";
import Link from "next/link";

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Map Strava distance names to display names (km only)
const DISTANCE_DISPLAY: Record<string, string> = {
  "400m": "400m",
  "1k": "1K",
  "5k": "5K",
  "10k": "10K",
  "15k": "15K",
  "20k": "20K",
  "Half-Marathon": "21K",
  "30k": "30K",
  "Marathon": "42K",
};

export function PRProgressionChart() {
  const { data, isLoading, error } = useBestEfforts();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-sm">Loading PRs...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">Error loading PRs</p>
      </div>
    );
  }

  // Filter to only show km-based distances
  const filteredRecords = data.personalRecords.filter(
    (pr) => DISTANCE_DISPLAY[pr.distance]
  );

  if (filteredRecords.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">No PRs recorded</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
            Personal Records
          </h3>
        </div>
        <span className="text-[10px] text-gray-400">
          {data.activitiesScanned} acts
        </span>
      </div>

      
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {filteredRecords.map((pr) => (
          <Link
            key={pr.distance}
            href={`/dashboard/activity/${pr.activityId}`}
            className="block rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 text-lg">🏆</span>
                <div>
                  <p className="text-xs text-gray-500">
                    {DISTANCE_DISPLAY[pr.distance] || pr.distance}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {formatTime(pr.time)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {new Date(pr.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </p>
                <p className="text-[9px] text-gray-400 truncate max-w-[80px]">
                  {pr.activityName}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
