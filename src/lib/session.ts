import { cookies } from "next/headers";
import { refreshAccessToken } from "./strava";
import type { StravaTokens, StravaAthlete } from "@/types/strava";

const SESSION_COOKIE = "strava_session";

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athlete: StravaAthlete;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value);

    const now = Math.floor(Date.now() / 1000);
    if (session.expiresAt < now + 300) {
      const newTokens = await refreshAccessToken(session.refreshToken);
      const newSession: Session = {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
        expiresAt: newTokens.expires_at,
        athlete: session.athlete,
      };

      await setSession(newSession);
      return newSession;
    }

    return session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function tokensToSession(tokens: StravaTokens): Session {
  if (!tokens.athlete) {
    throw new Error("No athlete data in tokens");
  }
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_at,
    athlete: tokens.athlete,
  };
}
