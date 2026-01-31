"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useActivities } from "@/hooks/use-strava";
import { format, startOfMonth, subMonths, isAfter } from "date-fns";
import { enUS } from "date-fns/locale";

export function MonthlyProgress() {
  const { data, isLoading } = useActivities(200);

  if (isLoading) {
    return <div className="h-80 bg-white rounded-xl animate-pulse" />;
  }

  const activities = data?.pages.flat() ?? [];
  const now = new Date();

  const months: Record<string, { distance: number; time: number; count: number; elevation: number }> = {};

  for (let i = 11; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const key = format(monthStart, "MMM", { locale: enUS });
    months[key] = { distance: 0, time: 0, count: 0, elevation: 0 };
  }

  activities.forEach((activity) => {
    const activityDate = new Date(activity.start_date_local);
    const monthStart = startOfMonth(activityDate);
    const twelveMonthsAgo = subMonths(now, 12);

    if (isAfter(monthStart, twelveMonthsAgo)) {
      const key = format(monthStart, "MMM", { locale: enUS });
      if (months[key]) {
        months[key].distance += activity.distance / 1000;
        months[key].time += activity.moving_time / 3600;
        months[key].count += 1;
        months[key].elevation += activity.total_elevation_gain;
      }
    }
  });

  const chartData = Object.entries(months).map(([month, data]) => ({
    month,
    distance: Math.round(data.distance),
    hours: Math.round(data.time * 10) / 10,
    activities: data.count,
    elevation: Math.round(data.elevation),
  }));

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg text-gray-500 uppercase tracking-wider mb-6 font-bold">
        Annual Progress
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              width={35}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#111827',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number, name: string) => {
                if (name === "distance") return [`${value} km`, "Distance"];
                return [value, name];
              }}
              labelStyle={{ color: '#6b7280' }}
            />
            <Area
              type="monotone"
              dataKey="distance"
              stroke="#f97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDistance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
