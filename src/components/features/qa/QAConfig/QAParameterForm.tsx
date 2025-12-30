import React from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { QAFormData, QASlideParameter } from '../../../../types/qa.types';

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
  onSave
}: QAParameterFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
          <div className="space-y-2">
            <Label htmlFor="parameterBarcode">QA Slide Barcode *</Label>
            <Input
              id="parameterBarcode"
              disabled={editingParameter !== null}
              value={formData.barcode}
              onChange={(e) => onInputChange('barcode', e.target.value)}
              placeholder="e.g. QA-2024-001"
              className={errors.barcode ? 'border-red-500' : ''}
            />
            {errors.barcode && <p className="text-sm text-red-600">{errors.barcode}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameterActivationCode">Activation Code *</Label>
            <Input
              id="parameterActivationCode"
              value={formData.activationCode}
              onChange={(e) => onInputChange('activationCode', e.target.value)}
              placeholder="e.g. ACT-123456"
              className={errors.activationCode ? 'border-red-500' : ''}
            />
            {errors.activationCode && (
              <p className="text-sm text-red-600">{errors.activationCode}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
            {editingParameter ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}