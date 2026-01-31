import type {
  StravaTokens,
  StravaAthlete,
  StravaActivity,
  StravaStats,
  StravaZones,
  StravaActivityStream,
  ActivityZones,
} from "@/types/strava";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_OAUTH_BASE = "https://www.strava.com/oauth";

export function getAuthorizationUrl(): string {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`;
  const scope = "read,activity:read_all,profile:read_all";

  return `${STRAVA_OAUTH_BASE}/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<StravaTokens> {
  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  return response.json();
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<StravaTokens> {
  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
}

async function stravaFetch<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  const response = await fetch(`${STRAVA_API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error(`Strava API error: ${response.status}`);
  }

  return response.json();
}

export async function getAthlete(accessToken: string): Promise<StravaAthlete> {
  return stravaFetch<StravaAthlete>("/athlete", accessToken);
}

export async function getAthleteStats(
  accessToken: string,
  athleteId: number
): Promise<StravaStats> {
  return stravaFetch<StravaStats>(
    `/athletes/${athleteId}/stats`,
    accessToken
  );
}

export async function getAthleteZones(
  accessToken: string
): Promise<StravaZones> {
  return stravaFetch<StravaZones>("/athlete/zones", accessToken);
}

export async function getActivities(
  accessToken: string,
  page: number = 1,
  perPage: number = 30,
  before?: number,
  after?: number
): Promise<StravaActivity[]> {
  let endpoint = `/athlete/activities?page=${page}&per_page=${perPage}`;
  if (before) endpoint += `&before=${before}`;
  if (after) endpoint += `&after=${after}`;
  return stravaFetch<StravaActivity[]>(endpoint, accessToken);
}

export async function getActivity(
  accessToken: string,
  activityId: number
): Promise<StravaActivity> {
  return stravaFetch<StravaActivity>(
    `/activities/${activityId}`,
    accessToken
  );
}

export async function getActivityStreams(
  accessToken: string,
  activityId: number,
  keys: string[] = ["time", "distance", "heartrate", "altitude", "velocity_smooth", "watts", "cadence", "latlng"]
): Promise<StravaActivityStream[]> {
  return stravaFetch<StravaActivityStream[]>(
    `/activities/${activityId}/streams?keys=${keys.join(",")}&key_by_type=true`,
    accessToken
  );
}

export async function getActivityZones(
  accessToken: string,
  activityId: number
): Promise<ActivityZones[]> {
  return stravaFetch<ActivityZones[]>(
    `/activities/${activityId}/zones`,
    accessToken
  );
}
