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
      <td className="px-6 py-1 text-sm text-gray-500">{index + 1}</td>

      <td className="px-6 py-1">
        <div className="font-mono text-sm text-gray-700">{record.slideBarcode}</div>
      </td>

      <td className="px-6 py-1">
        <div className="text-sm text-gray-600">{record.deviceSerialNumber}</div>
      </td>

      <td className="px-6 py-1">
        <div className={`inline-flex items-center gap-1.5 py-1 rounded-full `}>
          <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color} capitalize`}>
            {record.scanStatus.replace("-", " ")}
          </span>
        </div>
      </td>

      
      <td className="px-6 py-3">
        {percent === null ? (
          <span className="text-sm text-gray-400">N/A</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Progress bar container */}
            <div style={{ 
              width: '120px', 
              height: '10px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              {/* Progress bar fill */}
              <div style={{ 
                width: `${percent}%`, 
                height: '100%', 
                backgroundColor: record.scanStatus === 'completed' ? '#22c55e' : 
                                 record.scanStatus === 'failed' ? '#ef4444' : '#3b82f6',
                borderRadius: '9999px',
                transition: 'width 0.3s ease-out'
              }} />
            </div>
            
            {/* Percentage text */}
            <span style={{ 
              minWidth: '44px', 
              textAlign: 'right', 
              fontSize: '12px', 
              fontWeight: '600',
              color: '#374151'
            }}>
              {percent}%
            </span>
          </div>
        )}
      </td>
      
      <td className="px-6 py-1 text-sm text-gray-500">
        {formatTimestamp(record.updatedAt)}
      </td>
    </tr>
  );
}