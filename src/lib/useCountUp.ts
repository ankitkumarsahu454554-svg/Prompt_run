"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, durationMs = 400): number {
  const [value, setValue] = useState(target);
  const currentValRef = useRef(target);

  useEffect(() => {
    // Honor prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      currentValRef.current = target;
      setValue(target);
      return;
    }

    const startValue = currentValRef.current;
    const diff = target - startValue;
    if (diff === 0) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min(1, (timestamp - startTime) / durationMs);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startValue + diff * easeOut);
      currentValRef.current = nextVal;
      setValue(nextVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    }

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [target, durationMs]);

  return value;
}
