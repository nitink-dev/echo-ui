// src/App.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Layout } from "./components/Layout";
import { ScannerList } from "./components/features/scanner/ScannerList/ScannerList";
import { ScannerForm } from "./components/features/scanner/ScannerForm/ScannerForm";
import { ScannerDetails } from "./components/features/scanner/ScannerDetails/ScannerDetails";
import { QAConfig } from "./components/features/qa/QAConfig/QAConfig";
import { EnrichmentToolConfig } from "./components/features/enrichment/EnrichmentConfig/EnrichmentConfig";
import { Toaster } from "./components/ui/sonner";
import {
  fetchScanners,
  addScanner,
  deleteScanner,
  updateScanner,
} from "./store/slices/scannerSlice";
import { toast } from "sonner";
import { useAppDispatch } from './hooks';
import { SlideScanner } from "./types/scanner.types";
import { PageType, Breadcrumb } from "./types/common.types";
import { sanitizeFormData } from "./utils/helpers";

export default function App() {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState<PageType>("list");
  const [selectedScanner, setSelectedScanner] = useState<SlideScanner | null>(null);

  const scanners = useSelector((state: any) => state.scanners.items);
  const loading = useSelector((state: any) => state.scanners.loading);

  useEffect(() => {
    dispatch(fetchScanners());
  }, [dispatch]);

  const navigateToPage = (page: PageType, scanner?: SlideScanner) => {
    setCurrentPage(page);
    setSelectedScanner(scanner || null);
  };

  const handleAddScanner = () => navigateToPage('add');
  const handleEditScanner = (scanner: SlideScanner) => navigateToPage('edit', scanner);
  const handleViewScanner = (scanner: SlideScanner) => navigateToPage('view', scanner);

  const handleDeleteScanner = async (id?: string) => {
    if (!id) return;
    
    try {
      await dispatch(deleteScanner(id));
      toast.success('Scanner deleted successfully');
    } catch (err: any) {
      toast.error(err.message || "Error deleting scanner");
    }
  };

  const handleSaveScanner = async (scannerData: SlideScanner) => {
    try {
      const sanitizedData = sanitizeFormData(scannerData);
      const scannerToSave: SlideScanner = {
        ...sanitizedData,
        id: sanitizedData.id 
      };
  
      if (sanitizedData.id) {
        await dispatch(updateScanner(scannerToSave));
        toast.success("Scanner updated successfully");
      } else {
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

  const getBreadcrumbs = (): Breadcrumb[] => {
    const breadcrumbMap: Record<PageType, Breadcrumb[]> = {
      list: [{ label: "Slide Scanner" }],
      add: [{ label: "Slide Scanner", href: "#" }, { label: "Add Scanner" }],
      edit: [{ label: "Slide Scanner", href: "#" }, { label: "Edit Scanner" }],
      view: [{ label: "Slide Scanner", href: "#" }, { label: "Scanner Details" }],
      "qa-analysis": [{ label: "Clinical Applications" }, { label: "Slide Image Analysis" }],
      "google-dicom-temp": [{ label: "Data Stores" }, { label: "Google DICOM Temp" }],
      "google-dicom-final": [{ label: "Data Stores" }, { label: "Google DICOM Final" }],
      "hl7-store": [{ label: "Data Stores" }, { label: "HL7 Store" }],
      lis: [{ label: "Clinical Applications" }, { label: "LIS" }],
      synapse: [{ label: "Clinical Applications" }, { label: "Synapse" }],
      "enrichment-tool": [{ label: "Clinical Applications" }, { label: "Enrichment Tool" }]
    };

    return breadcrumbMap[currentPage] || [];
  };

  const renderCurrentPage = () => {
    const pageComponents: Record<PageType, JSX.Element | null> = {
      list: (
        <ScannerList
          scanners={scanners}
          loading={loading}
          onAddScanner={handleAddScanner}
          onEditScanner={handleEditScanner}
          onViewScanner={handleViewScanner}
          onDeleteScanner={handleDeleteScanner}
        />
      ),
      add: <ScannerForm onSave={handleSaveScanner} onCancel={handleCancelForm} isEdit={false} />,
      edit: selectedScanner ? (
        <ScannerForm scanner={selectedScanner} onSave={handleSaveScanner} onCancel={handleCancelForm} isEdit={true} />
      ) : null,
      view: selectedScanner ? <ScannerDetails scanner={selectedScanner} onBack={handleBackToList} /> : null,
      "qa-analysis": <QAConfig />,
      // "google-dicom-temp": <DataStoreConfig storeType="google-dicom-temp" />,
      // "google-dicom-final": <DataStoreConfig storeType="google-dicom-final" />,
      // "hl7-store": <DataStoreConfig storeType="hl7-store" />,
      // lis: <ClinicalAppsConfig appType="lis" />,
      // synapse: <ClinicalAppsConfig appType="synapse" />,
      "enrichment-tool": <EnrichmentToolConfig />
    };

    return pageComponents[currentPage] || <div>Page Not Found</div>;
  };

  return (
    <div className="min-h-screen bg-[#fafbff]">
      <Layout 
        currentPage={currentPage} 
        breadcrumbs={getBreadcrumbs()} 
        onNavigate={(pageId) => navigateToPage(pageId as PageType)}
      >
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