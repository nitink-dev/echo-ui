import React, { useCallback, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/tooltip";
import { toTitleCase } from "../../../../utils/helpers";
import { IframeViewModal } from "./IframeViewModal";
import apiClient from "../../../../api/services/apiClient";
import { BASE_URL } from "../../../../utils/constants";

const SYNAPSE_PATHOLOGY_URL = "/synapse-pathology/";

const SYNAPSE_COMPLETED_STATUS = "synapse-completed";
const IBEX_COMPLETED_STATUS = "ibex-classification-finished";

const hasProgressEvent = (record, scanStatus) =>
  (record.progressEvents ?? []).some(
    (event) => event.scanStatus?.toLowerCase() === scanStatus,
  );

const fetchIbexUrl = async (record) => {
  const response = await apiClient.get(
    `${BASE_URL}/api/slide-scan-status/barcode/${encodeURIComponent(record.slideBarcode)}/ibex-url?seriesId=${encodeURIComponent(record.seriesId)}`,
  );
  return response.data.ibexUrl;
};

export function CompletedRecordsRow({ record, index }) {
  const [viewModal, setViewModal] = useState(null); // null | "ibex" | "synapse"
  const loadIbexUrl = useCallback(
    () => fetchIbexUrl(record),
    [record.slideBarcode, record.seriesId],
  );
  const showIbexButton = hasProgressEvent(record, IBEX_COMPLETED_STATUS);
  const showSynapseButton = hasProgressEvent(record, SYNAPSE_COMPLETED_STATUS);
  const statusConfig = {
    completed: {
      color: "text-green-600",
      bg: "bg-green-50",
      icon: CheckCircle2,
    },
    failed: {
      color: "text-red-600",
      bg: "bg-red-50",
      icon: XCircle,
    },
    "in-progress": {
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: Clock,
    },
    "warning-completed": {
      color: "text-orange-500",
      bg: "bg-orange-50",
      icon: AlertTriangle,
    },
  };

  const config = statusConfig[record.scanStatus] || statusConfig.failed;
  const StatusIcon = config.icon;

  const warnings =
    record.progressEvents?.filter(
      (event) => event.type === "warning",
    ) || [];

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
    <>
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-0 text-sm text-gray-500">
        {index + 1}
      </td>

      <td className="px-6 py-0">
        <div className="font-mono text-sm text-gray-700">
          {record.slideBarcode}
        </div>
      </td>

      <td className="px-6 py-0">
        <div className="font-mono text-sm text-gray-700">
          {record.accessionNumber}
        </div>
      </td>

      <td className="px-6 py-0">
        <div className="text-sm text-gray-600">
          {record.deviceSerialNumber}
        </div>
      </td>
        
      <td className="px-3 py-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-default ${config.bg}`}
              >
                <StatusIcon
                  className={`h-3.5 w-3.5 ${config.color}`}
                />
                <span
                  className={`text-xs font-medium ${config.color}`}
                >
                  {record.scanStatus === "warning-completed" ? "Completed" : toTitleCase(record.scanStatus)}
                </span>
              </div>
            </TooltipTrigger>

            {warnings.length > 0 && (
              <TooltipContent
                side="right"
                align="start"
                className="opacity-70 bg-orange-100 border border-orange-200 shadow-xl p-4 rounded-xl text-xs max-w-sm"
              >
                <div className="space-y-3">
                  {warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className="border-t border-orange-100 pt-2 first:border-t-0 first:pt-0"
                    >
                      {/* Scan Status */}
                      <div className="text-xs font-medium text-orange-800">
                         {toTitleCase(warning.scanStatus)} 
                      </div>

                      {/* Message */}
                      <div className="text-gray-700 leading-snug mt-0.5">
                        {warning.message || "No additional details provided"}
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </td>

      <td className="px-6 py-0 text-sm text-gray-500">
        {formatTimestamp(record.updatedAt)}
      </td>

      <td className="px-3 py-0">
        <div className="flex items-center gap-2">
          {showIbexButton && (
            <button
              onClick={() => setViewModal("ibex")}
              className="px-2.5 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Ibex
            </button>
          )}
          {showSynapseButton && (
            <button
              onClick={() => setViewModal("synapse")}
              className="px-2.5 py-1 text-xs font-medium text-teal-600 border border-teal-200 rounded-md hover:bg-teal-50 transition-colors"
            >
              Synapse
            </button>
          )}
          {!showIbexButton && !showSynapseButton && (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
      </td>
    </tr>

    {viewModal === "ibex" && (
      <IframeViewModal
        title="Ibex"
        loadUrl={loadIbexUrl}
        onClose={() => setViewModal(null)}
      />
    )}
    {viewModal === "synapse" && (
      <IframeViewModal
        title="Synapse"
        url={SYNAPSE_PATHOLOGY_URL}
        onClose={() => setViewModal(null)}
      />
    )}
    </>
  );
}