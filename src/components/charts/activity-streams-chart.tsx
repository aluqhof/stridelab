"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import type { StravaActivityStream } from "@/types/strava";

interface ActivityStreamsChartProps {
  streams: Record<string, StravaActivityStream>;
  compact?: boolean;
}

export function ActivityStreamsChart({ streams, compact = false }: ActivityStreamsChartProps) {
  const timeStream = streams.time;
  const distanceStream = streams.distance;
  const hrStream = streams.heartrate;
  const altitudeStream = streams.altitude;
  const velocityStream = streams.velocity_smooth;

  if (!timeStream) {
    return (
      <div className={compact ? "text-center py-4" : "rounded-xl bg-white border border-gray-200 shadow-sm p-6 text-center"}>
        <p className="text-gray-500">No time series data available</p>
      </div>
    );
  }

  const sampleRate = Math.max(1, Math.floor(timeStream.data.length / (compact ? 100 : 200)));

  const chartData = timeStream.data
    .filter((_, i) => i % sampleRate === 0)
    .map((_, i) => {
      const idx = i * sampleRate;
      return {
        distance: distanceStream
          ? Math.round(distanceStream.data[idx] / 100) / 10
          : idx,
        hr: hrStream?.data[idx],
        altitude: altitudeStream?.data[idx],
        speed: velocityStream
          ? Math.round(velocityStream.data[idx] * 3.6 * 10) / 10
          : undefined,
      };
    });

  const hasHR = hrStream && hrStream.data.some((v) => v > 0);
  const hasAltitude = altitudeStream && altitudeStream.data.some((v) => v > 0);
  const hasSpeed = velocityStream && velocityStream.data.some((v) => v > 0);

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    color: '#111827',
    fontSize: '11px',
    padding: '6px 10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  if (compact) {
    return (
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorAltitudeCompact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="distance"
              tick={{ fontSize: 9, fill: '#6b7280' }}
              tickFormatter={(v) => `${v}`}
              tickLine={false}
              axisLine={false}
            />
            {hasAltitude && (
              <YAxis
                yAxisId="altitude"
                orientation="right"
                tick={{ fontSize: 9, fill: '#6b7280' }}
                domain={['dataMin - 20', 'dataMax + 20']}
                width={30}
                tickFormatter={(v) => `${Math.round(v)}`}
                tickLine={false}
                axisLine={false}
              />
            )}
            {hasHR && (
              <YAxis
                yAxisId="hr"
                orientation="left"
                tick={{ fontSize: 9, fill: '#6b7280' }}
                domain={['dataMin - 10', 'dataMax + 10']}
                width={30}
                tickLine={false}
                axisLine={false}
              />
            )}
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === 'hr') return [`${value} bpm`, 'HR'];
                if (name === 'altitude') return [`${Math.round(value)} m`, 'Altitude'];
                return [value, name];
              }}
              labelFormatter={(v) => `${v} km`}
              labelStyle={{ color: '#6b7280', fontSize: '10px' }}
            />
            {hasAltitude && (
              <Area
                yAxisId="altitude"
                type="monotone"
                dataKey="altitude"
                stroke="#22c55e"
                strokeWidth={1}
                fillOpacity={1}
                fill="url(#colorAltitudeCompact)"
              />
            )}
            {hasHR && (
              <Line
                yAxisId="hr"
                type="monotone"
                dataKey="hr"
                stroke="#ef4444"
                dot={false}
                strokeWidth={1.5}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-1">
          {hasHR && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-red-500 rounded" />
              <span className="text-[9px] text-gray-500">HR</span>
            </div>
          )}
          {hasAltitude && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500/30 rounded" />
              <span className="text-[9px] text-gray-500">Altitude</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasHR && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <h3 className="text-lg text-gray-500 uppercase tracking-wider font-bold">
              Heart Rate
            </h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="distance"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickFormatter={(v) => `${v}`}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                  width={35}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`${value} bpm`, 'HR']}
                  labelFormatter={(v) => `${v} km`}
                  labelStyle={{ color: '#6b7280' }}
                />
                <Line
                  type="monotone"
                  dataKey="hr"
                  stroke="#ef4444"
                  dot={false}
                  strokeWidth={1.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {hasAltitude && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <h3 className="text-lg text-gray-500 uppercase tracking-wider font-bold">
              Elevation
            </h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAltitude" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="distance"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickFormatter={(v) => `${v}`}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  domain={['dataMin - 20', 'dataMax + 20']}
                  width={45}
                  tickFormatter={(v) => `${v}m`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`${Math.round(value)} m`, 'Altitude']}
                  labelFormatter={(v) => `${v} km`}
                  labelStyle={{ color: '#6b7280' }}
                />
                <Area
                  type="monotone"
                  dataKey="altitude"
                  stroke="#22c55e"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorAltitude)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {hasSpeed && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <h3 className="text-lg text-gray-500 uppercase tracking-wider font-bold">
              Speed
            </h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="distance"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickFormatter={(v) => `${v}`}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  domain={[0, 'dataMax + 5']}
                  width={40}
                  tickFormatter={(v) => `${v}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`${value} km/h`, 'Speed']}
                  labelFormatter={(v) => `${v} km`}
                  labelStyle={{ color: '#6b7280' }}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={1.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
