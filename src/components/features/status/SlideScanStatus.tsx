// // SlideScanStatus.jsx - Fetch first, then stream updates (with explicit completed/failed branches)
// import React, { useEffect, useState, useRef } from "react";
// import {
//   Microscope,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   RefreshCw,
//   Search,
// } from "lucide-react";
// import { StatusPanelCompleted } from "./StatusPanelCompleted";
// import { StatusPanelFailed } from "./StatusPanelFailed";
// import { StatusPanel } from "./StatusPanel";
// import { BASE_URL } from "../../../utils/constants";
// import AutocompleteInput from "./AutocompleteInput";
// import apiClient from "../../../api/services/apiClient";

// const TABS = [
//   {
//     key: "inProgress",
//     label: "In Progress",
//     Icon: Clock,
//     accentBadgeClass: "bg-blue-100 text-blue-700",
//     activeClass: "text-blue-700",
//     activeBg: "bg-white",
//     activeBorderColor: "rgb(59,130,246)",
//     countActiveBgStyle: { backgroundColor: "rgb(59,130,246)", color: "#fff" },
//     countInactiveBgStyle: { backgroundColor: "rgb(243,244,246)", color: "rgb(107,114,128)" },
//     iconActiveColor: "text-blue-500",
//     glowColor: "rgba(59,130,246,0.10)",
//   },
//   {
//     key: "completed",
//     label: "Completed",
//     Icon: CheckCircle2,
//     accentBadgeClass: "bg-green-100 text-green-700",
//     activeClass: "text-green-700",
//     activeBg: "bg-white",
//     activeBorderColor: "rgb(34,197,94)",
//     countActiveBgStyle: { backgroundColor: "rgb(34,197,94)", color: "#fff" },
//     countInactiveBgStyle: { backgroundColor: "rgb(243,244,246)", color: "rgb(107,114,128)" },
//     iconActiveColor: "text-green-500",
//     glowColor: "rgba(34,197,94,0.10)",
//   },
//   {
//     key: "failed",
//     label: "Failed",
//     Icon: XCircle,
//     accentBadgeClass: "bg-red-100 text-red-700",
//     activeClass: "text-red-700",
//     activeBg: "bg-white",
//     activeBorderColor: "rgb(239,68,68)",
//     countActiveBgStyle: { backgroundColor: "rgb(239,68,68)", color: "#fff" },
//     countInactiveBgStyle: { backgroundColor: "rgb(243,244,246)", color: "rgb(107,114,128)" },
//     iconActiveColor: "text-red-500",
//     glowColor: "rgba(239,68,68,0.10)",
//   },
// ];

// // Maps scanStatus string from API to our tab keys
// const SCAN_STATUS_TO_TAB = {
//   "in-progress": "inProgress",
//   "inprogress": "inProgress",
//   "in_progress": "inProgress",
//   "completed": "completed",
//   "failed": "failed",
// };

// // Priority order for auto-jump when multiple tabs have results (used for list search fallback)
// const SEARCH_JUMP_PRIORITY = ["inProgress", "completed", "failed"];

// const pageSize = 9;

// /**
//  * Converts a single slide object from /api/slides/{barcode} into a
//  * pageable-shaped object that the status panels can render.
//  */
// const singleSlideToPageable = (slide) => ({
//   content: [slide],
//   totalElements: 1,
//   totalPages: 1,
//   number: 0,
//   size: pageSize,
// });

// /**
//  * Returns an empty pageable object (zero results).
//  */
// const emptyPageable = () => ({
//   content: [],
//   totalElements: 0,
//   totalPages: 1,
//   number: 0,
//   size: pageSize,
// });

// export function SlideScanStatus() {
//   const [statusData, setStatusData] = useState({
//     completed: null,
//     failed: null,
//     inProgress: null,
//     loading: { completed: false, failed: false, inProgress: false },
//     error: {},
//     lastFetched: { completed: null, failed: null, inProgress: null },
//   });

//   const [activeTab, setActiveTab] = useState("inProgress");
//   const [barcodeFilter, setBarcodeFilter] = useState("");
//   const [appliedFilters, setAppliedFilters] = useState({ barcode: "", deviceId: "" });

//   // Search state: idle | searching | found | not-found
//   const [searchState, setSearchState] = useState("idle");

//   const [autoRefresh, setAutoRefresh] = useState(true);

//   // currentPage tracks the page index per tab (0-based)
//   const [currentPage, setCurrentPage] = useState({ completed: 0, failed: 0, inProgress: 0 });

//   // SSE refs
//   const eventSourceRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const [isStreamConnected, setIsStreamConnected] = useState(false);
//   const [reconnectAttempts, setReconnectAttempts] = useState(0);

//   // Track previous in-progress count to detect drops (smart auto-refresh)
//   const prevInProgressCountRef = useRef(null);

//   // Stale-closure guards
//   const currentPageRef = useRef(currentPage);
//   useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

//   const appliedFiltersRef = useRef(appliedFilters);
//   useEffect(() => { appliedFiltersRef.current = appliedFilters; }, [appliedFilters]);

//   const toApiStatus = (key) => (key === "inProgress" ? "in-progress" : key);

//   // ── Core fetch — returns the response data ──
//   const fetchData = async (statusKey, page, overrideFilters) => {
//     setStatusData((prev) => ({
//       ...prev,
//       loading: { ...prev.loading, [statusKey]: true },
//     }));

