"use client";

import * as React from "react";
import { Scale } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { compareDecisions } from "../../../domain/engine/compareMode";
import { asPaise } from "../../../domain/money";
import type { DecisionInput, FinanceState } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";
import { parseAmount, sanitizeText } from "../../../lib/sanitize";

interface CompareDecisionsCardProps {
  readonly state: FinanceState;
  readonly onCommit: (input: DecisionInput) => void;
}

export const CompareDecisionsCard: React.FC<CompareDecisionsCardProps> = ({ state, onCommit }) => {
  const [nameA, setNameA] = React.useState("Zomato Dinner");
  const [amountA, setAmountA] = React.useState("650");
  const [nameB, setNameB] = React.useState("Home Cook Grocery");
  const [amountB, setAmountB] = React.useState("220");
  const [compared, setCompared] = React.useState(false);

  const inputA: DecisionInput = React.useMemo(() => ({
    name: sanitizeText(nameA) || "Option A",
    amount: parseAmount(amountA) ?? asPaise(0),
    recurrence: "once",
  }), [nameA, amountA]);

  const inputB: DecisionInput = React.useMemo(() => ({
    name: sanitizeText(nameB) || "Option B",
    amount: parseAmount(amountB) ?? asPaise(0),
    recurrence: "once",
  }), [nameB, amountB]);

  const verdict = React.useMemo(() => {
    if (!compared || inputA.amount <= 0 || inputB.amount <= 0) return null;
    return compareDecisions(state, inputA, inputB);
  }, [state, inputA, inputB, compared]);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary-text" aria-hidden="true" />
        <h2 className="text-lg font-bold font-heading text-text">Compare Mode (A vs B vs Neither)</h2>
      </div>
      <p className="text-xs text-muted">
        Simulate two potential purchases side by side to see which one preserves your daily runway and health.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 rounded-input border border-border p-3 bg-surface">
          <span className="text-xs font-semibold text-text">Option A</span>
          <Input id="compare-name-a" placeholder="e.g. Swiggy party" value={nameA} onChange={(e) => { setNameA(e.target.value); setCompared(false); }} />
          <Input id="compare-amount-a" type="number" placeholder="₹ Amount" value={amountA} onChange={(e) => { setAmountA(e.target.value); setCompared(false); }} />
        </div>
        <div className="space-y-2 rounded-input border border-border p-3 bg-surface">
          <span className="text-xs font-semibold text-text">Option B</span>
          <Input id="compare-name-b" placeholder="e.g. Cook at home" value={nameB} onChange={(e) => { setNameB(e.target.value); setCompared(false); }} />
          <Input id="compare-amount-b" type="number" placeholder="₹ Amount" value={amountB} onChange={(e) => { setAmountB(e.target.value); setCompared(false); }} />
        </div>
      </div>

      <Button variant="outline" onClick={() => setCompared(true)} className="w-full">
        Compare Options A vs B
      </Button>

      {verdict && (
        <div className="space-y-3 pt-2 border-t border-border animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text uppercase">Winner Verdict:</span>
            <Badge variant={verdict.winner === "NEITHER" ? "danger" : "safe"}>
              {verdict.winner === "OPTION_A" ? "OPTION A WINS" : verdict.winner === "OPTION_B" ? "OPTION B WINS" : "SKIP BOTH"}
            </Badge>
          </div>
          <p className="text-sm font-medium text-text bg-elevated/40 p-3 rounded-input border border-border">
            {verdict.recommendation}
          </p>
          <ul className="text-xs text-muted space-y-1 list-disc pl-4">
            {verdict.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => onCommit(inputA)}>
              Choose {inputA.name} ({formatPaise(inputA.amount)})
            </Button>
            <Button size="sm" variant="primary" onClick={() => onCommit(inputB)}>
              Choose {inputB.name} ({formatPaise(inputB.amount)})
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
