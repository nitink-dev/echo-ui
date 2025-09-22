import React, { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { SlideScannerListView } from "./components/SlideScannerListView";
import { SlideScannerForm } from "./components/SlideScannerForm";
import { ScannerDetailsView } from "./components/ScannerDetailsView";
import { QAAnalysisConfig } from "./components/QAAnalysisConfig";
import { DataStoreConfig } from "./components/DataStoreConfig";
import { ClinicalAppsConfig } from "./components/ClinicalAppsConfig";
import { Toaster } from "./components/ui/sonner";
import axios from "axios";

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
  status?: "online" | "offline" | "maintenance";
  lastSeen?: string;
}

type PageType =
  | "slide-scanner"
  | "add-scanner"
  | "edit-scanner"
  | "scanner-details"
  | "qa-analysis"
  | "google-dicom-temp"
  | "google-dicom-final"
  | "hl7-store"
  | "lis"
  | "synapse";

interface AppState {
  currentPage: PageType;
  scanners: SlideScanner[];
  selectedScanner: SlideScanner | null;
}

export default function App() {
  


  const [appState, setAppState] = useState<AppState>({
    currentPage: "slide-scanner",
    scanners: [], 
    selectedScanner: null,
  });

   // Fetch scanners from API on mount
   useEffect(() => {
    const fetchScanners = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/scanners"); 
        
        const apiScanners = res.data.map((scanner: any) => ({
          id: scanner.id,
          name: scanner.name,
          aeTitle: scanner.aeTitle,
          model: scanner.model,
          serialNumber: scanner.deviceSerialNumber,
          location: scanner.location,
          hospitalName: "Endeavor Health Main", // static since not in API
          department: scanner.department,
          ipAddress: "N/A", // not in API
          port: "N/A", // not in API
          vendor: "Unknown", // not in API
          status: "online" as const, // default until backend provides
          lastSeen: new Date().toLocaleString(),
        }));
        setAppState((prev) => ({ ...prev, scanners: apiScanners }));
      } catch (error) {
        console.error("Error fetching scanners:", error);
      }
    };

    fetchScanners();
  }, []);


  const navigateToPage = (
    page: PageType,
    scanner?: SlideScanner,
  ) => {
    setAppState((prev) => ({
      ...prev,
      currentPage: page,
      selectedScanner: scanner || null,
    }));
  };

  // Handle navigation from sidebar
  const handleNavigation = (pageId: string) => {
    navigateToPage(pageId as PageType);
  };

  const handleAddScanner = () => {
    navigateToPage("add-scanner");
  };

  const handleEditScanner = (scanner: SlideScanner) => {
    navigateToPage("edit-scanner", scanner);
  };

  const handleViewScanner = (scanner: SlideScanner) => {
    // Add status and lastSeen if not present (for mock data compatibility)
    const scannerWithStatus = {
      ...scanner,
      status: scanner.status || ("online" as const),
      lastSeen: scanner.lastSeen || new Date().toLocaleString(),
    };
    navigateToPage("scanner-details", scannerWithStatus);
  };

  const handleDeleteScanner = (scannerId: string) => {
    setAppState((prev) => ({
      ...prev,
      scanners: prev.scanners.filter((s) => s.id !== scannerId),
    }));
  };

  const handleSaveScanner = async (scannerData: SlideScanner) => {
    try {
      if (scannerData.id) {
        // Edit existing scanner
        await axios.put(`http://localhost:3001/api/scanners/${scannerData.id}`, scannerData);
  
        setAppState((prev) => ({
          ...prev,
          scanners: prev.scanners.map((s) =>
            s.id === scannerData.id
              ? { ...scannerData, status: s.status, lastSeen: s.lastSeen }
              : s
          ),
          currentPage: "slide-scanner",
        }));
      } else {
        // Add new scanner
        const res = await axios.post(`http://localhost:3001/api/scanners`, scannerData);
  
        const newScanner = {
          ...scannerData,
          id: res.data.id ?? Date.now().toString(), // use backend id if returned
          status: "offline" as const,
          lastSeen: new Date().toLocaleString(),
        };
  
        setAppState((prev) => ({
          ...prev,
          scanners: [...prev.scanners, newScanner],
          currentPage: "slide-scanner",
        }));
      }
    } catch (error) {
      console.error("Error saving scanner:", error);
    }
  };
  

  const handleCancelForm = () => {
    navigateToPage("slide-scanner");
  };

  const handleBackToList = () => {
    navigateToPage("slide-scanner");
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];

    switch (appState.currentPage) {
      case "slide-scanner":
        breadcrumbs.push({ label: "Slide Scanner" });
        break;
      case "add-scanner":
        breadcrumbs.push(
          { label: "Slide Scanner", href: "#" },
          { label: "Add Scanner" },
        );
        break;
      case "edit-scanner":
        breadcrumbs.push(
          { label: "Slide Scanner", href: "#" },
          { label: "Edit Scanner" },
        );
        break;
      case "scanner-details":
        breadcrumbs.push(
          { label: "Slide Scanner", href: "#" },
          { label: "Scanner Details" },
        );
        break;
      case "qa-analysis":
        breadcrumbs.push(
          { label: "Clinical Applications" },
          { label: "Slide Image Analysis" },
        );
        break;
      case "google-dicom-temp":
        breadcrumbs.push(
          { label: "Data Stores" },
          { label: "Google DICOM Temp" },
        );
        break;
      case "google-dicom-final":
        breadcrumbs.push(
          { label: "Data Stores" },
          { label: "Google DICOM Final" },
        );
        break;
      case "hl7-store":
        breadcrumbs.push(
          { label: "Data Stores" },
          { label: "HL7 Store" },
        );
        break;
      case "lis":
        breadcrumbs.push(
          { label: "Clinical Applications" },
          { label: "LIS" },
        );
        break;
      case "synapse":
        breadcrumbs.push(
          { label: "Clinical Applications" },
          { label: "Synapse" },
        );
        break;
    }

    return breadcrumbs;
  };

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case "slide-scanner":
        return (
          <SlideScannerListView
            scanners={appState.scanners}
            onAddScanner={handleAddScanner}
            onEditScanner={handleEditScanner}
            onViewScanner={handleViewScanner}
            onDeleteScanner={handleDeleteScanner}
          />
        );

      case "add-scanner":
        return (
          <SlideScannerForm
            onSave={handleSaveScanner}
            onCancel={handleCancelForm}
            isEdit={false}
          />
        );

      case "edit-scanner":
        return appState.selectedScanner ? (
          <SlideScannerForm
            scanner={appState.selectedScanner}
            onSave={handleSaveScanner}
            onCancel={handleCancelForm}
            isEdit={true}
          />
        ) : null;

      case "scanner-details":
        return appState.selectedScanner ? (
          <ScannerDetailsView
            scanner={appState.selectedScanner}
            onBack={handleBackToList}
          />
        ) : null;

      case "qa-analysis":
        return <QAAnalysisConfig />;

      case "google-dicom-temp":
        return (
          <DataStoreConfig storeType="google-dicom-temp" />
        );

      case "google-dicom-final":
        return (
          <DataStoreConfig storeType="google-dicom-final" />
        );

      case "hl7-store":
        return <DataStoreConfig storeType="hl7-store" />;

      case "lis":
        return <ClinicalAppsConfig appType="lis" />;

      case "synapse":
        return <ClinicalAppsConfig appType="synapse" />;

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Page Not Found
            </h2>
            <p className="text-gray-600">
              The requested page could not be found.
            </p>
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
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            color: "#1e293b",
          },
          success: {
            style: {
              border: "1px solid #10b981",
              background: "#f0fdf4",
              color: "#065f46",
            },
          },
          error: {
            style: {
              border: "1px solid #dc2626",
              background: "#fef2f2",
              color: "#991b1b",
            },
          },
        }}
      />
    </div>
  );
}