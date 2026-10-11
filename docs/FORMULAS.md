# Financial Engine Formulas & Invariants

**System Concept**: *Broke But Functional — Survive the Month*
**Currency Representation**: All monetary units are strictly integer Paise ($1\text{ Rupee} = 100\text{ Paise}$; ₹10,000 = 1,000,000 Paise).

---

## 1. Time Model & Days Left

- $\text{currentDay} \in [1, 30]$
- $\text{totalDays} = 30$
- $\text{daysLeft} = \text{totalDays} - \text{currentDay} + 1$
  - Invariant: Because today is an active spending day within the month, $\text{daysLeft} \ge 1$ for all $\text{currentDay} \le 30$.
  - At Day 30, $\text{daysLeft} = 1$. It never reaches 0 inside the monthly operating window, guarding against division-by-zero errors.

---

## 2. Settlement Rules & Balance

An item is **settled** if it has already occurred or impacted current funds:
1. **Incomes**: Received if $\text{income.day} \le \text{currentDay}$.
2. **Expenses**: Settled if $\text{expense.day} \le \text{currentDay}$.
3. **Commitments**: Settled if $\text{commitment.dueDay} \le \text{currentDay}$ OR $\text{commitment.paidEarly} = \text{true}$.
4. **Subscriptions**: Settled in the current billing cycle if $\text{subscription.active} = \text{true}$ AND $\text{subscription.renewalDay} \le \text{currentDay}$.
5. **Transfers**: Net sum of transfers to/from savings goals with $\text{transfer.day} \le \text{currentDay}$ (positive indicates money moved into savings goal, decreasing spendable balance).
6. **Resolved Events**: If resolved as "Pay now" or installment portions whose day $\le \text{currentDay}$.

### Balance Invariant
$$\text{balance} = \text{startBalance} + \sum \text{receivedIncomes} - \sum \text{settledOutflows} - \sum \text{settledTransfersToGoals}$$

---

## 3. Upcoming Obligations

Outflows that will occur during the remainder of the month that the user must honor:
$$\text{upcomingObligations} = \sum \text{unsettledCommitments} + \sum \text{upcomingSubscriptionCharges} + \sum \text{scheduledFutureExpenses} + \sum \text{pendingEventAmounts}$$

Where:
- $\text{unsettledCommitments}$: Commitments with $\text{dueDay} > \text{currentDay}$ and $\text{paidEarly} = \text{false}$.
- $\text{upcomingSubscriptionCharges}$: Active subscriptions with $\text{renewalDay} > \text{currentDay}$.
- $\text{scheduledFutureExpenses}$: Pre-scheduled expenses with $\text{day} > \text{currentDay}$.
- $\text{pendingEventAmounts}$: Pending unexpected events requiring user resolution.

---

## 4. Goal Reserve & Daily Allowance

### Goal Daily Requirement & Reserve
For each goal $g$:
$$\text{remaining}_g = \max(0, \text{target}_g - \text{saved}_g)$$
$$\text{daysToGoalDeadline}_g = \max(1, \text{deadlineDay}_g - \text{currentDay} + 1)$$
$$\text{requiredDailySaving}_g = \left\lceil \frac{\text{remaining}_g}{\text{daysToGoalDeadline}_g} \right\rceil$$
$$\text{goalReserve}_g = \min(\text{remaining}_g, \text{requiredDailySaving}_g \times \text{daysLeft})$$
$$\text{goalReserve} = \sum_g \text{goalReserve}_g$$

### Daily Allowance Invariant
The Daily Allowance represents safe-to-spend funds for today, excluding future unreceived income (only uncommitted money currently held in hand):
$$\text{netSpendablePool} = \text{balance} - \text{upcomingObligations} - \text{goalReserve}$$

$$\text{dailyAllowance} = \begin{cases}
\left\lfloor \frac{\text{netSpendablePool}}{\text{daysLeft}} \right\rfloor & \text{if } \text{netSpendablePool} \ge 0 \\
0 & \text{if } \text{netSpendablePool} < 0
\end{cases}$$

$$\text{overspentBy} = \begin{cases}
0 & \text{if } \text{netSpendablePool} \ge 0 \\
|\text{netSpendablePool}| & \text{if } \text{netSpendablePool} < 0
\end{cases}$$

*UI Guarantee*: Daily allowance is strictly non-negative. When over budget, the UI displays ₹0 safe-to-spend alongside the exact overspent deficit.

---

## 5. Discretionary Burn Rate

Calculated from discretionary manual spend over the past $\min(7, \text{currentDay}-1)$ days:
- If $\text{elapsedDays} = \text{currentDay} - 1 \ge 1$:
  $$\text{windowDays} = \min(7, \text{currentDay} - 1)$$
  $$\text{historicalSpend} = \sum_{\substack{\text{manual expenses} \\ \text{currentDay}-\text{windowDays} \le \text{day} < \text{currentDay}}} \text{amount}$$
  $$\text{burnRate} = \left\lfloor \frac{\text{historicalSpend}}{\text{windowDays}} \right\rfloor$$
- If $\text{currentDay} = 1$: Fallback constant $\text{burnRate} = \text{dailyAllowance}$.

---

## 6. Projections & Month-End Forecast

For each future day $d \in [\text{currentDay}, 30]$:
$$\text{projectedBalance}[d] = \text{balance} + \sum_{k=\text{currentDay}}^{d} \text{income}[k] - \sum_{k=\text{currentDay}}^{d} \text{obligations}[k] - (d - \text{currentDay} + 1) \times \text{burnRate}$$

