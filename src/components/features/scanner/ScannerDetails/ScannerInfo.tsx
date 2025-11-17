import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { SlideScanner } from '../../../../types/scanner.types';

interface ScannerInfoProps {
  scanner: SlideScanner;
}

export function ScannerInfo({ scanner }: ScannerInfoProps) {
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
              <label className="text-sm font-medium text-gray-500">Name of Scanner</label>
              <p className="text-base">{scanner.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">AE Title</label>
              <p className="text-base font-mono">{scanner.aeTitle}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Model</label>
              <p className="text-base">{scanner.model}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Serial Number</label>
              <p className="text-base font-mono">{scanner.deviceSerialNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">IP Address</label>
              <p className="text-base font-mono">{scanner.ipAddress}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Hospital Name</label>
              <p className="text-base">{scanner.hospitalName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Department</label>
              <p className="text-base">{scanner.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-base">{scanner.location}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Port</label>
              <p className="text-base font-mono">{scanner.port}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Vendor</label>
              <p className="text-base">{scanner.vendor}</p>
            </div>
            {scanner.otherIdentifier && (
              <div>
                <label className="text-sm font-medium text-gray-500">Other Identifier</label>
                <p className="text-base">{scanner.otherIdentifier}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}