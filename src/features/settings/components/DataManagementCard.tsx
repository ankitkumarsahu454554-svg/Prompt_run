"use client";

import * as React from "react";
import { AlertCircle, Check, Copy, Download, Upload } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

interface DataManagementCardProps {
  onExport: () => void;
  onCopyExport: () => void;
  copied: boolean;
  importText: string;
  setImportText: (v: string) => void;
  importStatus: { success?: boolean; message?: string } | null;
  onImportSubmit: (e: React.FormEvent) => void;
}

export const DataManagementCard: React.FC<DataManagementCardProps> = ({
  onExport,
  onCopyExport,
  copied,
  importText,
  setImportText,
  importStatus,
  onImportSubmit,
}) => {
  return (
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
          onClick={onExport}
          className="gap-2 text-xs"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Download JSON</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopyExport}
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

      <form onSubmit={onImportSubmit} className="space-y-3 pt-2">
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
  );
};
