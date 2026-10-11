import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { AddExpenseModal } from "../../src/features/expenses/AddExpenseModal";
import { useFinanceStore } from "../../src/store/financeStore";

describe("AddExpenseModal Component", () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
  });

  it("shows live preview of daily allowance impact before submitting", async () => {
    const user = userEvent.setup();
    render(<AddExpenseModal open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /Add Expense/i })).toBeDefined();

    const amountInput = screen.getByLabelText(/amount/i);
    await user.type(amountInput, "230");

    // Live preview section shows projected impact
    expect(screen.getByText(/Daily allowance after this:/i)).toBeDefined();
  });

  it("validates empty amount and disables submission or shows error", async () => {
    const user = userEvent.setup();
    render(<AddExpenseModal open={true} onOpenChange={vi.fn()} />);

    const submitBtn = screen.getByRole("button", { name: /Add Expense/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Please enter a valid amount/i)).toBeDefined();
  });

  it("successfully commits expense and invokes onOpenChange(false)", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<AddExpenseModal open={true} onOpenChange={handleClose} />);

    const initialCount = useFinanceStore.getState().state.expenses.length;

    const amountInput = screen.getByLabelText(/amount/i);
    await user.type(amountInput, "150");

    const noteInput = screen.getByLabelText(/note/i);
    await user.type(noteInput, "Chai and snacks with friends");

    const submitBtn = screen.getByRole("button", { name: /Add Expense/i });
    await user.click(submitBtn);

    expect(useFinanceStore.getState().state.expenses.length).toBe(initialCount + 1);
    expect(handleClose).toHaveBeenCalledWith(false);
  });
});
