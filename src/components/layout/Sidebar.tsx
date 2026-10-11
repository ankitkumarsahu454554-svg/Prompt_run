"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  ChevronRight,
  FastForward,
  History,
  Home,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useFinanceStore } from "../../store/financeStore";
import { Button } from "../ui/Button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/simulate", label: "Decision Simulator", icon: Sparkles },
  { href: "/timemachine", label: "Time Machine", icon: History },
  { href: "/plans", label: "Plans & Goals", icon: CalendarCheck },
  { href: "/forecast", label: "Forecast & Risk", icon: TrendingUp },
  { href: "/insights", label: "Health & Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const currentDay = useFinanceStore((s) => s.state.meta.currentDay);
  const totalDays = useFinanceStore((s) => s.state.config.totalDays);
  const advanceDay = useFinanceStore((s) => s.advanceDay);

  return (
    <aside
      aria-label="Desktop primary navigation"
      className="hidden lg:flex flex-col w-64 bg-surface border-r border-border shrink-0 min-h-screen p-5 select-none"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 pb-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-heading text-lg shadow-sm">
          ₹
        </div>
        <div className="flex flex-col text-left">
          <span className="font-heading font-bold text-sm tracking-tight text-text leading-tight">
            Survive The Month
          </span>
          <span className="text-[11px] text-muted">Broke But Functional</span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1.5 m-0 p-0 list-none">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-input text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text",
                    isActive
                      ? "bg-elevated text-primary-text font-semibold border border-border shadow-xs"
                      : "text-muted hover:text-text hover:bg-elevated/50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Time machine: Advance day button */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Month Progress</span>
          <span className="font-mono font-medium text-text">
            Day {currentDay}/{totalDays}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={advanceDay}
          disabled={currentDay >= totalDays}
          className="w-full gap-2 text-xs font-semibold justify-center min-h-[44px]"
          aria-label={`Advance to Day ${Math.min(totalDays, currentDay + 1)}`}
        >
          <FastForward className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Advance to Day {Math.min(totalDays, currentDay + 1)}</span>
        </Button>
      </div>
    </aside>
  );
};
