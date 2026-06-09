import { BarChart3, Plus } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { DicomStoreConfig } from "./DicomStoreConfig";
import { QAParameterForm } from "./QAParameterForm";
import { QAParameterTable } from "./QAParameterTable";
import { useQAConfig } from "./useQAConfig";
import { PermissionGuard } from "../../../../auth/permissions/PermissionGuard";
import { useFeaturePermissions } from "../../../../auth/permissions/useFeaturePermissions";
import { useSlideScan } from "../../status/SlideScanContext";

export function QAConfig() {
  const {
    qaParameters,
    dicomStores,
    dicomStoreAddress,
    parameterModalOpen,
    editingParameter,
    parameterFormData,
    parameterErrors,
    deleteDialogOpen,
    parameterToDelete,
    visibleActivationCodes,
    setParameterModalOpen,
    setDeleteDialogOpen,
    handleAddParameter,
    handleEditParameter,
    handleParameterInputChange,
    handleSaveParameter,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    toggleActivationCodeVisibility,
    handleSaveDicomStore,
  } = useQAConfig();

  const { qaAnalysis: qaPermissions } = useFeaturePermissions();
  
  const { inProgressCount } = useSlideScan();
  const isScanInProgress = inProgressCount > 0;
  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Slide Image Analysis
        </h1>
        <p className="text-gray-600 mt-1">
          Manage QA parameters and DICOM store configuration
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                QA Slide Parameters
              </CardTitle>
              <CardDescription>
                Manage barcode and activation code pairs for QA slides
              </CardDescription>
            </div>
              <PermissionGuard allowed={qaPermissions.canCreate}>
                <Button
                onClick={handleAddParameter}
                disabled={isScanInProgress}
                title={
                  isScanInProgress ? "A slide scan is currently in progress. Adding new parameters is disabled."
                  : undefined
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
              </PermissionGuard>
            
          </div>
        </CardHeader>
        <CardContent>
          <QAParameterTable
            qaParameters={qaParameters}
            visibleActivationCodes={visibleActivationCodes}
            onAddParameter={handleAddParameter}
            onEditParameter={handleEditParameter}
            onDeleteParameter={handleDeleteClick}
            onToggleVisibility={toggleActivationCodeVisibility}
          />
        </CardContent>
      </Card>

      <DicomStoreConfig
        dicomStores={dicomStores}
        dicomStoreAddress={dicomStoreAddress}
        onSave={handleSaveDicomStore}
      />

      <QAParameterForm
        open={parameterModalOpen}
        onOpenChange={setParameterModalOpen}
        editingParameter={editingParameter}
        formData={parameterFormData}
        errors={parameterErrors}
        onInputChange={handleParameterInputChange}
        onSave={handleSaveParameter}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete QA Parameter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the QA parameter with barcode "
              {parameterToDelete?.barcode}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
