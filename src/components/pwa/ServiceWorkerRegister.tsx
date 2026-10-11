"use client";

import * as React from "react";

export const ServiceWorkerRegister: React.FC = () => {
  React.useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silently ignore registration failure in non-supported environments
      });
    }
  }, []);

  return null;
};
