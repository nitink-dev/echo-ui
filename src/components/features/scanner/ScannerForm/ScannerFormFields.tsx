import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { FormErrors } from '../../../../types/common.types';
import { AlertCircle } from 'lucide-react';
import {
  IP_ALLOWED_PATTERN,
  PORT_ALLOWED_PATTERN,
  isValidIP,
  isValidPort,
  IP_ERROR_MESSAGE,
  PORT_ERROR_MESSAGE,
  sanitizeByPattern,
} from '../../../../utils/validation.constants';

const SERIAL_ALLOWED_PATTERN = /^[a-zA-Z0-9_-]$/;
const sanitizeSerial = (value: string) =>
  value.split('').filter((ch) => SERIAL_ALLOWED_PATTERN.test(ch)).join('');

interface ScannerFormFieldsProps {
  formData: any;
  errors: FormErrors;
  isEdit: boolean;
  hospitals: string[];
  departments: string[];
  locations: string[];
  dicomStores: Record<string, string[]>;
  onInputChange: (field: string, value: string | boolean) => void;
  onSerialNumberBlur?: () => void;
  checkingSerialNumber?: boolean;
}

export function ScannerFormFields({
  formData,
  errors,
  isEdit,
  hospitals,
  departments,
  locations,
  dicomStores,
  onInputChange,
  onSerialNumberBlur,
  checkingSerialNumber = false,
}: ScannerFormFieldsProps) {

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange('deviceSerialNumber', sanitizeSerial(e.target.value));
  };

  const handleSerialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCtrl = e.ctrlKey || e.metaKey || e.key.length > 1;
    if (isCtrl) return; 
    if (!SERIAL_ALLOWED_PATTERN.test(e.key)) e.preventDefault();
  };

  const handleSerialPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    const sanitized = sanitizeSerial(pasted);
    if (sanitized !== pasted) {
      e.preventDefault();
      const inp = e.currentTarget;
      const start = inp.selectionStart ?? 0;
      const end = inp.selectionEnd ?? 0;
      const cur = formData.deviceSerialNumber ?? '';
      onInputChange('deviceSerialNumber', cur.slice(0, start) + sanitized + cur.slice(end));
    }
  };

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeByPattern(e.target.value, IP_ALLOWED_PATTERN);
    onInputChange('ipAddress', sanitized);
  };

  const handleIpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCtrl = e.ctrlKey || e.metaKey || e.key.length > 1;
    if (isCtrl) return;
    if (!IP_ALLOWED_PATTERN.test(e.key)) e.preventDefault();
  };

  const handleIpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    const sanitized = sanitizeByPattern(pasted, IP_ALLOWED_PATTERN);
    if (sanitized !== pasted) {
      e.preventDefault();
      const inp = e.currentTarget;
      const start = inp.selectionStart ?? 0;
      const end = inp.selectionEnd ?? 0;
      const cur = formData.ipAddress ?? '';
      onInputChange('ipAddress', cur.slice(0, start) + sanitized + cur.slice(end));
    }
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeByPattern(e.target.value, PORT_ALLOWED_PATTERN);
    onInputChange('port', sanitized);
  };

  const handlePortKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCtrl = e.ctrlKey || e.metaKey || e.key.length > 1;
    if (isCtrl) return;
    if (!PORT_ALLOWED_PATTERN.test(e.key)) e.preventDefault();
  };

  const handlePortPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    const sanitized = sanitizeByPattern(pasted, PORT_ALLOWED_PATTERN);
    if (sanitized !== pasted) {
      e.preventDefault();
      const inp = e.currentTarget;
      const start = inp.selectionStart ?? 0;
      const end = inp.selectionEnd ?? 0;
      const cur = formData.port ?? '';
      onInputChange('port', cur.slice(0, start) + sanitized + cur.slice(end));
    }
  };

  const ipInlineError =
    formData.ipAddress && !isValidIP(formData.ipAddress) ? IP_ERROR_MESSAGE : '';

  const portInlineError =
    formData.port && !isValidPort(formData.port) ? PORT_ERROR_MESSAGE : '';

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name of Scanner */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Name of Scanner *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "" || /^[A-Za-z0-9_-]+$/.test(value)) {
                onInputChange("name", value);
              }
            }}
            placeholder="e.g. Pathology Scanner A"
            className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.name ? 'border-red-500 focus:border-red-500' : ''
              }`}
          />
          {errors.name && (
            <p className="text-sm text-red-600 flex items-center gap-1">{errors.name}</p>
          )}
        </div>

        {/* AE Title */}
        <div className="space-y-2">
          <Label htmlFor="aeTitle" className="text-sm font-medium text-gray-700">
            AE Title *
          </Label>
          <Input
            id="aeTitle"
            value={formData.aeTitle}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();

              if (value === "" || /^[A-Z0-9_-]+$/.test(value)) {
                onInputChange("aeTitle", value);
              }
            }}
            placeholder="e.g. PATH_SCAN_01"
            className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 font-mono ${errors.aeTitle ? 'border-red-500 focus:border-red-500' : ''
              }`}
          />
          {errors.aeTitle && (
            <p className="text-sm text-red-600 flex items-center gap-1">{errors.aeTitle}</p>
          )}
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
            className={`h-11 w-full rounded-md bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.hospitalName ? 'border-red-500 focus:border-red-500' : ''
              }`}
          >
            <option value="">Select Hospital</option>
            {hospitals.map((h, i) => (
              <option key={i} value={h}>{h}</option>
            ))}
          </select>
          {errors.hospitalName && (
            <p className="text-sm text-red-600">{errors.hospitalName}</p>
          )}
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
            className={`h-11 w-full rounded-md bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.department ? 'border-red-500 focus:border-red-500' : ''
              }`}
          >
            <option value="">Select Department</option>
            {departments.map((dept, i) => (
              <option key={i} value={dept}>{dept}</option>
            ))}
          </select>
          {errors.department && (
            <p className="text-sm text-red-600">{errors.department}</p>
          )}
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
            className={`h-11 w-full rounded-md bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.location ? 'border-red-500 focus:border-red-500' : ''
              }`}
          >
            <option value="">Select Location</option>
            {locations.map((loc, i) => (
              <option key={i} value={loc}>{loc}</option>
            ))}
          </select>
          {errors.location && (
            <p className="text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Storage Location (DICOM Store) */}
        {formData.department && (
          <div className="space-y-2">
            <Label htmlFor="dicomStore" className="text-sm font-medium text-gray-700">
              Storage Location *
            </Label>
            <select
              id="dicomStore"
              value={formData.dicomStore || ''}
              onChange={(e) => onInputChange('dicomStore', e.target.value)}
              className={`h-11 w-full rounded-md bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.dicomStore ? 'border-red-500 focus:border-red-500' : ''}`}
            >
              <option value="">Select Storage Location</option>
              {(dicomStores[formData.department] || []).map((store, i) => (
                <option key={i} value={store}>{store}</option>
              ))}
            </select>
          
            {formData.research && (
              <p className="text-xs text-blue-600 font-medium">
                Research mode enabled - storage will be assigned automatically
              </p>
            )}
            {errors.dicomStore && (
              <p className="text-sm text-red-600">{errors.dicomStore}</p>
            )}
          </div>
        )}

        {/* Device Serial Number */}
        <div className="space-y-2">
          <Label htmlFor="deviceSerialNumber" className="text-sm font-medium text-gray-700">
            Device Serial Number *
          </Label>
          <div className="relative">
            <Input
              id="deviceSerialNumber"
              disabled={isEdit}
              value={formData.deviceSerialNumber}
              onChange={handleSerialChange}
              onKeyDown={handleSerialKeyDown}
              onPaste={handleSerialPaste}
              onBlur={onSerialNumberBlur}
              placeholder="e.g. LCA-2023-001"
              className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 font-mono ${errors.deviceSerialNumber ? 'border-red-500 focus:border-red-500' : ''
                }`}
            />
            {checkingSerialNumber && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-[#007BFF]" />
              </div>
            )}
          </div>
          {errors.deviceSerialNumber && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              {errors.deviceSerialNumber}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Letters, numbers, hyphens and underscores only (e.g. LCA-2023_001)
          </p>
        </div>

        {/* ── IP Address — with full validation ── */}
        <div className="space-y-2">
          <Label htmlFor="ipAddress" className="text-sm font-medium text-gray-700">
            IP Address
          </Label>
          <Input
            id="ipAddress"
            value={formData.ipAddress ?? ''}
            onChange={handleIpChange}
            onKeyDown={handleIpKeyDown}
            onPaste={handleIpPaste}
            placeholder="e.g. 192.168.1.1"
            aria-invalid={Boolean(errors.ipAddress || ipInlineError)}
            aria-describedby={
              errors.ipAddress || ipInlineError ? 'ipAddress-error' : undefined
            }
            className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.ipAddress || ipInlineError
                ? 'border-red-500 focus:border-red-500'
                : ''
              }`}
          />
          {(errors.ipAddress || ipInlineError) && (
            <p
              id="ipAddress-error"
              className="text-sm text-red-600 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.ipAddress || ipInlineError}
            </p>
          )}
          {!errors.ipAddress && !ipInlineError && (
            <p className="text-xs text-gray-500">
              IPv4 (e.g. 192.168.1.1) or IPv6 (e.g. 2001:db8::1)
            </p>
          )}
        </div>

        {/* ── Port — with full validation ── */}
        <div className="space-y-2">
          <Label htmlFor="port" className="text-sm font-medium text-gray-700">
            Port
          </Label>
          <Input
            id="port"
            value={formData.port ?? ''}
            onChange={handlePortChange}
            onKeyDown={handlePortKeyDown}
            onPaste={handlePortPaste}
            placeholder="e.g. 104"
            aria-invalid={Boolean(errors.port || portInlineError)}
            aria-describedby={
              errors.port || portInlineError ? 'port-error' : undefined
            }
            className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.port || portInlineError
                ? 'border-red-500 focus:border-red-500'
                : ''
              }`}
          />
          {(errors.port || portInlineError) && (
            <p
              id="port-error"
              className="text-sm text-red-600 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.port || portInlineError}
            </p>
          )}
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
            className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${errors.vendor ? 'border-red-500 focus:border-red-500' : ''
              }`}
          />
          {errors.vendor && (
            <p className="text-sm text-red-600 flex items-center gap-1">{errors.vendor}</p>
          )}
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

      {/* Research and Connected Flags */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scanner Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Is Research */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label htmlFor="research" className="text-sm font-medium text-gray-700 block">
                Research Mode
              </label>
              <p className="text-xs text-gray-500 mt-2 font-semibold">
                Storage location will be assigned automatically for research slides
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="research"
                type="checkbox"
                checked={formData.research || false}
                onChange={(e) => onInputChange('research', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Is Connected */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label htmlFor="connected" className="text-sm font-medium text-gray-700 block">
                Connection Status
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {isEdit
                  ? 'Cannot change connection status when editing'
                  : 'Set initial connection status'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="connected"
                type="checkbox"
                checked={formData.connected || false}
                onChange={(e) => onInputChange('connected', e.target.checked)}
                disabled={isEdit}
              />
              <div
                className={`w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${isEdit ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              />
            </label>
          </div>
        </div>
      </div>
    </>
  );
}