"use client";

import { useState } from "react";
import type { WeeklyTrendData } from "@/types/strava";

interface PaceProgressionChartProps {
  data: WeeklyTrendData[];
}

function formatPace(paceSeconds: number): string {
  if (paceSeconds === 0) return "-";
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.round(paceSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PaceProgressionChart({ data }: PaceProgressionChartProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Filter weeks with valid pace data
  const validData = data.filter((d) => d.avgPace > 0);

  if (validData.length < 2) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">Not enough pace data</p>
      </div>
    );
  }

  const paces = validData.map((d) => d.avgPace);
  const minPace = Math.min(...paces);
  const maxPace = Math.max(...paces);
  const range = maxPace - minPace || 1;

  // Calculate trend (lower is better for pace)
  const recentAvg = validData.slice(-4).reduce((sum, d) => sum + d.avgPace, 0) / Math.min(4, validData.slice(-4).length);
  const olderAvg = validData.slice(0, 4).reduce((sum, d) => sum + d.avgPace, 0) / Math.min(4, validData.slice(0, 4).length);
  const improvement = olderAvg > 0 ? ((olderAvg - recentAvg) / olderAvg) * 100 : 0;

  const selected = selectedIdx !== null ? validData[selectedIdx] : null;

  // Use bar chart instead of line for better touch interaction
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
            Pace Progression
          </h3>
        </div>
        <div className={`text-xs sm:text-sm font-semibold ${improvement >= 0 ? "text-green-500" : "text-red-500"}`}>
          {improvement >= 0 ? "+" : ""}{improvement.toFixed(1)}%
        </div>
      </div>

      
      <div className="h-6 mb-1 text-center">
        {selected ? (
          <span className="text-sm">
            <span className="text-green-600 font-bold">{formatPace(selected.avgPace)} /km</span>
            <span className="text-gray-500 ml-2">{selected.week} · {(selected.distance / 1000).toFixed(0)}km</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">Tap a bar to see details</span>
        )}
      </div>

      
      <div className="flex items-end gap-1 h-20">
        {validData.map((week, idx) => {
          // Invert: faster pace (lower number) = taller bar
          const heightPercent = range > 0 ? ((maxPace - week.avgPace) / range) * 80 + 20 : 50;
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
                      ? "bg-green-500"
                      : "bg-green-400 hover:bg-green-500"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className={`text-[8px] mt-1 ${isSelected ? "text-green-600" : "text-gray-400"}`}>
                {week.week}
              </span>
            </div>
          );
        })}
      </div>

      
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 text-[10px]">
        <span className="text-gray-500">Best: <span className="text-green-600 font-semibold">{formatPace(minPace)}</span></span>
        <span className="text-gray-500">Avg: <span className="text-gray-900 font-semibold">{formatPace(paces.reduce((a, b) => a + b, 0) / paces.length)}</span></span>
        <span className="text-gray-500">Current: <span className="text-gray-900 font-semibold">{formatPace(validData[validData.length - 1]?.avgPace || 0)}</span></span>
      </div>
    </div>
  );
}
