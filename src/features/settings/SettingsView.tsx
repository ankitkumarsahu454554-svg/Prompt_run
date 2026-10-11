"use client";

import * as React from "react";
import { Award } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";
import { ThemeSettingsCard } from "./components/ThemeSettingsCard";
import { SimulationControlsCard } from "./components/SimulationControlsCard";
import { DataManagementCard } from "./components/DataManagementCard";
import { MonthRecapModal } from "./components/MonthRecapModal";
import { PrivacyGuaranteeCard } from "./components/PrivacyGuaranteeCard";

export const SettingsView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const resetToDemo = useFinanceStore((s) => s.resetToDemo);
  const startFresh = useFinanceStore((s) => s.startFresh);
  const exportJson = useFinanceStore((s) => s.exportJson);
  const importJson = useFinanceStore((s) => s.importJson);
  const advanceDay = useFinanceStore((s) => s.advanceDay);

  const snapshot = selectSnapshot(state);
  const { currentDay } = snapshot;

  const [importText, setImportText] = React.useState("");
  const [importStatus, setImportStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [showRecap, setShowRecap] = React.useState(false);

  function handleExport() {
    const jsonStr = exportJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `broke-but-functional-day-${currentDay}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopyExport() {
    const jsonStr = exportJson();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleImportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!importText.trim()) return;

    const res = importJson(importText);
    if (res.success) {
      setImportStatus({ success: true, message: "Data successfully restored and verified!" });
      setImportText("");
    } else {
      setImportStatus({ success: false, message: res.error || "Invalid JSON or schema validation failed." });
    }
  }

  function handleFastForwardDay30() {
    const diff = 30 - state.meta.currentDay;
    for (let i = 0; i < diff; i++) {
      advanceDay();
    }
    setShowRecap(true);
  }

  return (
    <div className="space-y-6 pb-20 text-left">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl font-heading">
          Settings & Data Controls
        </h1>
        <p className="text-sm text-muted">
          Manage local backups, testing simulation levers, theme appearance, and month recap.
        </p>
      </div>

      <ThemeSettingsCard />

      <SimulationControlsCard
        onResetDemo={resetToDemo}
        onStartFresh={startFresh}
        onFastForwardDay30={handleFastForwardDay30}
      />

      {currentDay >= 30 && (
        <Card variant="elevated" className="border-primary/50 bg-primary/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-warning" aria-hidden="true" />
              <div>
                <h3 className="font-heading font-bold text-base text-text">
                  Month Cycle Complete (Day 30)
                </h3>
                <p className="text-xs text-muted">
                  View your final survival scorecard and financial health rating.
                </p>
              </div>
            </div>
            <Button type="button" variant="primary" size="sm" onClick={() => setShowRecap(true)}>
              View Month Recap
            </Button>
          </div>
        </Card>
      )}

      <DataManagementCard
        onExport={handleExport}
        onCopyExport={handleCopyExport}
        copied={copied}
        importText={importText}
        setImportText={setImportText}
        importStatus={importStatus}
        onImportSubmit={handleImportSubmit}
      />

      <PrivacyGuaranteeCard />

      <MonthRecapModal
        open={showRecap}
        onOpenChange={setShowRecap}
        state={state}
      />
    </div>
  );
};
