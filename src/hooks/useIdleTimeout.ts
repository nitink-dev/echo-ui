import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove", "keydown", "mousedown", "scroll", "touchstart", "click",
];

interface UseIdleTimeoutOptions {
  sessionTimeoutMinutes: number;
  onAutoLogout: () => void;
}

export function useIdleTimeout({ sessionTimeoutMinutes, onAutoLogout }: UseIdleTimeoutOptions) {
  const warningAfterMs    = sessionTimeoutMinutes * 0.9 * 60 * 1000;
  const countdownSeconds  = Math.round(sessionTimeoutMinutes * 0.1 * 60);

  const [isIdle,      setIsIdle]      = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  const idleTimerRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const onAutoLogoutRef = useRef(onAutoLogout);

  useEffect(() => { onAutoLogoutRef.current = onAutoLogout; }, [onAutoLogout]);

  const clearCountdown = () => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };
  const clearIdleTimer = () => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
  };

  const startCountdown = useCallback((seconds: number) => {
    setSecondsLeft(seconds);
    clearCountdown();
    let remaining = seconds;

    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearCountdown();
        onAutoLogoutRef.current();
      }
    }, 1000);
  }, []);

  const resetTimer = useCallback(() => {
    clearIdleTimer();
    clearCountdown();
    setIsIdle(false);
    setSecondsLeft(countdownSeconds);

    if (sessionTimeoutMinutes <= 0) return;

    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      startCountdown(countdownSeconds);
    }, warningAfterMs);
  }, [sessionTimeoutMinutes, countdownSeconds, warningAfterMs, startCountdown]);

  const dismissModal = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    if (sessionTimeoutMinutes <= 0) return;
    resetTimer();
    IDLE_EVENTS.forEach((e) => window.addEventListener(e, resetTimer));
    return () => {
      clearIdleTimer();
      clearCountdown();
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer, sessionTimeoutMinutes]);

  return { isIdle, secondsLeft, countdownSeconds, resetTimer, dismissModal };
}