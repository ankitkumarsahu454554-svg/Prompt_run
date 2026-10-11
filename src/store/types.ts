import type {
  Commitment,
  DecisionInput,
  EventResolutionChoice,
  Expense,
  FinanceState,
  Goal,
  Income,
  RiskLevel,
  Subscription,
} from "../domain/types";
import type { Paise } from "../domain/money";

export interface RippleToastData {
  id: string;
  actionTitle: string;
  allowanceBefore: Paise;
  allowanceAfter: Paise;
  riskBefore: RiskLevel;
  riskAfter: RiskLevel;
  healthBefore: number;
  healthAfter: number;
  canUndo: boolean;
  timestamp: number;
}

export interface FinanceStoreState {
  state: FinanceState;
  previousState: FinanceState | null;
  lastRipple: RippleToastData | null;
  isHydrated: boolean;

  // Actions
  hydrate: () => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  addIncome: (income: Omit<Income, "id">) => void;
  addCommitment: (commitment: Omit<Commitment, "id">) => void;
  toggleCommitmentPaidEarly: (id: string) => void;
  toggleSubscription: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, "id">) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  contributeToGoal: (goalId: string, amount: Paise) => void;
  resolveEventAction: (
    eventId: string,
    choice: EventResolutionChoice,
    borrowGoalId?: string,
  ) => void;
  triggerSurprise: () => void;
  advanceDay: () => void;
  commitDecision: (decision: DecisionInput) => void;
  undo: () => void;
  dismissRipple: () => void;
  resetToDemo: () => void;
  startFresh: (startBalancePaise?: Paise) => void;
  completeOnboarding: (data: {
    startBalance: Paise;
    incomes: Array<Omit<Income, "id">>;
    goal?: Omit<Goal, "id">;
  }) => void;
  importJson: (jsonString: string) => { success: boolean; error?: string };
  exportJson: () => string;
}
