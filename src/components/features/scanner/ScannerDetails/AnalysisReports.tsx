import { format } from "date-fns";
import { ArrowUpDown, Calendar, Download, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner@2.0.3";
import { AnalysisReport } from "../../../../types/scanner.types";
import { BASE_URL } from "../../../../utils/constants";
import { downloadFile } from "../../../../utils/helpers";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Input } from "../../../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";

interface AnalysisReportsProps {
  deviceSerialNumber: string;
}

export function AnalysisReports({ deviceSerialNumber }: AnalysisReportsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [analysisReports, setAnalysisReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  const totalPages = Math.ceil(analysisReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = analysisReports.slice(startIndex, endIndex);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AnalysisReport;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/scanners/${deviceSerialNumber}/reports`,
        );
        if (!response.ok) throw new Error("Failed to fetch reports");
        const data: AnalysisReport[] = await response.json();
        setAnalysisReports(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        toast.error("Unable to fetch analysis reports: " + errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [deviceSerialNumber]);

  const filteredAndSortedReports = useMemo(() => {
    // Step 1: Filter

    const term = searchTerm.toLowerCase();

    let reports = analysisReports.filter((report: any) => {
      return (
        report.slideBarcode.toLowerCase().includes(term) ||
        String(report.deviceSerial).includes(String(term)) ||
        String(report.createdAt).includes(String(term)) ||
        report.analysisId.toLowerCase().includes(term)
      );
    });

    // Step 2: Sort (if user clicked a column)

    if (sortConfig) {
      reports = [...reports].sort((a, b) => {
        let valueA = a[sortConfig.key] || "";
        let valueB = b[sortConfig.key] || "";

        // 🗓 Handle date sorting

        if (sortConfig.key === "createdAt") {
          const dateA = new Date(valueA).getTime();
          const dateB = new Date(valueB).getTime();
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        //  Handle string comparison
        if (typeof valueA === "string") valueA = valueA.toLowerCase();
        if (typeof valueB === "string") valueB = valueB.toLowerCase();
        if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return reports;
  }, [searchTerm, sortConfig, analysisReports]);

  const handleSort = (key: keyof AnalysisReport) => {
    setSortConfig((prev) =>
      prev && prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const handleDownload = (format: "pdf" | "csv", report: AnalysisReport) => {
    try {
      const fileMap = {
        pdf: {
          url: report.result.pdfReportUrl,
          filename: "analysis-report.pdf",
        },
        csv: {
          url: report.result.csvDataFileUrl,
          filename: "analysis-report.csv",
        },
      };

      const { url, filename } = fileMap[format];
      downloadFile(url, filename);
      toast.success(`Analysis report downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      toast.error("File not found - Unable to download report: " + errorMessage);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Loading analysis reports...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start ">
          <div>
            <CardTitle>Analysis Report</CardTitle>
            <CardDescription>
              Quality analysis results for this scanner
            </CardDescription>
          </div>
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 pl-10 h-10 bg-white border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
          />
        </div>
      </CardHeader>
      <CardContent>
        {analysisReports.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">
              No analysis data available
            </div>
            <p className="text-gray-600">
              Analysis reports will appear here once QA slides are processed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("analysisId")}
                  >
                    Analysis Id
                    <ArrowUpDown className="inline-block ml-1 h-4 w-4 text-gray-400" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("createdAt")}
                  >
                    Date of Analysis
                    <ArrowUpDown className="inline-block ml-1 h-4 w-4 text-gray-400" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("slideBarcode")}
                  >
                    Slide Identifier
                    <ArrowUpDown className="inline-block ml-1 h-4 w-4 text-gray-400" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("deviceSerialNumber")}
                  >
                    Device Identifier
                    <ArrowUpDown className="inline-block ml-1 h-4 w-4 text-gray-400" />
                  </TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedReports.map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.analysisId}</TableCell>
                    <TableCell>
                      {format(
                        new Date(report.createdAt),
                        "yyyy-MM-dd HH:mm:ss",
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {report.slideBarcode}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {report.deviceSerialNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload("pdf", report)}
                          className="text-blue-600 hover:text-blue-700 hover:border-blue-300 min-w-0"
                          title="Download PDF Report"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload("csv", report)}
                          className="text-green-600 hover:text-green-700 hover:border-green-300 min-w-0"
                          title="Download CSV Data"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
