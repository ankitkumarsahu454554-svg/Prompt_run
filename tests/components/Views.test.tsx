import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { DashboardView } from "../../src/features/dashboard/DashboardView";
import { ForecastView } from "../../src/features/forecast/ForecastView";
import { InsightsView } from "../../src/features/insights/InsightsView";
import { SettingsView } from "../../src/features/settings/SettingsView";
import { AppShell } from "../../src/components/layout/AppShell";
import { ImpactBar } from "../../src/components/layout/ImpactBar";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { BottomTabBar } from "../../src/components/layout/BottomTabBar";
import { RippleToast } from "../../src/components/feedback/RippleToast";
import { Sparkline } from "../../src/components/charts/Sparkline";
import { DonutChart } from "../../src/components/charts/DonutChart";
import { LineChart } from "../../src/components/charts/LineChart";
import { useFinanceStore } from "../../src/store/financeStore";
import { asPaise } from "../../src/domain/money";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Core Views and Layout Components Rendering", () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
  });

  it("renders DashboardView with remaining balance and key KPIs", () => {
    render(<DashboardView />);
    expect(screen.getByText(/Safe Daily Budget/i)).toBeDefined();
    expect(screen.getByText(/Quick Add/i)).toBeDefined();
  });

  it("renders ForecastView with trajectory chart and risk diagnosis", () => {
    render(<ForecastView />);
    expect(screen.getByText(/30-Day Forecast & Risk/i)).toBeDefined();
    expect(screen.getByText(/Balance Trajectory Projection/i)).toBeDefined();
    expect(screen.getByText(/Risk Diagnostics/i)).toBeDefined();
  });

  it("renders InsightsView with financial health score and 6 factors", () => {
    render(<InsightsView />);
    expect(screen.getByText(/Financial Health & Insights/i)).toBeDefined();
    expect(screen.getByText(/6-Factor Diagnostic Breakdown/i)).toBeDefined();
    expect(screen.getByText(/Expense Allocation by Category/i)).toBeDefined();
  });

  it("renders SettingsView with theme and demo data controls", () => {
    render(<SettingsView />);
    expect(screen.getByText(/Settings & Data Controls/i)).toBeDefined();
    expect(screen.getByText(/Appearance & Theme/i)).toBeDefined();
    expect(screen.getByText(/Reset Demo \(Day 8\)/i)).toBeDefined();
  });

  it("renders layout shell, ImpactBar, Sidebar, and BottomTabBar", () => {
    render(
      <AppShell>
        <div>Content Inside Shell</div>
      </AppShell>
    );

    expect(screen.getByText("Content Inside Shell")).toBeDefined();
    expect(screen.getByText(/Survive The Month/i)).toBeDefined();
  });

  it("renders RippleToast when a ripple state is present and handles undo", () => {
    useFinanceStore.setState({
      lastRipple: {
        id: "rip-1",
        actionTitle: "Added Chai expense",
        allowanceBefore: asPaise(31200),
        allowanceAfter: asPaise(28700),
        riskBefore: "Watch",
        riskAfter: "Watch",
        healthBefore: 62,
        healthAfter: 61,
        canUndo: true,
        timestamp: Date.now(),
      },
    });

    render(<RippleToast />);
    expect(screen.getByText(/Added Chai expense/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Undo/i })).toBeDefined();

    const undoBtn = screen.getByRole("button", { name: /Undo/i });
    fireEvent.click(undoBtn);
  });

  it("renders charts directly with edge case data", () => {
    const { container: sparklineBox } = render(
      <Sparkline data={[100, 200, 150, 300, 250]} />
    );
    expect(sparklineBox.querySelector("svg")).toBeDefined();

    const { container: donutBox } = render(
      <DonutChart
        expenses={[
          { id: "e1", amount: asPaise(50000), category: "Food", day: 1, note: "Test", source: "manual" },
          { id: "e2", amount: asPaise(30000), category: "Fun", day: 2, note: "Test", source: "manual" },
        ]}
      />
    );
    expect(donutBox.querySelector("svg")).toBeDefined();

    const { container: lineBox } = render(
      <LineChart
        projections={[
          { day: 1, projectedBalance: asPaise(100000), income: asPaise(0), obligations: asPaise(0), burnRate: asPaise(100) },
          { day: 2, projectedBalance: asPaise(90000), income: asPaise(0), obligations: asPaise(0), burnRate: asPaise(100) },
        ]}
        currentDay={1}
      />
    );
    expect(lineBox.querySelector("svg")).toBeDefined();
  });
});
