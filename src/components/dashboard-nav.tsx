"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Overview", href: "/dashboard", exact: true },
  { name: "Analysis", href: "/dashboard/analysis" },
  { name: "Predictions", href: "/dashboard/predictions" },
  { name: "Activities", href: "/dashboard/activities" },
];

export function DashboardNav() {
  const pathname = usePathname();

  if (pathname.includes("/activity/")) {
    return null;
  }

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative
                  ${active
                    ? "text-cyan-600"
                    : "text-gray-500 hover:text-gray-900"
                  }
                `}
              >
                {tab.name}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
