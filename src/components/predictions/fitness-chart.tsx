"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import type { FitnessData } from "@/types/strava";

interface FitnessChartProps {
  data: FitnessData[];
  currentFitness: {
    ctl: number;
    atl: number;
    tsb: number;
  };
}

export function FitnessChart({ data, currentFitness }: FitnessChartProps) {
  const [showInfo, setShowInfo] = useState(false);
  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-gray-500 text-sm">
          Not enough training data with heart rate.
        </p>
      </div>
    );
  }

  const displayData = data.slice(-60).map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
  }));

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    color: '#111827',
    fontSize: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const getFormStatus = (tsb: number): { status: string; color: string } => {
    if (tsb > 25) return { status: "Transition", color: "text-yellow-500" };
    if (tsb > 5) return { status: "Fresh", color: "text-green-500" };
    if (tsb > -10) return { status: "Optimal", color: "text-blue-500" };
    if (tsb > -25) return { status: "Tired", color: "text-orange-500" };
    return { status: "Exhausted", color: "text-red-500" };
  };

  const formStatus = getFormStatus(currentFitness.tsb);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 relative">
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <h3 className="text-base text-gray-500 uppercase tracking-wider font-bold">
            Fitness & Freshness
          </h3>
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
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-500">CTL</span>
            <span className="text-blue-500 font-semibold">
              {currentFitness.ctl.toFixed(0)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-gray-500">ATL</span>
            <span className="text-orange-500 font-semibold">
              {currentFitness.atl.toFixed(0)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-500">TSB</span>
            <span className={`font-semibold ${currentFitness.tsb >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {currentFitness.tsb >= 0 ? '+' : ''}{currentFitness.tsb.toFixed(0)}
            </span>
          </div>
          <div className={`px-2 py-0.5 rounded text-xs font-medium ${formStatus.color} bg-gray-100`}>
            {formStatus.status}
          </div>
        </div>
      </div>

      
      {showInfo && (
        <div className="absolute top-14 left-4 z-10 w-72 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold text-gray-900">What do these metrics mean?</p>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="text-[11px] text-gray-500 space-y-2">
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold">CTL</span>
              <span><strong className="text-gray-700">Fitness</strong> - 42-day load average. Higher = fitter</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500 font-bold">ATL</span>
              <span><strong className="text-gray-700">Fatigue</strong> - 7-day load average. Higher = more tired</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">TSB</span>
              <span><strong className="text-gray-700">Form</strong> - CTL - ATL. Positive = fresh, negative = fatigued</span>
            </li>
          </ul>
          <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-400">
            Ideal for racing: TSB between +5 and +15 (fresh but fit)
          </div>
        </div>
      )}

      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData}>
            <defs>
              <linearGradient id="tsbGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="50%" stopColor="#22c55e" stopOpacity={0} />
                <stop offset="50%" stopColor="#ef4444" stopOpacity={0} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
              </linearGradient>
            </defs>
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
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#6b7280' }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  ctl: 'Fitness',
                  atl: 'Fatigue',
                  tsb: 'Form',
                };
                return [value.toFixed(1), labels[name] || name];
              }}
            />
            <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="tsb"
              fill="url(#tsbGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="ctl"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={1.5}
              name="ctl"
            />
            <Line
              type="monotone"
              dataKey="atl"
              stroke="#f97316"
              dot={false}
              strokeWidth={1.5}
              name="atl"
            />
            <Line
              type="monotone"
              dataKey="tsb"
              stroke="#22c55e"
              dot={false}
              strokeWidth={1}
              strokeDasharray="4 2"
              name="tsb"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
