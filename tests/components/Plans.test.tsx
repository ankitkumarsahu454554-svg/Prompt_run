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

    const subsTab = screen.getByRole("tab", { name: /Subscriptions/i });
    await user.click(subsTab);

    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBeGreaterThan(0);

    const firstSwitch = switches[0]!;
    const initialChecked = firstSwitch.getAttribute("aria-checked") === "true";

    await user.click(firstSwitch);

    const updatedSub = useFinanceStore.getState().state.subscriptions[0];
    expect(updatedSub?.active).toBe(!initialChecked);
  });

  it("renders commitments tab and toggles early payment on a commitment", async () => {
    const user = userEvent.setup();
    render(<PlansView />);

    const comTab = screen.getByRole("tab", { name: /Commitments/i });
    await user.click(comTab);

    expect(screen.getByText(/Fixed Obligations/i)).toBeDefined();

    const payEarlyBtn = screen.getAllByRole("button", { name: /Pay Early/i })[0]!;
    await user.click(payEarlyBtn);

    expect(screen.getByText(/Revert Early Pay/i)).toBeDefined();
  });

  it("renders goals tab and handles 'What if I skip a coffee' nudge", async () => {
    const user = userEvent.setup();
    render(<PlansView />);

    const goalsTab = screen.getByRole("tab", { name: /Goals/i });
    await user.click(goalsTab);

    const coffeeNudgeBtn = screen.getByRole("button", { name: /Skip Coffee/i });
    const initialTransfers = useFinanceStore.getState().state.transfers.length;

    await user.click(coffeeNudgeBtn);

    expect(useFinanceStore.getState().state.transfers.length).toBe(initialTransfers + 1);
  });
});
