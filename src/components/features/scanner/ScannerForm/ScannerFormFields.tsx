import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { FormErrors } from '../../../../types/common.types';

interface ScannerFormFieldsProps {
  formData: any;
  errors: FormErrors;
  isEdit: boolean;
  hospitals: string[];
  departments: string[];
  locations: string[];
  dicomStores: Record<string, string[]>;
  onInputChange: (field: string, value: string) => void;
}

export function ScannerFormFields({
  formData,
  errors,
  isEdit,
  hospitals,
  departments,
  locations,
  dicomStores,
  onInputChange
}: ScannerFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Name of Scanner */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name of Scanner *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="e.g. Pathology Scanner A"
          className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
            errors.name ? 'border-red-500 focus:border-red-500' : ''
          }`}
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
          onChange={(e) => onInputChange('aeTitle', e.target.value.toUpperCase())}
          placeholder="e.g. PATH_SCAN_01"
          className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 font-mono ${
            errors.aeTitle ? 'border-red-500 focus:border-red-500' : ''
          }`}
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
          onChange={(e) => onInputChange('model', e.target.value)}
          placeholder="e.g. Leica Aperio GT 450"
          className="h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
        />
      </div>

      {/* Hospital Name */}
      <div className="space-y-2">
        <Label htmlFor="hospitalName" className="text-sm font-medium text-gray-700">
          Hospital Name *
        </Label>
        <select
          id="hospitalName"
          value={formData.hospitalName}
          onChange={(e) => onInputChange('hospitalName', e.target.value)}
          className={`h-11 w-full rounded-md bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
            errors.hospitalName ? 'border-red-500 focus:border-red-500' : ''
          }`}
        >
          <option value="">Select Hospital</option>
          {hospitals.map((h, i) => (
            <option key={i} value={h}>{h}</option>
          ))}
        </select>
        {errors.hospitalName && <p className="text-sm text-red-600">{errors.hospitalName}</p>}
      </div>

      {/* Department Name */}
      <div className="space-y-2">
        <Label htmlFor="department" className="text-sm font-medium text-gray-700">
          Department Name *
        </Label>
        <select
          id="department"
          value={formData.department}
          onChange={(e) => onInputChange('department', e.target.value)}
          className={`h-11 w-full rounded-md bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
            errors.department ? 'border-red-500 focus:border-red-500' : ''
          }`}
        >
          <option value="">Select Department</option>
          {departments.map((dept, i) => (
            <option key={i} value={dept}>{dept}</option>
          ))}
        </select>
        {errors.department && <p className="text-sm text-red-600">{errors.department}</p>}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium text-gray-700">
          Location *
        </Label>
        <select
          id="location"
          value={formData.location}
          onChange={(e) => onInputChange('location', e.target.value)}
          className={`h-11 w-full rounded-md bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
            errors.location ? 'border-red-500 focus:border-red-500' : ''
          }`}
        >
          <option value="">Select Location</option>
          {locations.map((loc, i) => (
            <option key={i} value={loc}>{loc}</option>
          ))}
        </select>
        {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
      </div>

      {/* DICOM Store */}
      {formData.department && (
        <div className="space-y-2">
          <Label htmlFor="dicomStore" className="text-sm font-medium text-gray-700">
            DICOM Store *
          </Label>
          <select
            id="dicomStore"
            value={formData.dicomStore || ''}
            onChange={(e) => onInputChange('dicomStore', e.target.value)}
            className="h-11 w-full rounded-md bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
          >
            <option value="">Select DICOM Store</option>
            {(dicomStores[formData.department] || []).map((store, i) => (
              <option key={i} value={store}>{store}</option>
            ))}
          </select>
        </div>
      )}

      {/* Device Serial Number */}
      <div className="space-y-2">
        <Label htmlFor="deviceSerialNumber" className="text-sm font-medium text-gray-700">
          Device Serial Number *
        </Label>
        <Input
          id="deviceSerialNumber"
          disabled={isEdit}
          value={formData.deviceSerialNumber}
          onChange={(e) => onInputChange('deviceSerialNumber', e.target.value)}
          placeholder="e.g. LCA-2023-001"
          className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 font-mono ${
            errors.deviceSerialNumber ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        {errors.deviceSerialNumber && (
          <p className="text-sm text-red-600 flex items-center gap-1">{errors.deviceSerialNumber}</p>
        )}
      </div>

      {/* IP Address */}
      <div className="space-y-2">
        <Label htmlFor="ipAddress" className="text-sm font-medium text-gray-700">
          IP Address
        </Label>
        <Input
          id="ipAddress"
          value={formData.ipAddress}
          onChange={(e) => onInputChange('ipAddress', e.target.value)}
          placeholder="e.g. 192.168.1.1"
          className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
            errors.ipAddress ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        {errors.ipAddress && <p className="text-sm text-red-600 flex items-center gap-1">{errors.ipAddress}</p>}
      </div>

      {/* Port */}
      <div className="space-y-2">
        <Label htmlFor="port" className="text-sm font-medium text-gray-700">
          Port
        </Label>
        <Input
          id="port"
          value={formData.port}
          onChange={(e) => onInputChange('port', e.target.value)}
          placeholder="e.g. 104"
          className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
            errors.port ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        {errors.port && <p className="text-sm text-red-600 flex items-center gap-1">{errors.port}</p>}
      </div>

      {/* Vendor */}
      <div className="space-y-2">
        <Label htmlFor="vendor" className="text-sm font-medium text-gray-700">
          Vendor
        </Label>
        <Input
          id="vendor"
          value={formData.vendor}
          onChange={(e) => onInputChange('vendor', e.target.value)}
          placeholder="e.g. Leica"
          className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
            errors.vendor ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        {errors.vendor && <p className="text-sm text-red-600 flex items-center gap-1">{errors.vendor}</p>}
      </div>

      {/* Other Identifier */}
      <div className="space-y-2">
        <Label htmlFor="otherIdentifier" className="text-sm font-medium text-gray-700">
          Other Identifier (Device ID)
        </Label>
        <Input
          id="otherIdentifier"
          disabled={isEdit}
          value={formData.otherIdentifier}
          onChange={(e) => onInputChange('otherIdentifier', e.target.value)}
          placeholder="Optional additional identifier"
          className="h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
        />
        <p className="text-xs text-gray-500">Optional field for additional identifiers</p>
      </div>
    </div>
  );
}