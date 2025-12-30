import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { Button } from '../ui/button';
import { Microscope, CheckCircle2, XCircle, Clock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { AutocompleteInput } from '../progressbar/component/AutocompleteInput';
import { BASE_URL } from "../../utils/constants";
import { Input } from "../ui/input";

export function PipelineProgress() {
  const [statusData, setStatusData] = useState({
    completed: null,
    failed: null,
    inProgress: null,
    loading: { completed: false, failed: false, inProgress: false },
    error: {},
    lastFetched: { completed: null, failed: null, inProgress: null }
  });

  const [activeTab, setActiveTab] = useState("failed");
  const [currentPage, setCurrentPage] = useState({ completed: 0, failed: 0, inProgress: 0 });
  const pageSize = 4;

  // Filter state
  const [barcodeFilter, setBarcodeFilter] = useState("");
  const [deviceIdFilter, setDeviceIdFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ barcode: "", deviceId: "" });

  // Barcode and Device options from API
  const [barcodeOptions, setBarcodeOptions] = useState([]);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState({ barcodes: false, devices: false });

  // Fetch barcode options from API
  const fetchBarcodeOptions = async () => {
    setOptionsLoading(prev => ({ ...prev, barcodes: true }));
    try {
      const response = await fetch(`${BASE_URL}/api/slide-scan-status/barcodes`);
      const data = await response.json();
      setBarcodeOptions(data);
    } catch (error) {
      console.error('Error fetching barcodes:', error);
    } finally {
      setOptionsLoading(prev => ({ ...prev, barcodes: false }));
    }
  };

  // Fetch device options from API
  const fetchDeviceOptions = async () => {
    setOptionsLoading(prev => ({ ...prev, devices: true }));
    try {
      const response = await fetch(`${BASE_URL}/api/device-ids`);
      const data = await response.json();
      setDeviceOptions(data.map(item => item.deviceSerialNumber));
    } catch (error) {
      console.error('Error fetching device IDs:', error);
    } finally {
      setOptionsLoading(prev => ({ ...prev, devices: false }));
    }
  };

  // Fetch data for a specific status from API
  const fetchDataForStatus = async (status) => {
    setStatusData(prev => ({
      ...prev,
      loading: { ...prev.loading, [status]: true }
    }));

    try {
      let url = `${BASE_URL}/api/slide-scan-status/${status}?page=${currentPage[status]}&size=${pageSize}`;
      
      if (appliedFilters.barcode) {
        url += `&barcode=${encodeURIComponent(appliedFilters.barcode)}`;
      }
      
      if (appliedFilters.deviceId) {
        url += `&deviceId=${encodeURIComponent(appliedFilters.deviceId)}`;
      }

      const response = await fetch(url);
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

  // Initial load - fetch options and data
  useEffect(() => {
    fetchBarcodeOptions();
   //? fetchDeviceOptions();
    fetchDataForStatus('completed');
    fetchDataForStatus('failed');
    fetchDataForStatus('inProgress');
  }, []);

  // Reload data when filters or pagination changes
  useEffect(() => {
    fetchDataForStatus('completed');
    fetchDataForStatus('failed');
    fetchDataForStatus('inProgress');
  }, [appliedFilters, currentPage]);

  const handleApplyFilters = () => {
    setAppliedFilters({ barcode: barcodeFilter, deviceId: deviceIdFilter });
    setCurrentPage({ completed: 0, failed: 0, inProgress: 0 });
  };

  const handlePageChange = (tab, direction) => {
    const newPage = direction === 'next' 
      ? currentPage[tab] + 1 
      : currentPage[tab] - 1;
    
    setCurrentPage({ ...currentPage, [tab]: newPage });
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
        <td className="px-3 py-1 text-xs leading-tight text-gray-500">{index + 1}</td>
        <td className="px-3 py-1">
          <div className="font-mono text-xs leading-tight text-gray-700">{record.slideBarcode}</div>
        </td>
        <td className="px-3 py-1">
          <div className="text-xs leading-tight text-gray-600">{record.deviceSerialNumber}</div>
        </td>
        <td className="px-3 py-1">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bg}`}>
            <StatusIcon className={`h-3 w-3 ${config.color}`} />
            <span className={`text-[11px] leading-tight font-medium ${config.color} capitalize`}>
              {record.scanStatus.replace('-', ' ')}
            </span>
          </div>
        </td>
        <td className="px-3 py-1 text-xs leading-tight text-gray-500">
          {formatTimestamp(record.createdAt)}
        </td>
        <td className="px-3 py-1 text-xs leading-tight text-gray-500">
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

  const TabContent = ({ data, status }) => {
    const isLoading = statusData.loading[status] || false;

    if (isLoading && (!data || !data.content)) {
      return (
        <div className="text-center py-16">
          <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading {status} scans...</p>
        </div>
      );
    }

    if (!data || !data.content || data.content.length === 0) {
      return (
        <div className="text-center py-16">
          <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-1">No {status} scans found</p>
          <p className="text-sm text-gray-500">
            {appliedFilters.barcode || appliedFilters.deviceId 
              ? 'Try adjusting your filters' 
              : 'Scan data will appear here when available'}
          </p>
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
            <AutocompleteInput
              options={[]}
              value={barcodeFilter}
              onChange={setBarcodeFilter}
              placeholder="Barcode"
              emptyText="provide exact barcode to search"
              loading={optionsLoading.barcodes}
            />




            
            <Button 
              onClick={handleApplyFilters}
              className="bg-[#007BFF] hover:bg-[#0056cc] text-white px-4 h-10 flex-shrink-0"
            >
              <Filter className="h-4 w-4 mr-2" /> 
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>

        {/* Active Filters Badge */}
        {(appliedFilters.barcode || appliedFilters.deviceId) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Active filters:</span>
            {appliedFilters.barcode && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-mono text-xs">
                Barcode: {appliedFilters.barcode}
              </span>
            )}
            {appliedFilters.deviceId && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-mono text-xs">
                Device: {appliedFilters.deviceId}
              </span>
            )}
            <button
              onClick={() => {
                setBarcodeFilter("");
                setDeviceIdFilter("");
                setAppliedFilters({ barcode: "", deviceId: "" });
              }}
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Data containers */}
        <div className="mx-auto w-full max-w-[600px] h-auto flex flex-col space-y-2">
          <div className="min-h-[20px] flex-none">
            <div className="h-full w-full border border-gray-300 rounded bg-white shadow-sm overflow-hidden">
              <div className="h-full w-full overflow-hidden">
                <TabContent data={statusData.inProgress} status="inProgress" />
              </div>
            </div>
          </div>

          <div className="min-h-[20px] flex-none">
            <div className="h-full w-full border border-gray-300 rounded bg-white shadow-sm overflow-hidden">
              <div className="h-[200px] w-full overflow-y-auto">
                <TabContent data={statusData.completed} status="completed" />
              </div>
            </div>
          </div>

          <div className="min-h-[20px] flex-none">
            <div className="h-full w-full border border-gray-300 rounded bg-white shadow-sm overflow-hidden">
              <div className="h-full w-full overflow-hidden">
                <TabContent data={statusData.failed} status="failed" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}