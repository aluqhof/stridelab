"use client";

import type { ActivityZones, StravaActivityStream } from "@/types/strava";
import { formatDuration } from "@/lib/utils";
import { useZones } from "@/hooks/use-strava";

const ZONE_COLORS = [
  "bg-gray-400",
  "bg-green-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-red-500",
];

const ZONE_COLORS_HEX = [
  "#9ca3af",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
];

const ZONE_NAMES = [
  "Recovery",
  "Endurance",
  "Tempo",
  "Threshold",
  "VO2 Max",
];

interface HeartRateZonesProps {
  zones: ActivityZones[];
  streams?: Record<string, StravaActivityStream>;
  maxHR?: number;
  compact?: boolean;
}

export function HeartRateZones({ zones, streams, maxHR: propMaxHR, compact = false }: HeartRateZonesProps) {
  const { data: athleteZones } = useZones();

  const hrZones = zones.find((z) => z.type === "heartrate");
  const powerZones = zones.find((z) => z.type === "power");

  // Get HR stream data (streams is an object keyed by type)
  const hrStream = streams?.heartrate;
  const hrData = hrStream?.data || [];

  // Calculate max HR from athlete zones or estimate
  const maxHR = propMaxHR ||
    (athleteZones?.heart_rate?.zones?.[4]?.min ? athleteZones.heart_rate.zones[4].min + 20 : null) ||
    (hrData.length > 0 ? Math.max(...hrData) : 190);

  if (!hrZones && !powerZones) {
    return (
      <div className={compact ? "text-center py-4" : "rounded-xl bg-white border border-gray-200 shadow-sm p-6 text-center"}>
        <p className="text-gray-500">No zone data for this activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hrZones && (
        <ZoneChart
          zones={hrZones}
          type="hr"
          compact={compact}
          hrData={hrData}
          maxHR={maxHR}
          athleteZones={athleteZones?.heart_rate?.zones}
        />
      )}
      {powerZones && <ZoneChart zones={powerZones} type="power" compact={compact} />}
    </div>
  );
}

interface ZoneChartProps {
  zones: ActivityZones;
  type: "hr" | "power";
  compact?: boolean;
  hrData?: number[];
  maxHR?: number;
  athleteZones?: { min: number; max: number }[];
}

