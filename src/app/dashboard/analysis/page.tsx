"use client";

import { AdvancedStatsSection } from "@/components/advanced-stats/advanced-stats-section";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          <span className="text-cyan-600">ADVANCED</span> ANALYSIS
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Volume, pace, zones, efficiency and training patterns
        </p>
      </div>

      
      <AdvancedStatsSection />
    </div>
  );
}