//     try {
//       const apiStatus = toApiStatus(statusKey);
//       const filters = overrideFilters ?? appliedFiltersRef.current;
//       const barcodeParam = filters.barcode
//         ? `&searchTerm=${encodeURIComponent(filters.barcode)}`
//         : "";

//       const url = `${BASE_URL}/api/slide-scan-status/${apiStatus}?page=${page}&size=${pageSize}${barcodeParam}`;
//       const response = await apiClient.get(url);
//       const data = response.data;

//       setStatusData((prev) => {
//         // Smart auto-refresh: detect in-progress count drop
//         if (statusKey === "inProgress") {
//           const newCount = data?.totalElements ?? 0;
//           const oldCount = prevInProgressCountRef.current;

//           if (oldCount !== null && newCount < oldCount) {
//             const pageSnap = currentPageRef.current;
//             setTimeout(() => {
//               fetchData("completed", pageSnap.completed);
//               fetchData("failed", pageSnap.failed);
//             }, 0);
//           }

//           prevInProgressCountRef.current = newCount;
//         }

//         return {
//           ...prev,
//           [statusKey]: data,
//           loading: { ...prev.loading, [statusKey]: false },
//           lastFetched: { ...prev.lastFetched, [statusKey]: Date.now() },
//           error: { ...prev.error, [statusKey]: undefined },
//         };
//       });

//       return data;
//     } catch (error) {
//       setStatusData((prev) => ({
//         ...prev,
//         loading: { ...prev.loading, [statusKey]: false },
//         error: { ...prev.error, [statusKey]: error.message || "Unknown error" },
//       }));
//       return null;
//     }
//   };

//   const refreshPanelsForStatus = (normalizedStatus) => {
//     const pageSnapshot = currentPageRef.current;
//     if (normalizedStatus === "completed") fetchData("completed", pageSnapshot.completed);
//     else if (normalizedStatus === "failed") fetchData("failed", pageSnapshot.failed);
//     if (pageSnapshot.inProgress !== 0) fetchData("inProgress", pageSnapshot.inProgress);
//   };

//   const updateInProgressWithSSE = (slideData) => {
//     const status = (slideData?.scanStatus ?? "").toString().trim().toLowerCase();

//     setStatusData((prev) => {
//       const currentData = prev.inProgress;
//       if (!currentData || !currentData.content) return prev;

//       let updatedContent = [...currentData.content];
//       const existingIndex = updatedContent.findIndex((s) => s.id === slideData.id);

//       if (status === "completed") {
//         if (existingIndex !== -1) updatedContent.splice(existingIndex, 1);
//         refreshPanelsForStatus("completed");
//       } else if (status === "failed") {
//         if (existingIndex !== -1) updatedContent.splice(existingIndex, 1);
//         refreshPanelsForStatus("failed");
//       } else {
//         if (existingIndex !== -1) {
//           updatedContent[existingIndex] = { ...updatedContent[existingIndex], ...slideData };
//         } else {
//           updatedContent.unshift(slideData);
//           if (updatedContent.length > pageSize) updatedContent = updatedContent.slice(0, pageSize);
//         }
//       }

//       const totalElements =
//         status !== "completed" && status !== "failed" && existingIndex === -1
//           ? currentData.totalElements + 1
//           : (status === "completed" || status === "failed") && existingIndex !== -1
//           ? Math.max(0, currentData.totalElements - 1)
//           : currentData.totalElements;

//       prevInProgressCountRef.current = totalElements;

//       return {
//         ...prev,
//         inProgress: {
//           ...currentData,
//           content: updatedContent,
//           totalElements,
//           totalPages: Math.max(1, Math.ceil(totalElements / pageSize)),
//         },
//         lastFetched: { ...prev.lastFetched, inProgress: Date.now() },
//       };
//     });
//   };

//   const connectToInProgressStream = () => {
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
//     if (eventSourceRef.current) {
//       eventSourceRef.current.close();
//       eventSourceRef.current = null;
//     }

//     const url = `${BASE_URL}/api/slide-scan-status/stream/in-progress`;

//     try {
//       const eventSource = new EventSource(url);
//       eventSourceRef.current = eventSource;

//       eventSource.onopen = () => {
//         setIsStreamConnected(true);
//         setReconnectAttempts(0);
//       };

//       eventSource.addEventListener("slide_scan_status", (event) => {
//         try { updateInProgressWithSSE(JSON.parse(event.data)); }
//         catch (e) { console.error("❌ SSE parse error:", e); }
//       });

//       eventSource.onmessage = (event) => {
//         try { updateInProgressWithSSE(JSON.parse(event.data)); }
//         catch (e) { console.error("❌ SSE parse error:", e); }
//       };

//       eventSource.onerror = () => {
//         setIsStreamConnected(false);
//         if (eventSource.readyState === EventSource.CLOSED) {
//           setStatusData((prev) => ({
//             ...prev,
//             error: {
//               ...prev.error,
//               inProgress: reconnectAttempts > 3
//                 ? "Stream connection failed. Please refresh manually."
//                 : undefined,
//             },
//           }));

//           if (reconnectAttempts < 5) {
//             const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 30000);
//             reconnectTimeoutRef.current = setTimeout(() => {
//               setReconnectAttempts((prev) => prev + 1);
//               connectToInProgressStream();
//             }, delay);
//           }
//         }
//       };
//     } catch (error) {
//       setStatusData((prev) => ({
//         ...prev,
//         error: { ...prev.error, inProgress: `Connection error: ${error.message}` },
//       }));
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     fetchData("failed", 0);
//     fetchData("completed", 0);
//     fetchData("inProgress", 0).then((data) => {
//       if (data) {
//         prevInProgressCountRef.current = data.totalElements ?? 0;
//         connectToInProgressStream();
//       }
//     });

