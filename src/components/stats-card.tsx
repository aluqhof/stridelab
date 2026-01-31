"use client";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  accentColor?: "cyan" | "green" | "blue" | "red" | "teal";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-gray-200 p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm font-medium flex items-center gap-1",
                trend.value >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              <svg
                className={cn("w-3 h-3", trend.value < 0 && "rotate-180")}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {Math.abs(trend.value)}%
              <span className="text-gray-500 font-normal">{trend.label}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-gray-100 p-2.5 text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
