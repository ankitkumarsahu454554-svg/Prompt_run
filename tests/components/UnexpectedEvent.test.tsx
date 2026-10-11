import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { UnexpectedEventModal } from "../../src/features/events/UnexpectedEventModal";
import { useFinanceStore } from "../../src/store/financeStore";
import type { UnexpectedEvent } from "../../src/domain/types";
import { asPaise } from "../../src/domain/money";

describe("UnexpectedEventModal Component", () => {
  const sampleEvent: UnexpectedEvent = {
    id: "evt-test-1",
    title: "Cracked Phone Screen",
    amount: asPaise(180000), // ₹1,800
    day: 8,
    status: "pending",
  };

  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
    useFinanceStore.setState((s) => ({
      state: {
        ...s.state,
        unexpectedEvents: [sampleEvent],
      },
    }));
  });

  it("renders 4 resolution cards with consequences", () => {
    render(
      <UnexpectedEventModal
        eventId={sampleEvent.id}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText(/Cracked Phone Screen/i)).toBeDefined();
    expect(screen.getByText(/1\. Pay in full today/i)).toBeDefined();
    expect(screen.getByText(/2\. Split across 3 installments/i)).toBeDefined();
    expect(screen.getByText(/3\. Borrow from savings goal/i)).toBeDefined();
    expect(screen.getByText(/4\. Skip \(Defer 7 days\)/i)).toBeDefined();
  });

  it("resolves event with Pay in full today choice", async () => {
    const user = userEvent.setup();
    let closed = false;

    render(
      <UnexpectedEventModal
        eventId={sampleEvent.id}
        open={true}
        onOpenChange={(val) => {
          closed = !val;
        }}
      />
    );

    const payNowBtn = screen.getByRole("button", { name: /Pay Now/i });
    await user.click(payNowBtn);

    const resolved = useFinanceStore
      .getState()
      .state.unexpectedEvents.find((e) => e.id === sampleEvent.id);
    expect(resolved?.status).toBe("resolved");
    expect(resolved?.resolution).toBe("pay_now");
    expect(closed).toBe(true);
  });
});
