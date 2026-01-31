"use client";

import type { PersonalRecord } from "@/types/strava";
import { formatRaceTime } from "@/lib/utils";

interface PersonalRecordsProps {
  records: PersonalRecord[];
}

// Display names for distances (miles converted to km)
const DISTANCE_LABELS: Record<string, string> = {
  "400m": "400m",
  "1/2 mile": "800m",
  "1k": "1K",
  "1 mile": "1.6K",
  "2 mile": "3.2K",
  "5k": "5K",
  "10k": "10K",
  "15k": "15K",
  "10 mile": "16K",
  "20k": "20K",
  "Half-Marathon": "21K",
  "30k": "30K",
  "Marathon": "42K",
};

export function PersonalRecords({ records }: PersonalRecordsProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">No PRs recorded in the last 90 days.</p>
      </div>
    );
  }

  const displayRecords = records;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-yellow-500" />
        <h3 className="text-base text-gray-500 uppercase tracking-wider font-bold">
          Personal Records
        </h3>
      </div>

      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 auto-rows-fr">
        {displayRecords.map((pr) => (
          <div
            key={pr.distance}
            className={`rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center relative ${
              pr.isPR
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-gray-100 border border-gray-200"
            }`}
          >
            {pr.isPR && (
              <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 text-[10px] sm:text-xs bg-yellow-500 text-white font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-lg">
                PR
              </span>
            )}
            <p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${
              pr.isPR ? "text-yellow-600" : "text-gray-500"
            }`}>
              {DISTANCE_LABELS[pr.distance] || pr.distance}
            </p>
            <p className={`text-2xl sm:text-3xl font-bold ${pr.isPR ? "text-gray-900" : "text-gray-800"}`}>
              {formatRaceTime(pr.time)}
            </p>
            <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${pr.isPR ? "text-yellow-500" : "text-gray-400"}`}>
              {new Date(pr.date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "2-digit"
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
