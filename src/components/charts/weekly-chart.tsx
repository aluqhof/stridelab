"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useActivities } from "@/hooks/use-strava";
import { startOfWeek, subWeeks, format, isAfter } from "date-fns";
import { enUS } from "date-fns/locale";

export function WeeklyChart() {
  const { data, isLoading } = useActivities(100);

  if (isLoading) {
    return <div className="h-80 bg-white rounded-xl animate-pulse" />;
  }

  const activities = data?.pages.flat() ?? [];
  const now = new Date();

  const weeks: Record<string, { distance: number; time: number; count: number }> = {};

  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const key = format(weekStart, "d MMM", { locale: enUS });
    weeks[key] = { distance: 0, time: 0, count: 0 };
  }

  activities.forEach((activity) => {
    const activityDate = new Date(activity.start_date_local);
    const weekStart = startOfWeek(activityDate, { weekStartsOn: 1 });
    const eightWeeksAgo = subWeeks(now, 8);

    if (isAfter(weekStart, eightWeeksAgo)) {
      const key = format(weekStart, "d MMM", { locale: enUS });
      if (weeks[key]) {
        weeks[key].distance += activity.distance / 1000;
        weeks[key].time += activity.moving_time / 3600;
        weeks[key].count += 1;
      }
    }
  });

  const chartData = Object.entries(weeks).map(([week, data]) => ({
    week,
    distance: Math.round(data.distance * 10) / 10,
    hours: Math.round(data.time * 10) / 10,
    activities: data.count,
  }));

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg text-gray-500 uppercase tracking-wider mb-6 font-bold">
        Weekly Distance
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="week"
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
              formatter={(value: number) => [`${value} km`, 'Distance']}
              labelStyle={{ color: '#6b7280' }}
            />
            <Bar
              dataKey="distance"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
