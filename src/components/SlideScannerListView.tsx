import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, MoreVertical, Download, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

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

interface SlideScannerListViewProps {
  scanners: SlideScanner[];
  onAddScanner: () => void;
  onEditScanner: (scanner: SlideScanner) => void;
  onViewScanner: (scanner: SlideScanner) => void;
  onDeleteScanner: (scannerId: string) => void;
}

const mockScanners: SlideScanner[] = [
  {
    id: '1',
    name: 'Pathology Scanner A',
    aeTitle: 'PATH_SCAN_01',
    model: 'Leica Aperio GT 450',
    serialNumber: 'LCA-2023-001',
    location: 'Pathology Lab - Room 101',
    hospitalName: 'Endeavor Health Main',
    department: 'Pathology',
    ipAddress: '192.168.1.10',
    port: '4242',
    vendor: 'Leica Biosystems',
    status: 'online',
    lastSeen: '2024-01-15 09:30:00'
  },
  {
    id: '2',
    name: 'Research Scanner B',
    aeTitle: 'RES_SCAN_02',
    model: 'Hamamatsu NanoZoomer S60',
    serialNumber: 'HAM-2023-045',
    location: 'Research Center - Lab 205',
    hospitalName: 'Endeavor Health Research',
    department: 'Research',
    ipAddress: '192.168.2.150',
    port: '4243',
    vendor: 'Hamamatsu Photonics',
    status: 'offline',
    lastSeen: '2024-01-14 16:45:00'
  },
  {
    id: '3',
    name: 'Emergency Scanner C',
    aeTitle: 'EMRG_SCAN_03',
    model: 'Philips IntelliSite Pathology',
    serialNumber: 'PHI-2023-078',
    location: 'Emergency Lab - Bay 3',
    hospitalName: 'Endeavor Health Main',
    department: 'Emergency',
    ipAddress: '192.168.1.203',
    port: '4244',
    vendor: 'Philips Healthcare',
    status: 'maintenance',
    lastSeen: '2024-01-15 08:15:00'
  },
  {
    id: '4',
    name: 'Oncology Scanner D',
    aeTitle: 'ONCO_SCAN_04',
    model: 'Olympus VS200',
    serialNumber: 'OLY-2023-156',
    location: 'Oncology Center - Suite 301',
    hospitalName: 'Endeavor Health Cancer Center',
    department: 'Oncology',
    ipAddress: '192.168.3.75',
    port: '4245',
    vendor: 'Olympus Corporation',
    status: 'online',
    lastSeen: '2024-01-15 10:22:00'
  },
  {
    id: '5',
    name: 'Central Lab Scanner E',
    aeTitle: 'CENTR_SCAN_05',
    model: '3DHistech PANNORAMIC 250',
    serialNumber: '3DH-2023-092',
    location: 'Central Laboratory - Floor 2',
    hospitalName: 'Endeavor Health Main',
    department: 'Central Lab',
    ipAddress: '192.168.1.88',
    port: '4246',
    vendor: '3DHistech',
    status: 'online',
    lastSeen: '2024-01-15 11:05:00'
  },
  {
    id: '6',
    name: 'Surgical Pathology Scanner F',
    aeTitle: 'SURG_SCAN_06',
    model: 'Leica Aperio AT2',
    serialNumber: 'LCA-2023-234',
    location: 'Surgical Pathology - Room 415',
    hospitalName: 'Endeavor Health Surgery Center',
    department: 'Surgical Pathology',
    ipAddress: '192.168.4.120',
    port: '4247',
    vendor: 'Leica Biosystems',
    status: 'maintenance',
    lastSeen: '2024-01-14 14:30:00'
  },
  {
    id: '7',
    name: 'Dermatology Scanner G',
    aeTitle: 'DERM_SCAN_07',
    model: 'Hamamatsu NanoZoomer S210',
    serialNumber: 'HAM-2023-167',
    location: 'Dermatology Clinic - Room 102',
    hospitalName: 'Endeavor Health Specialty Clinic',
    department: 'Dermatology',
    ipAddress: '192.168.5.45',
    port: '4248',
    vendor: 'Hamamatsu Photonics',
    status: 'online',
    lastSeen: '2024-01-15 08:45:00'
  },
  {
    id: '8',
    name: 'Cytology Scanner H',
    aeTitle: 'CYTO_SCAN_08',
    model: 'Philips Ultra Fast Scanner',
    serialNumber: 'PHI-2023-289',
    location: 'Cytology Lab - Room 203',
    hospitalName: 'Endeavor Health Main',
    department: 'Cytology',
    ipAddress: '192.168.1.199',
    port: '4249',
    vendor: 'Philips Healthcare',
    status: 'offline',
    lastSeen: '2024-01-13 22:15:00'
  },
  {
    id: '9',
    name: 'Pediatric Scanner I',
    aeTitle: 'PED_SCAN_09',
    model: 'Olympus VS120',
    serialNumber: 'OLY-2023-301',
    location: 'Pediatric Hospital - Lab 105',
    hospitalName: 'Endeavor Children\'s Hospital',
    department: 'Pediatrics',
    ipAddress: '192.168.6.33',
    port: '4250',
    vendor: 'Olympus Corporation',
    status: 'online',
    lastSeen: '2024-01-15 09:12:00'
  },
  {
    id: '10',
    name: 'Forensic Scanner J',
    aeTitle: 'FOREN_SCAN_10',
    model: '3DHistech PANNORAMIC 1000',
    serialNumber: '3DH-2023-445',
    location: 'Forensic Lab - Secure Wing',
    hospitalName: 'Endeavor Health Forensic Center',
    department: 'Forensics',
    ipAddress: '192.168.7.101',
    port: '4251',
    vendor: '3DHistech',
    status: 'maintenance',
    lastSeen: '2024-01-15 07:30:00'
  },
  {
    id: '11',
    name: 'Nephrology Scanner K',
    aeTitle: 'NEPH_SCAN_11',
    model: 'Leica Versa 8',
    serialNumber: 'LCA-2023-512',
    location: 'Nephrology Unit - Room 308',
    hospitalName: 'Endeavor Health Kidney Center',
    department: 'Nephrology',
    ipAddress: '192.168.8.67',
    port: '4252',
    vendor: 'Leica Biosystems',
    status: 'online',
    lastSeen: '2024-01-15 10:55:00'
  },
  {
    id: '12',
    name: 'Cardiac Scanner L',
    aeTitle: 'CARD_SCAN_12',
    model: 'Hamamatsu NanoZoomer 2.0-HT',
    serialNumber: 'HAM-2023-678',
    location: 'Cardiac Pathology - Room 401',
    hospitalName: 'Endeavor Heart Institute',
    department: 'Cardiology',
    ipAddress: '192.168.9.89',
    port: '4253',
    vendor: 'Hamamatsu Photonics',
    status: 'offline',
    lastSeen: '2024-01-12 18:20:00'
  }
];

