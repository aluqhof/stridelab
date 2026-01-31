"use client";

import { ActivityCalendar } from "@/components/activity-calendar";
import { ActivityList } from "@/components/activity-list";

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          YOUR <span className="text-cyan-600">ACTIVITIES</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Training calendar and activity history
        </p>
      </div>

      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        <div className="lg:col-span-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="w-1 h-5 sm:h-6 bg-cyan-500 rounded-full" />
            CALENDAR
          </h2>
          <ActivityCalendar />
        </div>

        
        <div className="lg:col-span-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="w-1 h-5 sm:h-6 bg-cyan-500 rounded-full" />
            ACTIVITY HISTORY
          </h2>
          <ActivityList />
        </div>
      </section>
    </div>
  );
}
