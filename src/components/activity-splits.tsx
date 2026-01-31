"use client";

import type { StravaSplit } from "@/types/strava";

interface ActivitySplitsProps {
  splits: StravaSplit[];
  sportType: string;
}

export function ActivitySplits({ splits, sportType }: ActivitySplitsProps) {
  if (!splits || splits.length === 0) {
    return null;
  }

  const isRun = sportType === "Run" || sportType === "VirtualRun";

  const avgPace = splits.reduce((sum, s) => sum + s.average_speed, 0) / splits.length;
  const paces = splits.map(s => s.average_speed);
  const fastestPace = Math.max(...paces);
  const slowestPace = Math.min(...paces);

  const formatPace = (speed: number): string => {
    if (speed === 0) return "-";
    if (isRun) {
      const paceSeconds = 1000 / speed;
      const mins = Math.floor(paceSeconds / 60);
      const secs = Math.round(paceSeconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${(speed * 3.6).toFixed(1)}`;
    }
  };

  const getPaceColor = (speed: number): string => {
    if (speed === fastestPace) return "text-green-500";
    if (speed === slowestPace) return "text-red-400";
    if (speed > avgPace) return "text-green-500";
    if (speed < avgPace) return "text-orange-500";
    return "text-gray-900";
  };

  const getPaceBarWidth = (speed: number): number => {
    if (fastestPace === slowestPace) return 50;
    return 20 + ((speed - slowestPace) / (fastestPace - slowestPace)) * 80;
  };

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4">
      <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
        <span className="w-1 h-4 bg-blue-500 rounded-full" />
        Splits per Kilometer
      </h2>

      <div className="space-y-1 sm:space-y-1.5">
        {splits.map((split, idx) => (
          <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
            
            <div className="w-6 sm:w-8 text-right flex-shrink-0">
              <span className="text-[10px] sm:text-xs text-gray-500">{split.split}</span>
            </div>

            
            <div className="flex-1 h-5 sm:h-6 bg-gray-50 rounded overflow-hidden relative min-w-0">
              <div
                className={`h-full rounded transition-all ${
                  split.average_speed === fastestPace
                    ? "bg-green-100"
                    : split.average_speed === slowestPace
                    ? "bg-red-50"
                    : "bg-gray-100"
                }`}
                style={{ width: `${getPaceBarWidth(split.average_speed)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-1.5 sm:px-2">
                <span className={`text-[10px] sm:text-xs font-semibold ${getPaceColor(split.average_speed)}`}>
                  {formatPace(split.average_speed)}
                </span>
                <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] text-gray-500">
                  {split.elevation_difference !== 0 && (
                    <span className={split.elevation_difference > 0 ? "text-orange-500" : "text-green-500"}>
                      {split.elevation_difference > 0 ? "+" : ""}{Math.round(split.elevation_difference)}m
                    </span>
                  )}
                  {split.average_heartrate && (
                    <span className="text-red-400 hidden sm:inline">
                      {Math.round(split.average_heartrate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-around text-center">
        <div>
          <p className="text-[9px] text-gray-400 uppercase">Fastest</p>
          <p className="text-sm font-bold text-green-500">
            {formatPace(fastestPace)} {isRun ? "/km" : "km/h"}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase">Average</p>
          <p className="text-sm font-bold text-gray-900">
            {formatPace(avgPace)} {isRun ? "/km" : "km/h"}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase">Slowest</p>
          <p className="text-sm font-bold text-red-400">
            {formatPace(slowestPace)} {isRun ? "/km" : "km/h"}
          </p>
        </div>
      </div>
    </div>
  );
}
