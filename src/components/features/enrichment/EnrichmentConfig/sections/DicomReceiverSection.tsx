import React from 'react';
import { FormInput } from '../../../../common/FormField/FormInput';

interface DicomReceiverSectionProps {
  data: DicomReceiverConfig;
  disabled: boolean;
  onChange: (field: string, value: string) => void;
}

export function DicomReceiverSection({ data, disabled, onChange }: DicomReceiverSectionProps) {
  return (
    <>
      <FormInput
        id="aet"
        label="AET"
        value={data.aet}
        onChange={(value) => onChange('aet', value)}
        disabled={disabled}
      />
      <FormInput
        id="ipAddress"
        label="IP Address"
        value={data.ipAddress}
        onChange={(value) => onChange('ipAddress', value)}
        disabled={disabled}
      />
      <FormInput
        id="port"
        label="Port"
        value={data.port}
        onChange={(value) => onChange('port', value)}
        disabled={disabled}
      />
      <FormInput
        id="networkDrive"
        label="Network Drive"
        value={data.networkDrive}
        onChange={(value) => onChange('networkDrive', value)}
        disabled={disabled}
      />
    </>
  );
}