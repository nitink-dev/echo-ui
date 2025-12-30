
// SlideScanStatus.jsx
import React, { useEffect, useState } from "react";
import {
  Microscope,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { StatusPanelCompleted } from "./StatusPanelCompleted";
import { StatusPanelFailed } from "./StatusPanelFailed";
import { StatusPanel } from "./StatusPanel";     // <-- new component
import { BASE_URL } from "../../../utils/constants";
// ScanRecordRow is imported inside StatusPanel, so no need to import here

export function SlideScanStatus() {
  const [statusData, setStatusData] = useState({
    completed: null,
    failed: null,
    inProgress: null,
    loading: { completed: false, failed: false, inProgress: false },
    error: {},
    lastFetched: { completed: null, failed: null, inProgress: null },
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState({
    completed: 0,
    failed: 0,
    inProgress: 0,
  });
  const pageSize = 4;

  const toApiStatus = (key) => (key === "inProgress" ? "in-progress" : key);

  const fetchData = async (statusKey, page) => {
    setStatusData((prev) => ({
      ...prev,
      loading: { ...prev.loading, [statusKey]: true },
    }));

    try {
      const apiStatus = toApiStatus(statusKey);
      const response = await fetch(
        // `http://10.201.8.208:8081/api/slide-scan-status/${apiStatus}?page=${page}&size=${pageSize}`
        `${BASE_URL}/api/slide-scan-status/${apiStatus}?page=${page}&size=${pageSize}`
      );
      const data = await response.json();

      setStatusData((prev) => ({
        ...prev,
        [statusKey]: data,
        loading: { ...prev.loading, [statusKey]: false },
        lastFetched: { ...prev.lastFetched, [statusKey]: Date.now() },
        error: { ...prev.error, [statusKey]: undefined },
      }));
    } catch (error) {
      setStatusData((prev) => ({
        ...prev,
        loading: { ...prev.loading, [statusKey]: false },
        error: { ...prev.error, [statusKey]: error.message || "Unknown error" },
      }));
    }
  };

  useEffect(() => {
    fetchData("failed", currentPage.failed);
    fetchData("completed", currentPage.completed);
    fetchData("inProgress", currentPage.inProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData("failed", currentPage.failed);
      fetchData("completed", currentPage.completed);
      fetchData("inProgress", currentPage.inProgress);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, currentPage]);

  const handleRefresh = () => {
    fetchData("failed", currentPage.failed);
    fetchData("completed", currentPage.completed);
    fetchData("inProgress", currentPage.inProgress);
  };

  const handlePageChange = (tab, direction) => {
    const newPage = direction === "next" ? currentPage[tab] + 1 : currentPage[tab] - 1;
    setCurrentPage((prev) => ({ ...prev, [tab]: newPage }));
    fetchData(tab, newPage);
  };

  const isAnyLoading =
    statusData.loading.completed ||
    statusData.loading.failed ||
    statusData.loading.inProgress;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Microscope className="h-7 w-7 text-indigo-600" />
              Slide Scan Status Monitor
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time monitoring of slide scanning operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                autoRefresh
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {autoRefresh ? (
                <>
                  <Wifi className="h-4 w-4" />
                  Auto-refresh ON
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  Auto-refresh OFF
                </>
              )}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isAnyLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isAnyLoading ? "animate-spin" : ""}`} />
              Refresh all
            </button>
          </div>
        </div>

        {/* 3 status panels */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          <StatusPanel
            statusKey="inProgress"
            title="In Progress"
            Icon={Clock}
            accentBadgeClass="bg-blue-100 text-blue-700"
            data={statusData.inProgress}
            error={statusData.error.inProgress}
            isLoading={statusData.loading.inProgress}
            lastFetched={statusData.lastFetched.inProgress}
            onPageChange={handlePageChange}
          />
          
          <StatusPanelCompleted
            statusKey="completed"
            title="Completed"
            Icon={CheckCircle2}
            accentBadgeClass="bg-green-100 text-green-700"
            data={statusData.completed}
            error={statusData.error.completed}
            isLoading={statusData.loading.completed}
            lastFetched={statusData.lastFetched.completed}
            onPageChange={handlePageChange}
          />
  
          <StatusPanelFailed
            statusKey="failed"
            title="Failed"
            Icon={XCircle}
            accentBadgeClass="bg-red-100 text-red-700"
            data={statusData.failed}
            error={statusData.error.failed}
            isLoading={statusData.loading.failed}
            lastFetched={statusData.lastFetched.failed}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Global loading indicator */}
        {isAnyLoading && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
              Fetching scan status...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
