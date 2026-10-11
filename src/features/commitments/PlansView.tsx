"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";
import { SubscriptionsTab } from "./components/SubscriptionsTab";
import { CommitmentsTab } from "./components/CommitmentsTab";
import { GoalsTab } from "./components/GoalsTab";
import { SmartSwapsCard } from "./components/SmartSwapsCard";

export const PlansView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const toggleCommitmentPaidEarly = useFinanceStore((s) => s.toggleCommitmentPaidEarly);
  const toggleSubscription = useFinanceStore((s) => s.toggleSubscription);
  const addSubscription = useFinanceStore((s) => s.addSubscription);
  const addCommitment = useFinanceStore((s) => s.addCommitment);
  const addGoal = useFinanceStore((s) => s.addGoal);
  const contributeToGoal = useFinanceStore((s) => s.contributeToGoal);

  const snapshot = selectSnapshot(state);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold font-heading text-text tracking-tight">
          Financial Plans & Commitments
        </h1>
        <p className="text-sm text-muted">
          Track subscriptions drain, manage non-negotiable commitments, and hit your savings targets.
        </p>
      </div>

      <SmartSwapsCard state={state} />

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="commitments">Commitments</TabsTrigger>
          <TabsTrigger value="goals">Savings Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <SubscriptionsTab
            subscriptions={state.subscriptions}
            analytics={snapshot.subscriptionsAnalytics}
            onToggleSubscription={toggleSubscription}
            onAddSubscription={addSubscription}
          />
        </TabsContent>

        <TabsContent value="commitments">
          <CommitmentsTab
            commitments={state.commitments}
            currentDay={snapshot.currentDay}
            onTogglePaidEarly={toggleCommitmentPaidEarly}
            onAddCommitment={addCommitment}
          />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsTab
            state={state}
            goalEtas={snapshot.goalEtas}
            onContribute={contributeToGoal}
            onAddGoal={addGoal}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
