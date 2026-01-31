import type {
  StravaActivity,
  StravaStats,
  StravaZones,
  StravaActivityStream,
  ActivityZones,
  PredictionsData,
  PremiumStatsData,
  AdvancedStatsData,
} from "@/types/strava";
import type { Session } from "@/lib/session";

async function apiFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`/api${endpoint}`);

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/";
      throw new Error("UNAUTHORIZED");
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchSession(): Promise<Session | null> {
  const response = await fetch("/api/auth/session");
  if (!response.ok) return null;
  return response.json();
}

export async function fetchStats(): Promise<StravaStats> {
  return apiFetch<StravaStats>("/stats");
}

export async function fetchZones(): Promise<StravaZones> {
  return apiFetch<StravaZones>("/zones");
}

export async function fetchActivities(
  page: number = 1,
  perPage: number = 30
): Promise<StravaActivity[]> {
  return apiFetch<StravaActivity[]>(
    `/activities?page=${page}&per_page=${perPage}`
  );
}

export async function fetchActivity(id: number): Promise<StravaActivity> {
  return apiFetch<StravaActivity>(`/activities/${id}`);
}

export async function fetchActivityStreams(
  id: number
): Promise<Record<string, StravaActivityStream>> {
  return apiFetch<Record<string, StravaActivityStream>>(
    `/activities/${id}/streams`
  );
}

export async function fetchActivityZones(id: number): Promise<ActivityZones[]> {
  return apiFetch<ActivityZones[]>(`/activities/${id}/zones`);
}

export async function fetchPredictions(): Promise<PredictionsData> {
  return apiFetch<PredictionsData>("/predictions");
}

export async function fetchPremiumStats(): Promise<PremiumStatsData> {
  return apiFetch<PremiumStatsData>("/premium-stats");
}

export async function fetchBestEfforts(): Promise<{
  personalRecords: import("@/types/strava").PersonalRecord[];
  activitiesScanned: number;
}> {
  return apiFetch("/best-efforts");
}

export async function fetchAdvancedStats(): Promise<AdvancedStatsData> {
  return apiFetch<AdvancedStatsData>("/advanced-stats");
}
