
import React from "react";
import { RefreshCw, XCircle, Microscope } from "lucide-react";
import ScanRecordRow from "./ScanRecordRow";
import PaginationControls from "./PaginationControls";

type RecordType = {
  id?: string | number;
  // Add the fields used by ScanRecordRow (optional in this file)
  [key: string]: any;
};

type PageData = {
  content: RecordType[];
  page: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
};

type StatusData = {
  loading: Record<string, boolean>;
};

type CompletedTabContentProps = {
  /** Paged data for COMPLETED scans */
  data: PageData | null;
  /** Optional error message specific to COMPLETED tab */
  error?: string | null;
  /** Global statusData with loading per status */
  statusData: StatusData;
  /** Optional: show only first N rows (e.g., 4 to mimic slice(0,4)) */
  previewLimit?: number;
};

const COMPLETED_STATUS = "COMPLETED";

const CompletedTabContent: React.FC<CompletedTabContentProps> = ({
  data,
  error: tabError,
  statusData,
  previewLimit,
}) => {
  const isLoading = Boolean(statusData?.loading?.[COMPLETED_STATUS]);
  const hasContent = Array.isArray(data?.content) && data!.content.length > 0;

  if (isLoading && !hasContent) {
    return (
      <div className="text-center py-16">
        <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Loading {COMPLETED_STATUS.toLowerCase()} scans...</p>
      </div>
    );
  }

  if (tabError) {
    return (
      <div className="text-center py-16">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-900 font-medium mb-2">
          Error loading {COMPLETED_STATUS.toLowerCase()} scans
        </p>
        <p className="text-sm text-red-600">{tabError}</p>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="text-center py-16">
        <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-900 font-medium mb-1">
          No {COMPLETED_STATUS.toLowerCase()} scans found
        </p>
        <p className="text-sm text-gray-500">Scan data will appear here when available</p>
      </div>
    );
  }

  const rows = previewLimit ? data!.content.slice(0, previewLimit) : data!.content;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">{COMPLETED_STATUS} scans table</caption>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Number</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slide Barcode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Serial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((record, idx) => (
              <ScanRecordRow
                key={record.id ?? `${COMPLETED_STATUS}-${idx}`}
                record={record}
                index={(data!.page * data!.size) + idx}
              />
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls data={data!} tab={COMPLETED_STATUS} />
    </div>
  );
};

export default CompletedTabContent;
