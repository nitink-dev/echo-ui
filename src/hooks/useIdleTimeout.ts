import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_EVENTS: (keyof WindowEventMap)[] = [
   "mousemove", "keydown", "mousedown", "scroll", "touchstart", "click",
];

interface UseIdleTimeoutOptions {
  sessionTimeoutMinutes: number;
  onAutoLogout: () => void;
}

export function useIdleTimeout({ sessionTimeoutMinutes, onAutoLogout }: UseIdleTimeoutOptions) {
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

      let remaining = countdownSeconds;
      setSecondsLeft(remaining);
      clearCountdown();

      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);

        if (remaining <= 0) {
          clearCountdown();
          isWarningActive.current = false;
          onAutoLogoutRef.current(); 
        }
      }, 1000);
    }, warningAfterMs);
  }, [sessionTimeoutMinutes, countdownSeconds, warningAfterMs]);

  const handleActivity = useCallback(() => {
    if (isWarningActive.current) return;
    scheduleIdleTimer();
  }, [scheduleIdleTimer]);

  const resetTimer = useCallback(() => {
    clearIdleTimer();
    clearCountdown();
    isWarningActive.current = false;
    setIsIdle(false);
    setSecondsLeft(countdownSeconds);
    scheduleIdleTimer();
  }, [countdownSeconds, scheduleIdleTimer]);

  const dismissModal = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    if (sessionTimeoutMinutes <= 0) return;

    scheduleIdleTimer();
    IDLE_EVENTS.forEach((e) => window.addEventListener(e, handleActivity));

    return () => {
      clearIdleTimer();
      clearCountdown();
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [scheduleIdleTimer, handleActivity, sessionTimeoutMinutes]);

  return { isIdle, secondsLeft, countdownSeconds, resetTimer, dismissModal };
}