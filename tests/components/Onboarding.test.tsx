import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { OnboardingView } from "../../src/features/onboarding/OnboardingView";
import { useFinanceStore } from "../../src/store/financeStore";

// Mock next/navigation useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("OnboardingView Component", () => {
  beforeEach(() => {
    mockPush.mockClear();
    useFinanceStore.getState().startFresh();
  });

  it("navigates through step 1, step 2, step 3", async () => {
    const user = userEvent.setup();
    render(<OnboardingView />);

    expect(screen.getByText(/What is your 30-day budget\?/i)).toBeDefined();

    // Proceed to Step 2
    const nextBtn = screen.getByRole("button", { name: /Next: Income Sources/i });
    await user.click(nextBtn);

    expect(screen.getByText(/Any expected incomes this month\?/i)).toBeDefined();

    // Proceed to Step 3
    const nextStep3Btn = screen.getByRole("button", { name: /Next: First Goal/i });
    await user.click(nextStep3Btn);

    expect(screen.getByText(/Set your first savings goal/i)).toBeDefined();

    // Launch Dashboard
    const launchBtn = screen.getByRole("button", { name: /Launch Dashboard/i });
    await user.click(launchBtn);

    expect(useFinanceStore.getState().state.meta.onboarded).toBe(true);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("allows instant bypass to demo data", async () => {
    const user = userEvent.setup();
    render(<OnboardingView />);

    const demoBtn = screen.getByRole("button", { name: /Use Demo Data/i });
    await user.click(demoBtn);

    expect(useFinanceStore.getState().state.meta.onboarded).toBe(true);
    expect(useFinanceStore.getState().state.meta.currentDay).toBe(8);
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
