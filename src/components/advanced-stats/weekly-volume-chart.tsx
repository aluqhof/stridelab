"use client";

import { useState } from "react";
import type { WeeklyTrendData } from "@/types/strava";

interface WeeklyVolumeChartProps {
  data: WeeklyTrendData[];
}

export function WeeklyVolumeChart({ data }: WeeklyVolumeChartProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  const maxDistance = Math.max(...data.map((d) => d.distance));

  // Calculate trend
  const recentAvg = data.slice(-4).reduce((sum, d) => sum + d.distance, 0) / 4;
  const olderAvg = data.slice(0, 4).reduce((sum, d) => sum + d.distance, 0) / 4;
  const trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  const selected = selectedIdx !== null ? data[selectedIdx] : null;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
            Weekly Volume
          </h3>
        </div>
        <div className={`text-xs sm:text-sm font-semibold ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
          {trend >= 0 ? "+" : ""}{trend.toFixed(0)}%
        </div>
      </div>

      
      <div className="h-6 mb-1 text-center">
        {selected ? (
          <span className="text-sm">
            <span className="text-blue-600 font-bold">{(selected.distance / 1000).toFixed(1)} km</span>
            <span className="text-gray-500 ml-2">{selected.activities} acts · {Math.round(selected.elevation)}m ↑</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">Tap a bar to see details</span>
        )}
      </div>

      
      <div className="flex items-end gap-1 h-20">
        {data.map((week, idx) => {
          const heightPercent = maxDistance > 0 ? (week.distance / maxDistance) * 100 : 0;
          const isSelected = selectedIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full cursor-pointer"
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
              onMouseEnter={() => setSelectedIdx(idx)}
              onMouseLeave={() => setSelectedIdx(null)}
            >
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t transition-all ${
                    isSelected
                      ? "bg-blue-500"
                      : "bg-blue-400 hover:bg-blue-500"
                  }`}
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                />
              </div>
              <span className={`text-[8px] mt-1 ${isSelected ? "text-blue-600" : "text-gray-400"}`}>
                {week.week}
              </span>
            </div>
          );
        })}
      </div>

      
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 text-[10px]">
        <span className="text-gray-500">Avg: <span className="text-gray-900 font-semibold">{(data.reduce((sum, d) => sum + d.distance, 0) / data.length / 1000).toFixed(0)} km</span></span>
        <span className="text-gray-500">Max: <span className="text-blue-600 font-semibold">{(maxDistance / 1000).toFixed(0)} km</span></span>
        <span className="text-gray-500">Total: <span className="text-gray-900 font-semibold">{(data.reduce((sum, d) => sum + d.distance, 0) / 1000).toFixed(0)} km</span></span>
      </div>
    </div>
  );
}
