import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Stride<span className="text-cyan-600">lab</span>
        </h1>

        <p className="text-gray-500 mb-8">
          Your Running Lab
        </p>

        <p className="text-gray-600 mb-10">
          Smart training analysis.
          Data that makes you a better runner.
        </p>

        <Link
          href="/api/auth/login"
          className="inline-flex items-center gap-2 bg-[#fc4c02] hover:bg-[#e34402] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Connect with Strava
        </Link>

        <p className="mt-8 text-gray-400 text-sm">
          Powered by Strava API
        </p>
      </div>
    </main>
  );
}
