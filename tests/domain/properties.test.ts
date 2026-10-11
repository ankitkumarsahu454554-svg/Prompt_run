import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { calculateDailyAllowance } from "../../src/domain/engine/allowance";
import { calculateBalance } from "../../src/domain/engine/balance";
import { calculateHealthScore } from "../../src/domain/engine/health";
import { calculateRisk } from "../../src/domain/engine/risk";
import { simulateDecision } from "../../src/domain/engine/simulate";
import { asPaise, rupeesToPaise } from "../../src/domain/money";
import { createRng } from "../../src/domain/rng";
import { createDefaultSeed } from "../../src/domain/seed";
import type { FinanceState } from "../../src/domain/types";

describe("Property-based testing (fast-check)", () => {
  it("allowance is never negative across arbitrary balances and days", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -5000000, max: 10000000 }), // paise balance
        fc.integer({ min: 1, max: 30 }), // currentDay
        fc.integer({ min: 0, max: 5000000 }), // obligations
        (balance, currentDay, obligations) => {
          const state: FinanceState = {
            config: {
              startBalance: asPaise(balance),
              totalDays: 30,
            },
            meta: {
              onboarded: true,
              rngSeed: 42,
              currentDay,
              schemaVersion: 1,
            },
            incomes: [],
            expenses: [],
            commitments:
              obligations > 0
                ? [
                    {
                      id: "c1",
                      label: "Obligation",
                      amount: asPaise(obligations),
                      dueDay: 29,
                      paidEarly: false,
                    },
                  ]
                : [],
            subscriptions: [],
            goals: [],
            transfers: [],
            unexpectedEvents: [],
          };

          const allowanceRes = calculateDailyAllowance(state);
          expect(allowanceRes.dailyAllowance).toBeGreaterThanOrEqual(0);
          expect(allowanceRes.overspentBy).toBeGreaterThanOrEqual(0);
        },
      ),
    );
  });

  it("simulateDecision never mutates input state", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 100000 }), // amount in rupees
        fc.constantFrom("once", "weekly", "monthly"),
        (amountRupees, recurrence) => {
          const state = createDefaultSeed();
          const snapshotBeforeJson = JSON.stringify(state);

          simulateDecision(state, {
            name: "Arbitrary Test Item",
            amount: rupeesToPaise(amountRupees),
            recurrence: recurrence as "once" | "weekly" | "monthly",
          });

          expect(JSON.stringify(state)).toBe(snapshotBeforeJson);
        },
      ),
    );
  });

  it("adding an expense never increases balance", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500000 }), // expense amount in paise
        (expenseAmount) => {
          const baseState = createDefaultSeed();
          const balanceBefore = calculateBalance(baseState);

          const updatedState: FinanceState = {
            ...baseState,
            expenses: [
              ...baseState.expenses,
              {
                id: "exp-extra",
                amount: asPaise(expenseAmount),
                category: "Food",
                day: baseState.meta.currentDay,
                note: "Extra spend",
                source: "manual",
              },
            ],
          };

          const balanceAfter = calculateBalance(updatedState);
          expect(balanceAfter).toBeLessThanOrEqual(balanceBefore);
        },
      ),
    );
  });

  it("cancelling an active upcoming subscription never lowers the allowance", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 200000 }), // monthly subscription amount in paise
        (subAmount) => {
          const stateWithSub: FinanceState = {
            ...createDefaultSeed(),
            subscriptions: [
              {
                id: "sub-test",
                name: "Test Sub",
                monthlyAmount: asPaise(subAmount),
                renewalDay: 25, // upcoming after Day 8
                active: true,
              },
            ],
          };

          const stateCancelled: FinanceState = {
            ...stateWithSub,
            subscriptions: [
              {
                ...stateWithSub.subscriptions[0]!,
                active: false,
              },
            ],
          };

          const allowanceBefore = calculateDailyAllowance(stateWithSub).dailyAllowance;
          const allowanceAfter = calculateDailyAllowance(stateCancelled).dailyAllowance;

          expect(allowanceAfter).toBeGreaterThanOrEqual(allowanceBefore);
        },
      ),
    );
  });

  it("health score always stays bounded within [0, 100]", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10000000, max: 10000000 }), // forecast
        fc.option(fc.integer({ min: 1, max: 30 })), // daysUntilZero
        fc.integer({ min: 0, max: 100000 }), // burn rate
        fc.integer({ min: 0, max: 100000 }), // daily allowance
        (forecast, daysUntilZero, burnRate, dailyAllowance) => {
          const state = createDefaultSeed();
          const health = calculateHealthScore(
            state,
            forecast,
            daysUntilZero,
            burnRate,
            dailyAllowance,
          );

          expect(health.score).toBeGreaterThanOrEqual(0);
          expect(health.score).toBeLessThanOrEqual(100);
          expect(["Thriving", "Surviving", "Wobbly", "Cooked"]).toContain(health.mood);
        },
      ),
    );
  });

  it("the seeded RNG is strictly deterministic for identical seeds", () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const rng1 = createRng(seed);
        const rng2 = createRng(seed);

        for (let i = 0; i < 20; i++) {
          expect(rng1.next()).toBe(rng2.next());
        }
      }),
    );
  });

  it("risk is monotonic in forecast margin", () => {
    const riskRank = { Safe: 0, Watch: 1, Danger: 2, Critical: 3 };
    const state = createDefaultSeed();

    const lowForecastRisk = calculateRisk(state, -100000, null).level;
    const highForecastRisk = calculateRisk(state, 500000, null).level;

    expect(riskRank[lowForecastRisk]).toBeGreaterThanOrEqual(riskRank[highForecastRisk]);
  });
});
