"use client";

import { StatsOverview } from "@/components/stats-overview";
import { WeeklyChart } from "@/components/charts/weekly-chart";
import { MonthlyProgress } from "@/components/charts/monthly-progress";
import { HRTrend } from "@/components/charts/hr-trend";
import { RecentStats } from "@/components/recent-stats";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Your Performance
        </h1>
        <p className="text-gray-500 text-sm">
          Summary of your athletic activity
        </p>
      </div>

      
      <RecentStats />

      
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Yearly Statistics
        </h2>
        <StatsOverview />
      </section>

      
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Progress
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <WeeklyChart />
          <MonthlyProgress />
        </div>
      </section>

      
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Heart Rate
        </h2>
        <HRTrend />
      </section>
    </div>
  );
}
