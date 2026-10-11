"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export const ThemeSettingsCard: React.FC = () => {
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

  return (
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
  );
};
