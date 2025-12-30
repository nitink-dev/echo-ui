
// StatusPanel.jsx
import React from "react";
import { Microscope, RefreshCw, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ScanRecordRow } from "./ScanRecordRow"; // reuse your existing row component
import { RunningRecordsRow } from "./records/RunningRecordsRow";

export const StatusPanel = ({
  statusKey,          // "failed" | "completed" | "inProgress"
  title,              // panel title
  Icon,               // lucide icon component
  accentBadgeClass,   // tailwind classes for the badge (e.g., "bg-red-100 text-red-700")
  data,               // paged API result object { content, page, size, totalElements, totalPages, hasNext, hasPrevious }
  error,              // string | undefined
  isLoading,          // boolean
  lastFetched,        // timestamp | null
  onPageChange,       // (tab: string, direction: "prev" | "next") => void
}) => {
  const formatLastFetched = (ts) => {
    if (!ts) return "Never";
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const PaginationControls = ({ data, tab }) => {
    if (!data) return null;

    const start = data.page * data.size + 1;
    const end = Math.min((data.page + 1) * data.size, data.totalElements);

    return (
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{start}</span> to{" "}
          <span className="font-medium">{end}</span> of{" "}
          <span className="font-medium">{data.totalElements}</span> results
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(tab, "prev")}
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
            onClick={() => onPageChange(tab, "next")}
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${accentBadgeClass}`}>
            {data?.totalElements ?? 0}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Last updated <span className="font-medium text-gray-900">{formatLastFetched(lastFetched)}</span>
        </div>
      </div>

      {/* Body (loading / error / empty / table) */}
      <div>
        {isLoading && (!data || !data.content) ? (
          <div className="text-center py-12">
            <RefreshCw className="h-10 w-10 text-indigo-500 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600 text-sm">Loading {title.toLowerCase()} scans...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-900 font-medium mb-1">Error loading {title.toLowerCase()} scans</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : !data || !data.content || data.content.length === 0 ? (
          <div className="text-center py-12">
            <Microscope className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-900 font-medium mb-1">No {title.toLowerCase()} scans found</p>
            <p className="text-sm text-gray-500">Scan data will appear here when available</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Number</th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slide Barcode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Serial</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[220px]">
                      Progress
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">****</th>  */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {data.content.map((record, idx) => (
                    <RunningRecordsRow
                      key={record.id}
                      record={record}
                      index={data.page * data.size + idx}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationControls data={data} tab={statusKey} />
          </>
        )}
      </div>
    </div>
  );
};
