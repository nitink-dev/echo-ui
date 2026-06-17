import { Edit, Eye, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { updateScanner } from "../../../../store/slices/scannerSlice";
import { AppDispatch } from "../../../../store/store";
import { SlideScanner } from "../../../../types/scanner.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { Button } from "../../../ui/button";
import { Checkbox } from "../../../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { Switch } from "../../../ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { PermissionGuard } from "../../../../auth/permissions/PermissionGuard";
import { useSlideScan } from "../../status/SlideScanContext";
import { usePermissions } from "../../../../auth/permissions/usePermissions";
import { API_URLS } from "../../../../auth/permissions/apiConfig";

interface ScannerTableProps {
  scanners: SlideScanner[];
  onViewScanner: (scanner: SlideScanner) => void;
  onEditScanner: (scanner: SlideScanner) => void;
  onDeleteScanner: (id: string) => void;
  onAddScanner: () => void;
}

export function ScannerTable({
  scanners,
  onViewScanner,
  onEditScanner,
  onDeleteScanner,
  onAddScanner,
}: ScannerTableProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scannerToDelete, setScannerToDelete] = useState<SlideScanner | null>(
    null,
  );

  const { canAccess } = usePermissions();
  const canEditScanner = canAccess(API_URLS.scanners.update.path, API_URLS.scanners.update.method);
  const canCreateScanner = canAccess(API_URLS.scanners.create.path, API_URLS.scanners.create.method);
  const canDeleteScanner = canAccess(API_URLS.scanners.delete.path, API_URLS.scanners.delete.method);

  const initialConnected = useMemo(() => {
    const map: Record<string, boolean> = {};
    scanners.forEach((s) => {
      map[s.deviceSerialNumber] = (s as any).connected ?? false;
    });
    return map;
  }, [scanners]);

  const initialResearch = useMemo(() => {
    const map: Record<string, boolean> = {};
    scanners.forEach((s) => {
      map[s.deviceSerialNumber] = (s as any).research ?? false;
    });
    return map;
  }, [scanners]);

  const [connectedMap, setConnectedMap] =
    useState<Record<string, boolean>>(initialConnected);
  const [researchMap, setResearchMap] =
    useState<Record<string, boolean>>(initialResearch);

    const { inProgressCount } = useSlideScan();
    const isScanInProgress = inProgressCount > 0;

  useEffect(() => setConnectedMap(initialConnected), [initialConnected]);
  useEffect(() => setResearchMap(initialResearch), [initialResearch]);

  const handleDeleteClick = (scanner: SlideScanner) => {
    setScannerToDelete(scanner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (scannerToDelete) {
      onDeleteScanner(scannerToDelete.deviceSerialNumber);
      setDeleteDialogOpen(false);
      setScannerToDelete(null);
    }
  };

  if (scanners.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-[#f0f7ff] rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-[#007BFF]" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No registered scanners
        </h3>
        <PermissionGuard allowed={canCreateScanner}>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Click "Add New Scanner" to register your first scanner.
          </p>
           <Button
          onClick={onAddScanner}
          disabled={isScanInProgress}
          title={
            isScanInProgress? "A slide scan is currently in progress. Adding new scanners is disabled."
              : "undefined"
          }
          className="bg-[#007BFF] hover:bg-[#0056cc] text-white px-6 py-2.5"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Scanner
        </Button>
        </PermissionGuard>

      </div>
    );
  }

  return (
    <>
      <Table className="w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-gray-200 bg-gray-50">
            <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[26%]">
              Scanner Details
            </TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[14%]">
              AE Title
            </TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[18%]">
              Model &amp; Serial
            </TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[20%]">
              Location
            </TableHead>
            {/* Research (visible header) */}
            <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[12%]">
              Research
            </TableHead>
            {/* Connected (hidden header) */}
            <TableHead className="px-4 py-3 w-[6%]"></TableHead>
            {/* Actions */}
            <TableHead className="w-[4%] px-4 py-3" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {scanners.map((scanner, index) => {
            const key = scanner.deviceSerialNumber;
            const connected =
              connectedMap[key] ?? (scanner as any).connected ?? false;
            const research =
              researchMap[key] ?? (scanner as any).research ?? false;
            const researchDisabled = true;
            const dispatchUpdate = async (partial: Partial<SlideScanner>) => {
              try {
                const payload: SlideScanner = {
                  ...scanner,
                  ...partial,
                } as SlideScanner;
                await dispatch(updateScanner(payload)).unwrap();
              } catch (err) {
                connectedMap[key] = !scanner.connected;
                toast.error("Failed to update scanner:" + (err as any).message);
              }
            };

            return (
              <TableRow
                key={key}
                className={`cursor-pointer hover:bg-[#f8faff] border-gray-200 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
              >
                <TableCell
                  className="px-4 py-3"
                  onClick={() => onViewScanner(scanner)}
                >
                  <div>
                    <div className="font-semibold text-gray-900 text-sm truncate">
                      {scanner.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {scanner.department}
                    </div>
                  </div>
                </TableCell>

                <TableCell
                  className="px-4 py-3"
                  onClick={() => onViewScanner(scanner)}
                >
                  <code className="bg-[#e8f2ff] text-[#007BFF] px-2 py-1 rounded text-xs font-medium border border-[#c7e2ff] block w-fit">
                    {scanner.aeTitle}
                  </code>
                </TableCell>

                <TableCell
                  className="px-4 py-3"
                  onClick={() => onViewScanner(scanner)}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {scanner.model}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {scanner.deviceSerialNumber}
                    </div>
                  </div>
                </TableCell>

                {/* Location */}
                <TableCell
                  className="px-4 py-3"
                  onClick={() => onViewScanner(scanner)}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {scanner.location}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {scanner.hospitalName}
                    </div>
                  </div>
                </TableCell>

                {/* Research (checkbox) */}
                <TableCell
                  className="px-4 py-3"
                  onClick={() => onViewScanner(scanner)}
                >
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={!!research}
                      disabled={researchDisabled}
                      onCheckedChange={(checked) => {
                        const next = Boolean(checked);
                        setResearchMap((prev) => ({ ...prev, [key]: next }));
                        dispatchUpdate({ research: next });
                      }}
                      aria-label="Research"
                    />
                    <span className="text-xs text-gray-600">
                      {research ? "Yes" : "No"}
                    </span>
                  </div>
                </TableCell>

                <TableCell
                  className="px-4 py-3 "
                  width="120px"
                  onClick={() => onViewScanner(scanner)}
                >
                  <div
                    className="flex flex-col items-start"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      title={
                        isScanInProgress
                          ? "A slide scan is currently in progress. Scanner connection cannot be changed."
                          : !canEditScanner
                            ? "You do not have permission to edit scanner connection."
                            : undefined
                      }
                    >
                      <Switch
                        checked={!!connected}
                        disabled={!canEditScanner || isScanInProgress}
                        onCheckedChange={(checked) => {
                          if (!canEditScanner || isScanInProgress) return;

                          const next = Boolean(checked);
                          setConnectedMap((prev) => ({ ...prev, [key]: next }));
                          dispatchUpdate({ connected: next });
                        }}
                        aria-label="Connected"
                      />
                    </div>

                    <span
                      className={`mt-1 text-sm ${
                        connected ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {connected ? "Connected" : "Not Connected"}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-[#f0f7ff]"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onViewScanner(scanner)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <PermissionGuard allowed={canEditScanner}>
                        <DropdownMenuItem
                          onClick={() => onEditScanner(scanner)}
                             disabled={isScanInProgress}
                        title={
                          isScanInProgress? "A slide scan is currently in progress. Viewing scanner details is disabled."
                          : "undefined"
                        }
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                      </PermissionGuard>
                      <DropdownMenuSeparator />
                      <PermissionGuard allowed={canDeleteScanner}>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(scanner)}
                             disabled={isScanInProgress}
                        title={
                          isScanInProgress? "A slide scan is currently in progress. Viewing scanner details is disabled."
                          : "undefined"
                        }
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </PermissionGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scanner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scannerToDelete?.name}"? This
              action cannot be undone.
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
    </>
  );
}