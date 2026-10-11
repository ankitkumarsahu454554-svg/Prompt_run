import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { SimulatorView } from "../../src/features/simulator/SimulatorView";
import { useFinanceStore } from "../../src/store/financeStore";

describe("Decision Simulator View", () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
  });

  it("evaluates a low expense (₹399 Swiggy) as GO FOR IT via quick scenario", () => {
    render(<SimulatorView />);

    const quickBtn = screen.getByText(/🍔 Swiggy/i);
    fireEvent.click(quickBtn);

    expect(screen.getByText(/Verdict:\s*GO FOR IT/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Commit Decision/i })).toBeDefined();
  });

  it("evaluates a medium expense (₹1,299 Headphones) as THINK TWICE via quick scenario", () => {
    render(<SimulatorView />);

    const quickBtn = screen.getByText(/🎧 Headphones/i);
    fireEvent.click(quickBtn);

    expect(screen.getByText(/Verdict:\s*THINK TWICE/i)).toBeDefined();
  });

  it("evaluates an expensive expense (₹2,499 Sneakers) as HARD NO via quick scenario", () => {
    render(<SimulatorView />);

    const quickBtn = screen.getByText(/👟 Sneakers/i);
    fireEvent.click(quickBtn);

    expect(screen.getByText(/Verdict:\s*HARD NO/i)).toBeDefined();
  });

  it("commits a manual decision and records it into store", () => {
    render(<SimulatorView />);

    const initialExpensesCount = useFinanceStore.getState().state.expenses.length;

    const nameInput = screen.getByLabelText(/purchase name/i);
    const amountInput = screen.getByLabelText(/amount/i);
    const submitBtn = screen.getByRole("button", { name: /Simulate Impact/i });

    fireEvent.change(nameInput, { target: { value: "Manual Book" } });
    fireEvent.change(amountInput, { target: { value: "250" } });
    fireEvent.click(submitBtn);

    const commitBtn = screen.getByRole("button", { name: /Commit Decision/i });
    fireEvent.click(commitBtn);

    expect(useFinanceStore.getState().state.expenses.length).toBe(initialExpensesCount + 1);
  });

  it("clears inputs when Nah, Discard is clicked", () => {
    render(<SimulatorView />);

    const nameInput = screen.getByLabelText(/purchase name/i) as HTMLInputElement;
    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /Simulate Impact/i });

    fireEvent.change(nameInput, { target: { value: "Snack" } });
    fireEvent.change(amountInput, { target: { value: "100" } });
    fireEvent.click(submitBtn);

    const discardBtn = screen.getByRole("button", { name: /Nah, Discard/i });
    fireEvent.click(discardBtn);

    expect(nameInput.value).toBe("");
    expect(amountInput.value).toBe("");
  });
});
