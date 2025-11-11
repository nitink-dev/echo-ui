import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Layout } from "./components/Layout";
import { SlideScannerListView } from "./components/SlideScannerListView";
import { SlideScannerForm } from "./components/SlideScannerForm";
import { ScannerDetailsView } from "./components/ScannerDetailsView";
import { QAAnalysisConfig } from "./components/QAAnalysisConfig";
import { DataStoreConfig } from "./components/DataStoreConfig";
import { ClinicalAppsConfig } from "./components/ClinicalAppsConfig";
import { Toaster } from "./components/ui/sonner";
import {
  fetchScanners,
  addScanner,
  deleteScanner,
  updateScanner,
} from "./slices/scannerSlice";
import { toast } from "sonner@2.0.3";
import { useAppDispatch } from './hooks';
import { SlideScanner } from "./types/slideScanner";
import { PageType } from "./types/types";
import { EnrichmentToolConfig } from "./components/EnrichmentToolConfig";

export default function App() {
  const dispatch = useAppDispatch();

  // Navigation state
  const [currentPage, setCurrentPage] = useState<PageType>("list");
  const [selectedScanner, setSelectedScanner] = useState<SlideScanner | null>(null);

  // Redux state
  const scanners = useSelector((state: any) => state.scanners.items);
  const loading = useSelector((state: any) => state.scanners.loading);

  // Fetch scanners
  useEffect(() => {
    dispatch(fetchScanners());
  }, [dispatch]);

  // Navigation helper
  const navigateToPage = (page: PageType, scanner?: SlideScanner) => {
    setCurrentPage(page);
    setSelectedScanner(scanner || null);
  };

  // Handlers
  const handleAddScanner = () => navigateToPage('add');
  const handleEditScanner = (scanner: SlideScanner) => navigateToPage('edit', scanner);
  const handleViewScanner = (scanner: SlideScanner) => navigateToPage('view', scanner);

  const handleDeleteScanner = async (id?: string) => {
    if (!id) return;
    
    try {
      await dispatch(deleteScanner(id));
      toast.success(`Scanner deleted successfully`);
    } catch (err: any) {
      toast.error(err.message || "Error deleting scanner");
    }
    
  };

  const handleSaveScanner = async (scannerData: SlideScanner) => {
    try {
      // Convert all empty string values to null
      const sanitizedData: SlideScanner = Object.fromEntries(
        Object.entries(scannerData).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ])
      ) as SlideScanner;
  
      const scannerToSave: SlideScanner = {
        ...sanitizedData,
        id: sanitizedData.id
      };
  
      if (sanitizedData.id) {
        // update
        await dispatch(updateScanner(scannerToSave));
        toast.success("Scanner updated successfully");
      } else {
        // add
        await dispatch(addScanner(scannerToSave));
        toast.success("Scanner added successfully");
      }
  
      navigateToPage("list");
    } catch (err: any) {
      toast.error(err.message || "Error saving scanner");
    }
  };
  

  const handleCancelForm = () => navigateToPage("list");
  const handleBackToList = () => navigateToPage("list");

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    switch (currentPage) {
      case "list":
        breadcrumbs.push({ label: "Slide Scanner" });
        break;
      case "add":
        breadcrumbs.push({ label: "Slide Scanner", href: "#" }, { label: "Add Scanner" });
        break;
      case "edit":
        breadcrumbs.push({ label: "Slide Scanner", href: "#" }, { label: "Edit Scanner" });
        break;
      case "view":
        breadcrumbs.push({ label: "Slide Scanner", href: "#" }, { label: "Scanner Details" });
        break;
      case "qa-analysis":
        breadcrumbs.push({ label: "Clinical Applications" }, { label: "Slide Image Analysis" });
        break;
      case "google-dicom-temp":
        breadcrumbs.push({ label: "Data Stores" }, { label: "Google DICOM Temp" });
        break;
      case "google-dicom-final":
        breadcrumbs.push({ label: "Data Stores" }, { label: "Google DICOM Final" });
        break;
      case "hl7-store":
        breadcrumbs.push({ label: "Data Stores" }, { label: "HL7 Store" });
        break;
      case "lis":
        breadcrumbs.push({ label: "Clinical Applications" }, { label: "LIS" });
        break;
      case "synapse":
        breadcrumbs.push({ label: "Clinical Applications" }, { label: "Synapse" });
        break;
    }
    return breadcrumbs;
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "list":
        return (
          <SlideScannerListView
            scanners={scanners}
            loading={loading}
            onAddScanner={handleAddScanner}
            onEditScanner={handleEditScanner}
            onViewScanner={handleViewScanner}
            onDeleteScanner={handleDeleteScanner}
          />
        );
      case "add":
        return <SlideScannerForm onSave={handleSaveScanner} onCancel={handleCancelForm} isEdit={false} />;
      case "edit":
        return selectedScanner ? (
          <SlideScannerForm scanner={selectedScanner} onSave={handleSaveScanner} onCancel={handleCancelForm} isEdit={true} />
        ) : null;
      case "view":
        return selectedScanner ? <ScannerDetailsView scanner={selectedScanner} onBack={handleBackToList} /> : null;
      case "qa-analysis":
        return <QAAnalysisConfig />;
      case "google-dicom-temp":
        return <DataStoreConfig storeType="google-dicom-temp" />;
      case "google-dicom-final":
        return <DataStoreConfig storeType="google-dicom-final" />;
      case "hl7-store":
        return <DataStoreConfig storeType="hl7-store" />;
      case "lis":
        return <ClinicalAppsConfig appType="lis" />;
      case "synapse":
        return <ClinicalAppsConfig appType="synapse" />;
        case "enrichment-tool":
        return <EnrichmentToolConfig appType="enrichment-tool" />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbff]">
      <Layout currentPage={currentPage} breadcrumbs={getBreadcrumbs()} onNavigate={(pageId) => navigateToPage(pageId as PageType)}>
        {renderCurrentPage()}
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#ffffff", border: "1px solid #e2e8f0", color: "#1e293b" },
          success: { style: { border: "1px solid #10b981", background: "#f0fdf4", color: "#065f46" } },
          error: { style: { border: "1px solid #dc2626", background: "#fef2f2", color: "#991b1b" } },
        }}
      />
    </div>
  );
}