//     return () => {
//       eventSourceRef.current?.close();
//       if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Smart auto-refresh: only polls in-progress; completed/failed fire only on count drop
//   useEffect(() => {
//     if (!autoRefresh) return;
//     const interval = setInterval(() => {
//       fetchData("inProgress", currentPage.inProgress);
//     }, 30000);
//     return () => clearInterval(interval);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [autoRefresh, currentPage.inProgress]);

//   // Re-fetch in-progress on page change (SSE covers page 0 live)
//   useEffect(() => {
//     if (currentPage.inProgress !== 0) fetchData("inProgress", currentPage.inProgress);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentPage.inProgress]);

//   const handleRefresh = () => {
//     fetchData("failed", currentPage.failed);
//     fetchData("completed", currentPage.completed);
//     fetchData("inProgress", currentPage.inProgress);
//     setReconnectAttempts(0);
//     connectToInProgressStream();
//   };

//   // ── Fixed pagination: use explicit page numbers, not direction deltas ──
//   const handlePageChange = (tab, direction) => {
//     const totalPages = statusData[tab]?.totalPages ?? 1;
//     const currentPageNum = currentPage[tab];

//     const newPage =
//       direction === "next"
//         ? Math.min(currentPageNum + 1, totalPages - 1)
//         : Math.max(0, currentPageNum - 1);

//     // No-op if page hasn't changed (prevents spurious fetches)
//     if (newPage === currentPageNum) return;

//     setCurrentPage((prev) => ({ ...prev, [tab]: newPage }));

//     // Always fetch for completed and failed (they are not SSE-driven)
//     // For inProgress, the useEffect above handles it
//     if (tab !== "inProgress") {
//       fetchData(tab, newPage);
//     }
//   };

//   // ── Barcode search: call /api/slides/{barcode}, convert to pageable ──
//   const handleApplyFilters = async () => {
//     const trimmed = barcodeFilter.trim();
//     if (!trimmed) return;

//     setAppliedFilters({ barcode: trimmed, deviceId: "" });
//     setCurrentPage({ completed: 0, failed: 0, inProgress: 0 });
//     setSearchState("searching");

//     try {
//       // Call the barcode lookup endpoint
//       const response = await apiClient.get(`${BASE_URL}/api/slide-scan-status/barcode/${encodeURIComponent(trimmed)}`);
//       const slide = response.data;

//       if (!slide) {
//         // API returned empty / null
//         setStatusData((prev) => ({
//           ...prev,
//           inProgress: emptyPageable(),
//           completed: emptyPageable(),
//           failed: emptyPageable(),
//         }));
//         setSearchState("not-found");
//         return;
//       }

//       // Normalise scanStatus to a tab key
//       const rawStatus = (slide.scanStatus ?? "").toString().trim().toLowerCase();
//       const matchedTab = SCAN_STATUS_TO_TAB[rawStatus] ?? null;

//       // Build per-tab pageable data: the matched tab gets the record; others get empty
//       const inProgressData = matchedTab === "inProgress" ? singleSlideToPageable(slide) : emptyPageable();
//       const completedData  = matchedTab === "completed"  ? singleSlideToPageable(slide) : emptyPageable();
//       const failedData     = matchedTab === "failed"     ? singleSlideToPageable(slide) : emptyPageable();

//       setStatusData((prev) => ({
//         ...prev,
//         inProgress: inProgressData,
//         completed: completedData,
//         failed: failedData,
//         lastFetched: {
//           inProgress: Date.now(),
//           completed: Date.now(),
//           failed: Date.now(),
//         },
//         error: {},
//       }));

//       if (matchedTab) {
//         setActiveTab(matchedTab);
//         setSearchState("found");
//       } else {
//         // scanStatus not recognised — still show record but mark not-found
//         setSearchState("not-found");
//       }
//     } catch (err) {
//       // 404 or network error → no results
//       setStatusData((prev) => ({
//         ...prev,
//         inProgress: emptyPageable(),
//         completed: emptyPageable(),
//         failed: emptyPageable(),
//         error: {},
//       }));
//       setSearchState("not-found");
//     }
//   };

//   // Clear search — restore unfiltered view, reset search state
//   const handleClearSearch = () => {
//     setBarcodeFilter("");
//     const emptyFilters = { barcode: "", deviceId: "" };
//     setAppliedFilters(emptyFilters);
//     setCurrentPage({ completed: 0, failed: 0, inProgress: 0 });
//     setSearchState("idle");

//     fetchData("inProgress", 0, emptyFilters);
//     fetchData("completed", 0, emptyFilters);
//     fetchData("failed", 0, emptyFilters);
//   };

//   const isAnyLoading =
//     statusData.loading.completed || statusData.loading.failed || statusData.loading.inProgress;
//   const isSearchActive = !!appliedFilters.barcode;
//   const isSearching = searchState === "searching";

