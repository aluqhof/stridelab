export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatRaceTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatPace(metersPerSecond: number, sportType?: string): string {
  if (metersPerSecond === 0) return "-";

  if (sportType?.toLowerCase().includes("run")) {
    const secondsPerKm = 1000 / metersPerSecond;
    const mins = Math.floor(secondsPerKm / 60);
    const secs = Math.round(secondsPerKm % 60);
    return `${mins}:${secs.toString().padStart(2, "0")} /km`;
  }

  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`;
}

export function formatHeartRate(bpm: number): string {
  return `${Math.round(bpm)} bpm`;
}

export function formatPower(watts: number): string {
  return `${Math.round(watts)} W`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getActivityIcon(sportType: string): string {
  const icons: Record<string, string> = {
    Run: "🏃",
    Ride: "🚴",
    Swim: "🏊",
    Walk: "🚶",
    Hike: "🥾",
    VirtualRide: "🚴‍♂️",
    VirtualRun: "🏃‍♂️",
    WeightTraining: "🏋️",
    Workout: "💪",
    Yoga: "🧘",
    default: "🏅",
  };
  return icons[sportType] || icons.default;
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
