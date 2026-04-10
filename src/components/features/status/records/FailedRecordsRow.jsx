import React, { useState } from "react";
import { CheckCircle2, XCircle, Clock, X, Eye } from "lucide-react";
import { BASE_URL } from "../../../../utils/constants";

export function FailedRecordsRow({ record, index }) {
  const [showPopup, setShowPopup] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const statusConfig = {
    completed: { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
    failed: { color: "text-red-600", bg: "bg-red-50", icon: XCircle },
    "in-progress": { color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  };

  const config = statusConfig[record.scanStatus] || statusConfig.failed;
  const StatusIcon = config.icon;

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/api/slide-scan-status/barcode/${record.slideBarcode}/details`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDetailsData(data);
      setShowPopup(true);
    } catch (err) {
      setError(err.message || "Failed to fetch details");
      toast.error("Error fetching details: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    fetchDetails();
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "Case information Received": "bg-blue-100 text-blue-800",
      "DICOM series pushed to Synapse Folder": "bg-green-100 text-green-800",
      "LIS Query Sent": "bg-yellow-100 text-yellow-800",
      "File sent to Visiopharm": "bg-purple-100 text-purple-800",
      "File sent to iBEX": "bg-indigo-100 text-indigo-800",
      "ENRICHMENT_FAILED": "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };
  
  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-6 py-0 text-sm text-gray-500">{index + 1}</td>

        <td className="px-6 py-0">
          <div className="font-mono text-sm text-gray-700">{record.slideBarcode}</div>
        </td>

        <td className="px-6 py-0">
          <div className="text-sm text-gray-600">{record.deviceSerialNumber}</div>
        </td>

        <td className="px-3 py-0">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
            <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color} capitalize`}>
              {record.scanStatus.replace("-", " ")}
            </span>
          </div>
        </td>

        <td className="px-6 py-0 text-sm text-gray-500">
          {formatTimestamp(record.updatedAt)}
        </td>

        <td className="px-3 py-0">
          <button
            onClick={handleViewDetails}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium 
                       text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 
                       rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            {loading ? "Loading..." : "View Details"}
          </button>
        </td>
      </tr>

      {/* Popup Modal */}
      {showPopup && detailsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 p-8 ">
          {/* Dark Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPopup(false)}
          />
          <div
            className="relative bg-white
                      rounded-xl shadow-2xl flex flex-col
                      z-[10000]"
          >
            {/* Header */}
            <div className="flex items-center sticky justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Slide Details
                </h2>
                <p className="text-sm text-indigo-100 mt-1">
                  {Array.isArray(detailsData) && detailsData.length > 0 ? (
                    <><b>Series Id:</b> <span className="font-large">{detailsData[0].seriesInstanceUid}</span> <b>&nbsp;|&nbsp;Study Id:</b> <span className="font-large">{detailsData[0].originalStudyInstanceUid}</span></>
                  ) : null}
                </p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="p-2 rounded-lg bg-white/10
                          hover:bg-white/20 transition"
              >
                <X className="h-5 w-5 text-blue" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
              {Array.isArray(detailsData) && detailsData.length > 0 ? (
                <div className="border border-gray-200 rounded-lg shadow-sm">
                  {/* <div className="relative overflow-x-auto overflow-y-auto max-h-[100vh] "> */}
                         <div className="relative h-[60vh] ">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Case No</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Barcode</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Device SN</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Enriched At</th>
                          {/* <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">DICOM Received</th> */}
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SOP UID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Error Msg</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {detailsData.map((record, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{record.caseNumber || 'N/A'}</td>

                            <td className="px-4 py-3 text-sm font-mono">
                              {record.barcode || 'N/A'}
                            </td>

                            <td className="px-4 py-3 text-sm">
                              {record.deviceSerialNumber || 'N/A'}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-100 `}
                              >
                                {record.processingStatus || 'N/A'}
                              </span>
                            </td>

                            {/* <td className="px-4 py-3 text-sm">
                              {formatDate(record.enrichmentTimestamp)}
                            </td> */}

                            <td className="px-4 py-3 text-sm">
                              {formatDate(record.dicomInstanceReceivedTimestamp)}
                            </td>

                            <td className="px-4 py-3 text-xs">
                              <code className="bg-gray-100 px-2 py-1 rounded break-all">
                                {record.sopInstanceUid || 'N/A'}
                              </code>
                            </td>

                            <td className="px-4 py-3 text-xs" width="400px" >
                              <code className="bg-gray-100 px-2 py-1 rounded break-all">
                                {record.errorMessage || 'NA'}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No data available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}