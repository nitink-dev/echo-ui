import { ArrowLeft, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner@2.0.3";
import { useAppDispatch } from "../../../../hooks";
import {
  fetchDicomStores,
  fetchHospitalMetadata,
} from "../../../../store/slices/metadataSlice";
import { checkScannerExists } from "../../../../store/slices/scannerSlice";
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
import { ScannerFormFields } from "./ScannerFormFields";
import { useScannerForm } from "./useScannerForm";

interface ScannerFormProps {
  scanner?: SlideScanner;
  onSave: (scanner: SlideScanner | Partial<SlideScanner>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function ScannerForm({
  scanner,
  onSave,
  onCancel,
  isEdit = false,
}: ScannerFormProps) {
  const dispatch = useAppDispatch();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [dicomStore, setDicomStore] = useState<Record<string, string[]>>({});
  const [checkingSerialNumber, setCheckingSerialNumber] = useState(false);

  const { hospitals, locations, departments, dicomStores, loading } =
    useSelector((state: any) => state.metadata);

  const {
    formData,
    originalData,
    errors,
    isDirty,
    isFormValid,
    handleInputChange,
    validateForm,
    resetForm,
    setFieldError,
    getChangedFields,
  } = useScannerForm(scanner);

  useEffect(() => {
    dispatch(fetchHospitalMetadata());
    dispatch(fetchDicomStores());
  }, [dispatch]);

  useEffect(() => {
    if (dicomStores) {
      setDicomStore(dicomStores);
    }
  }, [dicomStores]);

  useEffect(() => {
    if (
      dicomStore &&
      scanner?.dicomStore &&
      scanner?.department &&
      dicomStore[scanner.department]?.includes(scanner.dicomStore)
    ) {
      handleInputChange("dicomStore", scanner.dicomStore);
    }
  }, [dicomStore, scanner]);

  const handleSerialNumberBlur = async () => {
    if (
      isEdit ||
      !formData.deviceSerialNumber ||
      formData.deviceSerialNumber.trim() === ""
    ) {
      return;
    }

    setCheckingSerialNumber(true);

    try {
      const result = await dispatch(
        checkScannerExists(formData.deviceSerialNumber),
      ).unwrap();

      if (result) {
        setFieldError(
          "deviceSerialNumber",
          "This serial number already exists in the database",
        );
        toast.error("Serial number already exists");
      } else {
        setFieldError("deviceSerialNumber", "");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to validate serial number: " + errorMessage);
    } finally {
      setCheckingSerialNumber(false);
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    if (isEdit) {
      const changedFields = getChangedFields();

      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const patchData: Partial<SlideScanner> = {
        ...changedFields,
        deviceSerialNumber: formData.deviceSerialNumber,
      };

      onSave(patchData);
    } else {
      const scannerData: SlideScanner = {
        ...formData,
      };

      onSave(scannerData);
    }
  };

  const handleReset = () => {
    resetForm();
    toast.info("Form reset");
  };

  const handleCancel = () => {
    if (isDirty) {
      setCancelDialogOpen(true);
    } else {
      onCancel();
    }
  };

  const handleCancelConfirm = () => {
    setCancelDialogOpen(false);
    onCancel();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="hover:bg-[#f8faff] border-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? "Edit Scanner" : "Add New Scanner"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? "Modify scanner configuration and details"
              : "Register a new slide scanner in the system"}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Scanner Information
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Please fill in all required fields marked with an asterisk (*)
          </p>
        </div>

        <div className="p-6 space-y-8">
          <ScannerFormFields
            formData={formData}
            errors={errors}
            isEdit={isEdit}
            hospitals={hospitals}
            departments={departments}
            locations={locations}
            dicomStores={dicomStore}
            onInputChange={handleInputChange}
            onSerialNumberBlur={handleSerialNumberBlur}
            checkingSerialNumber={checkingSerialNumber}
          />

          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={!isFormValid}
                className={`px-6 py-2.5 ${
                  isFormValid
                    ? "bg-[#007BFF] hover:bg-[#0056cc] text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? "Update Scanner" : "Save Scanner"}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="px-6 py-2.5 border-gray-200 hover:bg-[#f8faff] hover:border-[#007BFF]"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 py-2.5 border-gray-200 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? Your changes will be lost and
              cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
