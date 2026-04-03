import React from 'react';
import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';
export function EnrichmentServiceSection({ data, disabled, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Message Type</Label>
        <Input
          value={data.messageType}
          disabled={disabled}
          onChange={e => onChange('messageType', e.target.value)}
        />
      </div>
    </div>
  );
}