- $\text{monthEndForecast} = \text{projectedBalance}[30]$
- $\text{daysUntilZero}$: The first day index $d$ where $\text{projectedBalance}[d] < 0$. Relative offset: $d - \text{currentDay} + 1$. If projected balance remains $\ge 0$ throughout the month, $\text{daysUntilZero} = \text{null}$.

---

## 7. Financial Risk Classification

Evaluated deterministically in priority order:
1. **Critical**:
   $$\text{balance} < \text{upcomingObligations} \quad \lor \quad (\text{daysUntilZero} \ne \text{null} \land \text{daysUntilZero} \le 3)$$
   *Reason*: "Current balance cannot cover upcoming non-negotiable commitments" or "Cash runs out in under 3 days."
2. **Danger**:
   $$\text{monthEndForecast} < 0$$
   *Reason*: "Projected discretionary spend depletes all funds before Day 30."
3. **Watch**:
   $$(\text{monthEndForecast} \ge 0 \land \text{monthEndForecast} < 0.15 \times \text{startBalance}) \quad \lor \quad (\text{upcomingObligations} > 0.60 \times (\text{balance} + \text{receivedIncomes}))$$
   *Reason*: "Buffer is below 15% of starting capital" or "Over 60% of liquidity is tied up in fixed commitments."
4. **Safe**:
   $$\text{Otherwise}$$
   *Reason*: "Finances stable: obligations covered, positive buffer projected through month-end."

---

## 8. Financial Health Score (0–100)

Composite weighted sum of 6 normalized factors:

$$\text{healthScore} = \text{round}\left( \sum_{i=1}^{6} w_i \times f_i \right)$$

| Factor | Weight ($w_i$) | Formula / Evaluation |
|---|---|---|
| **Runway** | 30 | If $\text{daysUntilZero} = \text{null} \implies 1.0$; else $\frac{\text{daysUntilZero}}{\text{daysLeft}}$ |
| **Savings Progress** | 20 | $\text{clamp}\left( \frac{\sum \text{saved}}{\sum \text{expectedSavedToDate}}, 0, 1 \right)$; default 1.0 if no goals |
| **Commitment Ratio** | 15 | $1.0 - \text{clamp}\left( \frac{\text{upcomingObligations}}{\text{totalLiquidMoney} \times 0.60}, 0, 1 \right)$ |
| **Spending Discipline** | 15 | If $\text{dailyAllowance} = 0 \implies 0.0$; else $\text{clamp}\left(1.0 - \frac{\max(0, \text{burnRate} - \text{allowance})}{\text{allowance}}, 0, 1 \right)$ |
| **Subscription Load** | 10 | $1.0 - \text{clamp}\left( \frac{\text{monthlySubscriptionTotal}}{\text{startBalance} \times 0.15}, 0, 1 \right)$ |
| **Emergency Buffer** | 10 | $\text{clamp}\left( \frac{\max(0, \text{monthEndForecast})}{\text{startBalance} \times 0.10}, 0, 1 \right)$ |

### Mood Label Classification
- $\ge 80$: **Thriving**
- $60 \dots 79$: **Surviving**
- $40 \dots 59$: **Wobbly**
- $< 40$: **Cooked**

---

## 9. Goal ETAs & Pro-Rata Capacity

$$\text{savingCapacityPerDay} = \frac{\max(0, \text{monthEndForecast})}{\text{daysLeft}}$$

If $\sum_g \text{remaining}_g = 0$, all goals achieved.
Otherwise, each goal receives capacity share:
$$\text{goalShare}_g = \text{savingCapacityPerDay} \times \frac{\text{remaining}_g}{\sum_k \text{remaining}_k}$$

$$\text{etaDays}_g = \begin{cases}
\text{currentDay} + \left\lceil \frac{\text{remaining}_g}{\text{goalShare}_g} \right\rceil & \text{if } \text{goalShare}_g > 0 \\
\text{null} & \text{if } \text{goalShare}_g = 0 \text{ ("Not reachable at current pace")}
\end{cases}$$

---

## 10. Decision Simulator Invariant

Given current state $S$ and decision $D = (\text{name}, \text{amount}, \text{recurrence}, \text{day})$:
1. $S$ is deep-frozen (`Object.freeze`).
2. Construct simulated state $S' = \text{applyDecision}(S, D)$.
3. Compute pure snapshots $\text{before} = \text{getSnapshot}(S)$ and $\text{after} = \text{getSnapshot}(S')$.
4. Compute deltas:
   $$\Delta \text{balance} = \text{after.balance} - \text{before.balance}$$
   $$\Delta \text{allowance} = \text{after.dailyAllowance} - \text{before.dailyAllowance}$$
   $$\Delta \text{health} = \text{after.healthScore} - \text{before.healthScore}$$
   $$\Delta \text{forecast} = \text{after.monthEndForecast} - \text{before.monthEndForecast}$$

### Verdict Determination:
- **HARD NO** if:
  - $\text{after.risk} \in \{\text{Critical}, \text{Danger}\}$ AND $\text{after.risk}$ is worse than $\text{before.risk}$, OR
  - $\text{after.daysUntilZero} \ne \text{null}$, OR
  - $\text{amount} > (\text{before.balance} - \text{before.upcomingObligations})$
- **THINK TWICE** if:
  - Risk worsens by one tier, OR
  - $\text{after.dailyAllowance} < 0.75 \times \text{before.dailyAllowance}$, OR
  - $\text{before.healthScore} - \text{after.healthScore} \ge 8$, OR
  - Any goal ETA slips by $> 7\text{ days}$
- **GO FOR IT**: Otherwise.
