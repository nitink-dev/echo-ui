import React, { useState } from 'react';
import { Eye, Edit, Trash2, MoreVertical, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../ui/dropdown-menu';
import { Badge } from '../../../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../ui/alert-dialog';
import { SlideScanner } from '../../../../types/scanner.types';
import { STATUS_COLORS } from '../../../../utils/constants';

interface ScannerTableProps {
  scanners: SlideScanner[];
  onViewScanner: (scanner: SlideScanner) => void;
  onEditScanner: (scanner: SlideScanner) => void;
  onDeleteScanner: (id: string) => void;
  onAddScanner: () => void;
}

export function ScannerTable({ 
  scanners, 
  onViewScanner, 
  onEditScanner, 
  onDeleteScanner,
  onAddScanner 
}: ScannerTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scannerToDelete, setScannerToDelete] = useState<SlideScanner | null>(null);

  const handleDeleteClick = (scanner: SlideScanner) => {
    setScannerToDelete(scanner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (scannerToDelete) {
      onDeleteScanner(scannerToDelete.deviceSerialNumber);
      setDeleteDialogOpen(false);
      setScannerToDelete(null);
    }
  };

  if (scanners.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-[#f0f7ff] rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-[#007BFF]" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No registered scanners</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Click "Add New Scanner" to register your first scanner.
        </p>
        <Button onClick={onAddScanner} className="bg-[#007BFF] hover:bg-[#0056cc] text-white px-6 py-2.5">
          <Plus className="h-4 w-4 mr-2" /> Add New Scanner
        </Button>
      </div>
    );
  }

  return (
    <>
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
          {scanners.map((scanner, index) => (
            <TableRow 
              key={scanner.deviceSerialNumber} 
              className={`cursor-pointer hover:bg-[#f8faff] border-gray-200 transition-colors ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
              }`}
            >
              <TableCell className="px-4 py-3" onClick={() => onViewScanner(scanner)}>
                <div>
                  <div className="font-semibold text-gray-900 text-sm truncate">{scanner.name}</div>
                  <div className="text-xs text-gray-500">{scanner.department}</div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3" onClick={() => onViewScanner(scanner)}>
                <code className="bg-[#e8f2ff] text-[#007BFF] px-2 py-1 rounded text-xs font-medium border border-[#c7e2ff] block w-fit">
                  {scanner.aeTitle}
                </code>
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
                    <DropdownMenuItem onClick={() => onViewScanner(scanner)}>
                      <Eye className="h-4 w-4 mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditScanner(scanner)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDeleteClick(scanner)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </>
  );
}