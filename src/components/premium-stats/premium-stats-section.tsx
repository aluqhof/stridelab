"use client";

import { usePremiumStats } from "@/hooks/use-strava";
import { PersonalRecords } from "./personal-records";
import { InjuryRisk } from "./injury-risk";
import { AerobicEfficiency } from "./aerobic-efficiency";
import { TrainingDistribution } from "./training-distribution";
import { StreaksCard } from "./streaks-card";

export function PremiumStatsSection() {
  const { data, isLoading, error } = usePremiumStats();

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-6 bg-yellow-500 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900">
            ADVANCED STATISTICS
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[140px]">
          <div className="col-span-2 row-span-2 bg-white rounded-xl animate-pulse" />
          <div className="bg-white rounded-xl animate-pulse" />
          <div className="bg-white rounded-xl animate-pulse" />
          <div className="col-span-2 bg-white rounded-xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-red-400 text-sm">Error loading advanced statistics</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 sm:h-6 bg-yellow-500 rounded-full" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          ADVANCED STATISTICS
        </h2>
      </div>

      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="col-span-2 lg:row-span-2">
          <PersonalRecords records={data.personalRecords} />
        </div>

        
        <div className="col-span-1">
          <InjuryRisk data={data.injuryRisk} />
        </div>

        
        <div className="col-span-1">
          <TrainingDistribution data={data.trainingDistribution} />
        </div>

        
        <div className="col-span-2">
          <AerobicEfficiency data={data.efficiencyData} trend={data.efficiencyTrend} />
        </div>

        
        <div className="col-span-2 lg:col-span-2">
          <StreaksCard streaks={data.streaks} comparison={data.monthComparison} />
        </div>
      </div>
    </section>
  );
}
