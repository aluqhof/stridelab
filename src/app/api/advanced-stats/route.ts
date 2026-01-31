import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActivities } from "@/lib/strava";
import type { StravaActivity } from "@/types/strava";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  subWeeks,
  subMonths,
  subYears,
  format,
  getDay,
  getHours,
} from "date-fns";

interface WeeklyData {
  week: string;
  weekStart: string;
  distance: number;
  time: number;
  activities: number;
  avgPace: number;
  avgHR: number;
  elevation: number;
  tss: number;
}

interface MonthlyData {
  month: string;
  distance: number;
  time: number;
  activities: number;
  avgPace: number;
  elevation: number;
}

interface ZoneDistribution {
  week: string;
  zone1: number;
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
}

interface TimeOfDayData {
  hour: number;
  count: number;
  avgPace: number;
  avgHR: number;
}

interface DayOfWeekData {
  day: number;
  dayName: string;
  count: number;
  distance: number;
  avgPace: number;
}

interface PRProgression {
  distance: string;
  history: {
    date: string;
    time: number;
    activityId: number;
    activityName: string;
  }[];
}

interface PaceHRPoint {
  date: string;
  pace: number;
  hr: number;
  efficiency: number;
  activityName: string;
}

interface Goal {
  id: string;
  type:
    | "weekly_distance"
    | "weekly_time"
    | "weekly_activities"
    | "monthly_distance";
  target: number;
  current: number;
  unit: string;
  period: string;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const now = new Date();

    // For year comparison, we need activities from start of last year
    const fetchFromDate = startOfYear(subYears(now, 1));
    const afterTimestamp = Math.floor(fetchFromDate.getTime() / 1000);

    // Fetch activities from start of last year (Strava API max is 200 per page)
    const [page1, page2] = await Promise.all([
      getActivities(session.accessToken, 1, 200, undefined, afterTimestamp),
      getActivities(session.accessToken, 2, 200, undefined, afterTimestamp),
    ]);
    const activities: StravaActivity[] = [...page1, ...page2];

    // Filter running activities for pace-related stats
    const runActivities = activities.filter(
      (a) =>
        (a.sport_type === "Run" || a.sport_type === "VirtualRun") &&
        a.distance > 0,
    );