//   // Always return a number (0 fallback) so the badge always renders
//   const getTabCount = (key) => statusData[key]?.totalElements ?? 0;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-5xl mx-auto p-6 space-y-6">

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <Microscope className="h-7 w-7 text-indigo-600" />
//               Slide Scan Status Monitor
//             </h1>
//             <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
//               Real-time monitoring of slide scanning operations
//               {isStreamConnected && (
//                 <span className="inline-flex items-center gap-1 text-green-600">
//                   <span className="relative flex h-2 w-2">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//                   </span>
//                   Live
//                 </span>
//               )}
//               {!isStreamConnected && reconnectAttempts > 0 && (
//                 <span className="inline-flex items-center gap-1 text-yellow-600">
//                   <RefreshCw className="h-3 w-3 animate-spin" />
//                   Reconnecting... (attempt {reconnectAttempts})
//                 </span>
//               )}
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2">
//               <AutocompleteInput
//                 options={[]}
//                 value={barcodeFilter}
//                 onChange={setBarcodeFilter}
//                 placeholder="Search barcode…"
//                 emptyText="Enter exact barcode to search"
//                 onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
//               />

//               <button
//                 onClick={handleApplyFilters}
//                 disabled={!barcodeFilter.trim() || isSearching}
//                 className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//               >
//                 {isSearching
//                   ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
//                   : <Search className="h-3.5 w-3.5" />
//                 }
//                 {isSearching ? "Searching…" : "Search"}
//               </button>

//               {isSearchActive && (
//                 <button
//                   onClick={handleClearSearch}
//                   className="px-3 py-2 bg-amber-50 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex items-center gap-1"
//                 >
//                   <XCircle className="h-3.5 w-3.5" />
//                   Clear
//                 </button>
//               )}
//             </div>

//             <button
//               onClick={handleRefresh}
//               disabled={isAnyLoading}
//               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <RefreshCw className={`h-4 w-4 ${isAnyLoading ? "animate-spin" : ""}`} />
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Search result banners */}
//         {searchState === "found" && isSearchActive && (
//           <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
//             <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
//             <span>Found barcode</span>
//             <code className="px-2 py-0.5 bg-green-100 rounded font-mono text-green-900 text-xs">
//               {appliedFilters.barcode}
//             </code>
//             <span className="text-green-600">— jumped to the matching tab.</span>
//           </div>
//         )}

//         {searchState === "not-found" && isSearchActive && (
//           <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
//             <XCircle className="h-4 w-4 text-red-400 shrink-0" />
//             <span>No results found for barcode</span>
//             <code className="px-2 py-0.5 bg-red-100 rounded font-mono text-red-900 text-xs">
//               {appliedFilters.barcode}
//             </code>
//             <span className="text-red-500 text-xs">across all statuses.</span>
//           </div>
//         )}

//         {/* Tab bar */}
//         <div>
//           <div className="flex gap-2 bg-gray-100/80 rounded-2xl p-1.5 border border-gray-200/60 shadow-inner">
//             {TABS.map(({
//               key, label, Icon,
//               activeClass, activeBg, activeBorderColor,
//               countActiveBgStyle, countInactiveBgStyle,
//               iconActiveColor, glowColor,
//             }) => {
//               const count = getTabCount(key);
//               const isActive = activeTab === key;

//               return (
//                 <button
//                   key={key}
//                   onClick={() => setActiveTab(key)}
//                   style={isActive
//                     ? {
//                         boxShadow: `0 2px 16px 0 ${glowColor}, 0 1px 4px 0 rgba(0,0,0,0.07)`,
//                         borderColor: activeBorderColor,
//                       }
//                     : {}
//                   }
//                   className={`
//                     relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5
//                     rounded-xl text-sm font-semibold transition-all duration-200 border
//                     ${isActive
//                       ? `${activeBg} ${activeClass}`
//                       : "text-gray-400 hover:text-gray-600 hover:bg-white/50 border-transparent"
//                     }
//                   `}
//                 >
//                   <Icon className={`h-4 w-4 transition-colors ${isActive ? iconActiveColor : "text-gray-400"}`} />
//                   <span className="tracking-tight">{label}</span>

//                   {/* Count badge — always rendered with inline styles to avoid Tailwind purge */}
//                   <span
//                     style={isActive ? countActiveBgStyle : countInactiveBgStyle}
//                     className="px-2 py-0.5 rounded-full text-xs font-bold transition-colors"
//                   >
//                     {count}
//                   </span>

//                   {key === "inProgress" && isStreamConnected && (
//                     <span className="relative flex h-2 w-2">
//                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
//                       <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Panel card */}
//           <div className="mt-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//             <div className={`h-1 w-full ${
//               activeTab === "inProgress" ? "bg-blue-500" :
//               activeTab === "completed"  ? "bg-green-500" : "bg-red-500"
//             }`} />

