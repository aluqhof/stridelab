"use client";

import type { TimeOfDayStats, DayOfWeekStats } from "@/types/strava";

interface TimeAnalysisProps {
  timeOfDay: TimeOfDayStats[];
  dayOfWeek: DayOfWeekStats[];
}

function formatPace(paceSeconds: number): string {
  if (paceSeconds === 0) return "-";
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.round(paceSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TimeAnalysis({ timeOfDay, dayOfWeek }: TimeAnalysisProps) {
  // Find best time of day (most activities and best pace)
  const bestTimeOfDay = timeOfDay.reduce(
    (best, current) => {
      if (current.count > best.count) return current;
      return best;
    },
    { hour: 0, count: 0, avgPace: 0, avgHR: 0 }
  );

  const fastestTimeOfDay = timeOfDay.reduce(
    (best, current) => {
      if (current.avgPace > 0 && (best.avgPace === 0 || current.avgPace < best.avgPace)) {
        return current;
      }
      return best;
    },
    { hour: 0, count: 0, avgPace: 0, avgHR: 0 }
  );

  // Find best day of week
  const bestDayOfWeek = dayOfWeek.reduce(
    (best, current) => {
      if (current.count > best.count) return current;
      return best;
    },
    { day: 0, dayName: "", count: 0, distance: 0, avgPace: 0 }
  );

  const maxCount = Math.max(...timeOfDay.map((t) => t.count), 1);
  const maxDayCount = Math.max(...dayOfWeek.map((d) => d.count), 1);

  const formatHour = (hour: number): string => {
    if (hour === 0) return "12am";
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return "12pm";
    return `${hour - 12}pm`;
  };

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-cyan-500" />
        <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
          Training Patterns
        </h3>
      </div>

      
      <div className="mb-4">
        <p className="text-[10px] text-gray-500 uppercase mb-2">Time of day</p>
        <div className="flex items-end gap-0.5 h-12 sm:h-16">
          {Array.from({ length: 24 }, (_, hour) => {
            const data = timeOfDay.find((t) => t.hour === hour);
            const count = data?.count || 0;
            const heightPct = (count / maxCount) * 100;
            const isBest = data?.hour === bestTimeOfDay.hour && count > 0;
            const isFastest = data?.hour === fastestTimeOfDay.hour && data?.avgPace > 0;

            return (
              <div
                key={hour}
                className="flex-1 flex flex-col items-center justify-end"
                title={count > 0 ? `${formatHour(hour)}: ${count} activities` : ""}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isBest
                      ? "bg-cyan-500"
                      : isFastest
                      ? "bg-green-500"
                      : count > 0
                      ? "bg-gray-300"
                      : "bg-gray-100"
                  }`}
                  style={{ height: `${Math.max(heightPct, count > 0 ? 10 : 0)}%`, minHeight: count > 0 ? "2px" : "0" }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[8px] text-gray-400 mt-1">
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>12am</span>
        </div>
      </div>

      
      <div className="mb-4">
        <p className="text-[10px] text-gray-500 uppercase mb-2">Day of week</p>
        <div className="grid grid-cols-7 gap-1">
          {dayOfWeek.map((day) => {
            const heightPct = (day.count / maxDayCount) * 100;
            const isBest = day.dayName === bestDayOfWeek.dayName;

            return (
              <div key={day.day} className="flex flex-col items-center">
                <div className="w-full h-10 sm:h-12 flex items-end">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isBest ? "bg-cyan-500" : day.count > 0 ? "bg-gray-300" : "bg-gray-100"
                    }`}
                    style={{ height: `${Math.max(heightPct, day.count > 0 ? 10 : 0)}%` }}
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] text-gray-500 mt-1">{day.dayName}</span>
                <span className="text-[8px] text-gray-400">{day.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      
      <div className="mt-auto pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-[9px] text-gray-500 uppercase">Best hour</p>
          <p className="text-sm font-bold text-cyan-600">
            {formatHour(bestTimeOfDay.hour)}
          </p>
          <p className="text-[9px] text-gray-400">{bestTimeOfDay.count} workouts</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-[9px] text-gray-500 uppercase">Fastest</p>
          <p className="text-sm font-bold text-green-600">
            {formatHour(fastestTimeOfDay.hour)}
          </p>
          <p className="text-[9px] text-gray-400">{formatPace(fastestTimeOfDay.avgPace)} /km</p>
        </div>
      </div>
    </div>
  );
}
