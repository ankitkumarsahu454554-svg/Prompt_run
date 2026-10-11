"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useFinanceStore } from "../../store/financeStore";
import { RippleToast } from "../feedback/RippleToast";
import { Skeleton } from "../feedback/Skeleton";
import { BottomTabBar } from "./BottomTabBar";
import { ImpactBar } from "./ImpactBar";
import { Sidebar } from "./Sidebar";
import { SkipLink } from "./SkipLink";

const AddExpenseModal = dynamic(
  () => import("../../features/expenses/AddExpenseModal").then((mod) => mod.AddExpenseModal),
  { ssr: false }
);

const UnexpectedEventModal = dynamic(
  () => import("../../features/events/UnexpectedEventModal").then((mod) => mod.UnexpectedEventModal),
  { ssr: false }
);

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const hydrate = useFinanceStore((s) => s.hydrate);
  const isHydrated = useFinanceStore((s) => s.isHydrated);
  const isAddExpenseOpen = useFinanceStore((s) => s.isAddExpenseOpen);
  const setAddExpenseOpen = useFinanceStore((s) => s.setAddExpenseOpen);
  const selectedEventId = useFinanceStore((s) => s.selectedEventId);
  const setSelectedEventId = useFinanceStore((s) => s.setSelectedEventId);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <SkipLink />

      {/* Desktop Sidebar (>= 1024px) */}
      <Sidebar />

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-6">
        {/* Persistent ImpactBar */}
        <ImpactBar />

        {/* Page Content */}
        <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
          {!isHydrated ? (
            <div role="status" className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading financial dashboard">
              <div className="h-32 rounded-card bg-surface border border-border p-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-44 rounded-card bg-surface border border-border p-4" />
                <div className="h-44 rounded-card bg-surface border border-border p-4" />
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (< 1024px) */}
      <BottomTabBar />

      {/* Global RippleToast for mutations & undo */}
      <RippleToast />

      {/* Dynamic Global Overlays */}
      {isAddExpenseOpen && (
        <AddExpenseModal open={isAddExpenseOpen} onOpenChange={setAddExpenseOpen} />
      )}
      {selectedEventId && (
        <UnexpectedEventModal
          eventId={selectedEventId}
          open={Boolean(selectedEventId)}
          onOpenChange={(open) => {
            if (!open) setSelectedEventId(null);
          }}
        />
      )}
    </div>
  );
};
