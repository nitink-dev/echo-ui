import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { SlideScanner } from '../../../../types/scanner.types';
import { useFormLabels } from '../../../../hooks/useFormLabels';
import { SCANNER_FIELD_LABELS } from '../scannerLabels.constants';

interface ScannerInfoProps {
  scanner: SlideScanner;
}

export function ScannerInfo({ scanner }: ScannerInfoProps) {
  const labels = useFormLabels('scanner', SCANNER_FIELD_LABELS);

  const getDisplayDicomStore = (path: string | undefined) => {
    if (!path || typeof path !== 'string') return '';

    const parts = path.split('/').filter(Boolean);

    const startIdx = parts.indexOf('datasets');
    return startIdx >= 0 ? parts.slice(startIdx).join('/') : parts.join('/');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scanner Information</CardTitle>
        <CardDescription>Complete details of the registered scanner</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.name}</label>
              <p className="text-base">{scanner.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.aeTitle}</label>
              <p className="text-base font-mono">{scanner.aeTitle}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.model}</label>
              <p className="text-base">{scanner.model}</p>
            </div>
            {scanner.scannerType && (
              <div>
                <label className="text-sm font-medium text-gray-500">{labels.scannerType}</label>
                <p className="text-base">{scanner.scannerType}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.deviceSerialNumber}</label>
              <p className="text-base font-mono">{scanner.deviceSerialNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.ipAddress}</label>
              <p className="text-base font-mono">{scanner.ipAddress}</p>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-500">{labels.research}</label>
                <div className="flex items-center gap-2 mt-1">
                  {scanner.research ? (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                      Research Enabled
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Research Disabled</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {scanner.research 
                    ? 'This scanner is configured for research purposes' 
                    : 'This scanner is not configured for research'}
                </p>
              </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.hospitalName}</label>
              <p className="text-base">{scanner.hospitalName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.department}</label>
              <p className="text-base">{scanner.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.dicomStore}</label>
              <p className="text-base">{getDisplayDicomStore(scanner?.dicomStore)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.location}</label>
              <p className="text-base">{scanner.location}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.port}</label>
              <p className="text-base font-mono">{scanner.port}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{labels.vendor}</label>
              <p className="text-base">{scanner.vendor}</p>
            </div>
            {scanner.storageStrategy && (
              <div>
                <label className="text-sm font-medium text-gray-500">{labels.storageStrategy}</label>
                <p className="text-base">{scanner.storageStrategy}</p>
              </div>
            )}
            {scanner.storageStrategy === 'C-STORE' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">{labels.remoteAeTitle}</label>
                  <p className="text-base font-mono">{scanner.remoteAeTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{labels.remoteHost}</label>
                  <p className="text-base font-mono">{scanner.remoteHost}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{labels.remotePort}</label>
                  <p className="text-base font-mono">{scanner.remotePort}</p>
                </div>
              </>
            )}
          </div>

       
        </div>
      </CardContent>
    </Card>
  );
}