    // ============ WEEKLY TRENDS ============
    const weeklyData: WeeklyData[] = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });

      const weekActivities = activities.filter((a) => {
        const date = new Date(a.start_date_local);
        return date >= weekStart && date < weekEnd;
      });

      const weekRuns = weekActivities.filter(
        (a) => a.sport_type === "Run" || a.sport_type === "VirtualRun",
      );

      const totalDistance = weekActivities.reduce(
        (sum, a) => sum + a.distance,
        0,
      );
      const totalTime = weekActivities.reduce(
        (sum, a) => sum + a.moving_time,
        0,
      );
      const totalElevation = weekActivities.reduce(
        (sum, a) => sum + a.total_elevation_gain,
        0,
      );

      const runsWithHR = weekRuns.filter((a) => a.average_heartrate);
      const avgHR =
        runsWithHR.length > 0
          ? runsWithHR.reduce((sum, a) => sum + (a.average_heartrate || 0), 0) /
            runsWithHR.length
          : 0;

      const avgPace =
        weekRuns.length > 0 && totalDistance > 0
          ? weekRuns.reduce((sum, a) => sum + a.moving_time, 0) /
            (weekRuns.reduce((sum, a) => sum + a.distance, 0) / 1000)
          : 0;

      // Simple TSS estimation
      const tss = weekActivities.reduce((sum, a) => {
        const intensity = a.average_heartrate ? a.average_heartrate / 180 : 0.7;
        return sum + (a.moving_time / 3600) * 100 * intensity * intensity;
      }, 0);

      weeklyData.push({
        week: format(weekStart, "dd/MM"),
        weekStart: format(weekStart, "yyyy-MM-dd"),
        distance: totalDistance,
        time: totalTime,
        activities: weekActivities.length,
        avgPace,
        avgHR,
        elevation: totalElevation,
        tss,
      });
    }

    // ============ MONTHLY TRENDS ============
    const monthlyData: MonthlyData[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = startOfMonth(subMonths(now, i - 1));

      const monthActivities = activities.filter((a) => {
        const date = new Date(a.start_date_local);
        return date >= monthStart && date < monthEnd;
      });

      const monthRuns = monthActivities.filter(
        (a) => a.sport_type === "Run" || a.sport_type === "VirtualRun",
      );

      const totalDistance = monthActivities.reduce(
        (sum, a) => sum + a.distance,
        0,
      );
      const totalTime = monthActivities.reduce(
        (sum, a) => sum + a.moving_time,
        0,
      );
      const totalElevation = monthActivities.reduce(
        (sum, a) => sum + a.total_elevation_gain,
        0,
      );

      const avgPace =
        monthRuns.length > 0
          ? monthRuns.reduce((sum, a) => sum + a.moving_time, 0) /
            (monthRuns.reduce((sum, a) => sum + a.distance, 0) / 1000)
          : 0;

      monthlyData.push({
        month: format(monthStart, "MMM yy"),
        distance: totalDistance,
        time: totalTime,
        activities: monthActivities.length,
        avgPace,
        elevation: totalElevation,
      });
    }

    // ============ MONTH OVER MONTH ============
    const compThisMonthStart = startOfMonth(now);
    const compLastMonthStart = startOfMonth(subMonths(now, 1));

    const compThisMonthActivities = activities.filter(
      (a) => new Date(a.start_date_local) >= compThisMonthStart,
    );
    const compLastMonthActivities = activities.filter((a) => {
      const date = new Date(a.start_date_local);
      return date >= compLastMonthStart && date < compThisMonthStart;
    });

    const monthComparison = {
      thisMonth: {
        distance: compThisMonthActivities.reduce(
          (sum, a) => sum + a.distance,
          0,
        ),
        time: compThisMonthActivities.reduce(
          (sum, a) => sum + a.moving_time,
          0,
        ),
        activities: compThisMonthActivities.length,
        elevation: compThisMonthActivities.reduce(
          (sum, a) => sum + a.total_elevation_gain,
          0,
        ),
      },
      lastMonth: {
        distance: compLastMonthActivities.reduce(
          (sum, a) => sum + a.distance,
          0,
        ),
        time: compLastMonthActivities.reduce(
          (sum, a) => sum + a.moving_time,
          0,
        ),
        activities: compLastMonthActivities.length,
        elevation: compLastMonthActivities.reduce(
          (sum, a) => sum + a.total_elevation_gain,
          0,
        ),
      },
    };

    // ============ ZONE DISTRIBUTION BY WEEK ============
    const zoneDistribution: ZoneDistribution[] = [];
    // Estimate max HR
    const maxHRActivities = activities.filter(
      (a) => a.max_heartrate && a.max_heartrate > 150,
    );
    const estimatedMaxHR =
      maxHRActivities.length > 0
        ? Math.max(...maxHRActivities.map((a) => a.max_heartrate || 0))
        : 190;

    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });

      const weekActivities = activities.filter((a) => {
        const date = new Date(a.start_date_local);
        return date >= weekStart && date < weekEnd && a.average_heartrate;
      });

      let zone1 = 0,
        zone2 = 0,
        zone3 = 0,
        zone4 = 0,
        zone5 = 0;

      for (const act of weekActivities) {
        if (!act.average_heartrate) continue;
        const hrPercent = (act.average_heartrate / estimatedMaxHR) * 100;
        const time = act.moving_time;

        // Simplified zone estimation based on average HR
        if (hrPercent < 60) zone1 += time;
        else if (hrPercent < 70) zone2 += time;
        else if (hrPercent < 80) zone3 += time;
        else if (hrPercent < 90) zone4 += time;
        else zone5 += time;
      }

      zoneDistribution.push({
        week: format(weekStart, "dd/MM"),
        zone1,
        zone2,
        zone3,
        zone4,
        zone5,
      });
    }

    // ============ TIME OF DAY ANALYSIS ============
    const timeOfDayMap = new Map<
      number,
      { count: number; totalPace: number; totalHR: number; hrCount: number }
    >();

    for (const act of runActivities) {
      const hour = getHours(new Date(act.start_date_local));
      const existing = timeOfDayMap.get(hour) || {
        count: 0,
        totalPace: 0,
        totalHR: 0,
        hrCount: 0,
      };

      const pace = act.moving_time / (act.distance / 1000);
      existing.count++;
      existing.totalPace += pace;
      if (act.average_heartrate) {
        existing.totalHR += act.average_heartrate;
        existing.hrCount++;
      }

      timeOfDayMap.set(hour, existing);
    }

    const timeOfDayData: TimeOfDayData[] = Array.from(timeOfDayMap.entries())
      .map(([hour, data]) => ({
        hour,
        count: data.count,
        avgPace: data.totalPace / data.count,
        avgHR: data.hrCount > 0 ? data.totalHR / data.hrCount : 0,
      }))
      .sort((a, b) => a.hour - b.hour);

    // ============ DAY OF WEEK ANALYSIS ============
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeekMap = new Map<
      number,
      { count: number; distance: number; totalPace: number }
    >();

    for (const act of activities) {
      const day = getDay(new Date(act.start_date_local));
      const existing = dayOfWeekMap.get(day) || {
        count: 0,
        distance: 0,
        totalPace: 0,
      };

      existing.count++;
      existing.distance += act.distance;
      if (act.sport_type === "Run" || act.sport_type === "VirtualRun") {
        existing.totalPace += act.moving_time / (act.distance / 1000);
      }

      dayOfWeekMap.set(day, existing);
    }

    const dayOfWeekData: DayOfWeekData[] = [1, 2, 3, 4, 5, 6, 0].map((day) => {
      const data = dayOfWeekMap.get(day) || {
        count: 0,
        distance: 0,
        totalPace: 0,
      };
      return {
        day,
        dayName: dayNames[day],
        count: data.count,
        distance: data.distance,
        avgPace: data.count > 0 ? data.totalPace / data.count : 0,
      };
    });

    // ============ PR PROGRESSION ============
    // PRs are fetched separately via /api/best-efforts endpoint
    const prProgression: PRProgression[] = [];

    // ============ PACE VS HR (Aerobic Efficiency) ============
    const paceHRData: PaceHRPoint[] = runActivities
      .filter(
        (a) =>
          a.average_heartrate && a.average_heartrate > 100 && a.distance > 3000,
      )
      .slice(0, 50)
      .map((a) => {
        const pace = a.moving_time / (a.distance / 1000); // sec/km
        const hr = a.average_heartrate || 0;
        const efficiency = (1000 / pace / hr) * 1000; // meters per minute per bpm

        return {
          date: a.start_date_local.split("T")[0],
          pace,
          hr,
          efficiency,
          activityName: a.name,
        };
      })
      .reverse();

    // Calculate efficiency trend
    const recentEfficiency = paceHRData.slice(-10);
    const olderEfficiency = paceHRData.slice(0, 10);

    const avgRecentEff =
      recentEfficiency.length > 0
        ? recentEfficiency.reduce((sum, p) => sum + p.efficiency, 0) /
          recentEfficiency.length
        : 0;
    const avgOlderEff =
      olderEfficiency.length > 0
        ? olderEfficiency.reduce((sum, p) => sum + p.efficiency, 0) /
          olderEfficiency.length
        : 0;

    const efficiencyTrend =
      avgOlderEff > 0 ? ((avgRecentEff - avgOlderEff) / avgOlderEff) * 100 : 0;

    // ============ GOALS ============
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentMonthStart = startOfMonth(now);

    const thisWeekActivities = activities.filter(
      (a) => new Date(a.start_date_local) >= currentWeekStart,
    );
    const thisMonthActivities = activities.filter(
      (a) => new Date(a.start_date_local) >= currentMonthStart,
    );

    // Calculate suggested goals based on recent averages
    const avgWeeklyDistance =
      weeklyData.slice(-4).reduce((sum, w) => sum + w.distance, 0) / 4;
    const avgWeeklyTime =
      weeklyData.slice(-4).reduce((sum, w) => sum + w.time, 0) / 4;
    const avgWeeklyActivities =
      weeklyData.slice(-4).reduce((sum, w) => sum + w.activities, 0) / 4;

    const goals: Goal[] = [
      {
        id: "weekly_distance",
        type: "weekly_distance",
        target: Math.round((avgWeeklyDistance * 1.1) / 1000) * 1000, // 10% increase, rounded
        current: thisWeekActivities.reduce((sum, a) => sum + a.distance, 0),
        unit: "km",
        period: "This week",
      },
      {
        id: "weekly_time",
        type: "weekly_time",
        target: Math.round((avgWeeklyTime * 1.1) / 3600) * 3600, // 10% increase, rounded to hours
        current: thisWeekActivities.reduce((sum, a) => sum + a.moving_time, 0),
        unit: "hours",
        period: "This week",
      },
      {
        id: "weekly_activities",
        type: "weekly_activities",
        target: Math.max(Math.round(avgWeeklyActivities), 3),
        current: thisWeekActivities.length,
        unit: "activities",
        period: "This week",
      },
      {
        id: "monthly_distance",
        type: "monthly_distance",
        target: Math.round((avgWeeklyDistance * 4.3 * 1.1) / 1000) * 1000, // Monthly based on weekly avg
        current: thisMonthActivities.reduce((sum, a) => sum + a.distance, 0),
        unit: "km",
        period: "This month",
      },
    ];

    // ============ 80/20 RULE CHECK ============
    const totalEasyTime = zoneDistribution.reduce(
      (sum, w) => sum + w.zone1 + w.zone2,
      0,
    );
    const totalHardTime = zoneDistribution.reduce(
      (sum, w) => sum + w.zone4 + w.zone5,
      0,
    );
    const totalZoneTime = zoneDistribution.reduce(
      (sum, w) => sum + w.zone1 + w.zone2 + w.zone3 + w.zone4 + w.zone5,
      0,
    );

    const easyPercent =
      totalZoneTime > 0 ? (totalEasyTime / totalZoneTime) * 100 : 0;
    const hardPercent =
      totalZoneTime > 0 ? (totalHardTime / totalZoneTime) * 100 : 0;

    const trainingBalance = {
      easyPercent: Math.round(easyPercent),
      hardPercent: Math.round(hardPercent),
      moderatePercent: Math.round(100 - easyPercent - hardPercent),
      isPolarized: easyPercent >= 75 && hardPercent <= 20,
      recommendation:
        easyPercent < 75
          ? "Consider more easy workouts (zone 1-2) for better recovery"
          : hardPercent > 20
            ? "Reduce high intensity slightly to avoid overtraining"
            : "Excellent polarized training balance",
    };

    return NextResponse.json({
      weeklyData,
      monthlyData,
      monthComparison,
      zoneDistribution,
      timeOfDayData,
      dayOfWeekData,
      prProgression,
      paceHRData,
      efficiencyTrend,
      goals,
      trainingBalance,
      estimatedMaxHR,
    });
  } catch (error) {
    console.error("Error fetching advanced stats:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch advanced stats", details: errorMessage },
      { status: 500 },
    );
  }
}
