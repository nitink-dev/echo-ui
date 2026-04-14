import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
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
  clearAuthState,
  fetchSecurityConfig,
  loadStoredSession,
} from "./store/slices/authSlice";
import {
  addScanner,
  deleteScanner,
  fetchScanners,
  updateScanner,
} from "./store/slices/scannerSlice";
import { fetchHealthStatus } from "./store/slices/healthSlice";
import { fetchEhTool } from "./store/slices/ehToolsSlice";
import { Breadcrumb, PageType } from "./types/common.types";
import { SlideScanner } from "./types/scanner.types";
import { sanitizeFormData } from "./utils/helpers";
import { setUnauthorizedHandler } from "./api/services/apiClient";
import { ENRICHMENT_TOOLS } from "./utils/constants";

// ─── Global Page Wrapper ──────────────────────────────────────────────────────
const PageWrapper = ({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean;
  error?: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}) => {
  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <AlertCircle className="h-10 w-10 text-red-300" />
        <p className="text-sm text-gray-500">Could not load data.</p>
        <button
          onClick={onRetry}
          className="text-sm text-[#007BFF] underline hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    );

  return <>{children}</>;
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useAppDispatch();

  const [currentPage, setCurrentPage] = useState<PageType>("health-status");
  const [selectedScanner, setSelectedScanner] = useState<SlideScanner | null>(null);

  // ── Selectors ──
  const scanners      = useSelector((state: any) => state.scanners.items);
  const scannerLoading = useSelector((state: any) => state.scanners.loading);
  const scannerError  = useSelector((state: any) => state.scanners.error);

  const healthLoading = useSelector((state: any) => state.health.loading);
  const healthError   = useSelector((state: any) => state.health.error);

  const ehToolsLoading = useSelector((state: any) => state.ehTools.loading);
  const ehToolsError   = useSelector((state: any) => state.ehTools.error);

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  const { canRead, canWrite, configLoaded } = usePermissions();

  // ── Retry helpers ──
  const retryHealth = () => dispatch(fetchHealthStatus());

  const retryEhTools = () => {
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.DICOM_RECEIVER }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.LIS_CONNECTOR }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.ENRICHMENT_SERVICE }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.EXPORT_SERVICE }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.HL7_CONNECTOR }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.EMAIL_SERVICE }));
  };

  const retryScanners = () => dispatch(fetchScanners());

  // ── 1. Load stored session on mount ──
  useEffect(() => {
    dispatch(loadStoredSession());
  }, []);

  // ── 2. 401 → clear auth → LoginPage renders automatically ──
  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(clearAuthState());
    });
  }, [dispatch]);

  // ── 3. On login: fetch config → then always land on health-status ──
  useEffect(() => {
    if (!isLoggedIn) return;

    dispatch(fetchSecurityConfig()).finally(() => {
      setCurrentPage("health-status");          // fixed landing — no history
      localStorage.removeItem("currentPage");   // clear stale page history
      dispatch(fetchScanners());
    });
  }, [dispatch, isLoggedIn]);

  // ── 4. Refetch scanners when navigating to list ──
  useEffect(() => {
    if (isLoggedIn && currentPage === "list") {
      dispatch(fetchScanners());
    }
  }, [currentPage]);

  // ── 5. Backend reconnect → refetch everything ──
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleOnline = () => {
      dispatch(fetchSecurityConfig());
      dispatch(fetchScanners());
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isLoggedIn]);

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const navigateToPage = (page: PageType, scanner?: SlideScanner) => {
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

  // ─── Not logged in ───────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  // ─── Scanner handlers ────────────────────────────────────────────────────────
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

  const handleViewScanner = (scanner: SlideScanner) => navigateToPage("view", scanner);
  const handleCancelForm  = () => navigateToPage("list");
  const handleBackToList  = () => navigateToPage("list");

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
            sanitizedData as Partial<SlideScanner> & { deviceSerialNumber: string },
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

  // ─── Breadcrumbs ─────────────────────────────────────────────────────────────
  const getBreadcrumbs = (): Breadcrumb[] => {
    const breadcrumbMap: Record<string, Breadcrumb[]> = {
      list:             [{ label: "Slide Scanner" }],
      add:              [{ label: "Slide Scanner", href: "#" }, { label: "Add Scanner" }],
      edit:             [{ label: "Slide Scanner", href: "#" }, { label: "Edit Scanner" }],
      view:             [{ label: "Slide Scanner", href: "#" }, { label: "Scanner Details" }],
      lis:              [{ label: "Clinical Applications" }, { label: "LIS" }],
      synapse:          [{ label: "Clinical Applications" }, { label: "Synapse" }],
      "qa-analysis":    [{ label: "Clinical Applications" }, { label: "QA Slide Analysis" }],
      "enrichment-tool":[{ label: "Clinical Applications" }, { label: "Enrichment Tool" }],
      "health-status":  [{ label: "Health Monitor" }],
      "slide-status":   [{ label: "Slide Scan Status" }],
    };
    return breadcrumbMap[currentPage] || [];
  };

  // ─── Unauthorized UI ─────────────────────────────────────────────────────────
  const UnauthorizedPage = () => (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
      <svg className="w-12 h-12 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <p className="text-lg font-semibold text-gray-600">Access Denied</p>
      <p className="text-sm text-gray-400">You don't have permission to view this page.</p>
    </div>
  );

  // ─── Page render ─────────────────────────────────────────────────────────────
  const renderCurrentPage = () => {
    if (!configLoaded) return null;
    if (!canRead(currentPage)) return <UnauthorizedPage />;

    // Pages that need global loading/error handling → wrapped with PageWrapper
    // Pages like add/edit/view/lis/synapse manage their own state → unwrapped
    const wrappedPages: Record<
      string,
      { loading: boolean; error?: string | null; retry: () => void; content: JSX.Element }
    > = {
      "health-status": {
        loading: healthLoading,
        error: healthError,
        retry: retryHealth,
        content: <HealthMonitor />,
      },
      list: {
        loading: scannerLoading,
        error: scannerError,
        retry: retryScanners,
        content: (
          <ScannerList
            scanners={scanners}
            loading={scannerLoading}
            onAddScanner={handleAddScanner}
            onEditScanner={handleEditScanner}
            onViewScanner={handleViewScanner}
            onDeleteScanner={handleDeleteScanner}
          />
        ),
      },
      "enrichment-tool": {
        loading: ehToolsLoading,
        error: ehToolsError,
        retry: retryEhTools,
        content: <EnrichmentToolConfig />,
      },
    };

    // Unwrapped pages (handle loading internally or no async data)
    const unwrappedPages: Record<string, JSX.Element | null> = {
      add: canWrite("list") ? (
        <ScannerForm onSave={handleSaveScanner} onCancel={handleCancelForm} isEdit={false} />
      ) : (
        <UnauthorizedPage />
      ),
      edit: canWrite("list") && selectedScanner ? (
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
      lis:           <LisConfig appType="lis" />,
      synapse:       <SynapseConfig appType="synapse" />,
      "qa-analysis": <QAConfig />,
      "slide-status":<SlideScanStatus />,
    };

    // Wrapped page?
    if (wrappedPages[currentPage]) {
      const { loading, error, retry, content } = wrappedPages[currentPage];
      return (
        <PageWrapper loading={loading} error={error} onRetry={retry}>
          {content}
        </PageWrapper>
      );
    }

    // Unwrapped page?
    if (currentPage in unwrappedPages) {
      return unwrappedPages[currentPage] ?? <div>Page Not Found</div>;
    }

    return <div>Page Not Found</div>;
  };

  // ─── Root render ─────────────────────────────────────────────────────────────
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
        expand={true}
        toastOptions={{
          duration: 4000,
          style: { background: "#ffffff", border: "1px solid #e2e8f0", color: "#1e293b" },
          success: { style: { border: "1px solid #10b981", background: "#f0fdf4", color: "#065f46" } },
          error:   { style: { border: "1px solid #dc2626", background: "#fef2f2", color: "#991b1b" } },
        }}
      />
    </div>
  );
}