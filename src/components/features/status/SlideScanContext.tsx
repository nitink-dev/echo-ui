import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import apiClient from "../../../api/services/apiClient";
import { BASE_URL } from "../../../utils/constants";

const SlideScanContext = createContext({ isBannerVisible: false });

export const useSlideScan = () => useContext(SlideScanContext);

const getNumberEnv = (key: string, def: number) => {
  const val = Number(import.meta.env[key]);
  return Number.isFinite(val) && val > 0 ? val : def;
};

export const BANNER_BUFFER_MS = getNumberEnv('VITE_BANNER_TIMEOUT_MIN', 5) * 60 * 1000;

const BANNER_STORAGE_KEY = "slideScanBannerExpiresAt";

// ---- Logging helper -------------------------------------------------
// Every log line: [PROVIDER][ts][tag] message
// ts = performance.now() rounded to ms, gives us a monotonic clock we can
// use to interleave logs from SlideScanContext + SlideScanStatus.
const plog = (tag: string, ...args: any[]) => {
  const ts = Math.round(performance.now());
  // eslint-disable-next-line no-console
  console.log(`[PROVIDER][t=${ts}ms][${tag}]`, ...args);
};

export function SlideScanProvider({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useSelector((s: any) => s.auth.isLoggedIn);

  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renderCountRef = useRef(0);
  const prevIsLoggedInRef = useRef<boolean | null>(null);

  renderCountRef.current += 1;
  plog("RENDER", `render #${renderCountRef.current}`, {
    isLoggedIn,
    isBannerVisible,
  });

  const clearBannerTimer = () => {
    if (bannerTimerRef.current) {
      plog("TIMER-CLEAR", "clearing existing banner timer");
      clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    } else {
      plog("TIMER-CLEAR", "no active timer to clear");
    }
  };

  const extendBannerVisibility = () => {
    plog("EXTEND", "extendBannerVisibility() called - extending banner by", BANNER_BUFFER_MS, "ms");
    clearBannerTimer();
    const expiresAt = Date.now() + BANNER_BUFFER_MS;
    localStorage.setItem(BANNER_STORAGE_KEY, String(expiresAt));
    plog("EXTEND", "localStorage SET", BANNER_STORAGE_KEY, "=", expiresAt, `(${new Date(expiresAt).toISOString()})`);
    setIsBannerVisible(true);
    plog("EXTEND", "setIsBannerVisible(true) called");

    bannerTimerRef.current = setTimeout(() => {
      plog("TIMER-FIRE", "banner timer expired naturally -> hiding banner + removing localStorage key");
      localStorage.removeItem(BANNER_STORAGE_KEY);
      setIsBannerVisible(false);
      bannerTimerRef.current = null;
    }, BANNER_BUFFER_MS);
    plog("EXTEND", "new banner timer scheduled, id=", bannerTimerRef.current);
  };

  const restoreBannerFromStorage = () => {
    const stored = localStorage.getItem(BANNER_STORAGE_KEY);
    plog("RESTORE", "restoreBannerFromStorage() called. raw localStorage value =", stored);

    if (!stored) {
      plog("RESTORE", "no stored value found -> setIsBannerVisible(false)");
      setIsBannerVisible(false);
      return;
    }

    const expiresAt = Number(stored);
    const remaining = expiresAt - Date.now();
    plog("RESTORE", "parsed expiresAt =", expiresAt, `(${new Date(expiresAt).toISOString()})`, "remaining_ms=", remaining);

    if (remaining > 0) {
      plog("RESTORE", "remaining > 0 -> setIsBannerVisible(true), scheduling timer for", remaining, "ms");
      setIsBannerVisible(true);
      bannerTimerRef.current = setTimeout(() => {
        plog("TIMER-FIRE", "restored banner timer expired -> hiding banner + removing localStorage key");
        localStorage.removeItem(BANNER_STORAGE_KEY);
        setIsBannerVisible(false);
        bannerTimerRef.current = null;
      }, remaining);
      plog("RESTORE", "restored timer scheduled, id=", bannerTimerRef.current);
    } else {
      plog("RESTORE", "remaining <= 0 -> stale key, removing + setIsBannerVisible(false)");
      localStorage.removeItem(BANNER_STORAGE_KEY);
      setIsBannerVisible(false);
    }
  };

  const cleanup = () => {
    plog("CLEANUP", "cleanup() called. eventSource exists?", !!eventSourceRef.current, "reconnectTimeout exists?", !!reconnectTimeoutRef.current);
    if (eventSourceRef.current) {
      plog("CLEANUP", "closing existing EventSource, readyState=", eventSourceRef.current.readyState);
    }
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
      plog("CLEANUP", "cleared pending reconnect timeout");
    }
  };

  const updateFromSSE = (rawData: any) => {
    plog("SSE-DATA", "updateFromSSE() received raw payload:", rawData);

    if (!rawData) {
      plog("SSE-DATA", "rawData falsy -> ignoring");
      return;
    }

    const eventType = (rawData.eventType ?? "").toString().trim().toLowerCase();
    plog("SSE-DATA", "parsed eventType =", JSON.stringify(eventType));

    if (eventType === "heartbeat") {
      plog("SSE-DATA", "eventType is heartbeat -> IGNORING, banner NOT extended");
      return;
    }

    plog("SSE-DATA", "eventType is NOT heartbeat -> calling extendBannerVisibility()");
    extendBannerVisibility();
  };

  const connectStream = () => {
    plog("CONNECT", "connectStream() called");
    cleanup();
    if (!isMountedRef.current) {
      plog("CONNECT", "component not mounted -> aborting connectStream");
      return;
    }

    const url = `${BASE_URL}/api/slide-scan-status/stream/in-progress`;
    plog("CONNECT", "opening new EventSource to", url);

    try {
      const eventSource = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = eventSource;
      plog("CONNECT", "EventSource created, initial readyState=", eventSource.readyState);

      eventSource.onopen = () => {
        plog("SSE-OPEN", "EventSource connection OPENED. readyState=", eventSource.readyState);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        plog("SSE-RAW", "onmessage fired. raw event.data =", event.data);
        try {
          updateFromSSE(JSON.parse(event.data));
        } catch (e) {
          plog("SSE-RAW", "JSON.parse FAILED for event.data:", event.data, "error:", e);
        }
      };

      eventSource.onerror = (err) => {
        plog("SSE-ERROR", "onerror fired. readyState=", eventSource.readyState, "(0=CONNECTING,1=OPEN,2=CLOSED)", err);
        if (!isMountedRef.current) {
          plog("SSE-ERROR", "component not mounted -> ignoring error");
          return;
        }

        eventSource.close();
        eventSourceRef.current = null;

        const attempts = reconnectAttemptsRef.current;
        plog("SSE-ERROR", "reconnect attempts so far =", attempts);
        if (attempts >= 5) {
          plog("SSE-ERROR", "max reconnect attempts reached -> giving up");
          return;
        }

        const delay = Math.min(5000 * Math.pow(2, attempts), 30000);
        plog("SSE-ERROR", "scheduling reconnect in", delay, "ms (attempt", attempts + 1, ")");
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          plog("SSE-ERROR", "reconnect timer fired -> calling connectStream() again");
          connectStream();
        }, delay);
      };
    } catch (e) {
      plog("CONNECT", "EXCEPTION while creating EventSource:", e);
    }
  };

  // Mount / unmount
  useEffect(() => {
    plog("MOUNT-EFFECT", "=== PROVIDER MOUNTED ===");
    isMountedRef.current = true;
    restoreBannerFromStorage();

    return () => {
      plog("UNMOUNT-EFFECT", "=== PROVIDER UNMOUNTING ===");
      isMountedRef.current = false;
      cleanup();
      clearBannerTimer();
    };
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== BANNER_STORAGE_KEY) return;
      plog("STORAGE-EVENT", "cross-tab storage event for our key. newValue=", e.newValue, "oldValue=", e.oldValue);

      if (!e.newValue) {
        plog("STORAGE-EVENT", "newValue empty -> clearing timer, setIsBannerVisible(false)");
        clearBannerTimer();
        setIsBannerVisible(false);
      } else {
        plog("STORAGE-EVENT", "newValue present -> restoreBannerFromStorage()");
        restoreBannerFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Login-driven connect/disconnect
  useEffect(() => {
    plog("LOGIN-EFFECT", "isLoggedIn effect fired. isLoggedIn =", isLoggedIn);

    const wasLoggedIn = prevIsLoggedInRef.current;
    prevIsLoggedInRef.current = isLoggedIn;

    if (wasLoggedIn === null) {
      plog("LOGIN-EFFECT", "initial mount -> skipping login-state cleanup");
      return;
    }

    if (!isLoggedIn) {
      plog("LOGIN-EFFECT", "isLoggedIn changed to FALSE -> running cleanup + WIPING localStorage banner key");
      cleanup();
      clearBannerTimer();
      setIsBannerVisible(false);
      const before = localStorage.getItem(BANNER_STORAGE_KEY);
      localStorage.removeItem(BANNER_STORAGE_KEY);
      plog("LOGIN-EFFECT", "removed localStorage key. value before removal was:", before);
      reconnectAttemptsRef.current = 0;
      return;
    }

    plog("LOGIN-EFFECT", "isLoggedIn changed to TRUE -> connectStream()");
    connectStream();
  }, [isLoggedIn]);

  plog("PROVIDER-CONTEXT-VALUE", "providing isBannerVisible =", isBannerVisible);

  return (
    <SlideScanContext.Provider value={{ isBannerVisible }}>
      {children}
    </SlideScanContext.Provider>
  );
}