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
import { SCANNER_SERVICE_URL } from "./api/services/scannerService";

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

export default function App() {
  const dispatch = useAppDispatch();

  const getInitialPage = (): PageType => {
    const user = localStorage.getItem("auth_user");
    if (!user) return "health-status";

    const saved = localStorage.getItem(`currentPage:${user}`) as PageType;
      return saved && VALID_PAGES.includes(saved)
        ? saved
        : "health-status";
  };

  const [currentPage, setCurrentPage] = useState<PageType>(getInitialPage);
  const [selectedScanner, setSelectedScanner] = useState<SlideScanner | null>(null);
  const isNavigating = useRef(false);

  const scanners = useSelector((state: any) => state.scanners.items);
  const loading = useSelector((state: any) => state.scanners.loading);
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  const currentUser = useSelector((state: any) => state.auth.user);

  useCrossTabAuth(currentUser);

  const { canGet, canPatch, configLoaded } = usePermissions();

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
      const saved = localStorage.getItem("currentPage") as PageType;
      const page = saved && VALID_PAGES.includes(saved) ? saved : "health-status";
      if (page !== "view" && page !== "edit") {
        setCurrentPage(page);
      } else {
        setCurrentPage("list");
        localStorage.setItem(`currentPage:${localStorage.getItem("auth_user")}`, "list");
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && currentPage === "list") {
      dispatch(fetchScanners());
    }
  }, [currentPage]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const handlePopState = (event: PopStateEvent) => {
      if (isNavigating.current) return;
      const page = (event.state?.page as PageType) || "health-status";
      const safePage: PageType =
        page === "view" || page === "edit" ? "list" : page;
      localStorage.setItem(`currentPage:${localStorage.getItem("auth_user")}`, safePage);
      setCurrentPage(safePage);
      setSelectedScanner(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isLoggedIn]);

  const navigateToPage = (page: PageType, scanner?: SlideScanner) => {
    if (configLoaded && !canGet(page)) {
      console.log("You don't have permission to access this page.", page);
      return;
    }

    const storePage = page === "login" ? "list" : page;
    localStorage.setItem(`currentPage:${localStorage.getItem("auth_user")}`, storePage);

    isNavigating.current = true;
    window.history.pushState({ page: storePage }, "", window.location.pathname);
    isNavigating.current = false;

    setCurrentPage(storePage as PageType);
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
    if (!canPatch(SCANNER_SERVICE_URL)) {
      toast.error("You don't have permission to add a scanner.");
      return;
    }
    navigateToPage("add");
  };

  const handleEditScanner = (scanner: SlideScanner) => {
    if (!canPatch(SCANNER_SERVICE_URL)) {
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
    if (!canDelete(SCANNER_SERVICE_URL)) {
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

    if (!canGet(currentPage)) {
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
      add: canWrite("list") ? (
        <ScannerForm
          onSave={handleSaveScanner}
          onCancel={handleCancelForm}
          isEdit={false}
        />
      ) : (
        <UnauthorizedPage />
      ),
      edit: canWrite("list") ? (
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
