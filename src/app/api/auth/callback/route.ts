import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/strava";
import { setSession, tokensToSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/?error=access_denied", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const session = tokensToSession(tokens);
    await setSession(session);

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