export function SlideScannerListView({
  scanners = mockScanners,
  onAddScanner,
  onEditScanner,
  onViewScanner,
  onDeleteScanner
}: SlideScannerListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scannerToDelete, setScannerToDelete] = useState<SlideScanner | null>(null);

  const filteredScanners = scanners.filter(scanner =>
    scanner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scanner.aeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scanner.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scanner.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleDownloadPDF = (scanner: SlideScanner) => {
    // Mock PDF download functionality
    const scannerData = {
      name: scanner.name,
      aeTitle: scanner.aeTitle,
      model: scanner.model,
      serialNumber: scanner.serialNumber,
      location: scanner.location,
      hospitalName: scanner.hospitalName,
      department: scanner.department,
      ipAddress: scanner.ipAddress,
      port: scanner.port,
      vendor: scanner.vendor,
      status: scanner.status,
      lastSeen: scanner.lastSeen
    };
    
    console.log('Generating PDF report for:', scannerData);
    // In a real implementation, you would generate and download a PDF file
    alert(`PDF report for "${scanner.name}" would be downloaded here.`);
  };

  const handleDownloadCSV = (scanner: SlideScanner) => {
    // Mock CSV download functionality
    const csvData = [
      ['Name', scanner.name],
      ['AE Title', scanner.aeTitle],
      ['Model', scanner.model],
      ['Serial Number', scanner.serialNumber],
      ['Location', scanner.location],
      ['Hospital Name', scanner.hospitalName],
      ['Department', scanner.department],
      ['IP Address', scanner.ipAddress],
      ['Port', scanner.port],
      ['Vendor', scanner.vendor],
      ['Status', scanner.status],
      ['Last Seen', scanner.lastSeen]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scanner-${scanner.name.replace(/\s+/g, '-').toLowerCase()}-data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: SlideScanner['status']) => {
    switch (status) {
      case 'online':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200 flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Online
          </Badge>
        );
      case 'offline':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border border-gray-200 flex items-center gap-1.5">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            Offline
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border border-orange-200 flex items-center gap-1.5">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Maintenance
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border border-gray-200 flex items-center gap-1.5">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="px-6 space-y-4 min-h-full">
      {/* Optimized Header Section - 10% of vertical space */}
      <div className="grid grid-cols-12 gap-6 items-center py-4 min-h-[80px]">
        {/* Left: Title and Description */}
        <div className="col-span-12 lg:col-span-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Slide Scanners</h1>
          <p className="text-sm text-gray-600">Manage and monitor your slide scanning devices across all facilities</p>
        </div>
        
        {/* Right: Action Controls Row */}
        <div className="col-span-12 lg:col-span-6 header-controls flex items-center gap-3 lg:justify-end">
          {/* Search Bar */}
          <div className="relative flex-1 lg:max-w-sm search-control">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, AE Title, serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
              aria-label="Search scanners"
            />
          </div>
          
          {/* Action Buttons Group */}
          <div className="flex items-center gap-2 action-buttons">
            {/* Filter Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-200 hover:bg-[#f8faff] hover:border-[#007BFF] px-3 h-10 flex-shrink-0"
              aria-label="Filter scanners"
            >
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            
            {/* Add New Scanner Button */}
            <Button 
              onClick={onAddScanner} 
              className="bg-[#007BFF] hover:bg-[#0056cc] text-white px-4 h-10 flex-shrink-0"
              aria-label="Add new scanner"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add New Scanner</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Scanner Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredScanners.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#f0f7ff] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-[#007BFF]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No scanners found' : 'No registered scanners'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search criteria or check if the scanner is registered.' 
                : 'Click "Add New Scanner" to register your first slide scanning device.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={onAddScanner} className="bg-[#007BFF] hover:bg-[#0056cc] text-white px-6 py-2.5">
                <Plus className="h-4 w-4 mr-2" />
                Add New Scanner
              </Button>
            )}
          </div>
        ) : (
          <div>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-200 bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[25%]">Scanner Details</TableHead>
                  <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[15%]">AE Title</TableHead>
                  <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[20%]">Model & Serial</TableHead>
                  <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[25%]">Location</TableHead>
                  <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[10%]">Status</TableHead>
                  <TableHead className="w-[5%] px-4 py-3" aria-label="Actions"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScanners.map((scanner, index) => (
                  <TableRow 
                    key={scanner.id} 
                    className={`hover:bg-[#f8faff] border-gray-200 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm truncate">{scanner.name}</div>
                        <div className="text-xs text-gray-500">{scanner.department}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <code className="bg-[#e8f2ff] text-[#007BFF] px-2 py-1 rounded text-xs font-medium border border-[#c7e2ff] block w-fit">
                        {scanner.aeTitle}
                      </code>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate">{scanner.model}</div>
                        <div className="text-xs text-gray-500 font-mono">{scanner.serialNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate">{scanner.location}</div>
                        <div className="text-xs text-gray-500 truncate">{scanner.hospitalName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">{getStatusBadge(scanner.status)}</TableCell>
                    <TableCell className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-[#f0f7ff]"
                            aria-label={`Actions for ${scanner.name}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onViewScanner(scanner)} className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditScanner(scanner)} className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Scanner
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownloadPDF(scanner)} className="cursor-pointer">
                            <FileText className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadCSV(scanner)} className="cursor-pointer">
                            <Download className="h-4 w-4 mr-2" />
                            Download CSV
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(scanner)}
                            className="text-red-600 cursor-pointer focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Scanner
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Scanner Count Footer */}
        {filteredScanners.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredScanners.length} of {scanners.length} scanner{scanners.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scanner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scannerToDelete?.name}"? This action cannot be undone and will remove all associated configuration data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Scanner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}