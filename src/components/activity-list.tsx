"use client";

import { useActivities } from "@/hooks/use-strava";
import { ActivityCard } from "./activity-card";

export function ActivityList() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivities(20);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-red-400">Error loading activities</p>
      </div>
    );
  }

  const activities = data?.pages.flat() ?? [];

  if (activities.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-gray-500">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-4 px-4 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {isFetchingNextPage ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            "Load more activities"
          )}
        </button>
      )}
    </div>
  );
}
