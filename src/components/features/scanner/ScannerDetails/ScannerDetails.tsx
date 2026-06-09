import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { SlideScanner } from '../../../../types/scanner.types';
import { ScannerInfo } from './ScannerInfo';
import { AnalysisReports } from './AnalysisReports';
import { Badge } from '../../../ui/badge';
import { PermissionGuard } from '../../../../auth/permissions/PermissionGuard';
import { useFeaturePermissions } from '../../../../auth/permissions/useFeaturePermissions';


interface ScannerDetailsProps {
  scanner: SlideScanner;
  onBack: () => void;
}

export function ScannerDetails({ scanner, onBack }: ScannerDetailsProps) {
  const { scanners: scannerPermissions } = useFeaturePermissions();
  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div className="flex-1 text-left">
          <h1 className="text-2xl font-semibold text-gray-900">{scanner.name}</h1>
          <p className="text-gray-600 mt-1">Scanner Details and Analysis Reports</p>
        </div>

        <div className="text-right">
                <label className="text-sm font-medium text-gray-500">Connection Status</label>
                <div className="flex justify-end gap-2 mt-1">
                  {scanner.connected ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Disconnected</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {scanner.connected
                    ? 'Scanner is actively connected to the system' 
                    : 'Scanner is not currently connected'}
                </p>
              
              
              </div>

      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Scanner Information</TabsTrigger>
          <PermissionGuard allowed={scannerPermissions.canReadDetail}>
            <TabsTrigger value="analysis">Analysis Report</TabsTrigger>
          </PermissionGuard>
        </TabsList>

        <TabsContent value="info">
          <ScannerInfo scanner={scanner} />
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisReports deviceSerialNumber={scanner.deviceSerialNumber} />
        </TabsContent>
      </Tabs>
    </div>
  );
}