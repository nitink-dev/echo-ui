import React from 'react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Switch } from '../../../../../components/ui/switch';

export function ExportServiceSection({ data, disabled, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Synapse Server Folder</Label>
        <Input
          value={data.synapseServerFolder}
          disabled={disabled}
          onChange={e => onChange('synapseServerFolder', e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Synapse Enabled</Label>
        <Switch
          checked={data.synapseEnabled}
          disabled={disabled}
          onCheckedChange={v => onChange('synapseEnabled', v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>VisioPharm Enabled</Label>
        <Switch
          checked={data.visioPharmEnabled}
          disabled={disabled}
          onCheckedChange={v => onChange('visioPharmEnabled', v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Ibex Enabled</Label>
        <Switch
          checked={data.ibexEnabled}
          disabled={disabled}
          onCheckedChange={v => onChange('ibexEnabled', v)}
        />
      </div>
    </div>
  );
}
