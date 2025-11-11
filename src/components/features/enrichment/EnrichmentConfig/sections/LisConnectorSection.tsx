import React from 'react';
import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';

export function LisConnectorSection({ data, disabled, onChange }: any) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.keys(data).map((key) => (
        <div key={key}>
          <Label>{key}</Label>
          <Input
            value={data[key]}
            disabled={disabled}
            onChange={e => onChange(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
