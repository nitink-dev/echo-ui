import { createContext, useContext, useEffect, useRef, useState } from "react";
import apiClient from "../../../api/services/apiClient";
import { BASE_URL } from "../../../utils/constants";

const SlideScanContext = createContext({
  inProgressCount: 0,
});

export const useSlideScan = () => useContext(SlideScanContext);

const pageSize = 9;

const normalisePageable = (data) => {
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

export function SlideScanProvider({ children }) {
  const [inProgressCount, setInProgressCount] = useState(0);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const updateCountFromSSE = (slideData) => {
    const status = (slideData?.scanStatus ?? "")
      .toString()
      .trim()
      .toLowerCase();

    setInProgressCount((prev) => {
      if (status === "completed" || status === "failed") {
        return Math.max(0, prev - 1);
      }
      return prev;
    });
  };

  const connectStream = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const url = `${BASE_URL}/api/slide-scan-status/stream/in-progress`;

    try {
      const eventSource = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };

      eventSource.addEventListener("slide_scan_status", (event) => {
        try {
          updateCountFromSSE(JSON.parse(event.data));
        } catch {}
      });

      eventSource.onmessage = (event) => {
        try {
          updateCountFromSSE(JSON.parse(event.data));
        } catch {}
      };

      eventSource.onerror = () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          const attempts = reconnectAttemptsRef.current;
          if (attempts < 5) {
            const delay = Math.min(5000 * Math.pow(2, attempts), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current += 1;
              connectStream();
            }, delay);
          }
        }
      };
    } catch {}
  };

  useEffect(() => {
    apiClient
      .get(`${BASE_URL}/api/slide-scan-status/in-progress?page=0&size=${pageSize}`)
      .then((res) => {
        const data = normalisePageable(res.data);
        setInProgressCount(data?.totalElements ?? 0);
        connectStream();
      })
      .catch(() => {
        connectStream();
      });

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  return (
    <SlideScanContext.Provider value={{ inProgressCount }}>
      {children}
    </SlideScanContext.Provider>
  );
}