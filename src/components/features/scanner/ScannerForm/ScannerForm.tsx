// src/components/features/scanner/ScannerForm/ScannerForm.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, X } from 'lucide-react';
import { Button } from '../../../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../../hooks';
import { SlideScanner } from '../../../../types/scanner.types';
import { useScannerForm } from './useScannerForm';
import { fetchDicomStores, fetchHospitalMetadata } from '../../../../store/slices/metadataSlice';
import { ScannerFormFields } from './ScannerFormFields';

interface ScannerFormProps {
  scanner?: SlideScanner;
  onSave: (scanner: SlideScanner) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function ScannerForm({ scanner, onSave, onCancel, isEdit = false }: ScannerFormProps) {
  const dispatch = useAppDispatch();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [dicomStore, setDicomStore] = useState<Record<string, string[]>>({});

  const { hospitals, locations, departments, dicomStores, loading } = useSelector(
    (state: any) => state.metadata
  );

  const {
    formData,
    errors,
    isDirty,
    isFormValid,
    handleInputChange,
    validateForm,
    resetForm
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

  const handleSave = () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const scannerData: SlideScanner = {
      ...formData,
      ...(scanner?.id && { id: scanner.id })
    };

    onSave(scannerData);
  };

  const handleReset = () => {
    resetForm();
    toast.info('Form reset');
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
    <div className="p-8 space-y-8">
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
          <h1 className="text-3xl font-semibold text-gray-900">
            {isEdit ? 'Edit Scanner' : 'Add New Scanner'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Modify scanner configuration and details' : 'Register a new slide scanner in the system'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Scanner Information</h2>
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
          />

          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={!isFormValid}
                className={`px-6 py-2.5 ${
                  isFormValid 
                    ? 'bg-[#007BFF] hover:bg-[#0056cc] text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Update Scanner' : 'Save Scanner'}
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
              Are you sure you want to cancel? Your changes will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}