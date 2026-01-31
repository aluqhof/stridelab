import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  await clearSession();
  return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL));
}