//             <div className="p-5">
//               {activeTab === "inProgress" && (
//                 <StatusPanel
//                   statusKey="inProgress"
//                   title="In Progress"
//                   Icon={Clock}
//                   accentBadgeClass="bg-blue-100 text-blue-700"
//                   data={statusData.inProgress}
//                   error={statusData.error.inProgress}
//                   isLoading={statusData.loading.inProgress}
//                   lastFetched={statusData.lastFetched.inProgress}
//                   currentPage={currentPage.inProgress}
//                   onPageChange={handlePageChange}
//                   isStreaming={isStreamConnected}
//                 />
//               )}
//               {activeTab === "completed" && (
//                 <StatusPanelCompleted
//                   statusKey="completed"
//                   title="Completed"
//                   Icon={CheckCircle2}
//                   accentBadgeClass="bg-green-100 text-green-700"
//                   data={statusData.completed}
//                   error={statusData.error.completed}
//                   isLoading={statusData.loading.completed}
//                   lastFetched={statusData.lastFetched.completed}
//                   currentPage={currentPage.completed}
//                   onPageChange={handlePageChange}
//                 />
//               )}
//               {activeTab === "failed" && (
//                 <StatusPanelFailed
//                   statusKey="failed"
//                   title="Failed"
//                   Icon={XCircle}
//                   accentBadgeClass="bg-red-100 text-red-700"
//                   data={statusData.failed}
//                   error={statusData.error.failed}
//                   isLoading={statusData.loading.failed}
//                   lastFetched={statusData.lastFetched.failed}
//                   currentPage={currentPage.failed}
//                   onPageChange={handlePageChange}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Global loading indicator */}
//       {isAnyLoading && (
//         <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
//           <div className="flex items-center gap-2 text-sm text-gray-700">
//             <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
//             Fetching scan status...
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// SlideScanStatus.jsx - Fetch first, then stream updates (with explicit completed/failed branches)
import React, { useEffect, useState, useRef } from "react";
import {
  Microscope,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
} from "lucide-react";
import { StatusPanelCompleted } from "./StatusPanelCompleted";
import { StatusPanelFailed } from "./StatusPanelFailed";
import { StatusPanel } from "./StatusPanel";
import { BASE_URL } from "../../../utils/constants";
import AutocompleteInput from "./AutocompleteInput";
import apiClient from "../../../api/services/apiClient";

const TABS = [
  {
    key: "inProgress",
    label: "In Progress",
    Icon: Clock,
    accentBadgeClass: "bg-blue-100 text-blue-700",
    activeClass: "text-blue-700",
    activeBg: "bg-white",
    activeBorderColor: "rgb(59,130,246)",
    countActiveBgStyle: { backgroundColor: "rgb(59,130,246)", color: "#fff" },
    countInactiveBgStyle: { backgroundColor: "rgb(243,244,246)", color: "rgb(107,114,128)" },
    iconActiveColor: "text-blue-500",
    glowColor: "rgba(59,130,246,0.10)",
  },
  {
    key: "completed",
    label: "Completed",
    Icon: CheckCircle2,
    accentBadgeClass: "bg-green-100 text-green-700",
    activeClass: "text-green-700",
    activeBg: "bg-white",
    activeBorderColor: "rgb(34,197,94)",
    countActiveBgStyle: { backgroundColor: "rgb(34,197,94)", color: "#fff" },
    countInactiveBgStyle: { backgroundColor: "rgb(243,244,246)", color: "rgb(107,114,128)" },
    iconActiveColor: "text-green-500",
    glowColor: "rgba(34,197,94,0.10)",
  },
  {
    key: "failed",
    label: "Failed",
    Icon: XCircle,
    accentBadgeClass: "bg-red-100 text-red-700",
    activeClass: "text-red-700",
    activeBg: "bg-white",
    activeBorderColor: "rgb(239,68,68)",
    countActiveBgStyle: { backgroundColor: "rgb(239,68,68)", color: "#fff" },
    countInactiveBgStyle: { backgroundColor: "rgb(243,244,246)", color: "rgb(107,114,128)" },
    iconActiveColor: "text-red-500",
    glowColor: "rgba(239,68,68,0.10)",
  },
];

// Maps scanStatus string from API to our tab keys
const SCAN_STATUS_TO_TAB = {
  "in-progress": "inProgress",
  "inprogress": "inProgress",
  "in_progress": "inProgress",
  "completed": "completed",
  "failed": "failed",
};

// Priority order for auto-jump when multiple tabs have results (used for list search fallback)
const SEARCH_JUMP_PRIORITY = ["inProgress", "completed", "failed"];

const pageSize = 9;

/**
 * Converts a single slide object from /api/slides/{barcode} into a
 * pageable-shaped object that the status panels can render.
 */
const singleSlideToPageable = (slide) => ({
  content: [slide],
  totalElements: 1,
  totalPages: 1,
  page: 0,        // ← was: number: 0
  size: pageSize,
  hasNext: false,
  hasPrevious: false,
});

/**
 * Returns an empty pageable object (zero results).
 */
const emptyPageable = () => ({
  content: [],
  totalElements: 0,
  totalPages: 1,
  page: 0,        // ← was: number: 0
  size: pageSize,
  hasNext: false,
  hasPrevious: false,
});

/**
 * Normalises a pageable so totalElements / totalPages / number are always
 * safe finite integers — never undefined / null / NaN.
 */
const normalisePageable = (data) => {
  if (!data) return data;
  const totalElements = Number.isFinite(Number(data.totalElements))
    ? Number(data.totalElements) : 0;
  const totalPages = Number.isFinite(Number(data.totalPages))
    ? Math.max(1, Number(data.totalPages))
    : Math.max(1, Math.ceil(totalElements / pageSize));
  const page = Number.isFinite(Number(data.page ?? data.number))
    ? Number(data.page ?? data.number) : 0; 
  return { ...data, totalElements, totalPages, page };
};

