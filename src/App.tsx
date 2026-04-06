// src/App.tsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/auth/login/login";
import { EnrichmentToolConfig } from "./components/features/enrichment/EnrichmentConfig/EnrichmentConfig";
import { HealthMonitor } from "./components/features/health/HealthMonitor";
import { LisConfig } from "./components/features/lis/LISConfig";
import { QAConfig } from "./components/features/qa/QAConfig/QAConfig";
import { ScannerDetails } from "./components/features/scanner/ScannerDetails/ScannerDetails";
import { ScannerForm } from "./components/features/scanner/ScannerForm/ScannerForm";
import { ScannerList } from "./components/features/scanner/ScannerList/ScannerList";
import { SlideScanStatus } from "./components/features/status/SlideScanStatus";
import { SynapseConfig } from "./components/features/synapse/SynapseConfig";
import { Toaster } from "./components/ui/sonner";
import { useAppDispatch } from "./hooks";
import { usePermissions } from "./hooks/usePermissions";
import {
  fetchSecurityConfig,
  loadStoredSession,
} from "./store/slices/authSlice";
import {
  addScanner,
  deleteScanner,
  fetchScanners,
  updateScanner,
} from "./store/slices/scannerSlice";
import { Breadcrumb, PageType } from "./types/common.types";
import { SlideScanner } from "./types/scanner.types";
import { sanitizeFormData } from "./utils/helpers";

export default function App() {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState<PageType>(
    (localStorage.getItem("currentPage") as PageType) || "health-status",
  );
  const [selectedScanner, setSelectedScanner] = useState<SlideScanner | null>(
    null,
  );

  const scanners = useSelector((state: any) => state.scanners.items);
  const loading = useSelector((state: any) => state.scanners.loading);
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  const { canRead, canWrite, configLoaded } = usePermissions();

  // ── Step 1: restore session from localStorage on mount
  useEffect(() => {
    dispatch(loadStoredSession());
  }, []);

  // ── Step 2: once logged in, fetch security config + scanner list
  // fetchSecurityConfig is also dispatched inside loginUser thunk for fresh
  // logins. This effect handles the page-reload case where loadStoredSession
  // sets isLoggedIn = true but securityConfig is empty.
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchSecurityConfig());
      dispatch(fetchScanners());
      const curr =
        (localStorage.getItem("currentPage") as PageType) || "health-status";
      setCurrentPage(curr);
    }
  }, [dispatch, isLoggedIn]);

  // ── Step 3: refresh scanner list when navigating to the list page
  useEffect(() => {
    if (isLoggedIn && currentPage === "list") {
      dispatch(fetchScanners());
    }
  }, [currentPage]);

  const navigateToPage = (page: PageType, scanner?: SlideScanner) => {
    // Guard: don't navigate to a page the user cannot read.
    // Skip the guard while the security config is still loading to avoid
    // a flash-of-unauthorised for legitimate users on slow networks.
    if (configLoaded && !canRead(page)) {
      toast.error("You don't have permission to access this page.");
      return;
    }
    localStorage.setItem(
      "currentPage",
      page.match("login") ? "health-status" : page,
    );
    setCurrentPage(page);
    setSelectedScanner(scanner || null);
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  const handleAddScanner = () => {
    if (!canWrite("list")) {
      toast.error("You don't have permission to add a scanner.");
      return;
    }
    navigateToPage("add");
  };

  const handleEditScanner = (scanner: SlideScanner) => {
    if (!canWrite("list")) {
      toast.error("You don't have permission to edit a scanner.");
      return;
    }
    navigateToPage("edit", scanner);
  };

  const handleViewScanner = (scanner: SlideScanner) =>
    navigateToPage("view", scanner);
  const handleCancelForm = () => navigateToPage("list");
  const handleBackToList = () => navigateToPage("list");

  const handleDeleteScanner = async (id?: string) => {
    if (!id) return;
    if (!canWrite("list")) {
      toast.error("You don't have permission to delete a scanner.");
      return;
    }
    try {
      await dispatch(deleteScanner(id));
      toast.success("Scanner deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Error deleting scanner");
    }
  };

  const handleSaveScanner = async (
    scannerData: SlideScanner | Partial<SlideScanner>,
  ) => {
    try {
      const sanitizedData = sanitizeFormData(scannerData);

      if (currentPage === "edit" && "deviceSerialNumber" in sanitizedData) {
        await dispatch(
          updateScanner(
            sanitizedData as Partial<SlideScanner> & {
              deviceSerialNumber: string;
            },
          ),
        );
        toast.success("Scanner updated successfully");
      } else {
        await dispatch(addScanner(sanitizedData as Omit<SlideScanner, "id">));
        toast.success("Scanner added successfully");
      }

      navigateToPage("list");
    } catch (err: any) {
      toast.error(err.message || "Error saving scanner");
    }
  };

  const getBreadcrumbs = (): Breadcrumb[] => {
    const breadcrumbMap: Record<string, Breadcrumb[]> = {
      list: [{ label: "Slide Scanner" }],
      add: [{ label: "Slide Scanner", href: "#" }, { label: "Add Scanner" }],
      edit: [{ label: "Slide Scanner", href: "#" }, { label: "Edit Scanner" }],
      view: [
        { label: "Slide Scanner", href: "#" },
        { label: "Scanner Details" },
      ],
      lis: [{ label: "Clinical Applications" }, { label: "LIS" }],
      synapse: [{ label: "Clinical Applications" }, { label: "Synapse" }],
      "qa-analysis": [
        { label: "Clinical Applications" },
        { label: "QA Slide Analysis" },
      ],
      "enrichment-tool": [
        { label: "Clinical Applications" },
        { label: "Enrichment Tool" },
      ],
      "health-status": [{ label: "Health Monitor" }],
      "slide-status": [{ label: "Slide Scan Status" }],
    };
    return breadcrumbMap[currentPage] || [];
  };

  // ── Unauthorized fallback page ──
  const UnauthorizedPage = () => (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
      <svg
        className="w-12 h-12 text-red-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <p className="text-lg font-semibold text-gray-600">Access Denied</p>
      <p className="text-sm text-gray-400">
        You don't have permission to view this page.
      </p>
    </div>
  );

  const renderCurrentPage = () => {
    // While security config is still loading, don't block the UI
    if (!configLoaded) return null;

    // If the user cannot read this page, show access denied
    if (!canRead(currentPage)) {
      return <UnauthorizedPage />;
    }

    const pageComponents: Record<string, JSX.Element | null> = {
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
      add: canWrite("list") ? (
        <ScannerForm
          onSave={handleSaveScanner}
          onCancel={handleCancelForm}
          isEdit={false}
        />
      ) : (
        <UnauthorizedPage />
      ),
      edit:
        canWrite("list") && selectedScanner ? (
          <ScannerForm
            scanner={selectedScanner}
            onSave={handleSaveScanner}
            onCancel={handleCancelForm}
            isEdit={true}
          />
        ) : (
          <UnauthorizedPage />
        ),
      view: selectedScanner ? (
        <ScannerDetails scanner={selectedScanner} onBack={handleBackToList} />
      ) : null,
      lis: <LisConfig appType="lis" />,
      synapse: <SynapseConfig appType="synapse" />,
      "qa-analysis": <QAConfig />,
      "enrichment-tool": <EnrichmentToolConfig />,
      "health-status": <HealthMonitor />,
      "slide-status": <SlideScanStatus />,
    };

    return pageComponents[currentPage] ?? <div>Page Not Found</div>;
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
        richColors
        visibleToasts={3}
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
