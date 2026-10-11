"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarCheck, Home, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/simulate", label: "Simulate", icon: Sparkles },
  { href: "/plans", label: "Plans", icon: CalendarCheck },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export const BottomTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-lg"
    >
      <ul className="flex items-center justify-around h-16 max-w-md mx-auto px-2 m-0 p-0 list-none">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[44px] py-1 text-xs font-medium transition-colors rounded-input select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text",
                  isActive
                    ? "text-primary-text font-semibold"
                    : "text-muted hover:text-text",
                )}
              >
                <Icon
                  className={cn("w-5 h-5 mb-0.5", isActive && "stroke-[2.5px]")}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
