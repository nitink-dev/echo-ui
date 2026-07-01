import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "keydown",
  "mousedown",
  "scroll",
  "touchstart",
  "click",
];

export function useIdleTimeout(timeoutMinutes: number) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const resetTimer = useCallback(() => {
    clearTimer();
    setIsIdle(false);
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes]);

  useEffect(() => {
    resetTimer();
    IDLE_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      clearTimer();
      IDLE_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [resetTimer]);

  return { isIdle, resetTimer };
}