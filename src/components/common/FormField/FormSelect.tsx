import React from 'react';
import { Label } from '../../ui/label';

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }> | string[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  className?: string;
}

export function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
  required = false,
  helperText,
  placeholder = 'Select an option',
  className = ''
}: FormSelectProps) {
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`h-11 w-full rounded-md bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
          error ? 'border-red-500 focus:border-red-500' : ''
        } ${className}`}
      >
        <option value="">{placeholder}</option>
        {normalizedOptions.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}