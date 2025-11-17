import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { SlideScanner } from '../../../../types/scanner.types';
import { ScannerInfo } from './ScannerInfo';
import { AnalysisReports } from './AnalysisReports';

interface ScannerDetailsProps {
  scanner: SlideScanner;
  onBack: () => void;
}

export function ScannerDetails({ scanner, onBack }: ScannerDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{scanner.name}</h1>
          <p className="text-gray-600 mt-1">Scanner Details and Analysis Reports</p>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Scanner Information</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Report</TabsTrigger>
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