"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  History,
  Info,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Badge, RiskBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { simulateDecision } from "../../domain/engine/simulate";
import { asPaise } from "../../domain/money";
import type { DecisionInput, DecisionRecurrence, SimulationResult } from "../../domain/types";
import { formatPaise } from "../../lib/format";
import { parseAmount, sanitizeText } from "../../lib/sanitize";
import { useFinanceStore } from "../../store/financeStore";

interface SimulationHistoryItem {
  id: string;
  timestamp: number;
  input: DecisionInput;
  result: SimulationResult;
}

export const SimulatorView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const commitDecision = useFinanceStore((s) => s.commitDecision);

  const [name, setName] = React.useState("");
  const [amountStr, setAmountStr] = React.useState("");
  const [recurrence, setRecurrence] = React.useState<DecisionRecurrence>("once");
  const [error, setError] = React.useState<string | null>(null);

  const [activeSimulation, setActiveSimulation] = React.useState<SimulationResult | null>(null);
  const [currentInput, setCurrentInput] = React.useState<DecisionInput | null>(null);
  const [history, setHistory] = React.useState<SimulationHistoryItem[]>([]);

  // Run simulation
  function handleSimulate(inputToTest?: DecisionInput) {
    setError(null);
    const targetInput = inputToTest ?? {
      name: sanitizeText(name) || "Untitled Expense",
      amount: parseAmount(amountStr) ?? asPaise(0),
      recurrence,
    };

    if (targetInput.amount <= 0) {
      setError("Please enter a valid amount in Rupees (e.g. 399 or 1299).");
      return;
    }

    const simResult = simulateDecision(state, targetInput);
    setActiveSimulation(simResult);
    setCurrentInput(targetInput);

    // Append to history
    setHistory((prev) => [
      {
        id: `sim-hist-${Date.now()}`,
        timestamp: Date.now(),
        input: targetInput,
        result: simResult,
      },
      ...prev.slice(0, 4), // keep last 5
    ]);
  }

  function handleCommit() {
    if (!currentInput) return;
    commitDecision(currentInput);
    // Clear simulation
    setActiveSimulation(null);
    setCurrentInput(null);
    setName("");
    setAmountStr("");
  }

  function handleDiscard() {
    setActiveSimulation(null);
    setCurrentInput(null);
    setName("");
    setAmountStr("");
  }

  // Pre-filled demo simulation shortcuts from Section 9
  function loadDemoScenario(demoName: string, demoRupees: number, demoRecurrence: DecisionRecurrence) {
    setName(demoName);
    setAmountStr(String(demoRupees));
    setRecurrence(demoRecurrence);
    handleSimulate({
      name: demoName,
      amount: asPaise(demoRupees * 100),
      recurrence: demoRecurrence,
    });
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary-text" />
          <h1 className="text-2xl font-bold font-heading text-text tracking-tight">
            Decision Simulator
          </h1>
        </div>
        <p className="text-sm text-muted">
          Test drive purchases before spending real money. See exact before vs after consequences on daily allowance, risk, health, and goals.
        </p>
      </div>

      {/* Demo Scenario Quick-Picks */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider mr-1">
          Quick test cases:
        </span>
        <button
          onClick={() => loadDemoScenario("Swiggy Biryani Dinner", 399, "once")}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full bg-elevated hover:bg-surface border border-border text-text transition-colors"
        >
          🍔 Swiggy (₹399) → Go For It
        </button>
        <button
          onClick={() => loadDemoScenario("Bluetooth Headphones", 1299, "once")}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full bg-elevated hover:bg-surface border border-border text-text transition-colors"
        >
          🎧 Headphones (₹1,299) → Think Twice
        </button>
        <button
          onClick={() => loadDemoScenario("Designer Sneakers", 2499, "once")}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full bg-elevated hover:bg-surface border border-border text-text transition-colors"
        >
          👟 Sneakers (₹2,499) → Hard No
        </button>
      </div>

      {/* Simulator Inputs Card */}
      <Card className="p-5 sm:p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSimulate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Purchase Name"
              placeholder="e.g. Swiggy gourmet meal, Concert ticket"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />

            <div className="space-y-1.5">
              <label htmlFor="sim-amount" className="block text-sm font-medium text-text">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-heading font-semibold select-none">
                  ₹
                </span>
                <input
                  id="sim-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full min-h-[44px] pl-8 pr-3.5 rounded-input bg-elevated border border-border text-text font-bold font-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
                />
              </div>
              {error && (
                <p role="alert" className="text-xs font-semibold text-danger">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Recurrence Selector */}
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-text">Recurrence</span>
            <div className="grid grid-cols-3 gap-2">
              {(["once", "weekly", "monthly"] as const).map((rec) => {
                const isSelected = recurrence === rec;
                return (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => setRecurrence(rec)}
                    className={`min-h-[44px] py-2 px-3 rounded-input text-xs font-medium border transition-colors flex items-center justify-center select-none ${
                      isSelected
                        ? "bg-primary text-white border-primary font-semibold shadow-xs"
                        : "bg-elevated text-muted border-border hover:bg-surface hover:text-text"
                    }`}
                  >
                    {rec === "once" && "One-time purchase"}
                    {rec === "weekly" && "Weekly recurring"}
                    {rec === "monthly" && "Monthly recurring"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" className="px-6 gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Simulate Impact</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Active Simulation Results View */}
      {activeSimulation && currentInput && (
        <div className="space-y-5 animate-in fade-in-50 duration-300">
          {/* 1. Verdict Banner */}
          <div
            className={`p-5 rounded-card border flex items-start gap-4 ${
              activeSimulation.verdict === "GO FOR IT"
                ? "bg-success-muted/30 border-success/40 text-success"
                : activeSimulation.verdict === "THINK TWICE"
                ? "bg-warning-muted/30 border-warning/40 text-warning"
                : "bg-danger-muted/30 border-danger/40 text-danger"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {activeSimulation.verdict === "GO FOR IT" && (
                <CheckCircle2 className="w-7 h-7 text-success" />
              )}
              {activeSimulation.verdict === "THINK TWICE" && (
                <AlertTriangle className="w-7 h-7 text-warning" />
              )}
              {activeSimulation.verdict === "HARD NO" && (
                <ShieldAlert className="w-7 h-7 text-danger" />
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-heading uppercase tracking-wide">
                  Verdict: {activeSimulation.verdict}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-semibold border border-current">
                  {currentInput.name} ({formatPaise(currentInput.amount)})
                </span>
              </div>

              {/* Reasons list */}
              <ul className="text-xs space-y-1 m-0 p-0 list-disc list-inside opacity-95 text-text">
                {activeSimulation.reasons.map((reason, idx) => (
                  <li key={idx} className="font-medium">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. BEFORE vs AFTER Comprehensive Consequence Table */}
          <Card className="p-5 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-heading text-text">
                Consequence Breakdown: Before vs After
              </h2>
              <span className="text-xs text-muted">
                {currentInput.recurrence !== "once"
                  ? `Annualized Cost: ${formatPaise(activeSimulation.annualizedCost ?? asPaise(0))}`
                  : "One-off settlement"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th scope="col" className="py-2 px-3 font-semibold">Financial Metric</th>
                    <th scope="col" className="py-2 px-3 font-semibold">Before</th>
                    <th scope="col" className="py-2 px-3 font-semibold">After Purchase</th>
                    <th scope="col" className="py-2 px-3 font-semibold">Net Shift (Delta)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {/* Daily Allowance */}
                  <tr className="hover:bg-elevated/40">
                    <td className="py-3 px-3 font-medium text-text">Daily Safe Allowance</td>
                    <td className="py-3 px-3 font-mono tabular-nums text-text">
                      {formatPaise(activeSimulation.before.dailyAllowance)}/day
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-bold text-text">
                      {formatPaise(activeSimulation.after.dailyAllowance)}/day
                    </td>
                    <td className="py-3 px-3">
                      <DeltaBadge
                        diff={activeSimulation.delta.dailyAllowance}
                        higherIsBetter
                        unit="currency"
                      />
                    </td>
                  </tr>

                  {/* Cash Balance */}
                  <tr className="hover:bg-elevated/40">
                    <td className="py-3 px-3 font-medium text-text">Liquid Balance</td>
                    <td className="py-3 px-3 font-mono tabular-nums text-text">
                      {formatPaise(activeSimulation.before.balance)}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-bold text-text">
                      {formatPaise(activeSimulation.after.balance)}
                    </td>
                    <td className="py-3 px-3">
                      <DeltaBadge
                        diff={activeSimulation.delta.balance}
                        higherIsBetter
                        unit="currency"
                      />
                    </td>
                  </tr>

                  {/* Month End Forecast */}
                  <tr className="hover:bg-elevated/40">
                    <td className="py-3 px-3 font-medium text-text">Month-End Forecast (Day 30)</td>
                    <td className="py-3 px-3 font-mono tabular-nums text-text">
                      {formatPaise(activeSimulation.before.monthEndForecast)}
                    </td>
                    <td className={`py-3 px-3 font-mono tabular-nums font-bold ${
                      activeSimulation.after.monthEndForecast < 0 ? "text-danger" : "text-text"
                    }`}>
                      {formatPaise(activeSimulation.after.monthEndForecast)}
                    </td>
                    <td className="py-3 px-3">
                      <DeltaBadge
                        diff={activeSimulation.delta.monthEndForecast}
                        higherIsBetter
                        unit="currency"
                      />
                    </td>
                  </tr>

                  {/* Risk Tier */}
                  <tr className="hover:bg-elevated/40">
                    <td className="py-3 px-3 font-medium text-text">Financial Risk Tier</td>
                    <td className="py-3 px-3">
                      <RiskBadge level={activeSimulation.before.risk.level} />
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={activeSimulation.after.risk.level} />
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {activeSimulation.delta.riskChanged ? (
                        <span className="text-warning font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Degraded</span>
                        </span>
                      ) : (
                        <span className="text-muted font-medium">No Change</span>
                      )}
                    </td>
                  </tr>

                  {/* Financial Health Score */}
                  <tr className="hover:bg-elevated/40">
                    <td className="py-3 px-3 font-medium text-text">Health Score (0–100)</td>
                    <td className="py-3 px-3 font-mono font-medium text-text">
                      {activeSimulation.before.health.score} ({activeSimulation.before.health.mood})
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-text">
                      {activeSimulation.after.health.score} ({activeSimulation.after.health.mood})
                    </td>
                    <td className="py-3 px-3">
                      <DeltaBadge
                        diff={activeSimulation.delta.healthScore}
                        higherIsBetter
                        unit="points"
                      />
                    </td>
                  </tr>

                  {/* Goal ETAs */}
                  {state.goals.map((goal) => {
                    const beforeEta = activeSimulation.before.goalEtas[goal.id]?.etaDay;
                    const afterEta = activeSimulation.after.goalEtas[goal.id]?.etaDay;
                    const slipDays =
                      beforeEta !== null && beforeEta !== undefined && afterEta !== null && afterEta !== undefined
                        ? afterEta - beforeEta
                        : afterEta === null && beforeEta !== null
                        ? -999 // Unreachable now
                        : 0;

                    return (
                      <tr key={goal.id} className="hover:bg-elevated/40">
                        <td className="py-3 px-3 font-medium text-text">
                          Goal: {goal.emoji} {goal.name} ETA
                        </td>
                        <td className="py-3 px-3 text-text">
                          {beforeEta ? `Day ${beforeEta}` : "Not reachable"}
                        </td>
                        <td className="py-3 px-3 font-bold text-text">
                          {afterEta ? `Day ${afterEta}` : "Unreachable"}
                        </td>
                        <td className="py-3 px-3">
                          {slipDays === -999 ? (
                            <span className="text-danger font-semibold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Slipped out of reach</span>
                            </span>
                          ) : slipDays > 0 ? (
                            <span className="text-warning font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Delayed by {slipDays} days</span>
                            </span>
                          ) : (
                            <span className="text-muted">Unchanged</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Commit vs Discard Action Bar */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" onClick={handleDiscard}>
                Nah, Discard
              </Button>
              <Button
                variant={activeSimulation.verdict === "HARD NO" ? "danger" : "primary"}
                onClick={handleCommit}
                className="gap-2 px-6"
              >
                <span>Commit Decision</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Simulation History */}
      {history.length > 0 && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-muted">
            <History className="w-4 h-4" />
            <h2 className="text-sm font-semibold font-heading text-text">
              Recent Decision Experiments
            </h2>
          </div>
          <div className="divide-y divide-border/60">
            {history.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-text">{h.input.name}</strong>
                  <span className="text-muted ml-2">
                    {formatPaise(h.input.amount)} ({h.input.recurrence})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      h.result.verdict === "GO FOR IT"
                        ? "safe"
                        : h.result.verdict === "THINK TWICE"
                        ? "watch"
                        : "danger"
                    }
                  >
                    {h.result.verdict}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setActiveSimulation(h.result);
                      setCurrentInput(h.input);
                    }}
                    className="text-xs min-h-[36px]"
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Delta Badge using Arrow Icon + Sign + Text + Color (never color alone)
function DeltaBadge({
  diff,
  higherIsBetter = true,
  unit = "currency",
}: {
  diff: number;
  higherIsBetter?: boolean;
  unit?: "currency" | "points";
}) {
  if (diff === 0) {
    return <span className="text-muted font-medium">±0</span>;
  }

  const isGood = higherIsBetter ? diff > 0 : diff < 0;
  const isPositive = diff > 0;
  const absDiff = Math.abs(diff);

  const formattedVal =
    unit === "currency" ? formatPaise(asPaise(absDiff)) : `${absDiff} pts`;

  return (
    <span
      className={`inline-flex items-center gap-0.5 font-semibold font-mono text-xs ${
        isGood ? "text-success" : "text-danger"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      <span>
        {isPositive ? "+" : "-"}
        {formattedVal}
      </span>
    </span>
  );
}
