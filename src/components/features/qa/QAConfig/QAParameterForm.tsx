import React, { useCallback } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { QAFormData, QASlideParameter } from '../../../../types/qa.types';


const FIELD_RULES = {
  barcode: {
    allowedPattern: /^[a-zA-Z0-9_-]*$/,
    validPattern: /^[a-zA-Z0-9_-]{1,100}$/,
    label: 'QA Slide Barcode',
    placeholder: 'e.g. QA-2024-001',
    errorMessage:
      'Only letters, digits, hyphens (-) and underscores (_) are allowed. Special characters like $, %, #, ^, & are not permitted.',
  },
  activationCode: {
    allowedPattern: /^[a-zA-Z0-9_-]*$/,
    validPattern: /^[a-zA-Z0-9_-]{1,100}$/,
    label: 'Activation Code',
    placeholder: 'e.g. ACT-123456',
    errorMessage:
      'Only letters, digits, hyphens (-) and underscores (_) are allowed. Special characters are not permitted.',
  },
} as const;

type RuleKey = keyof typeof FIELD_RULES;


interface QAParameterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingParameter: QASlideParameter | null;
  formData: QAFormData;
  errors: { [key: string]: string };
  onInputChange: (field: keyof QAFormData, value: string) => void;
  onSave: () => void;
}


export function QAParameterForm({
  open,
  onOpenChange,
  editingParameter,
  formData,
  errors,
  onInputChange,
  onSave,
}: QAParameterFormProps) {

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const sanitize = useCallback((field: RuleKey, value: string): string => {
    const rule = FIELD_RULES[field];
    return value
      .split('')
      .filter((ch) => rule.allowedPattern.test(ch))
      .join('');
  }, []);

  const handleChange = useCallback(
    (field: RuleKey, value: string) => {
      onInputChange(field, sanitize(field, value));
    },
    [onInputChange, sanitize]
  );

  const handleKeyDown = useCallback(
    (field: RuleKey, e: React.KeyboardEvent<HTMLInputElement>) => {
      const isControlKey = e.ctrlKey || e.metaKey || e.key.length > 1;
      if (isControlKey) return; 
      const rule = FIELD_RULES[field];
      if (!rule.allowedPattern.test(e.key)) {
        e.preventDefault();
      }
    },
    []
  );

  const handlePaste = useCallback(
    (field: RuleKey, e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text');
      const sanitized = sanitize(field, pasted);
      if (sanitized === pasted) return; 

      e.preventDefault();
      const input = e.currentTarget;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const current: string = (formData as any)[field] ?? '';
      const next = current.slice(0, start) + sanitized + current.slice(end);
      onInputChange(field, next);
    },
    [formData, onInputChange, sanitize]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            {editingParameter ? 'Edit QA Parameter' : 'Add New QA Parameter'}
          </DialogTitle>
          <DialogDescription>
            {editingParameter
              ? 'Update the barcode and activation code for this QA parameter'
              : 'Enter the barcode and activation code for the new QA parameter'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">

          {/* ── QA Slide Barcode ── */}
          <div className="space-y-2">
            <Label htmlFor="parameterBarcode">
              QA Slide Barcode <span className="text-red-500">*</span>
            </Label>
            <Input
              id="parameterBarcode"
              disabled={editingParameter !== null}
              value={formData.barcode}
              placeholder={FIELD_RULES.barcode.placeholder}
              className={errors.barcode ? 'border-red-500' : ''}
              onChange={(e) => handleChange('barcode', e.target.value)}
              onKeyDown={(e) => handleKeyDown('barcode', e)}
              onPaste={(e) => handlePaste('barcode', e)}
            />
            {errors.barcode ? (
              <p className="text-sm text-red-600">{errors.barcode}</p>
            ) : (
              !editingParameter && (
                <p className="text-xs text-gray-400">
                  Allowed: letters, digits, <code>-</code> and <code>_</code> only
                </p>
              )
            )}
          </div>

          {/* ── Activation Code ── */}
          <div className="space-y-2">
            <Label htmlFor="parameterActivationCode">
              Activation Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="parameterActivationCode"
              value={formData.activationCode}
              placeholder={FIELD_RULES.activationCode.placeholder}
              className={errors.activationCode ? 'border-red-500' : ''}
              onChange={(e) => handleChange('activationCode', e.target.value)}
              onKeyDown={(e) => handleKeyDown('activationCode', e)}
              onPaste={(e) => handlePaste('activationCode', e)}
            />
            {errors.activationCode && (
              <p className="text-sm text-red-600">{errors.activationCode}</p>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            className="bg-green-600 hover:bg-green-700"
          >
            {editingParameter ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}