import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { SlideScannerListView } from './components/SlideScannerListView';
import { SlideScannerForm } from './components/SlideScannerForm';
import { ScannerDetailsView } from './components/ScannerDetailsView';
import { QAAnalysisConfig } from './components/QAAnalysisConfig';
import { DataStoreConfig } from './components/DataStoreConfig';
import { ClinicalAppsConfig } from './components/ClinicalAppsConfig';
import { EnrichmentToolConfig } from './components/EnrichmentToolConfig';
import { Toaster } from './components/ui/sonner';

interface SlideScanner {
  id?: string;
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
  status?: 'online' | 'offline' | 'maintenance';
  lastSeen?: string;
}

type PageType = 
  | 'slide-scanner' 
  | 'add-scanner' 
  | 'edit-scanner' 
  | 'scanner-details'
  | 'qa-analysis'
  | 'google-dicom-temp'
  | 'google-dicom-final'
  | 'hl7-store'
  | 'lis'
  | 'synapse'
  | 'enrichment-tool';

interface AppState {
  currentPage: PageType;
  scanners: SlideScanner[];
  selectedScanner: SlideScanner | null;
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
  },
  {
    id: '13',
    name: 'Hepatology Scanner M',
    aeTitle: 'HEP_SCAN_13',
    model: 'Zeiss Axio Scan.Z1',
    serialNumber: 'ZEI-2023-789',
    location: 'Liver Center - Room 205',
    hospitalName: 'Endeavor Health Liver Institute',
    department: 'Hepatology',
    ipAddress: '192.168.10.45',
    port: '4254',
    vendor: 'Carl Zeiss',
    status: 'online',
    lastSeen: '2024-01-15 11:45:00'
  },
  {
    id: '14',
    name: 'Neurology Scanner N',
    aeTitle: 'NEURO_SCAN_14',
    model: 'Leica Aperio VERSA 200',
    serialNumber: 'LCA-2023-890',
    location: 'Neurology Department - Lab 301',
    hospitalName: 'Endeavor Brain Institute',
    department: 'Neurology',
    ipAddress: '192.168.11.67',
    port: '4255',
    vendor: 'Leica Biosystems',
    status: 'maintenance',
    lastSeen: '2024-01-14 16:20:00'
  },
  {
    id: '15',
    name: 'Hematology Scanner O',
    aeTitle: 'HEMA_SCAN_15',
    model: 'Hamamatsu NanoZoomer S360',
    serialNumber: 'HAM-2023-901',
    location: 'Hematology Lab - Room 102',
    hospitalName: 'Endeavor Health Blood Center',
    department: 'Hematology',
    ipAddress: '192.168.12.89',
    port: '4256',
    vendor: 'Hamamatsu Photonics',
    status: 'online',
    lastSeen: '2024-01-15 09:15:00'
  },
  {
    id: '16',
    name: 'Immunology Scanner P',
    aeTitle: 'IMMUN_SCAN_16',
    model: 'Olympus VS110',
    serialNumber: 'OLY-2023-012',
    location: 'Immunology Lab - Suite 404',
    hospitalName: 'Endeavor Health Immunology Center',
    department: 'Immunology',
    ipAddress: '192.168.13.101',
    port: '4257',
    vendor: 'Olympus Corporation',
    status: 'offline',
    lastSeen: '2024-01-11 14:30:00'
  },
  {
    id: '17',
    name: 'Toxicology Scanner Q',
    aeTitle: 'TOX_SCAN_17',
    model: 'Philips Digital PathScan',
    serialNumber: 'PHI-2023-123',
    location: 'Toxicology Lab - Room 501',
    hospitalName: 'Endeavor Health Main',
    department: 'Toxicology',
    ipAddress: '192.168.1.234',
    port: '4258',
    vendor: 'Philips Healthcare',
    status: 'online',
    lastSeen: '2024-01-15 12:30:00'
  },
  {
    id: '18',
    name: 'Molecular Scanner R',
    aeTitle: 'MOL_SCAN_18',
    model: '3DHistech PANNORAMIC MIDI II',
    serialNumber: '3DH-2023-234',
    location: 'Molecular Diagnostics - Lab 601',
    hospitalName: 'Endeavor Health Research',
    department: 'Molecular Diagnostics',
    ipAddress: '192.168.14.145',
    port: '4259',
    vendor: '3DHistech',
    status: 'maintenance',
    lastSeen: '2024-01-15 06:45:00'
  },
  {
    id: '19',
    name: 'Endocrine Scanner S',
    aeTitle: 'ENDO_SCAN_19',
    model: 'Zeiss Axio Scan.Z1 DAPI',
    serialNumber: 'ZEI-2023-345',
    location: 'Endocrinology Unit - Room 302',
    hospitalName: 'Endeavor Health Hormone Center',
    department: 'Endocrinology',
    ipAddress: '192.168.15.67',
    port: '4260',
    vendor: 'Carl Zeiss',
    status: 'online',
    lastSeen: '2024-01-15 10:20:00'
  },
  {
    id: '20',
    name: 'Microbiology Scanner T',
    aeTitle: 'MICRO_SCAN_20',
    model: 'Leica DM6000 B',
    serialNumber: 'LCA-2023-456',
    location: 'Microbiology Lab - Room 103',
    hospitalName: 'Endeavor Health Infectious Disease Center',
    department: 'Microbiology',
    ipAddress: '192.168.16.89',
    port: '4261',
    vendor: 'Leica Biosystems',
    status: 'offline',
    lastSeen: '2024-01-10 18:15:00'
  }
];

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'slide-scanner',
    scanners: mockScanners,
    selectedScanner: null
  });

  const navigateToPage = (page: PageType, scanner?: SlideScanner) => {
    setAppState(prev => ({
      ...prev,
      currentPage: page,
      selectedScanner: scanner || null
    }));
  };

  // Handle navigation from sidebar
  const handleNavigation = (pageId: string) => {
    navigateToPage(pageId as PageType);
  };

  const handleAddScanner = () => {
    navigateToPage('add-scanner');
  };

  const handleEditScanner = (scanner: SlideScanner) => {
    navigateToPage('edit-scanner', scanner);
  };

  const handleViewScanner = (scanner: SlideScanner) => {
    // Add status and lastSeen if not present (for mock data compatibility)
    const scannerWithStatus = {
      ...scanner,
      status: scanner.status || 'online' as const,
      lastSeen: scanner.lastSeen || new Date().toLocaleString()
    };
    navigateToPage('scanner-details', scannerWithStatus);
  };

  const handleDeleteScanner = (scannerId: string) => {
    setAppState(prev => ({
      ...prev,
      scanners: prev.scanners.filter(s => s.id !== scannerId)
    }));
  };

  const handleSaveScanner = (scannerData: SlideScanner) => {
    if (scannerData.id) {
      // Edit existing scanner
      setAppState(prev => ({
        ...prev,
        scanners: prev.scanners.map(s => 
          s.id === scannerData.id 
            ? { ...scannerData, status: s.status, lastSeen: s.lastSeen }
            : s
        ),
        currentPage: 'slide-scanner'
      }));
    } else {
      // Add new scanner
      const newScanner = {
        ...scannerData,
        id: Date.now().toString(),
        status: 'offline' as const,
        lastSeen: new Date().toLocaleString()
      };
      setAppState(prev => ({
        ...prev,
        scanners: [...prev.scanners, newScanner],
        currentPage: 'slide-scanner'
      }));
    }
  };

  const handleCancelForm = () => {
    navigateToPage('slide-scanner');
  };

  const handleBackToList = () => {
    navigateToPage('slide-scanner');
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    
    switch (appState.currentPage) {
      case 'slide-scanner':
        breadcrumbs.push({ label: 'Slide Scanner' });
        break;
      case 'add-scanner':
        breadcrumbs.push(
          { label: 'Slide Scanner', href: '#' },
          { label: 'Add Scanner' }
        );
        break;
      case 'edit-scanner':
        breadcrumbs.push(
          { label: 'Slide Scanner', href: '#' },
          { label: 'Edit Scanner' }
        );
        break;
      case 'scanner-details':
        breadcrumbs.push(
          { label: 'Slide Scanner', href: '#' },
          { label: 'Scanner Details' }
        );
        break;
      case 'qa-analysis':
        breadcrumbs.push(
          { label: 'Applications' },
          { label: 'Slide Image Analysis' }
        );
        break;
      case 'enrichment-tool':
        breadcrumbs.push(
          { label: 'Applications' },
          { label: 'Enrichment Tool' }
        );
        break;
      case 'google-dicom-temp':
        breadcrumbs.push(
          { label: 'Data Stores' },
          { label: 'Google DICOM Temp' }
        );
        break;
      case 'google-dicom-final':
        breadcrumbs.push(
          { label: 'Data Stores' },
          { label: 'Google DICOM Final' }
        );
        break;
      case 'hl7-store':
        breadcrumbs.push(
          { label: 'Data Stores' },
          { label: 'HL7 Store' }
        );
        break;
      case 'lis':
        breadcrumbs.push(
          { label: 'Applications' },
          { label: 'LIS' }
        );
        break;
      case 'synapse':
        breadcrumbs.push(
          { label: 'Applications' },
          { label: 'Synapse' }
        );
        break;
    }
    
    return breadcrumbs;
  };

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'slide-scanner':
        return (
          <SlideScannerListView
            scanners={appState.scanners}
            onAddScanner={handleAddScanner}
            onEditScanner={handleEditScanner}
            onViewScanner={handleViewScanner}
            onDeleteScanner={handleDeleteScanner}
          />
        );
      
      case 'add-scanner':
        return (
          <SlideScannerForm
            onSave={handleSaveScanner}
            onCancel={handleCancelForm}
            isEdit={false}
          />
        );
      
      case 'edit-scanner':
        return appState.selectedScanner ? (
          <SlideScannerForm
            scanner={appState.selectedScanner}
            onSave={handleSaveScanner}
            onCancel={handleCancelForm}
            isEdit={true}
          />
        ) : null;
      
      case 'scanner-details':
        return appState.selectedScanner ? (
          <ScannerDetailsView
            scanner={appState.selectedScanner}
            onBack={handleBackToList}
          />
        ) : null;
      
      case 'qa-analysis':
        return <QAAnalysisConfig />;
      
      case 'google-dicom-temp':
        return <DataStoreConfig storeType="google-dicom-temp" />;
      
      case 'google-dicom-final':
        return <DataStoreConfig storeType="google-dicom-final" />;
      
      case 'hl7-store':
        return <DataStoreConfig storeType="hl7-store" />;
      
      case 'lis':
        return <ClinicalAppsConfig appType="lis" />;
      
      case 'synapse':
        return <ClinicalAppsConfig appType="synapse" />;
      
      case 'enrichment-tool':
        return <EnrichmentToolConfig />;
      
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-600">The requested page could not be found.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbff]">
      <Layout 
        currentPage={appState.currentPage} 
        breadcrumbs={getBreadcrumbs()}
        onNavigate={handleNavigation}
      >
        {renderCurrentPage()}
      </Layout>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#1e293b',
          },
          success: {
            style: {
              border: '1px solid #10b981',
              background: '#f0fdf4',
              color: '#065f46',
            },
          },
          error: {
            style: {
              border: '1px solid #dc2626',
              background: '#fef2f2',
              color: '#991b1b',
            },
          },
        }}
      />
    </div>
  );
}