import { Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { usePermissions } from "../../../../hooks/usePermissions";
import { QASlideParameter } from "../../../../types/qa.types";
import { Button } from "../../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { useSlideScan } from "../../status/SlideScanContext";

interface QAParameterTableProps {
  qaParameters: QASlideParameter[];
  visibleActivationCodes: { [id: string]: boolean };
  onAddParameter: () => void;
  onEditParameter: (parameter: QASlideParameter) => void;
  onDeleteParameter: (parameter: QASlideParameter) => void;
  onToggleVisibility: (id: string) => void;
}

export function QAParameterTable({
  qaParameters,
  visibleActivationCodes,
  onAddParameter,
  onEditParameter,
  onDeleteParameter,
  onToggleVisibility,
}: QAParameterTableProps) {
  const { canWrite, canDelete: canDeleteFn } = usePermissions();
  const canAdd = canWrite("qa-analysis");
  const canEdit = canWrite("qa-analysis");
  const canDelete = canDeleteFn("qa-analysis");
  const { inProgressCount } = useSlideScan();
  const isScanInProgress = inProgressCount > 0;

  if (!qaParameters || qaParameters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">
          No QA parameters configured
        </div>
        <p className="text-gray-600 mb-4">
          Add barcode and activation code pairs to get started
        </p>
        {canAdd && (
          <Button
            onClick={onAddParameter}
            disabled={isScanInProgress}
            title={
              isScanInProgress
                ? "A slide scan is currently in progress. Adding new parameters is disabled."
                : "Add First Parameter"
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Parameter
          </Button>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>QA Slide Barcode</TableHead>
          <TableHead>Activation Code</TableHead>
          {canEdit || canDelete ? (
            <TableHead className="w-[220px]">Actions</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {qaParameters.map((parameter) => (
          <TableRow key={parameter.barcode}>
            <TableCell className="font-mono">{parameter.barcode}</TableCell>
            <TableCell className="font-mono relative flex items-center gap-2">
              {visibleActivationCodes[parameter.barcode]
                ? parameter.activationCode
                : "******"}
              <button
                type="button"
                onClick={() => onToggleVisibility(parameter.barcode)}
                className="text-gray-400 hover:text-gray-600"
              >
                {visibleActivationCodes[parameter.barcode] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </TableCell>

            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditParameter(parameter)}
                    disabled={isScanInProgress}
                    title={
                      isScanInProgress
                        ? "A slide scan is currently in progress. Editing is disabled."
                        : "Edit Parameter"
                    }
                    className="min-w-0"
                    title="Edit Parameter"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteParameter(parameter)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300 min-w-0"
                    title="Delete Parameter"
                    disabled={isScanInProgress}
                    title={
                      isScanInProgress
                        ? "A slide scan is currently in progress. Deleting parameters is disabled."
                        : "Delete Parameter"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
