import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import axe from "axe-core";
import { DayScrubber } from "../../src/features/timemachine/components/DayScrubber";
import { TimeMachineView } from "../../src/features/timemachine/TimeMachineView";
import { SurvivalOddsCard } from "../../src/features/forecast/components/SurvivalOddsCard";
import { CompareDecisionsCard } from "../../src/features/simulator/components/CompareDecisionsCard";
import { SmartSwapsCard } from "../../src/features/commitments/components/SmartSwapsCard";
import { GamificationCard } from "../../src/features/dashboard/components/GamificationCard";
import { RecapCanvasCard } from "../../src/features/settings/components/RecapCanvasCard";
import { createDefaultSeed } from "../../src/domain/seed";
import { calculateSurvivalOdds } from "../../src/domain/engine/survivalOdds";
import { computeMonthRecap } from "../../src/domain/engine/monthRecap";

describe("Innovation Features Component & A11y Suite", () => {
  const state = createDefaultSeed();

  it("DayScrubber renders slider with accessible aria-valuetext and keyboard support", async () => {
    const handleDayChange = vi.fn();
    const handleReset = vi.fn();
    const { container } = render(
      <DayScrubber
        currentDay={14}
        totalDays={30}
        selectedDay={14}
        ariaValueText="Day 14, balance 2,340 rupees"
        onDayChange={handleDayChange}
        onReset={handleReset}
      />
    );

    const slider = screen.getByRole("slider", { name: /Replay month day slider/i });
    expect(slider).toBeDefined();
    expect(slider.getAttribute("aria-valuetext")).toBe("Day 14, balance 2,340 rupees");

    fireEvent.change(slider, { target: { value: "10" } });
    expect(handleDayChange).toHaveBeenCalledWith(10);

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("SurvivalOddsCard renders meter and has zero accessibility violations", async () => {
    const odds = calculateSurvivalOdds(state);
    const { container } = render(<SurvivalOddsCard odds={odds} />);

    expect(screen.getByText(new RegExp(`Month Survival Odds: ${odds.oddsPercent}%`, "i"))).toBeDefined();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(String(odds.oddsPercent));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("CompareDecisionsCard allows simulating A vs B side-by-side with winner verdict", async () => {
    const handleCommit = vi.fn();
    const { container } = render(<CompareDecisionsCard state={state} onCommit={handleCommit} />);

    expect(screen.getByText(/Compare Mode \(A vs B vs Neither\)/i)).toBeDefined();

    const compareBtn = screen.getByRole("button", { name: /Compare Options A vs B/i });
    fireEvent.click(compareBtn);

    expect(screen.getByText(/Winner Verdict:/i)).toBeDefined();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("SmartSwapsCard renders ranked allowance boosters and has zero a11y violations", async () => {
    const handleSimulate = vi.fn();
    const { container } = render(<SmartSwapsCard state={state} onSimulateSwap={handleSimulate} />);

    expect(screen.getByText(/Smart Swaps: Allowance Boosters/i)).toBeDefined();
    expect(screen.getAllByRole("button", { name: /Simulate/i }).length).toBeGreaterThan(0);

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("GamificationCard renders rank, streaks, badges and has zero a11y violations", async () => {
    const { container } = render(<GamificationCard state={state} />);

    expect(screen.getByText(/Survival Status & Streaks/i)).toBeDefined();
    expect(screen.getByText(/No-Spend Streak/i)).toBeDefined();
    expect(screen.getByText(/Achievements/i)).toBeDefined();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("RecapCanvasCard renders canvas and text summary fallback with zero a11y violations", async () => {
    const recap = computeMonthRecap(state);
    const { container } = render(<RecapCanvasCard recap={recap} />);

    expect(screen.getByRole("button", { name: /Download PNG/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Copy Text/i })).toBeDefined();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("renders TimeMachineView with day scrubber, replay KPIs and counterfactual toggles", async () => {
    const { container } = render(<TimeMachineView />);

    expect(screen.getByText(/Time Machine & Counterfactuals/i)).toBeDefined();
    expect(screen.getByRole("slider", { name: /Replay month day slider/i })).toBeDefined();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
