import {
  CheckCircle2,
  Clock,
  Microscope,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import apiClient from "../../../api/services/apiClient";
import { BASE_URL } from "../../../utils/constants";
import AutocompleteInput from "./AutocompleteInput";
import { StatusPanel } from "./StatusPanel";
import { StatusPanelCompleted } from "./StatusPanelCompleted";
import { StatusPanelFailed } from "./StatusPanelFailed";

const TABS = [
  {
    key: "inProgress",
    label: "In Progress",
    Icon: Clock,
    accentBadgeClass: "bg-blue-100 text-blue-700",
    activeClass: "text-blue-700",
    activeBg: "bg-white",
    activeBorderColor: "rgb(59,130,246)",
    countActiveBgStyle: { backgroundColor: "rgb(59,130,246)", color: "#fff" },
    countInactiveBgStyle: {
      backgroundColor: "rgb(243,244,246)",
      color: "rgb(107,114,128)",
    },
    iconActiveColor: "text-blue-500",
    glowColor: "rgba(59,130,246,0.10)",
  },
  {
    key: "completed",
    label: "Completed",
    Icon: CheckCircle2,
    accentBadgeClass: "bg-green-100 text-green-700",
    activeClass: "text-green-700",
    activeBg: "bg-white",
    activeBorderColor: "rgb(34,197,94)",
    countActiveBgStyle: { backgroundColor: "rgb(34,197,94)", color: "#fff" },
    countInactiveBgStyle: {
      backgroundColor: "rgb(243,244,246)",
      color: "rgb(107,114,128)",
    },
    iconActiveColor: "text-green-500",
    glowColor: "rgba(34,197,94,0.10)",
  },
  {
    key: "failed",
    label: "Failed",
    Icon: XCircle,
    accentBadgeClass: "bg-red-100 text-red-700",
    activeClass: "text-red-700",
    activeBg: "bg-white",
    activeBorderColor: "rgb(239,68,68)",
    countActiveBgStyle: { backgroundColor: "rgb(239,68,68)", color: "#fff" },
    countInactiveBgStyle: {
      backgroundColor: "rgb(243,244,246)",
      color: "rgb(107,114,128)",
    },
    iconActiveColor: "text-red-500",
    glowColor: "rgba(239,68,68,0.10)",
  },
];

const SCAN_STATUS_TO_TAB = {
  "in-progress": "inProgress",
  inprogress: "inProgress",
  in_progress: "inProgress",
  completed: "completed",
  failed: "failed",
};

const pageSize = 9;

const singleSlideToPageable = (slide) => ({
  content: [slide],
  totalElements: 1,
  totalPages: 1,
  page: 0,
  size: pageSize,
  hasNext: false,
  hasPrevious: false,
});

const emptyPageable = () => ({
  content: [],
  totalElements: 0,
  totalPages: 1,
  page: 0,
  size: pageSize,
  hasNext: false,
  hasPrevious: false,
});

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

export function SlideScanStatus() {
  const [statusData, setStatusData] = useState({
    completed: null,
    failed: null,
    inProgress: null,
    loading: { completed: false, failed: false, inProgress: false },
    error: {},
    lastFetched: { completed: null, failed: null, inProgress: null },
  });

  const [activeTab, setActiveTab] = useState("inProgress");
  const [barcodeFilter, setBarcodeFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    barcode: "",
    deviceId: "",
  });
  const [searchState, setSearchState] = useState("idle");
  const [currentPage, setCurrentPage] = useState({
    completed: 0,
    failed: 0,
    inProgress: 0,
  });
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const prevInProgressCountRef = useRef(null);
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const appliedFiltersRef = useRef(appliedFilters);
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  const toApiStatus = (key) => (key === "inProgress" ? "in-progress" : key);

  const fetchData = async (statusKey, page, overrideFilters) => {
    setStatusData((prev) => ({
      ...prev,
      loading: { ...prev.loading, [statusKey]: true },
    }));

    try {
      const apiStatus = toApiStatus(statusKey);
      const filters = overrideFilters ?? appliedFiltersRef.current;
      const barcodeParam = filters.barcode
        ? `&searchTerm=${encodeURIComponent(filters.barcode)}`
        : "";

      const url = `${BASE_URL}/api/slide-scan-status/${apiStatus}?page=${page}&size=${pageSize}${barcodeParam}`;
      const response = await apiClient.get(url);
      const data = normalisePageable(response.data);

      setStatusData((prev) => {
        if (statusKey === "inProgress") {
          const newCount = data?.totalElements ?? 0;
          const oldCount = prevInProgressCountRef.current;

          if (oldCount !== null && newCount < oldCount) {
            const pageSnap = currentPageRef.current;
            setTimeout(() => {
              fetchData("completed", pageSnap.completed);
              fetchData("failed", pageSnap.failed);
            }, 0);
          }

          prevInProgressCountRef.current = newCount;
        }

        return {
          ...prev,
          [statusKey]: data,
          loading: { ...prev.loading, [statusKey]: false },
          lastFetched: { ...prev.lastFetched, [statusKey]: Date.now() },
          error: { ...prev.error, [statusKey]: undefined },
        };
      });

      return data;
    } catch (error) {
      setStatusData((prev) => ({
        ...prev,
        [statusKey]: emptyPageable(),
        loading: { ...prev.loading, [statusKey]: false },
        error: { ...prev.error, [statusKey]: error.message || "Unknown error" },
      }));
      return null;
    }
  };

  const refreshPanelsForStatus = (normalizedStatus) => {
    const pageSnapshot = currentPageRef.current;
    if (normalizedStatus === "completed")
      fetchData("completed", pageSnapshot.completed);
    else if (normalizedStatus === "failed")
      fetchData("failed", pageSnapshot.failed);
    if (pageSnapshot.inProgress !== 0)
      fetchData("inProgress", pageSnapshot.inProgress);
  };

  const updateInProgressWithSSE = (eventData) => {
    const slideData = eventData?.payload;
  
    if (!slideData?.id) return;
  
    const status = (slideData.scanStatus ?? "")
      .toString()
      .trim()
      .toLowerCase();
  
    const isTerminal =
      status === "completed" ||
      status === "failed" ||
      status === "warning-completed" ||
      status === "ibex-warning-completed" ||
      status === "synapse-export-failed";
  
    setStatusData((prev) => {
      const currentData = prev.inProgress;
  
      if (!currentData?.content) return prev;
  
      let updatedContent = [...currentData.content];
  
      const existingIndex = updatedContent.findIndex(
        (s) => s.id === slideData.id,
      );
  
      if (isTerminal) {
        if (existingIndex !== -1) {
          updatedContent.splice(existingIndex, 1);
        }
  
        if (
          currentPageRef.current.completed === 0 ||
          currentPageRef.current.failed === 0
        ) {
          setTimeout(() => {
            fetchData("completed", currentPageRef.current.completed);
            fetchData("failed", currentPageRef.current.failed);
          }, 0);
        }
      } else {
        if (existingIndex !== -1) {
          updatedContent[existingIndex] = {
            ...updatedContent[existingIndex],
            ...slideData,
          };
        } else if (currentPageRef.current.inProgress === 0) {
          updatedContent.unshift(slideData);
  
          if (updatedContent.length > pageSize) {
            updatedContent = updatedContent.slice(0, pageSize);
          }
        }
      }
  
      const totalElements =
        isTerminal
          ? existingIndex !== -1
            ? Math.max(0, currentData.totalElements - 1)
            : currentData.totalElements
          : existingIndex === -1
            ? currentData.totalElements + 1
            : currentData.totalElements;
  
      prevInProgressCountRef.current = totalElements;
  
      return {
        ...prev,
        inProgress: normalisePageable({
          ...currentData,
          content: updatedContent,
          totalElements,
          totalPages: Math.max(
            1,
            Math.ceil(totalElements / pageSize),
          ),
        }),
        lastFetched: {
          ...prev.lastFetched,
          inProgress: Date.now(),
        },
      };
    });
  };

  const connectToInProgressStream = () => {
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
        setIsStreamConnected(true);
        setReconnectAttempts(0);
      };

      eventSource.addEventListener("slide_scan_status", (event) => {
        try {
          const parsed = JSON.parse(event.data);
          updateInProgressWithSSE(parsed);
        } catch (e) {}
      });

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
      
          if (
            parsed?.eventType?.toLowerCase() ===
            "slide_scan_status"
          ) {
            updateInProgressWithSSE(parsed);
          }
        } catch (e) {}
      };

      eventSource.onerror = () => {
        setIsStreamConnected(false);
        if (eventSource.readyState === EventSource.CLOSED) {
          setStatusData((prev) => ({
            ...prev,
            error: {
              ...prev.error,
              inProgress:
                reconnectAttempts > 3
                  ? "Stream connection failed. Please refresh manually."
                  : undefined,
            },
          }));

          if (reconnectAttempts < 5) {
            const delay = Math.min(
              5000 * Math.pow(2, reconnectAttempts),
              30000,
            );
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempts((prev) => prev + 1);
              connectToInProgressStream();
            }, delay);
          }
        }
      };
    } catch (error) {
      setStatusData((prev) => ({
        ...prev,
        error: {
          ...prev.error,
          inProgress: `Connection error: ${error.message}`,
        },
      }));
    }
  };

  useEffect(() => {
    fetchData("failed", 0, null);
    fetchData("completed", 0, null);
    fetchData("inProgress", 0, null).then((data) => {
      if (data) {
        prevInProgressCountRef.current = data.totalElements ?? 0;
        connectToInProgressStream();
      }
    });

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentPage.inProgress !== 0)
      fetchData("inProgress", currentPage.inProgress, null);
  }, [currentPage.inProgress]);

  const handleRefresh = () => {
    fetchData("failed", currentPageRef.current.failed, null);
    fetchData("completed", currentPageRef.current.completed, null);
    fetchData("inProgress", currentPageRef.current.inProgress, null);
    setReconnectAttempts(0);
    connectToInProgressStream();
  };

  const handlePageChange = (tab, direction) => {
    const currentPageNum = currentPageRef.current[tab];
    const totalPages = statusData[tab]?.totalPages ?? 1;

    const nextVal = Math.min(currentPageNum + 1, totalPages - 1);
    const preVal = Math.max(0, currentPageNum - 1);
    const newPage = direction === "next" ? nextVal : preVal;

    if (newPage === currentPageNum) return;

    currentPageRef.current = { ...currentPageRef.current, [tab]: newPage };

    setCurrentPage((prev) => ({ ...prev, [tab]: newPage }));

    fetchData(tab, newPage, null);
  };

  const handleApplyFilters = async () => {
    const trimmed = barcodeFilter.trim();
    if (!trimmed) return;

    setAppliedFilters({ barcode: trimmed, deviceId: "" });
    setCurrentPage({ completed: 0, failed: 0, inProgress: 0 });
    currentPageRef.current = { completed: 0, failed: 0, inProgress: 0 };
    setSearchState("searching");

    try {
      const response = await apiClient.get(
        `${BASE_URL}/api/slide-scan-status/barcode/${encodeURIComponent(trimmed)}`,
      );
      const slide = response.data;

      if (!slide) {
        setStatusData((prev) => ({
          ...prev,
          inProgress: emptyPageable(),
          completed: emptyPageable(),
          failed: emptyPageable(),
        }));
        setSearchState("not-found");
        setActiveTab("inProgress");
        return;
      }

      const rawStatus = (slide.scanStatus ?? "")
        .toString()
        .trim()
        .toLowerCase();
      const matchedTab = SCAN_STATUS_TO_TAB[rawStatus] ?? null;

      const inProgressData =
        matchedTab === "inProgress"
          ? singleSlideToPageable(slide)
          : emptyPageable();
      const completedData =
        matchedTab === "completed"
          ? singleSlideToPageable(slide)
          : emptyPageable();
      const failedData =
        matchedTab === "failed"
          ? singleSlideToPageable(slide)
          : emptyPageable();

      setStatusData((prev) => ({
        ...prev,
        inProgress: inProgressData,
        completed: completedData,
        failed: failedData,
        lastFetched: {
          inProgress: Date.now(),
          completed: Date.now(),
          failed: Date.now(),
        },
        error: {},
      }));

      if (matchedTab) {
        setActiveTab(matchedTab);
        setSearchState("found");
      } else {
        setSearchState("not-found");
        setActiveTab("inProgress");
      }
    } catch (err) {
      setStatusData((prev) => ({
        ...prev,
        inProgress: emptyPageable(),
        completed: emptyPageable(),
        failed: emptyPageable(),
        error: {},
      }));
      setSearchState("not-found");
      setActiveTab("inProgress");
    }
  };

  const handleClearSearch = () => {
    setBarcodeFilter("");
    const emptyFilters = { barcode: "", deviceId: "" };
    setAppliedFilters(emptyFilters);
    setCurrentPage({ completed: 0, failed: 0, inProgress: 0 });
    currentPageRef.current = { completed: 0, failed: 0, inProgress: 0 };
    setSearchState("idle");
    setActiveTab("inProgress");

    fetchData("inProgress", 0, emptyFilters);
    fetchData("completed", 0, emptyFilters);
    fetchData("failed", 0, emptyFilters);
  };

  const isAnyLoading =
    statusData.loading.completed ||
    statusData.loading.failed ||
    statusData.loading.inProgress;
  const isSearchActive = !!appliedFilters.barcode;
  const isSearching = searchState === "searching";

  const getTabCount = (key) => {
    const val = statusData[key]?.totalElements;
    return Number.isFinite(Number(val)) ? Number(val) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Microscope className="h-7 w-7 text-indigo-600" />
              Slide Scan Status Monitor
            </h1>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              Real-time monitoring of slide scanning operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AutocompleteInput
                options={[]}
                value={barcodeFilter}
                onChange={setBarcodeFilter}
                placeholder="Search barcode…"
                emptyText="Enter exact barcode to search"
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              />

              <button
                onClick={handleApplyFilters}
                disabled={!barcodeFilter.trim() || isSearching}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                {isSearching ? "Searching…" : "Search"}
              </button>

              {isSearchActive && (
                <button
                  onClick={handleClearSearch}
                  className="px-3 py-2 bg-amber-50 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={isAnyLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${isAnyLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {searchState === "found" && isSearchActive && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <span>Found barcode</span>
            <code className="px-2 py-0.5 bg-green-100 rounded font-mono text-green-900 text-xs">
              {appliedFilters.barcode}
            </code>
            <span className="text-green-600">
              — jumped to the matching tab.
            </span>
          </div>
        )}

        {searchState === "not-found" && isSearchActive && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>No results found for barcode</span>
            <code className="px-2 py-0.5 bg-red-100 rounded font-mono text-red-900 text-xs">
              {appliedFilters.barcode}
            </code>
            <span className="text-red-500 text-xs">across all statuses.</span>
          </div>
        )}

        <div>
          <div className="flex gap-2 bg-gray-100/80 rounded-2xl p-1.5 border border-gray-200/60 shadow-inner">
            {TABS.map(
              ({
                key,
                label,
                Icon,
                activeClass,
                activeBg,
                activeBorderColor,
                countActiveBgStyle,
                countInactiveBgStyle,
                iconActiveColor,
                glowColor,
              }) => {
                const count = getTabCount(key);
                const isActive = activeTab === key;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={
                      isActive
                        ? {
                            boxShadow: `0 2px 16px 0 ${glowColor}, 0 1px 4px 0 rgba(0,0,0,0.07)`,
                            borderColor: activeBorderColor,
                          }
                        : {}
                    }
                    className={`
                    relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                    rounded-xl text-sm font-semibold transition-all duration-200 border
                    ${
                      isActive
                        ? `${activeBg} ${activeClass}`
                        : "text-gray-400 hover:text-gray-600 hover:bg-white/50 border-transparent"
                    }
                  `}
                  >
                    <Icon
                      className={`h-4 w-4 transition-colors ${isActive ? iconActiveColor : "text-gray-400"}`}
                    />
                    <span className="tracking-tight">{label}</span>

                    <span
                      style={
                        isActive ? countActiveBgStyle : countInactiveBgStyle
                      }
                      className="px-2 py-0.5 rounded-full text-xs font-bold transition-colors"
                    >
                      {count}
                    </span>

                    {key === "inProgress" && isStreamConnected && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    )}
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div
              className={`h-1 w-full ${
                activeTab === "inProgress"
                  ? "bg-blue-500"
                  : activeTab === "completed"
                    ? "bg-green-500"
                    : "bg-red-500"
              }`}
            />

            <div className="p-5">
              {activeTab === "inProgress" && (
                <StatusPanel
                  statusKey="inProgress"
                  title="In Progress"
                  Icon={Clock}
                  accentBadgeClass="bg-blue-100 text-blue-700"
                  data={statusData.inProgress}
                  error={statusData.error.inProgress}
                  isLoading={statusData.loading.inProgress}
                  lastFetched={statusData.lastFetched.inProgress}
                  currentPage={currentPage.inProgress}
                  onPageChange={handlePageChange}
                  isStreaming={isStreamConnected}
                />
              )}
              {activeTab === "completed" && (
                <StatusPanelCompleted
                  statusKey="completed"
                  title="Completed"
                  Icon={CheckCircle2}
                  accentBadgeClass="bg-green-100 text-green-700"
                  data={statusData.completed}
                  error={statusData.error.completed}
                  isLoading={statusData.loading.completed}
                  lastFetched={statusData.lastFetched.completed}
                  currentPage={currentPage.completed}
                  onPageChange={handlePageChange}
                />
              )}
              {activeTab === "failed" && (
                <StatusPanelFailed
                  statusKey="failed"
                  title="Failed"
                  Icon={XCircle}
                  accentBadgeClass="bg-red-100 text-red-700"
                  data={statusData.failed}
                  error={statusData.error.failed}
                  isLoading={statusData.loading.failed}
                  lastFetched={statusData.lastFetched.failed}
                  currentPage={currentPage.failed}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {isAnyLoading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
            Fetching scan status...
          </div>
        </div>
      )}
    </div>
  );
}