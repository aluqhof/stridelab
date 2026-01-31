"use client";

import { useState } from "react";
import type { PaceHRPoint } from "@/types/strava";

interface AerobicDecouplingProps {
  data: PaceHRPoint[];
  efficiencyTrend: number;
}

function formatPace(paceSeconds: number): string {
  if (paceSeconds === 0) return "-";
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.round(paceSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AerobicDecoupling({ data, efficiencyTrend }: AerobicDecouplingProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!data || data.length < 3) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">Not enough pace/HR data</p>
      </div>
    );
  }

  // Find ranges for scaling
  const efficiencies = data.map((d) => d.efficiency);
  const minEff = Math.min(...efficiencies);
  const maxEff = Math.max(...efficiencies);
  const effRange = maxEff - minEff || 1;

  // Calculate averages for latest vs oldest
  const recentData = data.slice(-5);
  const avgRecentEff = recentData.reduce((sum, d) => sum + d.efficiency, 0) / recentData.length;
  const avgRecentPace = recentData.reduce((sum, d) => sum + d.pace, 0) / recentData.length;
  const avgRecentHR = recentData.reduce((sum, d) => sum + d.hr, 0) / recentData.length;

  const isImproving = efficiencyTrend > 0;
  const selected = selectedIdx !== null ? data[selectedIdx] : null;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
            Aerobic Efficiency
          </h3>
        </div>
        <div
          className={`text-xs sm:text-sm font-semibold ${isImproving ? "text-green-500" : "text-red-500"}`}
        >
          {isImproving ? "+" : ""}{efficiencyTrend.toFixed(1)}%
        </div>
      </div>

      
      <div className="h-6 mb-1 text-center">
        {selected ? (
          <span className="text-sm">
            <span className="text-emerald-600 font-bold">{selected.efficiency.toFixed(1)} m/lat</span>
            <span className="text-gray-500 ml-2">{formatPace(selected.pace)}/km · {Math.round(selected.hr)} bpm</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">Tap a bar to see details</span>
        )}
      </div>

      
      <div className="flex items-end gap-0.5 h-16">
        {data.map((point, idx) => {
          const heightPercent = effRange > 0 ? ((point.efficiency - minEff) / effRange) * 80 + 20 : 50;
          const isSelected = selectedIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full cursor-pointer min-w-0"
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
              onMouseEnter={() => setSelectedIdx(idx)}
              onMouseLeave={() => setSelectedIdx(null)}
            >
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t transition-all ${
                    isSelected
                      ? "bg-emerald-500"
                      : "bg-emerald-400 hover:bg-emerald-500"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 text-[10px]">
        <span className="text-gray-500">Pace: <span className="text-gray-900 font-semibold">{formatPace(avgRecentPace)}</span></span>
        <span className="text-gray-500">HR: <span className="text-red-500 font-semibold">{Math.round(avgRecentHR)} bpm</span></span>
        <span className="text-gray-500">Eff: <span className={`font-semibold ${isImproving ? "text-green-600" : "text-yellow-600"}`}>{avgRecentEff.toFixed(1)} m/beat</span></span>
      </div>
      <p className="text-[9px] text-gray-400 mt-1 text-center">
        Meters covered per heartbeat. Higher = better aerobic condition
      </p>
    </div>
  );
}