export function SlideScanStatus() {
  const [statusData, setStatusData] = useState({
    completed: null,
    failed: null,
    inProgress: null,
    loading: { completed: false, failed: false, inProgress: false },
    error: {},
    lastFetched: { completed: null, failed: null, inProgress: null },
  });

  const [activeTab, setActiveTab] = useState("inProgress");
  const [barcodeFilter, setBarcodeFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ barcode: "", deviceId: "" });

  // Search state: idle | searching | found | not-found
  const [searchState, setSearchState] = useState("idle");

  const [autoRefresh, setAutoRefresh] = useState(true);

  // currentPage tracks the page index per tab (0-based)
  const [currentPage, setCurrentPage] = useState({ completed: 0, failed: 0, inProgress: 0 });

  // SSE refs
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Track previous in-progress count to detect drops (smart auto-refresh)
  const prevInProgressCountRef = useRef(null);

  // Stale-closure guards
  const currentPageRef = useRef(currentPage);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  const appliedFiltersRef = useRef(appliedFilters);
  useEffect(() => { appliedFiltersRef.current = appliedFilters; }, [appliedFilters]);

  const toApiStatus = (key) => (key === "inProgress" ? "in-progress" : key);

  // ── Core fetch — returns the response data ──
  const fetchData = async (statusKey, page, overrideFilters) => {
    setStatusData((prev) => ({
      ...prev,
      loading: { ...prev.loading, [statusKey]: true },
    }));

    try {
      const apiStatus = toApiStatus(statusKey);
      const filters = overrideFilters ?? appliedFiltersRef.current;
      const barcodeParam = filters.barcode
        ? `&searchTerm=${encodeURIComponent(filters.barcode)}`
        : "";

      const url = `${BASE_URL}/api/slide-scan-status/${apiStatus}?page=${page}&size=${pageSize}${barcodeParam}`;
      const response = await apiClient.get(url);
      const data = normalisePageable(response.data);

      setStatusData((prev) => {
        // Smart auto-refresh: detect in-progress count drop
        if (statusKey === "inProgress") {
          const newCount = data?.totalElements ?? 0;
          const oldCount = prevInProgressCountRef.current;

          if (oldCount !== null && newCount < oldCount) {
            const pageSnap = currentPageRef.current;
            setTimeout(() => {
              fetchData("completed", pageSnap.completed);
              fetchData("failed", pageSnap.failed);
            }, 0);
          }

          prevInProgressCountRef.current = newCount;
        }

        return {
          ...prev,
          [statusKey]: data,
          loading: { ...prev.loading, [statusKey]: false },
          lastFetched: { ...prev.lastFetched, [statusKey]: Date.now() },
          error: { ...prev.error, [statusKey]: undefined },
        };
      });

      return data;
    } catch (error) {
      setStatusData((prev) => ({
        ...prev,
        loading: { ...prev.loading, [statusKey]: false },
        error: { ...prev.error, [statusKey]: error.message || "Unknown error" },
      }));
      return null;
    }
  };

  const refreshPanelsForStatus = (normalizedStatus) => {
    const pageSnapshot = currentPageRef.current;
    if (normalizedStatus === "completed") fetchData("completed", pageSnapshot.completed);
    else if (normalizedStatus === "failed") fetchData("failed", pageSnapshot.failed);
    if (pageSnapshot.inProgress !== 0) fetchData("inProgress", pageSnapshot.inProgress);
  };

  const updateInProgressWithSSE = (slideData) => {
    const status = (slideData?.scanStatus ?? "").toString().trim().toLowerCase();

    setStatusData((prev) => {
      const currentData = prev.inProgress;
      if (!currentData || !currentData.content) return prev;

      let updatedContent = [...currentData.content];
      const existingIndex = updatedContent.findIndex((s) => s.id === slideData.id);

      if (status === "completed") {
        if (existingIndex !== -1) updatedContent.splice(existingIndex, 1);
        refreshPanelsForStatus("completed");
      } else if (status === "failed") {
        if (existingIndex !== -1) updatedContent.splice(existingIndex, 1);
        refreshPanelsForStatus("failed");
      } else {
        if (existingIndex !== -1) {
          updatedContent[existingIndex] = { ...updatedContent[existingIndex], ...slideData };
        } else {
          updatedContent.unshift(slideData);
          if (updatedContent.length > pageSize) updatedContent = updatedContent.slice(0, pageSize);
        }
      }

      const totalElements =
        status !== "completed" && status !== "failed" && existingIndex === -1
          ? currentData.totalElements + 1
          : (status === "completed" || status === "failed") && existingIndex !== -1
          ? Math.max(0, currentData.totalElements - 1)
          : currentData.totalElements;

      prevInProgressCountRef.current = totalElements;

      return {
        ...prev,
        inProgress: normalisePageable({
          ...currentData,
          content: updatedContent,
          totalElements,
          totalPages: Math.max(1, Math.ceil(totalElements / pageSize)),
        }),
        lastFetched: { ...prev.lastFetched, inProgress: Date.now() },
      };
    });
  };