function ZoneChart({ zones, type, compact = false, hrData = [], maxHR = 190, athleteZones }: ZoneChartProps) {
  const totalTime = zones.distribution_buckets.reduce((sum, b) => sum + b.time, 0);
  const maxTime = Math.max(...zones.distribution_buckets.map((b) => b.time));

  // Calculate HR metrics from stream data
  const hasHRData = hrData.length > 0;
  const avgHR = hasHRData ? Math.round(hrData.reduce((a, b) => a + b, 0) / hrData.length) : 0;
  const peakHR = hasHRData ? Math.max(...hrData) : 0;
  const minHR = hasHRData ? Math.min(...hrData.filter(hr => hr > 0)) : 0;
  const percentOfMax = hasHRData ? Math.round((peakHR / maxHR) * 100) : 0;

  // Calculate aerobic vs anaerobic time (zones 1-3 vs zones 4-5)
  const aerobicTime = zones.distribution_buckets.slice(0, 3).reduce((sum, b) => sum + b.time, 0);
  const anaerobicTime = zones.distribution_buckets.slice(3).reduce((sum, b) => sum + b.time, 0);
  const aerobicPercent = totalTime > 0 ? Math.round((aerobicTime / totalTime) * 100) : 0;
  const anaerobicPercent = totalTime > 0 ? Math.round((anaerobicTime / totalTime) * 100) : 0;

  // Calculate HR distribution histogram (10 buckets)
  const hrHistogram = hasHRData ? calculateHistogram(hrData, 10) : [];

  // Compare with athlete's personal zones
  const zoneComparison = athleteZones && zones.distribution_buckets.length === athleteZones.length
    ? zones.distribution_buckets.map((bucket, i) => ({
        activityMin: bucket.min,
        activityMax: bucket.max,
        personalMin: athleteZones[i].min,
        personalMax: athleteZones[i].max,
        match: bucket.min === athleteZones[i].min && bucket.max === athleteZones[i].max,
      }))
    : null;

  if (compact) {
    return (
      <div className="space-y-4 relative">
        
        <div>
          <div className="h-8 rounded-lg overflow-hidden flex mb-2">
            {zones.distribution_buckets.map((bucket, index) => {
              const percentage = totalTime > 0 ? (bucket.time / totalTime) * 100 : 0;
              if (percentage < 1) return null;
              return (
                <div
                  key={index}
                  className={`${ZONE_COLORS[index] || "bg-purple-500"} flex items-center justify-center transition-all hover:opacity-80`}
                  style={{ width: `${percentage}%` }}
                  title={`Z${index + 1}: ${formatDuration(bucket.time)} (${percentage.toFixed(0)}%)`}
                >
                  {percentage > 8 && (
                    <span className="text-[10px] font-bold text-white">Z{index + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          
          <div className="flex flex-wrap gap-2 text-[10px]">
            {zones.distribution_buckets.map((bucket, index) => {
              const percentage = totalTime > 0 ? (bucket.time / totalTime) * 100 : 0;
              if (percentage < 2) return null;
              return (
                <div key={index} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded ${ZONE_COLORS[index]}`} />
                  <span className="text-gray-600 font-medium">Z{index + 1}</span>
                  <span className="text-gray-400">{percentage.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        
        {hasHRData && hrHistogram.length > 0 && (
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">HR Distribution</p>
            <div className="flex items-end gap-0.5 h-16">
              {hrHistogram.map((bucket, i) => {
                const heightPercent = bucket.count > 0 ? (bucket.count / Math.max(...hrHistogram.map(b => b.count))) * 100 : 0;
                const zoneIndex = getZoneForHR(bucket.midpoint, zones.distribution_buckets);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${Math.max(heightPercent, 2)}%`,
                      backgroundColor: ZONE_COLORS_HEX[zoneIndex] || "#9ca3af"
                    }}
                    title={`${bucket.min}-${bucket.max} bpm: ${bucket.count} points`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 mt-1">
              <span>{minHR}</span>
              <span>{peakHR} bpm</span>
            </div>
          </div>
        )}

        
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-[9px] text-gray-400 uppercase">Avg</p>
            <p className="text-lg font-bold text-gray-900">{avgHR || "-"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-[9px] text-gray-400 uppercase">Max</p>
            <p className="text-lg font-bold text-red-500">{peakHR || "-"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-[9px] text-gray-400 uppercase">% Max</p>
            <p className="text-lg font-bold text-orange-500">{percentOfMax || "-"}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-[9px] text-gray-400 uppercase">Range</p>
            <p className="text-lg font-bold text-gray-700">{peakHR - minHR || "-"}</p>
          </div>
        </div>

        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Effort Type</span>
          </div>
          <div className="flex gap-2 h-3 rounded-full overflow-hidden mb-2">
            <div
              className="bg-green-500 rounded-l-full transition-all"
              style={{ width: `${aerobicPercent}%` }}
            />
            <div
              className="bg-red-500 rounded-r-full transition-all"
              style={{ width: `${anaerobicPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-600">Aerobic</span>
              <span className="font-semibold text-green-600">{aerobicPercent}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-600">Anaerobic</span>
              <span className="font-semibold text-red-600">{anaerobicPercent}%</span>
            </div>
          </div>
        </div>

        
        {zoneComparison && !zoneComparison.every(z => z.match) && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-[10px] text-blue-600 uppercase tracking-wider mb-1">Comparison with your zones</p>
            <p className="text-xs text-blue-700">
              The zones for this activity differ from your personal zones configured in Strava.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Full version (non-compact)
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${type === "hr" ? "bg-red-500" : "bg-yellow-500"}`} />
          <h3 className="text-lg text-gray-500 uppercase tracking-wider font-bold">
            {type === "hr" ? "HR Zones" : "Power Zones"}
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          Total: {formatDuration(totalTime)}
        </span>
      </div>

      
      {type === "hr" && hasHRData && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-400 uppercase mb-1">Min</p>
            <p className="text-xl font-bold text-gray-600">{minHR}</p>
            <p className="text-[10px] text-gray-400">bpm</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-400 uppercase mb-1">Avg</p>
            <p className="text-xl font-bold text-gray-900">{avgHR}</p>
            <p className="text-[10px] text-gray-400">bpm</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-red-400 uppercase mb-1">Max</p>
            <p className="text-xl font-bold text-red-500">{peakHR}</p>
            <p className="text-[10px] text-red-400">bpm</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-orange-400 uppercase mb-1">% of Max</p>
            <p className="text-xl font-bold text-orange-500">{percentOfMax}%</p>
            <p className="text-[10px] text-orange-400">of {maxHR}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-400 uppercase mb-1">Range</p>
            <p className="text-xl font-bold text-gray-700">{peakHR - minHR}</p>
            <p className="text-[10px] text-gray-400">bpm</p>
          </div>
        </div>
      )}

      
      {type === "hr" && hasHRData && hrHistogram.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Heart Rate Distribution</p>
          <div className="flex items-end gap-1 h-24 mb-2">
            {hrHistogram.map((bucket, i) => {
              const heightPercent = bucket.count > 0 ? (bucket.count / Math.max(...hrHistogram.map(b => b.count))) * 100 : 0;
              const zoneIndex = getZoneForHR(bucket.midpoint, zones.distribution_buckets);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${Math.max(heightPercent, 3)}%`,
                    backgroundColor: ZONE_COLORS_HEX[zoneIndex] || "#9ca3af"
                  }}
                  title={`${bucket.min}-${bucket.max} bpm: ${bucket.count} points (${((bucket.count / hrData.length) * 100).toFixed(1)}%)`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{minHR} bpm</span>
            <span>Heart rate</span>
            <span>{peakHR} bpm</span>
          </div>
        </div>
      )}

      
      {type === "hr" && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Effort Type</p>
          <div className="flex gap-1 h-6 rounded-full overflow-hidden mb-3">
            <div
              className="bg-green-500 transition-all flex items-center justify-center"
              style={{ width: `${aerobicPercent}%` }}
            >
              {aerobicPercent > 15 && <span className="text-[10px] font-bold text-white">{aerobicPercent}%</span>}
            </div>
            <div
              className="bg-red-500 transition-all flex items-center justify-center"
              style={{ width: `${anaerobicPercent}%` }}
            >
              {anaerobicPercent > 15 && <span className="text-[10px] font-bold text-white">{anaerobicPercent}%</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Aerobic (Z1-Z3)</p>
                <p className="text-xs text-gray-500">{formatDuration(aerobicTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Anaerobic (Z4-Z5)</p>
                <p className="text-xs text-gray-500">{formatDuration(anaerobicTime)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      
      <div className="space-y-3">
        {zones.distribution_buckets.map((bucket, index) => {
          const minutes = Math.floor(bucket.time / 60);
          const seconds = bucket.time % 60;
          const percentage = totalTime > 0 ? (bucket.time / totalTime) * 100 : 0;
          const barWidth = maxTime > 0 ? (bucket.time / maxTime) * 100 : 0;

          // Check if this zone matches personal zones
          const personalZone = athleteZones?.[index];
          const zonesDiffer = personalZone && (bucket.min !== personalZone.min || bucket.max !== personalZone.max);

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${ZONE_COLORS[index] || "bg-purple-500"}`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {ZONE_NAMES[index] || `Zone ${index + 1}`}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {bucket.min}-{bucket.max === -1 ? "∞" : bucket.max} {type === "hr" ? "bpm" : "W"}
                  </span>
                  {zonesDiffer && (
                    <span className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded" title={`Your zone: ${personalZone.min}-${personalZone.max}`}>
                      differs
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">
                    {minutes}:{seconds.toString().padStart(2, "0")}
                  </span>
                  <span className="text-gray-500 ml-2 text-xs">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${ZONE_COLORS[index] || "bg-purple-500"}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="mt-5 pt-5 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Main Zone</p>
          <p className="text-xl font-bold text-gray-900">
            Z{zones.distribution_buckets.reduce((maxIdx, bucket, idx, arr) =>
              bucket.time > arr[maxIdx].time ? idx : maxIdx, 0) + 1}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Intense (Z4-Z5)</p>
          <p className="text-xl font-bold text-orange-500">
            {formatDuration(anaerobicTime)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Easy (Z1-Z2)</p>
          <p className="text-xl font-bold text-green-500">
            {formatDuration(
              zones.distribution_buckets
                .slice(0, 2)
                .reduce((sum, b) => sum + b.time, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate histogram buckets
function calculateHistogram(data: number[], bucketCount: number): { min: number; max: number; midpoint: number; count: number }[] {
  if (data.length === 0) return [];

  const validData = data.filter(d => d > 0);
  if (validData.length === 0) return [];

  const min = Math.min(...validData);
  const max = Math.max(...validData);
  const range = max - min;
  const bucketSize = range / bucketCount;

  const buckets: { min: number; max: number; midpoint: number; count: number }[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const bucketMin = Math.round(min + (i * bucketSize));
    const bucketMax = Math.round(min + ((i + 1) * bucketSize));
    buckets.push({
      min: bucketMin,
      max: bucketMax,
      midpoint: Math.round((bucketMin + bucketMax) / 2),
      count: 0,
    });
  }

  for (const value of validData) {
    const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), bucketCount - 1);
    if (bucketIndex >= 0 && bucketIndex < buckets.length) {
      buckets[bucketIndex].count++;
    }
  }

  return buckets;
}

// Helper to determine which zone a HR value falls into
function getZoneForHR(hr: number, zones: { min: number; max: number }[]): number {
  for (let i = 0; i < zones.length; i++) {
    if (hr >= zones[i].min && (zones[i].max === -1 || hr <= zones[i].max)) {
      return i;
    }
  }
  return 0;
}
