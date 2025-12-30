import React from 'react';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';

interface FormFieldProps {
  type: 'input' | 'select';
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  options?: Array<{ value: string; label: string }> | string[];
  inputType?: string;
  className?: string;
}

export function FormField({ type, ...props }: FormFieldProps) {
  if (type === 'select') {
    return <FormSelect {...props} options={props.options || []} />;
  }
  return <FormInput {...props} type={props.inputType} />;
}