"use client";

import * as React from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import type { MonthRecap } from "../../../domain/engine/monthRecap";
import { formatRecapText } from "../../../domain/engine/monthRecap";

interface RecapCanvasCardProps {
  readonly recap: MonthRecap;
}

export const RecapCanvasCard: React.FC<RecapCanvasCardProps> = ({ recap }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

    // Draw background
    ctx.fillStyle = "#0c0d12";
    ctx.fillRect(0, 0, 600, 400);

    // Accent header border
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(0, 0, 600, 6);

    // Title & Brand
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px monospace";
    ctx.fillText("BROKE BUT FUNCTIONAL — MONTH RECAP", 32, 45);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText(recap.headline, 32, 75);

    // Score badge box
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(32, 95, 536, 70);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 28px monospace";
    const grade = recap.healthScore >= 80 ? "Grade A" : recap.healthScore >= 60 ? "Grade B" : "Grade C";
    ctx.fillText(`Health: ${recap.healthScore}/100 (${grade})`, 50, 140);

    // Stats Grid
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "14px monospace";
    ctx.fillText(`Best Move: ${recap.bestDecision}`, 32, 200);
    if (recap.biggestLeak) {
      ctx.fillText(`Biggest Leak: ${recap.biggestLeak.category} - ${recap.biggestLeak.title}`, 32, 230);
    }
    ctx.fillText(`Ending Cash: ₹${(recap.endingBalance / 100).toLocaleString("en-IN")}`, 32, 260);

    // Footer
    ctx.fillStyle = "#64748b";
    ctx.font = "12px sans-serif";
    ctx.fillText("Generated offline • 100% deterministic client engine", 32, 360);
    } catch {
      // Graceful fallback when canvas 2D context is not available
    }
  }, [recap]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `broke-month-recap.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatRecapText(recap));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="relative rounded-input overflow-hidden border border-border flex justify-center bg-background">
        <canvas ref={canvasRef} width={600} height={400} className="w-full max-w-[500px] h-auto" />
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleDownload} className="flex-1 gap-1.5 text-xs">
          <Download className="h-4 w-4" /> Download PNG
        </Button>
        <Button size="sm" variant="secondary" onClick={handleCopy} className="flex-1 gap-1.5 text-xs">
          <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy Text"}
        </Button>
      </div>

      <div className="rounded-input border border-border p-3 bg-elevated/40 text-xs text-muted font-mono whitespace-pre-wrap">
        {formatRecapText(recap)}
      </div>
    </div>
  );
};
