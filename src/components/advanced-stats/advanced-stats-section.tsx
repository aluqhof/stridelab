"use client";

import { useAdvancedStats } from "@/hooks/use-strava";
import { WeeklyVolumeChart } from "./weekly-volume-chart";
import { PaceProgressionChart } from "./pace-progression-chart";
import { YearComparisonCard } from "./year-comparison";
import { ZoneDistributionChart } from "./zone-distribution-chart";
import { TimeAnalysis } from "./time-analysis";
import { AerobicDecoupling } from "./aerobic-decoupling";
import { GoalsTracker } from "./goals-tracker";

export function AdvancedStatsSection() {
  const { data, isLoading, error } = useAdvancedStats();

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 sm:h-6 bg-emerald-500 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            ADVANCED ANALYSIS
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl animate-pulse ${
                i < 2 ? "sm:col-span-2 h-[280px]" : "h-[240px]"
              }`}
            />
          ))}
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 sm:h-6 bg-emerald-500 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            ADVANCED ANALYSIS
          </h2>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 text-center">
          <p className="text-red-400">Error loading advanced analysis</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            PROGRESS & VOLUME
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <WeeklyVolumeChart data={data.weeklyData} />
          <PaceProgressionChart data={data.weeklyData} />
        </div>
      </div>

      
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 sm:h-6 bg-purple-500 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            COMPARISONS & GOALS
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <YearComparisonCard data={data.yearComparison} />
          <GoalsTracker goals={data.goals} />
        </div>
      </div>

      
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 sm:h-6 bg-red-500 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            TRAINING ANALYSIS
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ZoneDistributionChart data={data.zoneDistribution} balance={data.trainingBalance} />
          <AerobicDecoupling data={data.paceHRData} efficiencyTrend={data.efficiencyTrend} />
        </div>
      </div>

      
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 sm:h-6 bg-cyan-500 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            PATTERNS & HABITS
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <TimeAnalysis timeOfDay={data.timeOfDayData} dayOfWeek={data.dayOfWeekData} />
          
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <h3 className="text-sm sm:text-base text-gray-500 uppercase tracking-wider font-bold">
                Monthly Summary
              </h3>
            </div>
            <div className="space-y-2">
              {data.monthlyData.slice(-6).reverse().map((month) => (
                <div key={month.month} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <span className="text-xs sm:text-sm text-gray-500 capitalize">{month.month}</span>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <span className="text-gray-900 font-semibold">{(month.distance / 1000).toFixed(0)} km</span>
                    <span className="text-gray-500">{month.activities} acts</span>
                    <span className="text-gray-400">{Math.round(month.elevation)}m ↑</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
