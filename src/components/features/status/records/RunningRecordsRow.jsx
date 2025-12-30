
// RunningRecordsRow.jsx
import React from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function RunningRecordsRow({ record, index }) {
  const statusConfig = {
    completed: { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
    failed: { color: "text-red-600", bg: "bg-red-50", icon: XCircle },
    "in-progress": { color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
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
      <td className="px-6 py-0 text-sm text-gray-500">{index + 1}</td>

      {/* Case Number intentionally omitted */}
      <td className="px-6 py-0">
        <div className="font-mono text-sm text-gray-700">{record.slideBarcode}</div>
      </td>

      <td className="px-6 py-0">
        <div className="text-sm text-gray-600">{record.deviceSerialNumber}</div>
      </td>

      <td className="px-6 py-0">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
          <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color} capitalize`}>
            {record.scanStatus.replace("-", " ")}
          </span>
        </div>
      </td>

      {/* Created At intentionally omitted */}
      <td className="px-6 py-0 text-sm text-gray-500">
        {formatTimestamp(record.updatedAt)}
      </td>
      
     
 
{/* Progress (horizontal bar: grey background, blue fill) */}
<td className="px-6 py-0">
  {percent === null ? (
    <span className="text-sm text-gray-400">N/A</span>
  ) : (
    <div className="flex items-center gap-3">
      {/* Bar container (grey background) */}
      <div
        className="w-40 h-2 rounded-full bg-black overflow-hidden"
        aria-label="Progress"
      >
        {/* Fill (brand) */}
        <div
          className="h-2 rounded-full bg-black transition-all"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Percent text */}
      <span className="text-xs font-medium text-gray-600">{percent}%</span>
    </div>
  )}
</td>



    </tr>
  );
}
