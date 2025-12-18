import React, { useEffect, useState } from "react";
import { Microscope, CheckCircle2, XCircle, Clock, RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";

export function SlideScanStatus() {
  // Mock data structure matching your API
  const [statusData, setStatusData] = useState({
    completed: null,
    failed: null,
    inProgress: null,
    loading: { completed: false, failed: false, inProgress: false },
    error: {},
    lastFetched: { completed: null, failed: null, inProgress: null }
  });

  const [activeTab, setActiveTab] = useState("failed");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState({ completed: 0, failed: 0, inProgress: 0 });
  const pageSize = 10;

  // Handle tab change and fetch data
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Fetch data for the new tab if not already loaded
    const data = statusData[newTab];
    if (!data || !data.content || data.content.length === 0) {
      fetchData(newTab, currentPage[newTab]);
    }
  };

  // Mock fetch function - replace with your actual API calls
  const fetchData = async (status, page) => {
    setStatusData(prev => ({
      ...prev,
      loading: { ...prev.loading, [status]: true }
    }));

    try {
      // Replace this with your actual API endpoint
      const response = await fetch(`http://10.201.8.208:8081/api/slide-scan-status/${status}?page=${page}&size=${pageSize}`);
      const data = await response.json();
      
      setStatusData(prev => ({
        ...prev,
        [status]: data,
        loading: { ...prev.loading, [status]: false },
        lastFetched: { ...prev.lastFetched, [status]: Date.now() }
      }));
    } catch (error) {
      setStatusData(prev => ({
        ...prev,
        loading: { ...prev.loading, [status]: false },
        error: { ...prev.error, [status]: error.message }
      }));
    }
  };

  useEffect(() => {
    // Initial load with mock data
    setStatusData(prev => ({
      ...prev,
      failed: {
        content: [
          {
            id: "6931d8d58827f948025622d7",
            caseNumber: "EHS-25-07342",
            slideBarcode: "395FQ18",
            deviceSerialNumber: "SS35106",
            scanStatus: "failed",
            progressPercent: null,
            createdAt: "2025-12-04T18:54:13.305Z",
            updatedAt: "2025-12-04T18:54:13.305Z"
          },
          {
            id: "6931d8d08827f948025622d6",
            caseNumber: "EHS-25-07342",
            slideBarcode: "395FQ17",
            deviceSerialNumber: "SS35106",
            scanStatus: "failed",
            progressPercent: null,
            createdAt: "2025-12-04T18:54:08.758Z",
            updatedAt: "2025-12-04T18:54:08.758Z"
          },
          {
            id: "6931d8cb8827f948025622d5",
            caseNumber: "EHS-25-07342",
            slideBarcode: "395FQ16",
            deviceSerialNumber: "SS35106",
            scanStatus: "failed",
            progressPercent: null,
            createdAt: "2025-12-04T18:54:03.101Z",
            updatedAt: "2025-12-04T18:54:03.101Z"
          }
        ],
        page: 0, // Convert to 0-based
        size: 5,
        totalElements: 8,
        totalPages: 2,
        hasNext: true,
        hasPrevious: false
      },
      completed: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false },
      inProgress: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false },
      lastFetched: { completed: Date.now(), failed: Date.now(), inProgress: Date.now() }
    }));
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Uncomment when using real API
      // fetchData('completed', currentPage.completed);
      // fetchData('failed', currentPage.failed);
      // fetchData('inProgress', currentPage.inProgress);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, currentPage]);

  const handleRefresh = () => {
    // Uncomment when using real API
    // fetchData('completed', currentPage.completed);
    // fetchData('failed', currentPage.failed);
    // fetchData('inProgress', currentPage.inProgress);
  };

  const handlePageChange = (tab, direction) => {
    const newPage = direction === 'next' 
      ? currentPage[tab] + 1 
      : currentPage[tab] - 1;
    
    setCurrentPage({ ...currentPage, [tab]: newPage });
    // fetchData(tab, newPage);
  };

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatLastFetched = (ts) => {
    if (!ts) return "Never";
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const ScanRecordRow = ({ record, index }) => {
    const statusConfig = {
      completed: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
      failed: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
      'in-progress': { color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock }
    };

    const config = statusConfig[record.scanStatus] || statusConfig.failed;
    const StatusIcon = config.icon;

    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
        <td className="px-6 py-4">
          <div className="font-medium text-gray-900">{record.caseNumber}</div>
        </td>
        <td className="px-6 py-4">
          <div className="font-mono text-sm text-gray-700">{record.slideBarcode}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-600">{record.deviceSerialNumber}</div>
        </td>
        <td className="px-6 py-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
            <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color} capitalize`}>
              {record.scanStatus.replace('-', ' ')}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {formatTimestamp(record.createdAt)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {formatTimestamp(record.updatedAt)}
        </td>
      </tr>
    );
  };

  const PaginationControls = ({ data, tab }) => {
    if (!data) return null;

    const isLoading = statusData.loading[tab] || false;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{(data.page * data.size) + 1}</span> to{' '}
          <span className="font-medium">{Math.min((data.page + 1) * data.size, data.totalElements)}</span> of{' '}
          <span className="font-medium">{data.totalElements}</span> results
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(tab, 'prev')}
            disabled={!data.hasPrevious || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <div className="flex items-center px-3 text-sm text-gray-700">
            Page {data.page + 1} of {data.totalPages}
          </div>
          <button
            onClick={() => handlePageChange(tab, 'next')}
            disabled={!data.hasNext || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const TabContent = ({ data, status, error: tabError }) => {
    const isLoading = statusData.loading[status] || false;

    if (isLoading && (!data || !data.content)) {
      return (
        <div className="text-center py-16">
          <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading {status} scans...</p>
        </div>
      );
    }

    if (tabError) {
      return (
        <div className="text-center py-16">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Error loading {status} scans</p>
          <p className="text-sm text-red-600">{tabError}</p>
        </div>
      );
    }

    if (!data || !data.content || data.content.length === 0) {
      return (
        <div className="text-center py-16">
          <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-1">No {status} scans found</p>
          <p className="text-sm text-gray-500">Scan data will appear here when available</p>
        </div>
      );
    }

    return (
      <div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slide Barcode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Serial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.content.map((record, idx) => (
                <ScanRecordRow 
                  key={record.id} 
                  record={record} 
                  index={(data.page * data.size) + idx} 
                />
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls data={data} tab={status} />
      </div>
    );
  };

  const getTabLastFetched = () => {
    const fetched = statusData.lastFetched[activeTab];
    return formatLastFetched(fetched);
  };

  const getTotalCounts = () => {
    return {
      completed: statusData.completed?.totalElements || 0,
      failed: statusData.failed?.totalElements || 0,
      inProgress: statusData.inProgress?.totalElements || 0,
    };
  };

  const counts = getTotalCounts();
  const isAnyLoading = statusData.loading.completed || statusData.loading.failed || statusData.loading.inProgress;

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
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            <div className="text-right text-xs text-gray-500">
              <div>Last updated</div>
              <div className="font-medium text-gray-900">{getTabLastFetched()}</div>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isAnyLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Card with Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2 bg-gray-50">
              <button
                onClick={() => handleTabChange('completed')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'completed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Completed</span>
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {counts.completed}
                </span>
              </button>
              <button
                onClick={() => handleTabChange('failed')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'failed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Failed</span>
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {counts.failed}
                </span>
              </button>
              <button
                onClick={() => handleTabChange('inProgress')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'inProgress'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Clock className="h-4 w-4 text-blue-600" />
                <span>In Progress</span>
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === 'inProgress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {counts.inProgress}
                </span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'completed' && (
              <TabContent data={statusData.completed} status="completed" error={statusData.error.completed} />
            )}
            {activeTab === 'failed' && (
              <TabContent data={statusData.failed} status="failed" error={statusData.error.failed} />
            )}
            {activeTab === 'inProgress' && (
              <TabContent data={statusData.inProgress} status="inProgress" error={statusData.error.inProgress} />
            )}
          </div>
        </div>

        {/* Loading Indicator */}
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