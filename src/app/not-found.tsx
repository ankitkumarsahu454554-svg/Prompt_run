import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-text">
      <div className="max-w-md space-y-4 rounded-card border border-border bg-surface p-8 shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary-text">
          <FileQuestion className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl font-black text-text">
          404: Lost in the Ledger
        </h1>
        <p className="text-sm text-muted">
          The requested page could not be located. Let&apos;s get you back to your 30-day budget dashboard.
        </p>
        <div className="pt-2">
          <Link href="/" className="inline-block w-full">
            <Button type="button" variant="primary" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
