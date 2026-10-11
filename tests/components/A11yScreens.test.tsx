import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import axe from "axe-core";
import { EmptyState } from "../../src/components/feedback/EmptyState";
import { ErrorState } from "../../src/components/feedback/ErrorState";
import { Skeleton } from "../../src/components/feedback/Skeleton";
import { RiskBadge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";

describe("Accessibility Audit (axe-core) on Component States", () => {
  it("EmptyState has zero accessibility violations", async () => {
    const { container } = render(
      <main>
        <EmptyState
          title="No expenses logged"
          description="You haven't spent anything yet today."
        />
      </main>
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("ErrorState has zero accessibility violations", async () => {
    const { container } = render(
      <main>
        <ErrorState
          title="Calculation Anomaly"
          message="Could not derive snapshot metrics."
        />
      </main>
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("Skeleton has zero accessibility violations", async () => {
    const { container } = render(
      <main>
        <Skeleton className="h-20 w-full" />
      </main>
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("RiskBadges across all states have zero accessibility violations", async () => {
    const { container } = render(
      <main>
        <RiskBadge level="Safe" />
        <RiskBadge level="Watch" />
        <RiskBadge level="Danger" />
        <RiskBadge level="Critical" />
      </main>
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
