"use client";

import { useSession } from "@/hooks/use-strava";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-gray-900">
              Stride<span className="text-cyan-600">lab</span>
            </span>
          </Link>

          {session && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
                {session.athlete.profile && (
                  <Image
                    src={session.athlete.profile}
                    alt={session.athlete.firstname}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {session.athlete.firstname}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
