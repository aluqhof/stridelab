"use client";

import { useState } from "react";
import type { InjuryRiskData } from "@/types/strava";

interface InjuryRiskProps {
  data: InjuryRiskData;
}

const RISK_COLORS = {
  low: { bg: "bg-green-50", text: "text-green-500", bar: "bg-green-500" },
  moderate: { bg: "bg-blue-50", text: "text-blue-500", bar: "bg-blue-500" },
  high: { bg: "bg-orange-50", text: "text-orange-500", bar: "bg-orange-500" },
  very_high: { bg: "bg-red-50", text: "text-red-500", bar: "bg-red-500" },
};

const RISK_LABELS = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very High",
};

export function InjuryRisk({ data }: InjuryRiskProps) {
  const [showInfo, setShowInfo] = useState(false);
  const colors = RISK_COLORS[data.riskLevel];
  const acwrPercent = Math.min(100, (data.acwr / 2) * 100);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <h3 className="text-base text-gray-500 uppercase tracking-wider font-bold">
            Injury Risk
          </h3>
        </div>
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

      {showInfo && (
        <div className="absolute top-14 right-4 z-10 w-56 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold text-gray-900">ACWR</p>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="text-[11px] text-gray-500 space-y-1.5">
            <li><strong className="text-gray-700">ACWR</strong> = Acute Load / Chronic Load</li>
            <li><span className="text-green-500">0.8-1.3</span> = Optimal zone</li>
            <li><span className="text-orange-500">&gt;1.5</span> = High injury risk</li>
            <li><span className="text-blue-500">&lt;0.8</span> = Detraining</li>
          </ul>
        </div>
      )}

      <div className="flex-1 flex items-center gap-4">
        <div className={`w-16 h-16 rounded-xl ${colors.bg} flex flex-col items-center justify-center`}>
          <p className={`text-2xl font-bold ${colors.text}`}>
            {data.acwr.toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-400 uppercase">ACWR</p>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-semibold ${colors.text}`}>
              {RISK_LABELS[data.riskLevel]}
            </span>
            <span className="text-xs text-gray-400">
              {data.weeklyLoad} / {data.chronicLoad} TSS
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${colors.bar}`}
              style={{ width: `${acwrPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-400">
            <span>0.8</span>
            <span className="text-green-500">Optimal</span>
            <span>1.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
