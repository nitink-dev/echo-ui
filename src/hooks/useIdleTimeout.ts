import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_EVENTS: (keyof WindowEventMap)[] = [
   "mousemove", "keydown", "mousedown", "scroll", "touchstart", "click",
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

  const idleTimerRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const isWarningActive = useRef(false); 
  const onAutoLogoutRef = useRef(onAutoLogout);

  useEffect(() => { onAutoLogoutRef.current = onAutoLogout; }, [onAutoLogout]);

  const clearCountdown = () => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };

  const clearIdleTimer = () => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
  };

  const scheduleIdleTimer = useCallback(() => {
    clearIdleTimer();
    if (sessionTimeoutMinutes <= 0) return;

    idleTimerRef.current = setTimeout(() => {
      isWarningActive.current = true;
      setIsIdle(true);
      logIdleEvent(`idle warning started with ${countdownSeconds}s remaining`);

      let remaining = countdownSeconds;
      setSecondsLeft(remaining);
      clearCountdown();

      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);

        if (remaining <= 0) {
          clearCountdown();
          isWarningActive.current = false;
          logIdleEvent("idle countdown expired; auto logout triggered");
          onAutoLogoutRef.current(); 
        }
      }, 1000);
    }, warningAfterMs);
  }, [sessionTimeoutMinutes, countdownSeconds, warningAfterMs]);

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

    return () => {
      clearIdleTimer();
      clearCountdown();
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, handleActivity as EventListener));
    };
  }, [scheduleIdleTimer, handleActivity, sessionTimeoutMinutes]);

  return { isIdle, secondsLeft, countdownSeconds, resetTimer, dismissModal };
}