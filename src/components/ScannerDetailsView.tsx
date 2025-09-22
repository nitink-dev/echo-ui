import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, Calendar, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { toast } from 'sonner@2.0.3';
import axios from 'axios';

interface SlideScanner {
  id: string;
  name: string;
  aeTitle: string;
  model: string;
  serialNumber: string;
  location: string;
  hospitalName: string;
  department: string;
  ipAddress: string;
  port: string;
  vendor: string;
  otherIdentifier?: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
}

interface AnalysisReport {
  id: string;
  dateOfAnalysis: string;
  slideIdentifier: string;
  deviceIdentifier: string;
  patchColors: string;
  deltaValues: string;
}

interface ScannerDetailsViewProps {
  scanner: SlideScanner;
  onBack: () => void;
}

export function ScannerDetailsView({ scanner, onBack }: ScannerDetailsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [analysisReports, setAnalysisReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(analysisReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = analysisReports.slice(startIndex, endIndex);

  // Fetch reports from Mockoon API
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3001/api/scanners/${scanner.id}/analysis-reports`);
        setAnalysisReports(res.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        toast.error('Failed to load analysis reports');
      } finally {
        setLoading(false);
      }
    };

    if (scanner?.id) {
      fetchReports();
    }
  }, [scanner?.id]);

  const getStatusBadge = (status: SlideScanner['status']) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Online</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleDownload = (format: 'pdf' | 'csv') => {
    // Mock download functionality
    toast.success(`Analysis report downloaded as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{scanner.name}</h1>
          <p className="text-gray-600 mt-1">Scanner Details and Analysis Reports</p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-lg font-medium">{scanner.name}</div>
                <div className="text-sm text-gray-500">AE Title: {scanner.aeTitle}</div>
                <div className="text-sm text-gray-500">Last Seen: {scanner.lastSeen}</div>
              </div>
            </div>
            <div className="text-right">{getStatusBadge(scanner.status)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Scanner Information</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Report</TabsTrigger>
        </TabsList>

        {/* Scanner Information Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Scanner Information</CardTitle>
              <CardDescription>Complete details of the registered scanner</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name of Scanner</label>
                    <p className="text-base">{scanner.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">AE Title</label>
                    <p className="text-base font-mono">{scanner.aeTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Model</label>
                    <p className="text-base">{scanner.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Serial Number</label>
                    <p className="text-base font-mono">{scanner.serialNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-base font-mono">{scanner.ipAddress}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hospital Name</label>
                    <p className="text-base">{scanner.hospitalName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="text-base">{scanner.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-base">{scanner.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Port</label>
                    <p className="text-base font-mono">{scanner.port}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vendor</label>
                    <p className="text-base">{scanner.vendor}</p>
                  </div>
                  {scanner.otherIdentifier && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Other Identifier</label>
                      <p className="text-base">{scanner.otherIdentifier}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Report Tab */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Analysis Report</CardTitle>
                  <CardDescription>Quality analysis results for this scanner</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading analysis reports...</div>
              ) : analysisReports.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-400 text-lg mb-2">No analysis data available</div>
                  <p className="text-gray-600">Analysis reports will appear here once QA slides are processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date of Analysis</TableHead>
                        <TableHead>Slide Identifier</TableHead>
                        <TableHead>Device Identifier</TableHead>
                        <TableHead>Patch Colors</TableHead>
                        <TableHead>Delta Values</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.dateOfAnalysis}</TableCell>
                          <TableCell className="font-mono text-sm">{report.slideIdentifier}</TableCell>
                          <TableCell className="font-mono text-sm">{report.deviceIdentifier}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {report.patchColors.split(', ').map((color, index) => (
                                <div key={index} className="truncate">{color}</div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{report.deltaValues}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 text-center">
                    Showing {startIndex + 1}-{Math.min(endIndex, analysisReports.length)} of {analysisReports.length} entries
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
