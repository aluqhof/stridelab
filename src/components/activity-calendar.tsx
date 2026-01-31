"use client";

import { useState, useMemo } from "react";
import { useActivities } from "@/hooks/use-strava";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { formatDistance, formatDuration, getActivityIcon } from "@/lib/utils";
import Link from "next/link";

interface DayActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  suffer_score?: number;
}

export function ActivityCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Fetch enough activities to cover the calendar
  const { data, isLoading } = useActivities(200);

  const activities = data?.pages.flat() ?? [];

  // Group activities by date
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, DayActivity[]>();
    for (const activity of activities) {
      const dateKey = activity.start_date_local.split("T")[0];
      const existing = map.get(dateKey) || [];
      existing.push({
        id: activity.id,
        name: activity.name,
        type: activity.type,
        sport_type: activity.sport_type,
        distance: activity.distance,
        moving_time: activity.moving_time,
        total_elevation_gain: activity.total_elevation_gain,
        suffer_score: activity.suffer_score,
      });
      map.set(dateKey, existing);
    }
    return map;
  }, [activities]);

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get activities for selected day
  const selectedDayActivities = selectedDay
    ? activitiesByDate.get(format(selectedDay, "yyyy-MM-dd")) || []
    : [];

  // Calculate monthly totals
  const monthlyTotals = useMemo(() => {
    let distance = 0;
    let time = 0;
    let elevation = 0;
    let count = 0;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    activitiesByDate.forEach((dayActivities, dateKey) => {
      const date = new Date(dateKey);
      if (date >= monthStart && date <= monthEnd) {
        for (const act of dayActivities) {
          distance += act.distance;
          time += act.moving_time;
          elevation += act.total_elevation_gain;
          count++;
        }
      }
    });

    return { distance, time, elevation, count };
  }, [activitiesByDate, currentMonth]);

  // Get intensity color based on total distance/time for the day
  const getIntensityColor = (dayActivities: DayActivity[]) => {
    const totalTime = dayActivities.reduce((sum, a) => sum + a.moving_time, 0);

    // Based on time (in minutes)
    const minutes = totalTime / 60;
    if (minutes >= 120) return "bg-cyan-500"; // 2+ hours
    if (minutes >= 60) return "bg-cyan-400"; // 1-2 hours
    if (minutes >= 30) return "bg-teal-400"; // 30-60 min
    return "bg-teal-300"; // < 30 min
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <h3 className="text-base text-gray-500 uppercase tracking-wider font-bold">
            Calendar
          </h3>
        </div>

        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-gray-900 font-semibold min-w-[140px] text-center capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: enUS })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-4 gap-1 mb-3">
        <div className="bg-gray-100 rounded-lg p-1.5 text-center">
          <p className="text-[8px] text-gray-500 uppercase">Acts</p>
          <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
            {monthlyTotals.count}
          </p>
        </div>
        <div className="bg-gray-100 rounded-lg p-1.5 text-center">
          <p className="text-[8px] text-gray-500 uppercase">Dist</p>
          <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
            {(monthlyTotals.distance / 1000).toFixed(0)}km
          </p>
        </div>
        <div className="bg-gray-100 rounded-lg p-1.5 text-center">
          <p className="text-[8px] text-gray-500 uppercase">Time</p>
          <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
            {Math.floor(monthlyTotals.time / 3600)}h
          </p>
        </div>
        <div className="bg-gray-100 rounded-lg p-1.5 text-center">
          <p className="text-[8px] text-gray-500 uppercase">Elev</p>
          <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
            {Math.round(monthlyTotals.elevation)}m
          </p>
        </div>
      </div>

      
      <div className="grid grid-cols-7 gap-1">
        
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[10px] text-gray-500 uppercase py-1">
            {day}
          </div>
        ))}

        
        {calendarDays.map((day, idx) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayActivities = activitiesByDate.get(dateKey) || [];
          const hasActivities = dayActivities.length > 0;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const isTodayDate = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(hasActivities ? day : null)}
              className={`
                relative aspect-square rounded-lg flex flex-col items-center justify-center
                transition-all text-xs cursor-pointer
                ${!isCurrentMonth ? "opacity-30" : ""}
                ${isSelected ? "ring-2 ring-cyan-500" : ""}
                ${isTodayDate ? "ring-1 ring-gray-300" : ""}
                ${hasActivities
                  ? `${getIntensityColor(dayActivities)} text-white font-semibold hover:opacity-80`
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }
              `}
            >
              <span>{format(day, "d")}</span>
              {hasActivities && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayActivities.slice(0, 3).map((act, i) => (
                    <span key={i} className="text-[8px]">
                      {getActivityIcon(act.sport_type)}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      
      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 text-[8px] sm:text-[9px] text-gray-500 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-teal-300" />
          <span>&lt;30m</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-teal-400" />
          <span>30-60m</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-cyan-400" />
          <span>1-2h</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-cyan-500" />
          <span>2h+</span>
        </div>
      </div>

      
      {selectedDay && selectedDayActivities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2 capitalize">
            {format(selectedDay, "EEEE, MMMM d", { locale: enUS })}
          </p>
          <div className="space-y-2">
            {selectedDayActivities.map((act) => (
              <Link
                key={act.id}
                href={`/dashboard/activity/${act.id}`}
                className="flex items-center gap-3 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <span className="text-lg">{getActivityIcon(act.sport_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium truncate">{act.name}</p>
                  <div className="flex gap-2 text-[10px] text-gray-500">
                    <span>{formatDistance(act.distance)}</span>
                    <span>•</span>
                    <span>{formatDuration(act.moving_time)}</span>
                    {act.total_elevation_gain > 0 && (
                      <>
                        <span>•</span>
                        <span>{Math.round(act.total_elevation_gain)}m ↑</span>
                      </>
                    )}
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