const connectToInProgressStream = () => {
  if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = null;
  }
  if (eventSourceRef.current) {
    eventSourceRef.current.close();
    eventSourceRef.current = null;
  }

  // ✅ Read XSRF-TOKEN from cookie and pass as query param
  // EventSource does not support custom headers — this is the only way
  // to send the CSRF token for SSE endpoints with Spring Security.
  const xsrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  const tokenParam = xsrfToken
    ? `?_xsrf=${encodeURIComponent(decodeURIComponent(xsrfToken))}`
    : "";

  const url = `${BASE_URL}/api/slide-scan-status/stream/in-progress${tokenParam}`;

  try {
    // ✅ withCredentials: true — sends SESSION cookie automatically
    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsStreamConnected(true);
      setReconnectAttempts(0);
    };

    eventSource.addEventListener("slide_scan_status", (event) => {
      try { updateInProgressWithSSE(JSON.parse(event.data)); }
      catch (e) { console.error("SSE parse error:", e); }
    });

    eventSource.onmessage = (event) => {
      try { updateInProgressWithSSE(JSON.parse(event.data)); }
      catch (e) { console.error("SSE parse error:", e); }
    };

    eventSource.onerror = () => {
      setIsStreamConnected(false);
      if (eventSource.readyState === EventSource.CLOSED) {
        setStatusData((prev) => ({
          ...prev,
          error: {
            ...prev.error,
            inProgress: reconnectAttempts > 3
              ? "Stream connection failed. Please refresh manually."
              : undefined,
          },
        }));

        if (reconnectAttempts < 5) {
          const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connectToInProgressStream();
          }, delay);
        }
      }
    };
  } catch (error) {
    setStatusData((prev) => ({
      ...prev,
      error: { ...prev.error, inProgress: `Connection error: ${error.message}` },
    }));
  }
};

  // Initial load
  useEffect(() => {
    fetchData("failed", 0, null);
    fetchData("completed", 0, null);
    fetchData("inProgress", 0, null).then((data) => {
      if (data) {
        prevInProgressCountRef.current = data.totalElements ?? 0;
        connectToInProgressStream();
      }
    });

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smart auto-refresh: only polls in-progress; completed/failed fire only on count drop
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData("inProgress", currentPageRef.current.inProgress, null);
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  // Re-fetch inProgress on page change (SSE covers page 0 live)
  useEffect(() => {
    if (currentPage.inProgress !== 0) fetchData("inProgress", currentPage.inProgress, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage.inProgress]);

  const handleRefresh = () => {
    fetchData("failed", currentPageRef.current.failed, null);
    fetchData("completed", currentPageRef.current.completed, null);
    fetchData("inProgress", currentPageRef.current.inProgress, null);
    setReconnectAttempts(0);
    connectToInProgressStream();
  };

  // ── Fixed pagination ──
  // Reads current page from the ref (avoids stale closure) and writes the
  // new page into both state AND the ref atomically so rapid clicks are safe.
  const handlePageChange = (tab, direction) => {

    const currentPageNum = currentPageRef.current[tab];
    const totalPages = statusData[tab]?.totalPages ?? 1;
        
    const nextVal = Math.min(currentPageNum + 1, totalPages - 1);
    const preVal = Math.max(0, currentPageNum - 1);
    // const newPage =
    //   direction === "next"
    //     ? Math.min(currentPageNum + 1, totalPages - 1)
    //     : Math.max(0, currentPageNum - 1) ;

        const newPage =
      direction === "next"
        ? nextVal
        : preVal ;
        
{  console.log("direction: "+ direction+ ",pVal:"+preVal+"nVal: "+ nextVal)} 

    // No-op if page hasn't changed
    if (newPage === currentPageNum) return;

    // Update ref immediately so rapid successive calls see the latest value
    currentPageRef.current = { ...currentPageRef.current, [tab]: newPage };



    setCurrentPage((prev) => ({ ...prev, [tab]: newPage }));

    //if (tab !== "inProgress") {
      fetchData(tab, newPage, null);
    //}
    {  console.log("currentPageNum: "+ currentPageNum+ ",totalPages: "+ totalPages )} 
  };

  // ── Barcode search: call /api/slides/{barcode}, convert to pageable ──
  const handleApplyFilters = async () => {
    const trimmed = barcodeFilter.trim();
    if (!trimmed) return;

    setAppliedFilters({ barcode: trimmed, deviceId: "" });
    setCurrentPage({ completed: 0, failed: 0, inProgress: 0 });
    currentPageRef.current = { completed: 0, failed: 0, inProgress: 0 };
    setSearchState("searching");

    try {
      // Call the barcode lookup endpoint
      const response = await apiClient.get(`${BASE_URL}/api/slide-scan-status/barcode/${encodeURIComponent(trimmed)}`);
      const slide = response.data;

      if (!slide) {
        setStatusData((prev) => ({
          ...prev,
          inProgress: emptyPageable(),
          completed: emptyPageable(),
          failed: emptyPageable(),
        }));
        setSearchState("not-found");
        setActiveTab("inProgress");
        return;
      }

      // Normalise scanStatus to a tab key
      const rawStatus = (slide.scanStatus ?? "").toString().trim().toLowerCase();
      const matchedTab = SCAN_STATUS_TO_TAB[rawStatus] ?? null;

      // Build per-tab pageable data: the matched tab gets the record; others get empty
      const inProgressData = matchedTab === "inProgress" ? singleSlideToPageable(slide) : emptyPageable();
      const completedData  = matchedTab === "completed"  ? singleSlideToPageable(slide) : emptyPageable();
      const failedData     = matchedTab === "failed"     ? singleSlideToPageable(slide) : emptyPageable();

      setStatusData((prev) => ({
        ...prev,
        inProgress: inProgressData,
        completed: completedData,
        failed: failedData,
        lastFetched: {
          inProgress: Date.now(),
          completed: Date.now(),
          failed: Date.now(),
        },
        error: {},
      }));

      if (matchedTab) {
        setActiveTab(matchedTab);
        setSearchState("found");
      } else {
        setSearchState("not-found");
        setActiveTab("inProgress");
      }
    } catch (err) {
      setStatusData((prev) => ({
        ...prev,
        inProgress: emptyPageable(),
        completed: emptyPageable(),
        failed: emptyPageable(),
        error: {},
      }));
      setSearchState("not-found");
      setActiveTab("inProgress");
    }
  };

  // Clear search — restore unfiltered view, reset search state
  const handleClearSearch = () => {
    setBarcodeFilter("");
    const emptyFilters = { barcode: "", deviceId: "" };
    setAppliedFilters(emptyFilters);
    setCurrentPage({ completed: 0, failed: 0, inProgress: 0 });
    currentPageRef.current = { completed: 0, failed: 0, inProgress: 0 };
    setSearchState("idle");
    setActiveTab("inProgress");

    fetchData("inProgress", 0, emptyFilters);
    fetchData("completed", 0, emptyFilters);
    fetchData("failed", 0, emptyFilters);
  };

  const isAnyLoading =
    statusData.loading.completed || statusData.loading.failed || statusData.loading.inProgress;
  const isSearchActive = !!appliedFilters.barcode;
  const isSearching = searchState === "searching";

  // Always return a safe number (0 fallback) so the badge always renders
  const getTabCount = (key) => {
    const val = statusData[key]?.totalElements;
    return Number.isFinite(Number(val)) ? Number(val) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Microscope className="h-7 w-7 text-indigo-600" />
              Slide Scan Status Monitor
            </h1>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              Real-time monitoring of slide scanning operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AutocompleteInput
                options={[]}
                value={barcodeFilter}
                onChange={setBarcodeFilter}
                placeholder="Search barcode…"
                emptyText="Enter exact barcode to search"
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              />

              <button
                onClick={handleApplyFilters}
                disabled={!barcodeFilter.trim() || isSearching}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching
                  ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  : <Search className="h-3.5 w-3.5" />
                }
                {isSearching ? "Searching…" : "Search"}
              </button>

              {isSearchActive && (
                <button
                  onClick={handleClearSearch}
                  className="px-3 py-2 bg-amber-50 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={isAnyLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isAnyLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search result banners */}
        {searchState === "found" && isSearchActive && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <span>Found barcode</span>
            <code className="px-2 py-0.5 bg-green-100 rounded font-mono text-green-900 text-xs">
              {appliedFilters.barcode}
            </code>
            <span className="text-green-600">— jumped to the matching tab.</span>
          </div>
        )}

        {searchState === "not-found" && isSearchActive && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>No results found for barcode</span>
            <code className="px-2 py-0.5 bg-red-100 rounded font-mono text-red-900 text-xs">
              {appliedFilters.barcode}
            </code>
            <span className="text-red-500 text-xs">across all statuses.</span>
          </div>
        )}

        {/* Tab bar */}
        <div>
          <div className="flex gap-2 bg-gray-100/80 rounded-2xl p-1.5 border border-gray-200/60 shadow-inner">
            {TABS.map(({
              key, label, Icon,
              activeClass, activeBg, activeBorderColor,
              countActiveBgStyle, countInactiveBgStyle,
              iconActiveColor, glowColor,
            }) => {
              const count = getTabCount(key);
              const isActive = activeTab === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={isActive
                    ? {
                        boxShadow: `0 2px 16px 0 ${glowColor}, 0 1px 4px 0 rgba(0,0,0,0.07)`,
                        borderColor: activeBorderColor,
                      }
                    : {}
                  }
                  className={`
                    relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                    rounded-xl text-sm font-semibold transition-all duration-200 border
                    ${isActive
                      ? `${activeBg} ${activeClass}`
                      : "text-gray-400 hover:text-gray-600 hover:bg-white/50 border-transparent"
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? iconActiveColor : "text-gray-400"}`} />
                  <span className="tracking-tight">{label}</span>

                  {/* Count badge — always rendered with inline styles to avoid Tailwind purge */}
                  <span
                    style={isActive ? countActiveBgStyle : countInactiveBgStyle}
                    className="px-2 py-0.5 rounded-full text-xs font-bold transition-colors"
                  >
                    {count}
                  </span>

                  {key === "inProgress" && isStreamConnected && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Panel card */}
          <div className="mt-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className={`h-1 w-full ${
              activeTab === "inProgress" ? "bg-blue-500" :
              activeTab === "completed"  ? "bg-green-500" : "bg-red-500"
            }`} />

            <div className="p-5">
              {activeTab === "inProgress" && (
                <StatusPanel
                  statusKey="inProgress"
                  title="In Progress"
                  Icon={Clock}
                  accentBadgeClass="bg-blue-100 text-blue-700"
                  data={statusData.inProgress}
                  error={statusData.error.inProgress}
                  isLoading={statusData.loading.inProgress}
                  lastFetched={statusData.lastFetched.inProgress}
                  currentPage={currentPage.inProgress}
                  onPageChange={handlePageChange}
                  isStreaming={isStreamConnected}
                />
              )}
              {activeTab === "completed" && (
                <StatusPanelCompleted
                  statusKey="completed"
                  title="Completed"
                  Icon={CheckCircle2}
                  accentBadgeClass="bg-green-100 text-green-700"
                  data={statusData.completed}
                  error={statusData.error.completed}
                  isLoading={statusData.loading.completed}
                  lastFetched={statusData.lastFetched.completed}
                  currentPage={currentPage.completed}
                  onPageChange={handlePageChange}
                />
              )}
              {activeTab === "failed" && (
                <StatusPanelFailed
                  statusKey="failed"
                  title="Failed"
                  Icon={XCircle}
                  accentBadgeClass="bg-red-100 text-red-700"
                  data={statusData.failed}
                  error={statusData.error.failed}
                  isLoading={statusData.loading.failed}
                  lastFetched={statusData.lastFetched.failed}
                  currentPage={currentPage.failed}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global loading indicator */}
      {isAnyLoading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
            Fetching scan status...
          </div>
        </div>
      )}
    </div>
  );
}