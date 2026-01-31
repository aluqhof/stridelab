"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchSession,
  fetchStats,
  fetchZones,
  fetchActivities,
  fetchActivity,
  fetchActivityStreams,
  fetchActivityZones,
  fetchPredictions,
  fetchPremiumStats,
  fetchAdvancedStats,
  fetchBestEfforts,
} from "@/lib/api-client";

const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;
const THIRTY_MINUTES = 1000 * 60 * 30;
const ONE_HOUR = 1000 * 60 * 60;

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: TEN_MINUTES,
    gcTime: ONE_HOUR,
    retry: false,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: THIRTY_MINUTES,
    gcTime: ONE_HOUR,
  });
}

export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: fetchZones,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR * 2,
  });
}

export function useActivities(perPage: number = 30) {
  return useInfiniteQuery({
    queryKey: ["activities", perPage],
    queryFn: ({ pageParam = 1 }) => fetchActivities(pageParam, perPage),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < perPage) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: TEN_MINUTES,
    gcTime: THIRTY_MINUTES,
  });
}

export function useActivity(id: number | null) {
  return useQuery({
    queryKey: ["activity", id],
    queryFn: () => fetchActivity(id!),
    enabled: id !== null,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR * 2,
  });
}

export function useActivityStreams(id: number | null) {
  return useQuery({
    queryKey: ["activity-streams", id],
    queryFn: () => fetchActivityStreams(id!),
    enabled: id !== null,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR * 2,
  });
}

export function useActivityZones(id: number | null) {
  return useQuery({
    queryKey: ["activity-zones", id],
    queryFn: () => fetchActivityZones(id!),
    enabled: id !== null,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR * 2,
  });
}

export function usePredictions() {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: fetchPredictions,
    staleTime: THIRTY_MINUTES,
    gcTime: ONE_HOUR,
  });
}

export function usePremiumStats() {
  return useQuery({
    queryKey: ["premium-stats"],
    queryFn: fetchPremiumStats,
    staleTime: THIRTY_MINUTES,
    gcTime: ONE_HOUR,
  });
}

export function useAdvancedStats() {
  return useQuery({
    queryKey: ["advanced-stats"],
    queryFn: fetchAdvancedStats,
    staleTime: THIRTY_MINUTES,
    gcTime: ONE_HOUR,
  });
}

export function useBestEfforts() {
  return useQuery({
    queryKey: ["best-efforts"],
    queryFn: fetchBestEfforts,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR * 2,
  });
}
