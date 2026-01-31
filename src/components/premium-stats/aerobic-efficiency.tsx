"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EfficiencyDataPoint, EfficiencyTrend } from "@/types/strava";

interface AerobicEfficiencyProps {
  data: EfficiencyDataPoint[];
  trend: EfficiencyTrend | null;
}

export function AerobicEfficiency({ data, trend }: AerobicEfficiencyProps) {
  const [showInfo, setShowInfo] = useState(false);

  if (data.length < 3) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-gray-500 text-sm">You need more runs to see your efficiency.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
    efficiency: d.efficiency,
    name: d.activityName,
  }));

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    color: '#111827',
    fontSize: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <h3 className="text-base text-gray-500 uppercase tracking-wider font-bold">
            Aerobic Efficiency
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend.improving ? 'text-green-500' : 'text-red-500'}`}>
              <span>{trend.improving ? '↑' : '↓'}</span>
              <span className="font-semibold">{Math.abs(trend.change)}%</span>
            </div>
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
            <p className="text-xs font-semibold text-gray-900">Aerobic Efficiency</p>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="text-[11px] text-gray-500 space-y-1.5">
            <li><strong className="text-gray-700">Meters per heartbeat</strong></li>
            <li>Distance covered / Total heartbeats</li>
            <li className="pt-1 border-t border-gray-200">
              <span className="text-cyan-600">Higher = better</span> cardiac efficiency
            </li>
            <li>Improves with aerobic training</li>
          </ul>
        </div>
      )}

      <div className="flex-1 min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              width={28}
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#6b7280' }}
              formatter={(value: number) => [`${value.toFixed(2)} m/beat`, 'Efficiency']}
            />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ fill: '#06b6d4', strokeWidth: 0, r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
