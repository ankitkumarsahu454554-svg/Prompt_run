"use client";

import * as React from "react";
import { Scale, Sparkles } from "lucide-react";
import { simulateDecision } from "../../domain/engine/simulate";
import { asPaise } from "../../domain/money";
import type { DecisionInput, DecisionRecurrence, SimulationResult } from "../../domain/types";
import { parseAmount, sanitizeText } from "../../lib/sanitize";
import { useFinanceStore } from "../../store/financeStore";
import { Button } from "../../components/ui/Button";
import { SimulatorForm } from "./components/SimulatorForm";
import { SimulatorVerdictBanner } from "./components/SimulatorVerdictBanner";
import { SimulatorComparisonTable } from "./components/SimulatorComparisonTable";
import { SimulatorHistory, type SimulationHistoryItem } from "./components/SimulatorHistory";
import { CompareDecisionsCard } from "./components/CompareDecisionsCard";

export const SimulatorView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const commitDecision = useFinanceStore((s) => s.commitDecision);

  const [mode, setMode] = React.useState<"single" | "compare">("single");
  const [name, setName] = React.useState("");
  const [amountStr, setAmountStr] = React.useState("");
  const [recurrence, setRecurrence] = React.useState<DecisionRecurrence>("once");
  const [error, setError] = React.useState<string | null>(null);
  const [activeSimulation, setActiveSimulation] = React.useState<SimulationResult | null>(null);
  const [currentInput, setCurrentInput] = React.useState<DecisionInput | null>(null);
  const [history, setHistory] = React.useState<SimulationHistoryItem[]>([]);

  function handleSimulate(inputToTest?: DecisionInput) {
    setError(null);
    const target = inputToTest ?? {
      name: sanitizeText(name) || "Untitled Expense",
      amount: parseAmount(amountStr) ?? asPaise(0),
      recurrence,
    };
    if (target.amount <= 0) {
      setError("Please enter a valid amount in Rupees.");
      return;
    }
    const simResult = simulateDecision(state, target);
    setActiveSimulation(simResult);
    setCurrentInput(target);
    setHistory((prev) => [{ id: `sim-${Date.now()}`, timestamp: Date.now(), input: target, result: simResult }, ...prev.slice(0, 4)]);
  }

  function handleReset() {
    setActiveSimulation(null);
    setCurrentInput(null);
    setName("");
    setAmountStr("");
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-text" />
            <h1 className="text-2xl font-bold font-heading text-text tracking-tight">Decision Simulator</h1>
          </div>
          <p className="text-sm text-muted">Test drive purchases before spending real money.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "single" ? "primary" : "outline"} onClick={() => setMode("single")}>Single</Button>
          <Button size="sm" variant={mode === "compare" ? "primary" : "outline"} onClick={() => setMode("compare")}>Compare Mode</Button>
        </div>
      </div>

      {mode === "compare" ? (
        <CompareDecisionsCard state={state} onCommit={(input) => { commitDecision(input); handleReset(); }} />
      ) : (
        <>
          <SimulatorForm name={name} amountStr={amountStr} recurrence={recurrence} error={error} setName={setName} setAmountStr={setAmountStr} setRecurrence={setRecurrence} onSimulate={handleSimulate} />
          {activeSimulation && currentInput && (
            <div className="space-y-5 animate-in fade-in-50 duration-300">
              <SimulatorVerdictBanner result={activeSimulation} input={currentInput} />
              <SimulatorComparisonTable result={activeSimulation} input={currentInput} state={state} onCommit={() => { commitDecision(currentInput); handleReset(); }} onDiscard={handleReset} />
            </div>
          )}
          <SimulatorHistory history={history} onSelect={(item) => { setActiveSimulation(item.result); setCurrentInput(item.input); }} />
        </>
      )}
    </div>
  );
};
