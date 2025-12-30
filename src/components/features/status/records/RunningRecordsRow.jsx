// RunningRecordsRow.jsx
import React from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function RunningRecordsRow({ record, index }) {
  // Debug logging - remove after fixing
  console.log('Record data:', { 
    scanStatus: record.scanStatus, 
    progressPercent: record.progressPercent,
    type: typeof record.progressPercent 
  });

  const statusConfig = {
    completed: { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2, progressBg: "bg-green-500" },
    failed: { color: "text-red-600", bg: "bg-red-50", icon: XCircle, progressBg: "bg-red-500" },
    "in-progress": { color: "text-blue-600", bg: "bg-blue-50", icon: Clock, progressBg: "bg-blue-500" },
  };

  const config = statusConfig[record.scanStatus] || statusConfig["in-progress"];
  const StatusIcon = config.icon;

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  
  const percent = Number.isFinite(record.progressPercent)
    ? Math.max(0, Math.min(100, Number(record.progressPercent)))
    : null;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>

      <td className="px-6 py-3">
        <div className="font-mono text-sm text-gray-700">{record.slideBarcode}</div>
      </td>

      <td className="px-6 py-3">
        <div className="text-sm text-gray-600">{record.deviceSerialNumber}</div>
      </td>

      <td className="px-6 py-3">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
          <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color} capitalize`}>
            {record.scanStatus.replace("-", " ")}
          </span>
        </div>
      </td>

      <td className="px-6 py-3 text-sm text-gray-500">
        {formatTimestamp(record.updatedAt)}
      </td>
      
      <td className="px-6 py-3 w-[220px]">
        {percent === null ? (
          <span className="text-sm text-gray-400">N/A</span>
        ) : (
          <div className="flex items-center gap-3 w-full">
            {/* Progress track */}
            <div className="relative flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end px-1.5"
                style={{ 
                  width: `${percent}%`,
                  backgroundColor: record.scanStatus === 'completed' ? '#22c55e' : 
                                   record.scanStatus === 'failed' ? '#ef4444' : '#3b82f6'
                }}
              >
                {percent > 25 && (
                  <span className="text-[9px] font-bold text-white drop-shadow">
                    {percent}%
                  </span>
                )}
              </div>
            </div>

            {/* Percentage badge */}
            {/* <span className="text-xs font-semibold text-gray-700 w-11 text-right shrink-0">
              {percent}%
            </span> */}
          </div>
        )}
      </td>
    </tr>
  );
}