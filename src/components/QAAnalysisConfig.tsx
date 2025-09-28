import React, { useState,useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, BarChart3, Database, Download, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import axios from "axios";

interface QASlideParameter {
  id: string;
  barcode: string;
  activationCode: string;
  dicomWebUrl:String;
  
}

interface QAAnalysisConfigProps {
  // Props could be added here for external state management
}

interface ParameterFormData {
  barcode: string;
  activationCode: string;  
}

const initialFormData: ParameterFormData = {
  barcode: '',
  activationCode: ''
};

export function QAAnalysisConfig({}: QAAnalysisConfigProps) {
  const BASE_URL="http://localhost:8081/api";
  const [qaParameters, setQAParameters] = useState<QASlideParameter[]>([]);
  const [dicomStoreAddress, setDicomStoreAddress] = useState('projects/endeavor-health/locations/us-central1/datasets/pathology/dicomStores/qa-slides');
  const [isEditingDicom, setIsEditingDicom] = useState(false);
  const [tempDicomAddress, setTempDicomAddress] = useState(dicomStoreAddress);

  
  // Parameter modal state
  const [parameterModalOpen, setParameterModalOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<QASlideParameter | null>(null);
  const [parameterFormData, setParameterFormData] = useState<ParameterFormData>(initialFormData);
  const [parameterErrors, setParameterErrors] = useState<{[key: string]: string}>({});
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parameterToDelete, setParameterToDelete] = useState<QASlideParameter | null>(null);

  // Handle opening add parameter modal
  const handleAddParameter = () => {
    setEditingParameter(null);
    setParameterFormData(initialFormData);
    setParameterErrors({});
    setParameterModalOpen(true);
  };

useEffect(() => {
  const fetchQAParameters = async () => {
    try {
      const res = await axios.get(BASE_URL+"/slides", {
        headers: {
              "Accept": "application/json"
        }
      });
      const apislides = res.data.qaSlides.map((slide: any) => ({
        id: slide.id,
        barcode: slide.barcode,
        activationCode: slide.activationCode     
      }));
      setQAParameters(apislides) ;
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  };

  fetchQAParameters();
}, []);



  // Handle opening edit parameter modal
  const handleEditParameter = (parameter: QASlideParameter) => {
    setEditingParameter(parameter);
    setParameterFormData({
      barcode: parameter.barcode,
      activationCode: parameter.activationCode
    });
    setParameterErrors({});
    setParameterModalOpen(true);
  };

  // Handle parameter form input changes
  const handleParameterInputChange = (field: keyof ParameterFormData, value: string) => {
    setParameterFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (parameterErrors[field]) {
      setParameterErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate parameter form
  const validateParameterForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!parameterFormData.barcode.trim()) {
      errors.barcode = 'QA Slide Barcode is required';
    } else if (parameterFormData.barcode.length < 5) {
      errors.barcode = 'Barcode must be at least 5 characters long';
    }

    if (!parameterFormData.activationCode.trim()) {
      errors.activationCode = 'Activation Code is required';
    } else if (parameterFormData.activationCode.length < 6) {
      errors.activationCode = 'Activation Code must be at least 6 characters long';
    }

    // Check for duplicate barcode (except when editing)
    const isDuplicate = qaParameters.some(param => 
      param.barcode === parameterFormData.barcode && 
      param.id !== editingParameter?.id
    );
    
    if (isDuplicate) {
      errors.barcode = 'This barcode already exists';
    }

    setParameterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle saving parameter
  const handleSaveParameter = async ()  => {
    if (!validateParameterForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    const payload = {"barcode":parameterFormData.barcode,"activationCode":parameterFormData.activationCode,"dicomWebUrl" :"null"}
    try{
    if (editingParameter) {
      // Edit existing parameter
     await axios.put(`${BASE_URL}/slides/${payload.barcode}`, payload);
    
      setQAParameters(prev => prev.map(param => 

        param.id === editingParameter.id 
          ? { ...param, ...parameterFormData }
          : param
      ));
      toast.success('QA Slide Parameter updated successfully');
    } else {
      // Add new parameter
      const res = await axios.post(`${BASE_URL}/slides`, payload);
      const newParameter: QASlideParameter = {
        id: res.data.id,
        barcode: res.data.barcode,
        activationCode: res.data.activationCode,
        dicomWebUrl: res.data.dicomWebUrl
      };
      setQAParameters(prev => [...prev, newParameter]);
      toast.success('QA Slide Parameter added successfully');
    }
  }catch(err:any){
    toast.error(err.message || "Error: A Slide Parameter not added");
    
  }

    setParameterModalOpen(false);
    setEditingParameter(null);
    setParameterFormData(initialFormData);
  };

  // Handle opening delete confirmation
  const handleDeleteClick = (parameter: QASlideParameter) => {
    setParameterToDelete(parameter);
    setDeleteDialogOpen(true);
  };

  // Handle confirming delete
  const handleDeleteConfirm = () => {
    if (parameterToDelete) {
      setQAParameters(prev => prev.filter(param => param.id !== parameterToDelete.id));
      toast.success('QA Slide Parameter deleted successfully');
      setDeleteDialogOpen(false);
      setParameterToDelete(null);
    }
  };

  // Handle DICOM store editing
  const handleEditDicom = () => {
    setIsEditingDicom(true);
    setTempDicomAddress(dicomStoreAddress);
  };

  // Handle saving DICOM store address
  const handleSaveDicom = () => {
    if (!tempDicomAddress.trim()) {
      toast.error('DICOM store address cannot be empty');
      return;
    }

    setDicomStoreAddress(tempDicomAddress);
    setIsEditingDicom(false);
    toast.success('DICOM store address updated successfully');
  };

  // Handle canceling DICOM edit
  const handleCancelDicom = () => {
    setTempDicomAddress(dicomStoreAddress);
    setIsEditingDicom(false);
  };

  // Handle downloading PDF report for a parameter
  const handleDownloadPDF = (parameter: QASlideParameter) => {
    // Mock PDF download functionality
    const reportData = {
      barcode: parameter.barcode,
      activationCode: parameter.activationCode,
      generatedDate: new Date().toLocaleDateString(),
      analysisType: 'QA Slide Analysis',
      dicomStore: dicomStoreAddress
    };
    
    console.log('Generating PDF analysis report for:', reportData);
    // In a real implementation, you would generate and download a PDF report
    toast.success(`PDF analysis report for "${parameter.barcode}" would be downloaded here.`);
  };

  // Handle downloading CSV data for a parameter
  const handleDownloadCSV = (parameter: QASlideParameter) => {
    // Mock CSV download functionality
    const csvData = [
      ['Field', 'Value'],
      ['QA Slide Barcode', parameter.barcode],
      ['Activation Code', parameter.activationCode],
      ['Generated Date', new Date().toLocaleDateString()],
      ['Analysis Type', 'QA Slide Analysis'],
      ['DICOM Store', dicomStoreAddress],
      ['Status', 'Active'],
      ['Configuration ID', parameter.id]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qa-analysis-${parameter.barcode.replace(/\s+/g, '-').toLowerCase()}-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success(`CSV data for "${parameter.barcode}" downloaded successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Slide Image Analysis</h1>
        <p className="text-gray-600 mt-1">Manage QA parameters and DICOM store configuration</p>
      </div>

      {/* QA Slide Parameters Section */}
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
          {qaParameters.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No QA parameters configured</div>
              <p className="text-gray-600 mb-4">Add barcode and activation code pairs to get started</p>
              <Button onClick={handleAddParameter} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Parameter
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QA Slide Barcode</TableHead>
                  <TableHead>Activation Code</TableHead>
                  <TableHead className="w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qaParameters.map((parameter) => (
                  <TableRow key={parameter.id}>
                    <TableCell className="font-mono">{parameter.barcode}</TableCell>
                    <TableCell className="font-mono">{parameter.activationCode}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditParameter(parameter)}
                          className="min-w-0"
                          title="Edit Parameter"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPDF(parameter)}
                          className="text-blue-600 hover:text-blue-700 hover:border-blue-300 min-w-0"
                          title="Download PDF Report"
                        >
                          <FileText className="h-4 w-4" />
                        </Button> */}
                        {/* <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadCSV(parameter)}
                          className="text-green-600 hover:text-green-700 hover:border-green-300 min-w-0"
                          title="Download CSV Data"
                        >
                          <Download className="h-4 w-4" />
                        </Button> */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteClick(parameter)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300 min-w-0"
                          title="Delete Parameter"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* DICOM Store Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            DICOM Store for QA
          </CardTitle>
          <CardDescription>Configure the DICOM store address for QA slide analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dicomStore">DICOM Store Address</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="dicomStore"
                  value={isEditingDicom ? tempDicomAddress : dicomStoreAddress}
                  onChange={(e) => setTempDicomAddress(e.target.value)}
                  readOnly={!isEditingDicom}
                  placeholder="Please paste the DICOM store address here"
                  className={`flex-1 ${!isEditingDicom ? 'bg-gray-50' : ''}`}
                />
                {isEditingDicom ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveDicom} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleCancelDicom}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={handleEditDicom}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Full path to the Google Cloud DICOM store for QA slide storage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameter Add/Edit Modal */}
      <Dialog open={parameterModalOpen} onOpenChange={setParameterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingParameter ? 'Edit QA Parameter' : 'Add New QA Parameter'}
            </DialogTitle>
            <DialogDescription>
              {editingParameter 
                ? 'Update the barcode and activation code for this QA parameter'
                : 'Enter the barcode and activation code for the new QA parameter'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parameterBarcode">QA Slide Barcode *</Label>
              <Input
                id="parameterBarcode"
                disabled={editingParameter !== null} // Disable editing barcode if in edit mode
                value={parameterFormData.barcode}
                onChange={(e) => handleParameterInputChange('barcode', e.target.value)}
                placeholder="e.g. QA-2024-001"
                className={parameterErrors.barcode ? 'border-red-500' : ''}
              />
              {parameterErrors.barcode && (
                <p className="text-sm text-red-600">{parameterErrors.barcode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="parameterActivationCode">Activation Code *</Label>
              <Input
                id="parameterActivationCode"
                value={parameterFormData.activationCode}
                onChange={(e) => handleParameterInputChange('activationCode', e.target.value)}
                placeholder="e.g. ACT-123456"
                className={parameterErrors.activationCode ? 'border-red-500' : ''}
              />
              {parameterErrors.activationCode && (
                <p className="text-sm text-red-600">{parameterErrors.activationCode}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setParameterModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveParameter} className="bg-green-600 hover:bg-green-700">
              {editingParameter ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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