"use client";

import { useState } from "react";
import type { TrainingDistribution as TrainingDistributionType } from "@/types/strava";

interface TrainingDistributionProps {
  data: TrainingDistributionType;
}

export function TrainingDistribution({ data }: TrainingDistributionProps) {
  const [showInfo, setShowInfo] = useState(false);
  const total = data.zone1_2 + data.zone3 + data.zone4_5;

  if (total === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-gray-500 text-sm">No distribution data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <h3 className="text-base text-gray-500 uppercase tracking-wider font-bold">
            80/20 Distribution
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {data.isPolarized && (
            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-200">
              Polarizado
            </span>
          )}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="absolute top-14 right-4 z-10 w-60 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold text-gray-900">80/20 Rule</p>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="text-[11px] text-gray-500 space-y-1.5">
            <li><strong className="text-gray-700">Polarized</strong> training is optimal</li>
            <li><span className="text-green-500">~80%</span> easy (Z1-2)</li>
            <li><span className="text-yellow-500">~0%</span> moderate (Z3) - avoid</li>
            <li><span className="text-red-500">~20%</span> hard (Z4-5)</li>
            <li className="pt-1 border-t border-gray-200">Avoid training too much in Z3 (&quot;gray zone&quot;)</li>
          </ul>
        </div>
      )}

      
      <div className="h-8 rounded-lg overflow-hidden flex mb-3">
        <div
          className="bg-green-500 flex items-center justify-center"
          style={{ width: `${data.zone1_2}%` }}
        >
          {data.zone1_2 > 15 && (
            <span className="text-xs font-bold text-white">{data.zone1_2}%</span>
          )}
        </div>
        <div
          className="bg-yellow-500 flex items-center justify-center"
          style={{ width: `${data.zone3}%` }}
        >
          {data.zone3 > 10 && (
            <span className="text-xs font-bold text-white">{data.zone3}%</span>
          )}
        </div>
        <div
          className="bg-red-500 flex items-center justify-center"
          style={{ width: `${data.zone4_5}%` }}
        >
          {data.zone4_5 > 10 && (
            <span className="text-xs font-bold text-white">{data.zone4_5}%</span>
          )}
        </div>
      </div>

      
      <div className="flex justify-between text-xs mb-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-green-500" />
          <span className="text-gray-500">Easy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-yellow-500" />
          <span className="text-gray-500">Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-red-500" />
          <span className="text-gray-500">Hard</span>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-tight">
        {data.recommendation}
      </p>
    </div>
  );
}
