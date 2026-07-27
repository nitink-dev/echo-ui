import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const IDLE_EVENTS: (keyof WindowEventMap)[] = [
  "keydown",
  "mousedown",
  "scroll",
  "click",
];

interface UseIdleTimeoutOptions {
  sessionTimeoutMinutes: number;
  onAutoLogout: () => void;
  onActivity?: () => void;
}

const logIdleEvent = (message: string) => {
  console.info(`[${new Date().toISOString()}] ${message}`);
};

export function useIdleTimeout({
  sessionTimeoutMinutes,
  onAutoLogout,
  onActivity,
}: UseIdleTimeoutOptions) {
  const warningAfterMs = sessionTimeoutMinutes * 0.9 * 60 * 1000;
  const countdownSeconds = Math.round(sessionTimeoutMinutes * 0.1 * 60);

  const [isIdle, setIsIdle] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isWarningActive = useRef(false);
  const onAutoLogoutRef = useRef(onAutoLogout);
  const warningStartsAtRef = useRef(0);
  const warningEndsAtRef = useRef(0);
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  const handleActivityRef = useRef<EventListener | null>(null);

  useEffect(() => {
    onAutoLogoutRef.current = onAutoLogout;
  }, [onAutoLogout]);

  const clearCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const attachActivityListeners = useCallback(() => {
    if (!handleActivityRef.current) return;
    IDLE_EVENTS.forEach((e) =>
      window.addEventListener(e, handleActivityRef.current!)
    );
  }, []);

  const detachActivityListeners = useCallback(() => {
    if (!handleActivityRef.current) return;
    IDLE_EVENTS.forEach((e) =>
      window.removeEventListener(e, handleActivityRef.current!)
    );
  }, []);

  const startCountdown = useCallback(() => {
    isWarningActive.current = true;
    detachActivityListeners();
    setIsIdle(true);
    logIdleEvent(`idle warning started with ${countdownSeconds}s remaining`);

    warningEndsAtRef.current = Date.now() + countdownSeconds * 1000;
    setSecondsLeft(countdownSeconds);
    clearCountdown();

    countdownRef.current = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.round((warningEndsAtRef.current - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearCountdown();
        isWarningActive.current = false;
        setIsIdle(false);
        logIdleEvent("idle countdown expired; auto logout triggered");
        onAutoLogoutRef.current();
      }
    }, 1000);
  }, [countdownSeconds, detachActivityListeners]);

  const scheduleIdleTimer = useCallback(() => {
    clearIdleTimer();
    if (sessionTimeoutMinutes <= 0) return;

    warningStartsAtRef.current = Date.now() + warningAfterMs;
    idleTimerRef.current = setTimeout(startCountdown, warningAfterMs);
  }, [sessionTimeoutMinutes, warningAfterMs, startCountdown]);

  const handleActivity = useCallback(
    (event: Event) => {
      const eventName = event?.type ?? "activity";

      logIdleEvent(`${eventName} refreshed the idle timer`);
      onActivity?.();
      scheduleIdleTimer();
    },
    [onActivity, scheduleIdleTimer]
  );

  handleActivityRef.current = handleActivity;

  const resetTimer = useCallback(() => {
    clearIdleTimer();
    clearCountdown();
    isWarningActive.current = false;
    setIsIdle(false);
    setSecondsLeft(countdownSeconds);
    attachActivityListeners();
    onActivity?.();
    logIdleEvent("idle timer reset manually");
    scheduleIdleTimer();
  }, [
    countdownSeconds,
    onActivity,
    scheduleIdleTimer,
    attachActivityListeners,
  ]);

  const dismissModal = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    if (sessionTimeoutMinutes <= 0) return;

    attachActivityListeners();
    scheduleIdleTimer();

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();

      if (isWarningActive.current) {
        if (now >= warningEndsAtRef.current) {
          clearCountdown();
          isWarningActive.current = false;
          setIsIdle(false);
          setSecondsLeft(0);
          logIdleEvent(
            "idle countdown expired while hidden; auto logout triggered"
          );
          onAutoLogoutRef.current();
        } else {
          setSecondsLeft(
            Math.max(
              0,
              Math.round((warningEndsAtRef.current - now) / 1000)
            )
          );
        }
      } else if (
        warningStartsAtRef.current &&
        now >= warningStartsAtRef.current
      ) {
        clearIdleTimer();
        startCountdown();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      clearIdleTimer();
      clearCountdown();
      detachActivityListeners();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [
    sessionTimeoutMinutes,
    scheduleIdleTimer,
    startCountdown,
    attachActivityListeners,
    detachActivityListeners,
  ]);

useEffect(() => {
  if (sessionTimeoutMinutes > 0) return;

  clearIdleTimer();
  clearCountdown();
  detachActivityListeners();

  isWarningActive.current = false;
  warningStartsAtRef.current = 0;
  warningEndsAtRef.current = 0;

  setIsIdle(false);
  setSecondsLeft(countdownSeconds);
}, [sessionTimeoutMinutes, countdownSeconds, detachActivityListeners]);

  useEffect(() => {
    if (!isLoggedIn) return;
    resetTimer();
    logIdleEvent("Idle timer reset after login");
  }, [isLoggedIn, resetTimer]);


  return {
    isIdle,
    secondsLeft,
    countdownSeconds,
    resetTimer,
    dismissModal
  };
}
