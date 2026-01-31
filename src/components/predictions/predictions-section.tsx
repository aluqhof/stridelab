"use client";

import { usePredictions } from "@/hooks/use-strava";
import { RacePredictions } from "./race-predictions";
import { VDOTCard } from "./vdot-card";
import { FitnessChart } from "./fitness-chart";

export function PredictionsSection() {
  const { data, isLoading, error } = usePredictions();

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 sm:h-6 bg-purple-500 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            PREDICTIONS
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="col-span-1 sm:col-span-2 bg-white rounded-xl animate-pulse h-[280px]" />
          <div className="col-span-1 sm:col-span-2 bg-white rounded-xl animate-pulse h-[280px]" />
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white rounded-xl animate-pulse h-[200px]" />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-red-400">Error loading predictions</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-1 h-6 bg-purple-500 rounded-full" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          PREDICTIONS
        </h2>
      </div>

      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="col-span-2 row-span-2">
          <RacePredictions
            predictions={data.racePredictions}
            adjustments={data.adjustments}
            trainingContext={data.trainingContext}
            effortsUsed={data.effortsUsed}
          />
        </div>

        
        <div className="col-span-2 row-span-2">
          <VDOTCard
            vdot={data.vdot}
            trainingPaces={data.trainingPaces}
            effortsUsed={data.effortsUsed}
            confidence={data.vdotConfidence}
          />
        </div>

        
        <div className="col-span-2 lg:col-span-4">
          <FitnessChart
            data={data.fitnessHistory}
            currentFitness={data.currentFitness}
          />
        </div>
      </div>
    </section>
  );
}
