import React from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function ScanRecordRow({ record, index }) {
  const statusConfig = {
    completed: { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
    failed: { color: "text-red-600", bg: "bg-red-50", icon: XCircle },
    "in-progress": { color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
    "warning completed": { color: "text-orange-600", bg: "bg-orange-50", icon: CheckCircle2 },
  };

  const config = statusConfig[record.scanStatus] || statusConfig.failed;
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
      <td className="px-3 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
          <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color} capitalize`}>
            {record.scanStatus.replace("-", " ")}
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
}
