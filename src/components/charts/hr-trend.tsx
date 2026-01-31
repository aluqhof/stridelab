"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useActivities } from "@/hooks/use-strava";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export function HRTrend() {
  const { data, isLoading } = useActivities(50);

  if (isLoading) {
    return <div className="h-72 bg-white rounded-xl animate-pulse" />;
  }

  const activities = data?.pages.flat() ?? [];

  const activitiesWithHR = activities
    .filter((a) => a.average_heartrate && a.average_heartrate > 0)
    .sort(
      (a, b) =>
        new Date(a.start_date_local).getTime() -
        new Date(b.start_date_local).getTime()
    )
    .slice(-20);

  if (activitiesWithHR.length < 3) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-gray-500">Not enough heart rate data</p>
      </div>
    );
  }

  const chartData = activitiesWithHR.map((activity) => ({
    date: format(new Date(activity.start_date_local), "d MMM", { locale: enUS }),
    avgHR: Math.round(activity.average_heartrate || 0),
    maxHR: activity.max_heartrate || 0,
    type: activity.sport_type,
    name: activity.name,
  }));

  const avgOfAvg = Math.round(
    chartData.reduce((sum, d) => sum + d.avgHR, 0) / chartData.length
  );

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg text-gray-500 uppercase tracking-wider font-bold">
          HR Trend
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-gray-500">Average: <span className="text-red-400 font-semibold">{avgOfAvg} bpm</span></span>
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              width={30}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#111827',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number, name: string) => [
                `${value} bpm`,
                name === 'avgHR' ? 'Avg HR' : 'Max HR',
              ]}
              labelFormatter={(_, payload) => (payload as { payload?: { name?: string } }[])?.[0]?.payload?.name || ''}
              labelStyle={{ color: '#6b7280' }}
            />
            <ReferenceLine
              y={avgOfAvg}
              stroke="#d1d5db"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="avgHR"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#ef4444' }}
            />
            <Line
              type="monotone"
              dataKey="maxHR"
              stroke="#fca5a5"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
