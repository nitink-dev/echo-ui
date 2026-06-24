import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import apiClient from "../../../api/services/apiClient";
import { BASE_URL } from "../../../utils/constants";

const SlideScanContext = createContext({
  inProgressCount: 0,
});

export const useSlideScan = () => useContext(SlideScanContext);

const pageSize = 10;

const BANNER_BUFFER_MS = 5 * 60 * 1000;

const normalisePageable = (data: any) => {
  if (!data) return data;
  const totalElements = Number.isFinite(Number(data.totalElements))
    ? Number(data.totalElements)
    : 0;
  const totalPages = Number.isFinite(Number(data.totalPages))
    ? Math.max(1, Number(data.totalPages))
    : Math.max(1, Math.ceil(totalElements / pageSize));
  const page = Number.isFinite(Number(data.page ?? data.number))
    ? Number(data.page ?? data.number)
    : 0;
  return { ...data, totalElements, totalPages, page };
};

export function SlideScanProvider({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useSelector((s: any) => s.auth.isLoggedIn);

  const [inProgressCount, setInProgressCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const trackedSlidesRef = useRef<Set<string>>(new Set());
  const pendingTerminalTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const cleanup = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const clearPendingTimer = (slideId: string) => {
    const existing = pendingTerminalTimersRef.current.get(slideId);
    if (existing) {
      clearTimeout(existing);
      pendingTerminalTimersRef.current.delete(slideId);
    }
  };

  const updateCountFromSSE = (rawData: any) => {
    if (!rawData) return;

    const eventType = (rawData.eventType ?? "").toString().trim().toLowerCase();

    if (eventType !== "slide_scan_status") return;

    const payload = rawData.payload;

    if (!payload?.id) return;

    const slideId = payload.id as string;

    const scanStatus = (payload.scanStatus ?? "")
      .toString()
      .trim()
      .toLowerCase();

    const isTerminal = !scanStatus.includes("in") && !scanStatus.includes("progress");

    const wasTracked = trackedSlidesRef.current.has(slideId);

    clearPendingTimer(slideId);

    if (isTerminal) {
      if (wasTracked) {
        const timer = setTimeout(() => {
          pendingTerminalTimersRef.current.delete(slideId);
          trackedSlidesRef.current.delete(slideId);
          setInProgressCount((prev) => Math.max(0, prev - 1));
        }, BANNER_BUFFER_MS);

        pendingTerminalTimersRef.current.set(slideId, timer);
      }
    } else {
      if (!wasTracked) {
        trackedSlidesRef.current.add(slideId);

        setInProgressCount((prev) => prev + 1);
      }
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
          updateCountFromSSE(JSON.parse(event.data));
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
      pendingTerminalTimersRef.current.forEach((timer) => clearTimeout(timer));
      pendingTerminalTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      cleanup();
      setInProgressCount(0);
      reconnectAttemptsRef.current = 0;
      trackedSlidesRef.current.clear();
      pendingTerminalTimersRef.current.forEach((timer) => clearTimeout(timer));
      pendingTerminalTimersRef.current.clear();
      return;
    }

    apiClient
      .get(
        `${BASE_URL}/api/slide-scan-status/in-progress?page=0&size=${pageSize}`,
      )
      .then((res) => {
        if (!isMountedRef.current) return;
        const data = normalisePageable(res.data);
        const count = data?.totalElements ?? 0;
        setInProgressCount(count);

        trackedSlidesRef.current.clear();
        const content: any[] = data?.content ?? [];
        content.forEach((slide: any) => {
          if (slide.id) {
            trackedSlidesRef.current.add(slide.id);
          }
        });

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
    <SlideScanContext.Provider value={{ inProgressCount }}>
      {children}
    </SlideScanContext.Provider>
  );
}