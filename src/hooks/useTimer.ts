// ============================================================
// 📚 hooks/useTimer.ts — Timer hook con TypeScript
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import type { UseTimerReturn, UrgencyLevel } from "../types";

interface UseTimerOptions {
  initialSeconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export function useTimer({
  initialSeconds = 60,
  autoStart = false,
  onComplete,
}: UseTimerOptions = {}): UseTimerReturn {
  // useRef<ReturnType<typeof setInterval> | null>:
  // ReturnType infiere el tipo de retorno de setInterval
  // En Node: NodeJS.Timeout | En Browser: number
  // ReturnType<typeof setInterval> maneja ambos automáticamente
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          setIsComplete(true);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback((): void => {
    if (!isComplete) setIsRunning(true);
  }, [isComplete]);

  const pause = useCallback((): void => setIsRunning(false), []);

  const reset = useCallback(
    (newSeconds?: number): void => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSeconds(newSeconds ?? initialSeconds);
      setIsRunning(false);
      setIsComplete(false);
    },
    [initialSeconds],
  );

  const restart = useCallback((): void => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(initialSeconds);
    setIsComplete(false);
    setIsRunning(true);
  }, [initialSeconds]);

  const percentage = Math.round((seconds / initialSeconds) * 100);
  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  // Type-safe ternary: retorna UrgencyLevel (no un string cualquiera)
  const urgencyLevel: UrgencyLevel =
    percentage > 60 ? "normal" : percentage > 30 ? "warning" : "danger";

  return {
    seconds,
    percentage,
    formatted,
    urgencyLevel,
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    restart,
  };
}
