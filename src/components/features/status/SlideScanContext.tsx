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
  const clearBannerTimer = () => {
    if (bannerTimerRef.current) {   
      clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    } 
  };

  const extendBannerVisibility = () => {
    clearBannerTimer();
    const expiresAt = Date.now() + BANNER_BUFFER_MS;
    localStorage.setItem(BANNER_STORAGE_KEY, String(expiresAt));
    setIsBannerVisible(true);
    bannerTimerRef.current = setTimeout(() => {
      localStorage.removeItem(BANNER_STORAGE_KEY);
      setIsBannerVisible(false);
      bannerTimerRef.current = null;
    }, BANNER_BUFFER_MS);
  };

  const restoreBannerFromStorage = () => {
    const stored = localStorage.getItem(BANNER_STORAGE_KEY);
    if (!stored) {
      setIsBannerVisible(false);
      return;
    }

    const expiresAt = Number(stored);
    const remaining = expiresAt - Date.now();
    if (remaining > 0) {
      setIsBannerVisible(true);
      bannerTimerRef.current = setTimeout(() => {
        localStorage.removeItem(BANNER_STORAGE_KEY);
        setIsBannerVisible(false);
        bannerTimerRef.current = null;
      }, remaining);
    } else {
      localStorage.removeItem(BANNER_STORAGE_KEY);
      setIsBannerVisible(false);
    }
  };

  const cleanup = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };
  const updateFromSSE = (rawData: any) => {
    if (!rawData) {
      return;
    }

    const eventType = (rawData.eventType ?? "").toString().trim().toLowerCase();
    if (eventType === "heartbeat") {
      return;
    }
    const payload = rawData.payload;
    const scanStatus = (payload?.scanStatus ?? "").toString().trim().toLowerCase();
    const isTerminal = scanStatus === "completed" || scanStatus === "failed"; 
    if (isTerminal) {
      return;
    }
    extendBannerVisibility();
  };

  const connectStream = () => {
    cleanup();
    if (!isMountedRef.current) {
      return;
    }

    const url = `${BASE_URL}/api/slide-scan-status/stream/in-progress`;
    try {
      const eventSource = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = eventSource;
      eventSource.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };
      eventSource.onmessage = (event) => {
        try {
          updateFromSSE(JSON.parse(event.data));
        } catch (e) {
          console.log("SSE-RAW", "JSON.parse FAILED for event.data:", event.data, "error:", e);
        }
      };
      eventSource.onerror = (err) => {        
        if (!isMountedRef.current) {
          return;
        }
        eventSource.close();
        eventSourceRef.current = null;
        const attempts = reconnectAttemptsRef.current;
        if (attempts >= 5) {
          return;
        }
        const delay = Math.min(5000 * Math.pow(2, attempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connectStream();
        }, delay);
      };
    } catch (e) {
      console.log("CONNECT", "EXCEPTION while creating EventSource:", e);
    }
  };

  // Mount / unmount
  useEffect(() => {
    isMountedRef.current = true;
    restoreBannerFromStorage();
    return () => {
      isMountedRef.current = false;
      cleanup();
      clearBannerTimer();
    };
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== BANNER_STORAGE_KEY) return;    
      if (!e.newValue) {
        clearBannerTimer();
        setIsBannerVisible(false);
      } else {
        restoreBannerFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const wasLoggedIn = prevIsLoggedInRef.current;
    prevIsLoggedInRef.current = isLoggedIn;
    if (wasLoggedIn === null) {
      return;
    }

    if (!isLoggedIn) {
      cleanup();
      clearBannerTimer();
      setIsBannerVisible(false);
      const before = localStorage.getItem(BANNER_STORAGE_KEY);
      localStorage.removeItem(BANNER_STORAGE_KEY);
      reconnectAttemptsRef.current = 0;
      return;
    }
    connectStream();
  }, [isLoggedIn]);
  return (
    <SlideScanContext.Provider value={{ isBannerVisible }}>
      {children}
    </SlideScanContext.Provider>
  );
}