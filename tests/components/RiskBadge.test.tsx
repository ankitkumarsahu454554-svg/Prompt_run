import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { RiskBadge } from "../../src/components/ui/Badge";

describe("RiskBadge Component", () => {
  it("renders Safe state with icon and text", () => {
    render(<RiskBadge level="Safe" />);
    expect(screen.getByText("Safe")).toBeDefined();
    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.getByLabelText("Financial risk level: Safe")).toBeDefined();
  });

  it("renders Watch state with icon and text", () => {
    render(<RiskBadge level="Watch" />);
    expect(screen.getByText("Watch")).toBeDefined();
    expect(screen.getByLabelText("Financial risk level: Watch")).toBeDefined();
  });

  it("renders Danger state with icon and text", () => {
    render(<RiskBadge level="Danger" />);
    expect(screen.getByText("Danger")).toBeDefined();
    expect(screen.getByLabelText("Financial risk level: Danger")).toBeDefined();
  });

  it("renders Critical state with icon and text", () => {
    render(<RiskBadge level="Critical" />);
    expect(screen.getByText("Critical")).toBeDefined();
    expect(screen.getByLabelText("Financial risk level: Critical")).toBeDefined();
  });
});
