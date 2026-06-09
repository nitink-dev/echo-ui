import { Plus, Search } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { useFeaturePermissions } from "../../../../auth/permissions/useFeaturePermissions";
import { PermissionGuard } from "../../../../auth/permissions/PermissionGuard";

interface ScannerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddScanner: () => void;
}

export function ScannerFilters({
  searchTerm,
  onSearchChange,
  onAddScanner,
}: ScannerFiltersProps) {

  const { scanners: scannerPermissions } = useFeaturePermissions();

  return (
    <div className="grid grid-cols-12 gap-6 items-center py-4 min-h-[80px]">
      <div className="col-span-12 lg:col-span-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Slide Scanners
        </h1>
        <p className="text-sm text-gray-600">
          Manage and monitor your slide scanning devices across all facilities
        </p>
      </div>
      <div className="col-span-12 lg:col-span-6 flex items-center gap-3 lg:justify-end">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search Scanner by any field"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 bg-white border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard allowed={scannerPermissions.canCreate}>
            <Button
              onClick={onAddScanner}
              className="bg-[#007BFF] hover:bg-[#0056cc] text-white px-4 h-10 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add New Scanner</span>
            </Button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}