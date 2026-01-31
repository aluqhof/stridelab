"use client";

import { useState } from "react";
import type { TrainingPaces } from "@/types/strava";

interface VDOTCardProps {
  vdot: number;
  trainingPaces: TrainingPaces | null;
  effortsUsed: number;
  confidence: number;
}

const PACE_ZONES = [
  { key: "easy", label: "Easy", color: "bg-green-500" },
  { key: "marathon", label: "Marathon", color: "bg-blue-500" },
  { key: "threshold", label: "Threshold", color: "bg-yellow-500" },
  { key: "interval", label: "Intervals", color: "bg-orange-500" },
  { key: "repetition", label: "Repetitions", color: "bg-red-500" },
] as const;

export function VDOTCard({ vdot, trainingPaces, effortsUsed, confidence }: VDOTCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  if (vdot === 0 || !trainingPaces) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-gray-500 text-sm">
          Not enough data to calculate your VDOT.
        </p>
      </div>
    );
  }

  const getFitnessLevel = (v: number): { level: string; color: string } => {
    if (v >= 70) return { level: "Elite", color: "text-purple-500" };
    if (v >= 60) return { level: "Very High", color: "text-orange-500" };
    if (v >= 50) return { level: "High", color: "text-green-500" };
    if (v >= 40) return { level: "Intermediate", color: "text-blue-500" };
    if (v >= 30) return { level: "Beginner", color: "text-yellow-500" };
    return { level: "Starting", color: "text-gray-500" };
  };

  const fitness = getFitnessLevel(vdot);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <h3 className="text-base text-gray-500 uppercase tracking-wider font-bold">
            VDOT & Paces
          </h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Information"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
      </div>

      
      {showInfo && (
        <div className="absolute top-14 right-4 z-10 w-64 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold text-gray-900">What is VDOT?</p>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="text-[11px] text-gray-500 space-y-1.5">
            <li className="flex gap-2">
              <span className="text-blue-500">-</span>
              <span>VDOT is a <strong className="text-gray-700">VO2max</strong> estimate based on performance (Jack Daniels)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">-</span>
              <span>Paces are <strong className="text-gray-700">optimal</strong> training zones for your level</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">-</span>
              <span>Calculated from your <strong className="text-gray-700">best effort</strong> in {effortsUsed} {effortsUsed === 1 ? "distance" : "distances"}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">-</span>
              <span>Confidence: <strong className="text-gray-700">{confidence}%</strong> (more distances = more accurate)</span>
            </li>
          </ul>
        </div>
      )}

      
      <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-200">
        <div className="w-16 h-16 rounded-xl bg-blue-50 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-gray-900">
            {vdot.toFixed(1)}
          </p>
          <p className="text-[10px] text-blue-500 uppercase">VDOT</p>
        </div>
        <div>
          <p className={`text-lg font-semibold ${fitness.color}`}>
            {fitness.level}
          </p>
          <p className="text-[11px] text-gray-400">
            VO2max ~{vdot.toFixed(0)} ml/kg/min
          </p>
        </div>
      </div>

      
      <div className="space-y-1.5">
        {PACE_ZONES.map((zone) => {
          const pace = zone.key === "easy"
            ? `${trainingPaces.easy.min} - ${trainingPaces.easy.max}`
            : trainingPaces[zone.key as keyof Omit<TrainingPaces, "easy">];

          return (
            <div
              key={zone.key}
              className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${zone.color}`} />
                <span className="text-xs text-gray-500">{zone.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {pace}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
