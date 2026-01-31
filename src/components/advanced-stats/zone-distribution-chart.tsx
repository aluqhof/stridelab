"use client";

import { useState } from "react";
import type { ZoneDistributionWeek, TrainingBalanceData } from "@/types/strava";

interface ZoneDistributionChartProps {
  data: ZoneDistributionWeek[];
  balance: TrainingBalanceData;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h${remainingMins > 0 ? `${remainingMins}m` : ""}`;
}

export function ZoneDistributionChart({ data, balance }: ZoneDistributionChartProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">No zone data available</p>
      </div>
    );
  }

  const selected = selectedIdx !== null ? data[selectedIdx] : null;
  const selectedTotal = selected ? selected.zone1 + selected.zone2 + selected.zone3 + selected.zone4 + selected.zone5 : 0;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
            Zones by Week
          </h3>
        </div>
      </div>

      
      <div className="h-6 mb-1 text-center">
        {selected && selectedTotal > 0 ? (
          <div className="flex items-center justify-center gap-2 text-[10px]">
            <span className="text-gray-500">{selected.week}:</span>
            <span className="text-gray-400">Z1 {Math.round((selected.zone1/selectedTotal)*100)}%</span>
            <span className="text-blue-500">Z2 {Math.round((selected.zone2/selectedTotal)*100)}%</span>
            <span className="text-green-500">Z3 {Math.round((selected.zone3/selectedTotal)*100)}%</span>
            <span className="text-yellow-500">Z4 {Math.round((selected.zone4/selectedTotal)*100)}%</span>
            <span className="text-red-500">Z5 {Math.round((selected.zone5/selectedTotal)*100)}%</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Tap a bar to see details</span>
        )}
      </div>

      
      <div className="flex items-end gap-1 h-16">
        {data.map((week, idx) => {
          const total = week.zone1 + week.zone2 + week.zone3 + week.zone4 + week.zone5;
          const isSelected = selectedIdx === idx;

          if (total === 0) {
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full">
                <div className="flex-1 w-full bg-gray-100 rounded" />
                <span className="text-[8px] text-gray-400 mt-1">{week.week}</span>
              </div>
            );
          }

          const z1Pct = (week.zone1 / total) * 100;
          const z2Pct = (week.zone2 / total) * 100;
          const z3Pct = (week.zone3 / total) * 100;
          const z4Pct = (week.zone4 / total) * 100;
          const z5Pct = (week.zone5 / total) * 100;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full cursor-pointer"
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
              onMouseEnter={() => setSelectedIdx(idx)}
              onMouseLeave={() => setSelectedIdx(null)}
            >
              <div className={`flex-1 w-full flex flex-col rounded overflow-hidden transition-all ${isSelected ? "ring-2 ring-gray-400" : ""}`}>
                {z5Pct > 0 && <div className="bg-red-400" style={{ height: `${z5Pct}%` }} />}
                {z4Pct > 0 && <div className="bg-yellow-400" style={{ height: `${z4Pct}%` }} />}
                {z3Pct > 0 && <div className="bg-green-400" style={{ height: `${z3Pct}%` }} />}
                {z2Pct > 0 && <div className="bg-blue-400" style={{ height: `${z2Pct}%` }} />}
                {z1Pct > 0 && <div className="bg-gray-400" style={{ height: `${z1Pct}%` }} />}
              </div>
              <span className={`text-[8px] mt-1 ${isSelected ? "text-gray-900" : "text-gray-400"}`}>{week.week}</span>
            </div>
          );
        })}
      </div>

      
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500">Balance 80/20</span>
          <div
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              balance.isPolarized
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-yellow-50 text-yellow-600 border border-yellow-200"
            }`}
            title={balance.isPolarized ? "Good balance: mostly easy workouts with some intense ones" : "Too much time in mid-high zones"}
          >
            {balance.isPolarized ? "Good" : "Needs Work"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-blue-400" style={{ width: `${balance.easyPercent}%` }} title="Easy (Z1-Z2)" />
              <div className="bg-yellow-400" style={{ width: `${balance.moderatePercent}%` }} title="Moderate (Z3)" />
              <div className="bg-red-400" style={{ width: `${balance.hardPercent}%` }} title="Hard (Z4-Z5)" />
            </div>
          </div>
          <span className="text-[10px] text-blue-600" title="Easy">{balance.easyPercent}%</span>
          <span className="text-[10px] text-gray-400">/</span>
          <span className="text-[10px] text-red-500" title="Hard">{balance.hardPercent}%</span>
        </div>
        <p className="text-[9px] text-gray-400 mt-1">
          Ideal: 80% easy (Z1-Z2) / 20% hard (Z4-Z5)
        </p>
      </div>
    </div>
  );
}
