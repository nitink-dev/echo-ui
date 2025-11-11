import React from 'react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';

export function EmailServiceSection({ data, disabled, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Email From</Label>
        <Input
          value={data.emailFrom}
          disabled={disabled}
          onChange={e => onChange('emailFrom', e.target.value)}
        />
      </div>

      <div>
        <Label>Email To (comma separated)</Label>
        <Input
          value={data.emailTo.join(', ')}
          disabled={disabled}
          onChange={e => onChange('emailTo', e.target.value.split(',').map(v => v.trim()))}
        />
      </div>

      <div>
        <Label>Email Ibex To (comma separated)</Label>
        <Input
          value={data.emailIbexTo.join(', ')}
          disabled={disabled}
          onChange={e => onChange('emailIbexTo', e.target.value.split(',').map(v => v.trim()))}
        />
      </div>
    </div>
  );
}
