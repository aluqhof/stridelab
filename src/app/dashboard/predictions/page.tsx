"use client";

import { PredictionsSection } from "@/components/predictions/predictions-section";
import { PremiumStatsSection } from "@/components/premium-stats/premium-stats-section";

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          <span className="text-cyan-600">PREDICTIONS</span> & PRs
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Time estimates, personal records and injury risk
        </p>
      </div>

      
      <PredictionsSection />

      
      <PremiumStatsSection />
    </div>
  );
}
