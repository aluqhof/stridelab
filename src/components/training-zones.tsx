"use client";

import { useZones } from "@/hooks/use-strava";

const ZONE_COLORS = [
  "bg-gray-400",
  "bg-green-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-red-500",
];

const ZONE_NAMES = [
  "Recovery",
  "Endurance",
  "Tempo",
  "Threshold",
  "VO2 Max",
];

export function TrainingZones() {
  const { data: zones, isLoading, error } = useZones();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !zones) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-gray-500">Could not load training zones</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {zones.heart_rate && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <h3 className="text-lg text-gray-500 uppercase tracking-wider font-bold">
              Heart Rate Zones
            </h3>
            {zones.heart_rate.custom_zones && (
              <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider border border-orange-200">
                Custom
              </span>
            )}
          </div>
          <div className="space-y-3">
            {zones.heart_rate.zones.map((zone, index) => (
              <div key={index} className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${ZONE_COLORS[index]}`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{ZONE_NAMES[index]}</span>
                    <span className="text-xs text-gray-500">
                      {zone.min} - {zone.max === -1 ? "∞" : zone.max} bpm
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ZONE_COLORS[index]}`}
                      style={{ width: `${Math.min(100, (zone.max === -1 ? 220 : zone.max) / 2.2)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {zones.power && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <h3 className="text-lg text-gray-500 uppercase tracking-wider font-bold">
              Power Zones
            </h3>
          </div>
          <div className="space-y-3">
            {zones.power.zones.map((zone, index) => (
              <div key={index} className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${ZONE_COLORS[index] || 'bg-purple-500'}`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Zone {index + 1}</span>
                    <span className="text-xs text-gray-500">
                      {zone.min} - {zone.max === -1 ? "∞" : zone.max} W
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ZONE_COLORS[index] || 'bg-purple-500'}`}
                      style={{ width: `${Math.min(100, ((zone.max === -1 ? 500 : zone.max) / 500) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
