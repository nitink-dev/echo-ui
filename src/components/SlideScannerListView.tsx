import React, { useState } from "react";
import { Search, Filter, Plus, Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { deleteScanner } from "../slices/scannerSlice";
import { SlideScanner } from "../types/slideScanner";

interface SlideScannerListViewProps {
  scanners: SlideScanner[];
  loading: boolean;
  onAddScanner: () => void;
  onEditScanner: (scanner: SlideScanner) => void;
  onViewScanner: (scanner: SlideScanner) => void;
  onDeleteScanner: (scannerId: string) => void;
}

export function SlideScannerListView({
  scanners,
  loading,
  onAddScanner,
  onEditScanner,
  onViewScanner,
  onDeleteScanner,
}: SlideScannerListViewProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scannerToDelete, setScannerToDelete] = useState<SlideScanner | null>(null);

  const filteredScanners = scanners.filter((scanner) => {
    const term = searchTerm.toLowerCase();
    return (
      scanner.name.toLowerCase().includes(term) ||
      scanner.aeTitle.toLowerCase().includes(term) ||
      scanner.deviceSerialNumber.toLowerCase().includes(term) ||
      (scanner.model?.toLowerCase() || "").includes(term) ||
      scanner.location.toLowerCase().includes(term)
    );
  });
  

  const handleDeleteClick = (scanner: SlideScanner) => {
    setScannerToDelete(scanner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (scannerToDelete) {
      onDeleteScanner(scannerToDelete.id);
      setDeleteDialogOpen(false);
      setScannerToDelete(null);
    }
  };

  const getStatusBadge = (status: SlideScanner["status"]) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Online</Badge>;
      case "offline":
        return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1.5"><div className="w-2 h-2 bg-gray-500 rounded-full"></div>Offline</Badge>;
      case "maintenance":
        return <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1.5"><div className="w-2 h-2 bg-orange-500 rounded-full"></div>Maintenance</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1.5"><div className="w-2 h-2 bg-gray-400 rounded-full"></div>Unknown</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading scanners...</div>;
  if (!scanners) return <div className="p-8 text-center text-red-600">Failed to load scanners</div>;

  return (
    <div className="px-6 space-y-4 min-h-full">
      {/* Header */}
      <div className="grid grid-cols-12 gap-6 items-center py-4 min-h-[80px]">
        <div className="col-span-12 lg:col-span-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Slide Scanners</h1>
          <p className="text-sm text-gray-600">Manage and monitor your slide scanning devices across all facilities</p>
        </div>
        <div className="col-span-12 lg:col-span-6 flex items-center gap-3 lg:justify-end">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, AE Title, serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" size="sm" className="border-gray-200 hover:bg-[#f8faff] hover:border-[#007BFF] px-3 h-10 flex-shrink-0">
              <Filter className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Filter</span>
            </Button> */}
            <Button onClick={onAddScanner} className="bg-[#007BFF] hover:bg-[#0056cc] text-white px-4 h-10 flex-shrink-0">
              <Plus className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Add New Scanner</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredScanners.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#f0f7ff] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-[#007BFF]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{searchTerm ? "No scanners found" : "No registered scanners"}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{searchTerm ? "Try adjusting your search criteria." : 'Click "Add New Scanner" to register your first scanner.'}</p>
            {!searchTerm && (
              <Button onClick={onAddScanner} className="bg-[#007BFF] hover:bg-[#0056cc] text-white px-6 py-2.5">
                <Plus className="h-4 w-4 mr-2" /> Add New Scanner
              </Button>
            )}
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-200 bg-gray-50">
                <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[25%]">Scanner Details</TableHead>
                <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[15%]">AE Title</TableHead>
                <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[20%]">Model & Serial</TableHead>
                <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[25%]">Location</TableHead>
                <TableHead className="w-[5%] px-4 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScanners.map((scanner, index) => (
                <TableRow key={scanner.id} className={`cursor-pointer hover:bg-[#f8faff] border-gray-200 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                  <TableCell className="px-4 py-3" onClick={() => onViewScanner(scanner)}>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm truncate">{scanner.name}</div>
                      <div className="text-xs text-gray-500">{scanner.department}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3" onClick={() => onViewScanner(scanner)}>
                    <code className="bg-[#e8f2ff] text-[#007BFF] px-2 py-1 rounded text-xs font-medium border border-[#c7e2ff] block w-fit">{scanner.aeTitle}</code>
                  </TableCell>
                  <TableCell className="px-4 py-3" onClick={() => onViewScanner(scanner)}>
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate">{scanner.model}</div>
                      <div className="text-xs text-gray-500 font-mono">{scanner.deviceSerialNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3" onClick={() => onViewScanner(scanner)}>
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate">{scanner.location}</div>
                      <div className="text-xs text-gray-500 truncate">{scanner.hospitalName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#f0f7ff]">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onViewScanner(scanner)}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditScanner(scanner)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteClick(scanner)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scanner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scannerToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete Scanner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
