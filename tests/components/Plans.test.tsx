import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { PlansView } from "../../src/features/commitments/PlansView";
import { useFinanceStore } from "../../src/store/financeStore";

describe("PlansView Component (Commitments, Subscriptions, Goals)", () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
  });

  it("renders subscriptions tab and allows toggling subscription active status", async () => {
    const user = userEvent.setup();
    render(<PlansView />);

    // Switch to subscriptions tab
    const subsTab = screen.getByRole("tab", { name: /Subscriptions/i });
    await user.click(subsTab);

    // Find a subscription switch
    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBeGreaterThan(0);

    const firstSwitch = switches[0]!;
    const initialChecked = firstSwitch.getAttribute("aria-checked") === "true";

    // Toggle subscription
    await user.click(firstSwitch);

    // Verify status flipped in store
    const updatedSub = useFinanceStore.getState().state.subscriptions[0];
    expect(updatedSub?.active).toBe(!initialChecked);
  });

  it("renders goals tab and handles 'What if I skip a coffee' nudge", async () => {
    const user = userEvent.setup();
    render(<PlansView />);

    // Switch to goals tab
    const goalsTab = screen.getByRole("tab", { name: /Goals/i });
    await user.click(goalsTab);

    // Click Skip a Coffee nudge
    const coffeeNudgeBtn = screen.getByRole("button", { name: /Skip Coffee/i });
    const initialTransfers = useFinanceStore.getState().state.transfers.length;

    await user.click(coffeeNudgeBtn);

    expect(useFinanceStore.getState().state.transfers.length).toBe(initialTransfers + 1);
  });
});
