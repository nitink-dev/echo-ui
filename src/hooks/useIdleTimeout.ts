import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_EVENTS: (keyof WindowEventMap)[] = [
   "keydown", "mousedown", "scroll",  "click",
];

interface UseIdleTimeoutOptions {
  sessionTimeoutMinutes: number;
  onAutoLogout: () => void;
  onActivity?: () => void;
}

const logIdleEvent = (message: string) => {
  console.info(`[${new Date().toISOString()}] ${message}`);
};

export function useIdleTimeout({ sessionTimeoutMinutes, onAutoLogout, onActivity }: UseIdleTimeoutOptions) {
  const warningAfterMs   = sessionTimeoutMinutes * 0.9 * 60 * 1000;
  const countdownSeconds = Math.round(sessionTimeoutMinutes * 0.1 * 60);

  const [isIdle,      setIsIdle]      = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  const idleTimerRef       = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const countdownRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const isWarningActive    = useRef(false); 
  const onAutoLogoutRef    = useRef(onAutoLogout);
  const warningStartsAtRef = useRef(0);
  const warningEndsAtRef   = useRef(0);

  useEffect(() => { onAutoLogoutRef.current = onAutoLogout; }, [onAutoLogout]);

  const clearCountdown = () => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };

  const clearIdleTimer = () => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
  };

  const startCountdown = useCallback(() => {
    isWarningActive.current = true;
    setIsIdle(true);
    logIdleEvent(`idle warning started with ${countdownSeconds}s remaining`);

    warningEndsAtRef.current = Date.now() + countdownSeconds * 1000;
    setSecondsLeft(countdownSeconds);
    clearCountdown();

    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((warningEndsAtRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearCountdown();
        isWarningActive.current = false;
        setIsIdle(false);
        logIdleEvent("idle countdown expired; auto logout triggered");
        onAutoLogoutRef.current();
      }
    }, 1000);
  }, [countdownSeconds]);

  const scheduleIdleTimer = useCallback(() => {
    clearIdleTimer();
    if (sessionTimeoutMinutes <= 0) return;

    warningStartsAtRef.current = Date.now() + warningAfterMs;
    idleTimerRef.current = setTimeout(startCountdown, warningAfterMs);
  }, [sessionTimeoutMinutes, warningAfterMs, startCountdown]);

  const handleActivity = useCallback((event: Event) => {
    const eventName = event?.type ?? "activity";

    if (isWarningActive.current) {
      logIdleEvent(`${eventName} ignored while warning is active`);
      return;
    }

    logIdleEvent(`${eventName} refreshed the idle timer`);
    onActivity?.();
    scheduleIdleTimer();
  }, [onActivity, scheduleIdleTimer]);

  const resetTimer = useCallback(() => {
    clearIdleTimer();
    clearCountdown();
    isWarningActive.current = false;
    setIsIdle(false);
    setSecondsLeft(countdownSeconds);
    onActivity?.();
    logIdleEvent("idle timer reset manually");
    scheduleIdleTimer();
  }, [countdownSeconds, onActivity, scheduleIdleTimer]);

  const dismissModal = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    if (sessionTimeoutMinutes <= 0) return;

    scheduleIdleTimer();
    IDLE_EVENTS.forEach((e) => window.addEventListener(e, handleActivity as EventListener));

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();

      if (isWarningActive.current) {
        if (now >= warningEndsAtRef.current) {
          clearCountdown();
          isWarningActive.current = false;
          setIsIdle(false);
          setSecondsLeft(0);
          logIdleEvent("idle countdown expired while hidden; auto logout triggered");
          onAutoLogoutRef.current();
        } else {
          setSecondsLeft(Math.max(0, Math.round((warningEndsAtRef.current - now) / 1000)));
        }
      } else if (warningStartsAtRef.current && now >= warningStartsAtRef.current) {
        clearIdleTimer();
        startCountdown();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      clearIdleTimer();
      clearCountdown();
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, handleActivity as EventListener));
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [scheduleIdleTimer, handleActivity, sessionTimeoutMinutes, startCountdown]);

  return { isIdle, secondsLeft, countdownSeconds, resetTimer, dismissModal };
}