"use client";

import * as React from "react";
import {
  AlertCircle,
  Award,
  Check,
  Copy,
  Download,
  FastForward,
  Moon,
  RefreshCw,
  RotateCcw,
  Shield,
  Sparkles,
  Sun,
  Upload,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { asPaise } from "../../domain/money";
import { formatPaise } from "../../lib/format";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";

export const SettingsView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const resetToDemo = useFinanceStore((s) => s.resetToDemo);
  const startFresh = useFinanceStore((s) => s.startFresh);
  const exportJson = useFinanceStore((s) => s.exportJson);
  const importJson = useFinanceStore((s) => s.importJson);
  const advanceDay = useFinanceStore((s) => s.advanceDay);

  const snapshot = selectSnapshot(state);
  const { currentDay, balance, health } = snapshot;

  // State for import
  const [importText, setImportText] = React.useState("");
  const [importStatus, setImportStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Month Recap dialog
  const [showRecap, setShowRecap] = React.useState(false);

  // Theme toggle
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  function toggleTheme() {
    if (typeof document !== "undefined") {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      } else {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }

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
    // Advance days until 30
    const diff = 30 - state.meta.currentDay;
    for (let i = 0; i < diff; i++) {
      advanceDay();
    }
    setShowRecap(true);
  }

  const survived = (balance as number) >= 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl font-heading">
          Settings & Data Controls
        </h1>
        <p className="text-sm text-muted">
          Manage local backups, testing simulation levers, theme appearance, and month recap.
        </p>
      </div>

      {/* Theme & Display */}
      <Card className="p-5 space-y-4">
        <h2 className="font-heading text-lg font-bold text-text">Appearance & Theme</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-text">Color Scheme</div>
            <div className="text-xs text-muted">
              {isDark ? "Dark Mode (Cred / Fintech Cyberpunk)" : "Light Mode (High Contrast)"}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="gap-2"
            aria-label="Toggle dark/light theme"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-warning" aria-hidden="true" />
                <span>Switch to Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-primary-text" aria-hidden="true" />
                <span>Switch to Dark</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Demo & Simulation Controls */}
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-text">Simulation & Testing Controls</h2>
          <p className="text-xs text-muted">
            Test scenarios, advance time, or restore the calibrated Day 8 benchmark seed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            onClick={resetToDemo}
            className="justify-start gap-2 h-auto py-3 px-4 text-left"
          >
            <Sparkles className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />
            <div>
              <div className="font-bold text-xs text-text">Reset Demo (Day 8)</div>
              <div className="text-2xs text-muted">Calibrated seed in Watch risk</div>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => startFresh()}
            className="justify-start gap-2 h-auto py-3 px-4 text-left"
          >
            <RotateCcw className="h-5 w-5 text-danger shrink-0" aria-hidden="true" />
            <div>
              <div className="font-bold text-xs text-text">Start Fresh</div>
              <div className="text-2xs text-muted">Clean slate Day 1 with ₹10,000</div>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleFastForwardDay30}
            className="justify-start gap-2 h-auto py-3 px-4 text-left"
          >
            <FastForward className="h-5 w-5 text-primary-text shrink-0" aria-hidden="true" />
            <div>
              <div className="font-bold text-xs text-text">Jump to Day 30</div>
              <div className="text-2xs text-muted">Trigger Month End Recap</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Month End Recap Action */}
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
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowRecap(true)}
            >
              View Month Recap
            </Button>
          </div>
        </Card>
      )}

      {/* Backup Export / Import */}
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-text">Data Portability (Export & Import)</h2>
          <p className="text-xs text-muted">
            All state is strictly validated via Zod schemas, caps file sizes at 100KB, and defends against prototype pollution.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download JSON</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyExport}
            className="gap-2 text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copied ? "Copied JSON" : "Copy to Clipboard"}</span>
          </Button>
        </div>

        {/* Import JSON Form */}
        <form onSubmit={handleImportSubmit} className="space-y-3 pt-2">
          <label htmlFor="import-json" className="text-xs font-semibold uppercase text-text block">
            Import Backup JSON
          </label>
          <textarea
            id="import-json"
            rows={4}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your JSON backup data here..."
            className="w-full rounded-input border border-border bg-elevated/40 p-3 font-mono text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {importStatus && (
            <div
              className={`rounded-input p-3 text-xs flex items-center gap-2 ${
                importStatus.success
                  ? "bg-success/10 text-success border border-success/30"
                  : "bg-danger/10 text-danger border border-danger/30"
              }`}
              role="alert"
            >
              {importStatus.success ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!importText.trim()}
              className="gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Validate & Restore Data</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Privacy Guarantee */}
      <Card className="p-4 border-border/80 bg-elevated/30">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-xs text-muted">
            <span className="font-semibold text-text">Zero-Telemetry Privacy Guarantee</span>
            <p>
              Broke But Functional operates 100% in your browser. No external telemetry, no cloud servers, zero analytics trackers, and zero network calls. All financial numbers remain strictly confidential on your local device.
            </p>
          </div>
        </div>
      </Card>

      {/* Month Recap Modal */}
      <Dialog open={showRecap} onOpenChange={setShowRecap}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black font-heading flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              Month 30 Survival Scorecard
            </DialogTitle>
            <DialogDescription>
              Final evaluation of your 30-day survival campaign.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div
              className={`rounded-card p-5 text-center border space-y-2 ${
                survived
                  ? "border-success/40 bg-success/10"
                  : "border-danger/40 bg-danger/10"
              }`}
            >
              <div className="text-3xl">
                {survived ? "🎉" : "💀"}
              </div>
              <div
                className={`text-2xl font-black font-heading ${
                  survived ? "text-success" : "text-danger"
                }`}
              >
                {survived ? "YOU SURVIVED THE MONTH!" : "YOU WENT BROKE"}
              </div>
              <p className="text-xs text-text">
                {survived
                  ? "You managed your ₹10,000 budget, met your obligations, and closed Day 30 with cash in hand."
                  : "Your funds ran dry before Day 30. Review your fixed commitments and burn rate to survive next month!"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-input bg-elevated/70 border border-border p-3">
                <div className="text-2xs text-muted uppercase font-semibold">Final Balance</div>
                <div
                  className={`text-lg font-black font-heading tabular-nums ${
                    survived ? "text-success" : "text-danger"
                  }`}
                >
                  {formatPaise(balance)}
                </div>
              </div>

              <div className="rounded-input bg-elevated/70 border border-border p-3">
                <div className="text-2xs text-muted uppercase font-semibold">Health Score</div>
                <div className="text-lg font-black font-heading text-text tabular-nums">
                  {health.score}/100
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowRecap(false)}
            >
              Close Scorecard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
