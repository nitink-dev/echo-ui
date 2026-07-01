import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import apiClient from "../../../api/services/apiClient";
import { BASE_URL } from "../../../utils/constants";

const SlideScanContext = createContext({
  isBannerVisible: false,
});

export const useSlideScan = () => useContext(SlideScanContext);

const getNumberEnv = (key: string, def: number) => {
  const val = Number(import.meta.env[key]);
  return Number.isFinite(val) && val > 0 ? val : def;
};

export const BANNER_BUFFER_MS =
  getNumberEnv('VITE_BANNER_TIMEOUT_MIN', 1) * 60 * 1000;

const TERMINAL_STATUSES = new Set(["completed", "failed"]);

export function SlideScanProvider({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useSelector((s: any) => s.auth.isLoggedIn);

  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearBannerTimer = () => {
    if (bannerTimerRef.current) {
      clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
  };

  const extendBannerVisibility = () => {
    clearBannerTimer();
    setIsBannerVisible(true);
    bannerTimerRef.current = setTimeout(() => {
      setIsBannerVisible(false);
      bannerTimerRef.current = null;
    }, BANNER_BUFFER_MS);
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
    if (!rawData) return;

    const eventType = (rawData.eventType ?? "").toString().trim().toLowerCase();

    if (eventType === "heartbeat") return;

    if (eventType === "research_event") {
      extendBannerVisibility();
      return;
    }

    const payload = rawData.payload;
    if (!payload?.id) return;

    const scanStatus = (payload.scanStatus ?? "").toString().trim().toLowerCase();
    const isTerminal = TERMINAL_STATUSES.has(scanStatus);

    if (!isTerminal) {
      extendBannerVisibility();
    }
  };

  const connectStream = () => {
    cleanup();
    if (!isMountedRef.current) return;

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
        } catch {}
      };

      eventSource.onerror = () => {
        if (!isMountedRef.current) return;

        eventSource.close();
        eventSourceRef.current = null;

        apiClient
          .get(`${BASE_URL}/api/slide-scan-status/in-progress?page=0&size=1`)
          .then(() => {
            if (!isMountedRef.current) return;
            const attempts = reconnectAttemptsRef.current;
            if (attempts < 5) {
              const delay = Math.min(5000 * Math.pow(2, attempts), 30000);
              reconnectTimeoutRef.current = setTimeout(() => {
                reconnectAttemptsRef.current += 1;
                connectStream();
              }, delay);
            }
          })
          .catch((err) => {
            const status = err?.response?.status;
            if (status === 401 || status === 403) return;
            if (!isMountedRef.current) return;
            const attempts = reconnectAttemptsRef.current;
            if (attempts < 5) {
              const delay = Math.min(5000 * Math.pow(2, attempts), 30000);
              reconnectTimeoutRef.current = setTimeout(() => {
                reconnectAttemptsRef.current += 1;
                connectStream();
              }, delay);
            }
          });
      };
    } catch {}
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
      clearBannerTimer();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      cleanup();
      clearBannerTimer();
      setIsBannerVisible(false);
      reconnectAttemptsRef.current = 0;
      return;
    }

    apiClient
      .get(`${BASE_URL}/api/slide-scan-status/in-progress?page=0&size=1`)
      .then((res) => {
        if (!isMountedRef.current) return;
        connectStream();
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) return;
        if (!isMountedRef.current) return;
        connectStream();
      });
  }, [isLoggedIn]);

  return (
    <SlideScanContext.Provider value={{ isBannerVisible }}>
      {children}
    </SlideScanContext.Provider>
  );
}



