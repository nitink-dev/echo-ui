import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';

interface SlideScanner {
  id?: string;
  name: string;
  aeTitle: string;
  model: string;
  hospitalName: string;
  department: string;
  location: string;
  serialNumber: string;
  ipAddress: string;
  port: string;
  vendor: string;
  otherIdentifier?: string;
}

interface SlideScannerFormProps {
  scanner?: SlideScanner;
  onSave: (scanner: SlideScanner) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

interface FormData {
  name: string;
  aeTitle: string;
  model: string;
  hospitalName: string;
  department: string;
  location: string;
  serialNumber: string;
  ipAddress: string;
  port: string;
  vendor: string;
  otherIdentifier: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  name: '',
  aeTitle: '',
  model: '',
  hospitalName: '',
  department: '',
  location: '',
  serialNumber: '',
  ipAddress: '',
  port: '',
  vendor: '',
  otherIdentifier: ''
};

const requiredFields = ['name', 'aeTitle', 'hospitalName', 'department', 'location', 'serialNumber', 'ipAddress', 'port', 'vendor'];

export function SlideScannerForm({ scanner, onSave, onCancel, isEdit = false }: SlideScannerFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Initialize form data if editing
  useEffect(() => {
    if (scanner) {
      setFormData({
        name: scanner.name || '',
        aeTitle: scanner.aeTitle || '',
        model: scanner.model || '',
        hospitalName: scanner.hospitalName || '',
        department: scanner.department || '',
        location: scanner.location || '',
        serialNumber: scanner.serialNumber || '',
        ipAddress: scanner.ipAddress || '',
        port: scanner.port || '',
        vendor: scanner.vendor || '',
        otherIdentifier: scanner.otherIdentifier || ''
      });
    }
  }, [scanner]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Check required fields
    requiredFields.forEach((field) => {
      if (!formData[field as keyof FormData].trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    // Validate AE Title format (alphanumeric and underscores only)
    if (formData.aeTitle && !/^[A-Z0-9_]+$/.test(formData.aeTitle)) {
      newErrors.aeTitle = 'AE Title must contain only uppercase letters, numbers, and underscores';
    }

    // Validate Serial Number format
    if (formData.serialNumber && formData.serialNumber.length < 3) {
      newErrors.serialNumber = 'Serial Number must be at least 3 characters long';
    }

    // Validate IP Address format
    if (formData.ipAddress) {
      const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ipAddress)) {
        newErrors.ipAddress = 'Please enter a valid IP address (e.g., 192.168.1.1)';
      }
    }

    // Validate Port number
    if (formData.port) {
      const portNum = parseInt(formData.port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        newErrors.port = 'Port must be a number between 1 and 65535';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    toast.success(`Slide Scanner ${isEdit ? 'updated' : 'registered'} successfully`);
  };

  const handleReset = () => {
    if (scanner) {
      setFormData({
        name: scanner.name || '',
        aeTitle: scanner.aeTitle || '',
        model: scanner.model || '',
        hospitalName: scanner.hospitalName || '',
        department: scanner.department || '',
        location: scanner.location || '',
        serialNumber: scanner.serialNumber || '',
        ipAddress: scanner.ipAddress || '',
        port: scanner.port || '',
        vendor: scanner.vendor || '',
        otherIdentifier: scanner.otherIdentifier || ''
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setIsDirty(false);
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

  const isFormValid = requiredFields.every(field => formData[field as keyof FormData].trim()) && Object.keys(errors).length === 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleCancel} className="hover:bg-[#f8faff] border-gray-200">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name of Scanner */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name of Scanner *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Pathology Scanner A"
                className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.name && <p className="text-sm text-red-600 flex items-center gap-1">{errors.name}</p>}
            </div>

            {/* AE Title */}
            <div className="space-y-2">
              <Label htmlFor="aeTitle" className="text-sm font-medium text-gray-700">
                AE Title *
              </Label>
              <Input
                id="aeTitle"
                value={formData.aeTitle}
                onChange={(e) => handleInputChange('aeTitle', e.target.value.toUpperCase())}
                placeholder="e.g. PATH_SCAN_01"
                className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 font-mono ${errors.aeTitle ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.aeTitle && <p className="text-sm text-red-600 flex items-center gap-1">{errors.aeTitle}</p>}
              <p className="text-xs text-gray-500">Uppercase letters, numbers, and underscores only</p>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                Model
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g. Leica Aperio GT 450"
                className="h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
              />
            </div>

            {/* Hospital Name */}
            <div className="space-y-2">
              <Label htmlFor="hospitalName" className="text-sm font-medium text-gray-700">
                Hospital Name *
              </Label>
              <Input
                id="hospitalName"
                value={formData.hospitalName}
                onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                placeholder="e.g. Endeavor Health Main"
                className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.hospitalName ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.hospitalName && <p className="text-sm text-red-600 flex items-center gap-1">{errors.hospitalName}</p>}
            </div>

            {/* Department Name */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                Department Name *
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g. Pathology"
                className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.department ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.department && <p className="text-sm text-red-600 flex items-center gap-1">{errors.department}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g. Pathology Lab - Room 101"
                className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.location ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.location && <p className="text-sm text-red-600 flex items-center gap-1">{errors.location}</p>}
            </div>

            {/* Device Serial Number */}
            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="text-sm font-medium text-gray-700">
                Device Serial Number *
              </Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                placeholder="e.g. LCA-2023-001"
                className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 font-mono ${errors.serialNumber ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.serialNumber && <p className="text-sm text-red-600 flex items-center gap-1">{errors.serialNumber}</p>}
            </div>

            {/* IP Address */}
            <div className="space-y-2">
              <Label htmlFor="ipAddress" className="text-sm font-medium text-gray-700">
                IP Address *
              </Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.ipAddress ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.ipAddress && <p className="text-sm text-red-600 flex items-center gap-1">{errors.ipAddress}</p>}
            </div>

            {/* Port */}
            <div className="space-y-2">
              <Label htmlFor="port" className="text-sm font-medium text-gray-700">
                Port *
              </Label>
              <Input
                id="port"
                value={formData.port}
                onChange={(e) => handleInputChange('port', e.target.value)}
                placeholder="e.g. 104"
                className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.port ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.port && <p className="text-sm text-red-600 flex items-center gap-1">{errors.port}</p>}
            </div>

            {/* Vendor */}
            <div className="space-y-2">
              <Label htmlFor="vendor" className="text-sm font-medium text-gray-700">
                Vendor *
              </Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder="e.g. Leica"
                className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.vendor ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.vendor && <p className="text-sm text-red-600 flex items-center gap-1">{errors.vendor}</p>}
            </div>

            {/* Other Identifier */}
            <div className="space-y-2">
              <Label htmlFor="otherIdentifier" className="text-sm font-medium text-gray-700">
                Other Identifier
              </Label>
              <Input
                id="otherIdentifier"
                value={formData.otherIdentifier}
                onChange={(e) => handleInputChange('otherIdentifier', e.target.value)}
                placeholder="Optional additional identifier"
                className="h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
              />
              <p className="text-xs text-gray-500">Optional field for additional identifiers</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={!isFormValid}
                className={`px-6 py-2.5 ${isFormValid 
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