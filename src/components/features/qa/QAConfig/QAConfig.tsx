import React from 'react';
import { BarChart3, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../ui/alert-dialog';
import { DicomStoreConfig } from './DicomStoreConfig';
import { QAParameterTable } from './QAParameterTable';
import { useQAConfig } from './useQAConfig';
import { QAParameterForm } from './QAParameterForm';

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
    handleAddParameter,
    handleEditParameter,
    handleParameterInputChange,
    handleSaveParameter,
    handleDeleteClick,
    handleDeleteConfirm,
    toggleActivationCodeVisibility,
    handleSaveDicomStore
  } = useQAConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Slide Image Analysis</h1>
        <p className="text-gray-600 mt-1">Manage QA parameters and DICOM store configuration</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                QA Slide Parameters
              </CardTitle>
              <CardDescription>Manage barcode and activation code pairs for QA slides</CardDescription>
            </div>
            <Button onClick={handleAddParameter} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete QA Parameter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the QA parameter with barcode "{parameterToDelete?.barcode}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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