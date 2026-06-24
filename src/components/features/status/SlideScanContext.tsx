import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import apiClient from "../../../api/services/apiClient";
import { BASE_URL } from "../../../utils/constants";

type SSESlidePayload = {
  id: string;
  scanStatus: string;
  slideBarcode?: string;
  deviceSerialNumber?: string;
  progressPercent?: number;
  accessionNumber?: string;
  seriesId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type SSEEventListener = (payload: SSESlidePayload) => void;

type SlideScanContextValue = {
  inProgressCount: number;
  subscribeToSSE: (listener: SSEEventListener) => () => void;
};

const SlideScanContext = createContext<SlideScanContextValue>({
  inProgressCount: 0,
  subscribeToSSE: () => () => {},
});

export const useSlideScan = () => useContext(SlideScanContext);

const pageSize = 10;

const TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "warning-completed",
  "ibex-warning-completed",
  "synapse-export-failed",
  "exported",
  "synapse-exported",
]);

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
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  const trackedSlidesRef = useRef<Set<string>>(new Set());
  const listenersRef = useRef<Set<SSEEventListener>>(new Set());

  const subscribeToSSE = useCallback((listener: SSEEventListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const broadcast = (payload: SSESlidePayload) => {
    listenersRef.current.forEach((fn) => {
      try {
        fn(payload);
      } catch {}
    });
  };

  const cleanup = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const processSSEPayload = (payload: SSESlidePayload) => {
    if (!payload?.id) return;

    const slideId = payload.id;
    const scanStatus = (payload.scanStatus ?? "").toString().trim().toLowerCase();
    const isTerminal = TERMINAL_STATUSES.has(scanStatus);
    const wasTracked = trackedSlidesRef.current.has(slideId);

    if (isTerminal) {
      if (wasTracked) {
        trackedSlidesRef.current.delete(slideId);
        setInProgressCount((prev) => Math.max(0, prev - 1));
      }
    } else {
      if (!wasTracked) {
        trackedSlidesRef.current.add(slideId);
        setInProgressCount((prev) => prev + 1);
      }
    }

    broadcast(payload);
  };

  const handleRawMessage = (rawData: any) => {
    if (!rawData) return;

    const eventType = (rawData.eventType ?? "").toString().trim().toLowerCase();

    if (eventType === "slide_scan_status") {
      const payload = rawData.payload as SSESlidePayload;
      if (payload) processSSEPayload(payload);
    }
  };

  const scheduleReconnect = () => {
    if (!isMountedRef.current) return;
    const attempts = reconnectAttemptsRef.current;
    if (attempts >= 5) return;
    const delay = Math.min(5000 * Math.pow(2, attempts), 30000);
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      connectStream();
    }, delay);
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
          handleRawMessage(JSON.parse(event.data));
        } catch {}
      };

      eventSource.addEventListener("slide_scan_status", (event) => {
        try {
          const parsed = JSON.parse((event as MessageEvent).data);
          const payload = parsed?.payload ?? parsed;
          if (payload) processSSEPayload(payload);
        } catch {}
      });

      eventSource.onerror = () => {
        if (!isMountedRef.current) return;
        eventSource.close();
        eventSourceRef.current = null;

        apiClient
          .get(`${BASE_URL}/api/slide-scan-status/in-progress?page=0&size=1`)
          .then(() => scheduleReconnect())
          .catch((err) => {
            const status = err?.response?.status;
            if (status === 401 || status === 403) return;
            scheduleReconnect();
          });
      };
    } catch {}
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      cleanup();
      setInProgressCount(0);
      reconnectAttemptsRef.current = 0;
      trackedSlidesRef.current.clear();
      return;
    }

    apiClient
      .get(`${BASE_URL}/api/slide-scan-status/in-progress?page=0&size=${pageSize}`)
      .then((res) => {
        if (!isMountedRef.current) return;

        const data = normalisePageable(res.data);
        const totalElements = data?.totalElements ?? 0;

        trackedSlidesRef.current.clear();
        const content: any[] = data?.content ?? [];
        content.forEach((slide: any) => {
          if (slide.id) trackedSlidesRef.current.add(slide.id);
        });

        setInProgressCount(totalElements);

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
    <SlideScanContext.Provider value={{ inProgressCount, subscribeToSSE }}>
      {children}
    </SlideScanContext.Provider>
  );
}