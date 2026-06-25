import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { setUnauthorizedHandler } from "./api/services/apiClient";
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
import { usePermissions } from "./auth/permissions/usePermissions";
import { loadStoredSession, logoutUser } from "./store/slices/authSlice";
import {
  addScanner,
  deleteScanner,
  fetchScanners,
  updateScanner,
} from "./store/slices/scannerSlice";
import { Breadcrumb, PageType } from "./types/common.types";
import { SlideScanner } from "./types/scanner.types";
import { sanitizeFormData } from "./utils/helpers";
import { useCrossTabAuth } from "./hooks/useCrossTabAuth";
import { API_URLS } from "./auth/permissions/apiConfig";

const VALID_PAGES: PageType[] = [
  "list", "add", "edit", "view", "lis", "synapse",
  "qa-analysis", "enrichment-tool", "health-status", "slide-status",
];

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]" />
    </div>
  );
}

const STORAGE_KEY_PREFIX = "currentPage:";

const normalizeStoredPage = (page: string | null): PageType => {
  const safePage = page && VALID_PAGES.includes(page as PageType)
    ? (page as PageType)
    : "slide-status";

  return safePage === "view" || safePage === "edit"
    ? "list"
    : safePage;
};

const getSavedPageForUser = (user: string | null): PageType =>
  normalizeStoredPage(localStorage.getItem(`${STORAGE_KEY_PREFIX}${user}`));

const savePageForCurrentUser = (page: PageType): void => {
  const user = localStorage.getItem("auth_user");
  const normalizedPage = normalizeStoredPage(page);
  if (user) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${user}`, normalizedPage);
  }
};

export default function App() {
  const dispatch = useAppDispatch();

  const [currentPage, setCurrentPage] = useState<PageType>(() =>
    getSavedPageForUser(localStorage.getItem("auth_user"))
  );
  const [selectedScanner, setSelectedScanner] = useState<SlideScanner | null>(null);
  const isNavigating = useRef(false);

  const scanners = useSelector((state: any) => state.scanners.items);
  const loading = useSelector((state: any) => state.scanners.loading);
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  const currentUser = useSelector((state: any) => state.auth.user);

  useCrossTabAuth(currentUser);
  const { canAccess, configLoaded } = usePermissions();
  const canGetScanners = canAccess(API_URLS.scanners.base.path, API_URLS.scanners.base.method);
  const canEditScanners = canAccess(API_URLS.scanners.update.path, API_URLS.scanners.update.method);
  const canDeleteScanners = canAccess(API_URLS.scanners.delete.path, API_URLS.scanners.delete.method);

  useEffect(() => {
    dispatch(loadStoredSession());
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(logoutUser());
    });
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchScanners());
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && currentPage === "list") {
      dispatch(fetchScanners());
    }
  }, [currentPage, dispatch, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const handlePopState = (event: PopStateEvent) => {
      if (isNavigating.current) return;
      const page = (event.state?.page as string) || "slide-status";
      const normalizedPage = normalizeStoredPage(page);
      savePageForCurrentUser(normalizedPage);
      setCurrentPage(normalizedPage);
      setSelectedScanner(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      const savedPage = getSavedPageForUser(localStorage.getItem("auth_user"));
      setCurrentPage(savedPage);
    }
  }, [isLoggedIn]);

  const navigateToPage = (page: PageType, scanner?: SlideScanner) => {
    if (configLoaded && !canGetScanners) {
      console.log("You don't have permission to access this page.", page);
      return;
    }

    savePageForCurrentUser(page);

    isNavigating.current = true;
    window.history.pushState({ page }, "", window.location.pathname);
    isNavigating.current = false;

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
    if (!canEditScanners) {
      toast.error("You don't have permission to add a scanner.");
      return;
    }
    navigateToPage("add");
  };

  const handleEditScanner = (scanner: SlideScanner) => {
    if (!canEditScanners) {
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
    if (!canDeleteScanners) {
      toast.error("You don't have permission to delete a scanner.");
      return;
    }
    try {
      await dispatch(deleteScanner(id));
    } catch (err: any) {
      toast.error(err.message || "Error deleting scanner");
    }
  };

  const handleSaveScanner = async (
    scannerData: SlideScanner | Partial<SlideScanner>
  ) => {
    try {
      const sanitizedData = sanitizeFormData(scannerData);

      if (currentPage === "edit" && "deviceSerialNumber" in sanitizedData) {
        await dispatch(
          updateScanner(
            sanitizedData as Partial<SlideScanner> & {
              deviceSerialNumber: string;
            }
          )
        );
      } else {
        await dispatch(addScanner(sanitizedData as Omit<SlideScanner, "id">));
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

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

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
        <button
          type="button"
          onClick={handleLogout}
          className="ml-1 bg-transparent p-0 text-sm font-medium text-[#DC2626] underline underline-offset-2 hover:text-[#991B1B] focus:outline-none focus:ring-0"
        >
          Back to login ...
        </button>
      </p>
    </div>
  );

  const renderCurrentPage = () => {
    if (!configLoaded) {
      return <PageLoader />;
    }

    if (!canGetScanners) {
      return <UnauthorizedPage />;
    }

    if ((currentPage === "view" || currentPage === "edit") && !selectedScanner) {
      setTimeout(() => navigateToPage("list"), 0);
      return <PageLoader />;
    }

    const pageComponents: Record<string, JSX.Element> = {
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
      add: canEditScanners ? (
        <ScannerForm
          onSave={handleSaveScanner}
          onCancel={handleCancelForm}
          isEdit={false}
        />
      ) : (
        <UnauthorizedPage />
      ),
      edit: canEditScanners ? (
        <ScannerForm
          scanner={selectedScanner!}
          onSave={handleSaveScanner}
          onCancel={handleCancelForm}
          isEdit={true}
        />
      ) : (
        <UnauthorizedPage />
      ),
      view: (
        <ScannerDetails scanner={selectedScanner!} onBack={handleBackToList} />
      ),
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
        visibleToasts={1}
        expand={true}
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