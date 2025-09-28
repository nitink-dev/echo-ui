import React, { useState } from 'react';
import { 
  Network, 
  Activity, 
  Settings, 
  Database, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  FolderOpen,
  Cloud,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface EnrichmentConfig {
  dicomReceiver: {
    aet: string;
    ipAddress: string;
    port: string;
    networkDrive: string;
  };
  lisConnector: {
    applicationName: string;
    ipAddress: string;
    receivingPort: string;
    status: boolean;
  };
  enrichmentService: {
    enrichmentLogic: 'customized' | 'ihe-dpia';
    storageCommitment: 'dicom-dir' | 'storage-commitment' | 'timeout';
    timeoutDuration?: string;
  };
  exportService: {
    sharedFolder: {
      enabled: boolean;
      location?: string;
    };
    visiopharm: boolean;
    ibex: boolean;
  };
  hl7Messaging: {
    applicationName: string;
    ipAddress: string;
    receivingPort: string;
    outputPort: string;
    threadPoolSize: string;
  };
}

const defaultConfig: EnrichmentConfig = {
  dicomReceiver: {
    aet: 'ENRICHMENT_AET',
    ipAddress: '192.168.1.100',
    port: '4242',
    networkDrive: '\\\\server\\shared\\dicom'
  },
  lisConnector: {
    applicationName: 'LIS Connector Service',
    ipAddress: '192.168.1.101',
    receivingPort: '8080',
    status: true
  },
  enrichmentService: {
    enrichmentLogic: 'customized',
    storageCommitment: 'dicom-dir',
    timeoutDuration: '300'
  },
  exportService: {
    sharedFolder: {
      enabled: true,
      location: '\\\\server\\shared\\export'
    },
    visiopharm: false,
    ibex: true
  },
  hl7Messaging: {
    applicationName: 'HL7 Message Service',
    ipAddress: '192.168.1.102',
    receivingPort: '2575',
    outputPort: '2576',
    threadPoolSize: '5'
  }
};

export function EnrichmentToolConfig() {
  const [config, setConfig] = useState<EnrichmentConfig>(defaultConfig);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['dicom-receiver', 'lis-connector', 'enrichment-service', 'export-service', 'hl7-messaging'])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const updateConfig = (section: keyof EnrichmentConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedConfig = (section: keyof EnrichmentConfig, nestedField: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedField]: {
          ...(prev[section] as any)[nestedField],
          [field]: value
        }
      }
    }));
  };

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId);

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div className="mb-8 p-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Enrichment Tool</h1>
        <p className="text-gray-600">Configure enrichment services, connectors, and data processing workflows</p>
      </div>

      <div className="px-6 pb-6 space-y-6">

      {/* DICOM Receiver Section */}
      <Card className="border border-gray-200 shadow-sm">
        <Collapsible 
          open={isExpanded('dicom-receiver')} 
          onOpenChange={() => toggleSection('dicom-receiver')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Network className="h-5 w-5 text-[#007BFF]" />
                  DICOM Receiver
                </CardTitle>
                {isExpanded('dicom-receiver') ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dicom-aet" className="text-sm font-medium text-gray-700">AET</Label>
                  <Input
                    id="dicom-aet"
                    value={config.dicomReceiver.aet}
                    readOnly
                    className="bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dicom-ip" className="text-sm font-medium text-gray-700">IP Address</Label>
                  <Input
                    id="dicom-ip"
                    value={config.dicomReceiver.ipAddress}
                    readOnly
                    className="bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dicom-port" className="text-sm font-medium text-gray-700">Port</Label>
                  <Input
                    id="dicom-port"
                    value={config.dicomReceiver.port}
                    readOnly
                    className="bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dicom-network-drive" className="text-sm font-medium text-gray-700">Network Drive</Label>
                  <Input
                    id="dicom-network-drive"
                    value={config.dicomReceiver.networkDrive}
                    readOnly
                    className="bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* LIS Connector Section */}
      <Card className="border border-gray-200 shadow-sm">
        <Collapsible 
          open={isExpanded('lis-connector')} 
          onOpenChange={() => toggleSection('lis-connector')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Database className="h-5 w-5 text-[#007BFF]" />
                  LIS Connector
                </CardTitle>
                {isExpanded('lis-connector') ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lis-app-name" className="text-sm font-medium text-gray-700">Application Name</Label>
                  <Input
                    id="lis-app-name"
                    value={config.lisConnector.applicationName}
                    onChange={(e) => updateConfig('lisConnector', 'applicationName', e.target.value)}
                    className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lis-ip" className="text-sm font-medium text-gray-700">IP Address</Label>
                  <Input
                    id="lis-ip"
                    value={config.lisConnector.ipAddress}
                    onChange={(e) => updateConfig('lisConnector', 'ipAddress', e.target.value)}
                    className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lis-port" className="text-sm font-medium text-gray-700">Receiving Port</Label>
                  <Input
                    id="lis-port"
                    value={config.lisConnector.receivingPort}
                    onChange={(e) => updateConfig('lisConnector', 'receivingPort', e.target.value)}
                    className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lis-status" className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="flex items-center space-x-3 pt-2">
                    <Switch
                      id="lis-status"
                      checked={config.lisConnector.status}
                      onCheckedChange={(checked) => updateConfig('lisConnector', 'status', checked)}
                    />
                    <span className={`text-sm font-medium ${
                      config.lisConnector.status 
                        ? 'text-[#10b981]' 
                        : 'text-gray-500'
                    }`}>
                      {config.lisConnector.status ? 'Active' : 'Stopped'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Enrichment Service Section */}
      <Card className="border border-gray-200 shadow-sm">
        <Collapsible 
          open={isExpanded('enrichment-service')} 
          onOpenChange={() => toggleSection('enrichment-service')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Settings className="h-5 w-5 text-[#007BFF]" />
                  Enrichment Service
                </CardTitle>
                {isExpanded('enrichment-service') ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Enrichment Logic</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={config.enrichmentService.enrichmentLogic === 'customized' ? 'default' : 'outline'}
                      onClick={() => updateConfig('enrichmentService', 'enrichmentLogic', 'customized')}
                      className={config.enrichmentService.enrichmentLogic === 'customized' 
                        ? 'bg-[#007BFF] hover:bg-[#0056cc] text-white' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    >
                      Customized Enrichment (ORU/OUL message)
                    </Button>
                    <Button
                      variant={config.enrichmentService.enrichmentLogic === 'ihe-dpia' ? 'default' : 'outline'}
                      onClick={() => updateConfig('enrichmentService', 'enrichmentLogic', 'ihe-dpia')}
                      className={config.enrichmentService.enrichmentLogic === 'ihe-dpia' 
                        ? 'bg-[#007BFF] hover:bg-[#0056cc] text-white' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    >
                      IHE DPIA Profile (QBP/OML message)
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="storage-commitment" className="text-sm font-medium text-gray-700">Storage Commitment Mechanism</Label>
                  <Select 
                    value={config.enrichmentService.storageCommitment} 
                    onValueChange={(value) => updateConfig('enrichmentService', 'storageCommitment', value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20">
                      <SelectValue placeholder="Select storage commitment mechanism" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dicom-dir">DICOM DIR</SelectItem>
                      <SelectItem value="storage-commitment">Storage Commitment RQ from Slide Scanner</SelectItem>
                      <SelectItem value="timeout">Timeout</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {config.enrichmentService.storageCommitment === 'timeout' && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="timeout-duration" className="text-sm font-medium text-gray-700">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Timeout Duration (seconds)
                      </Label>
                      <Input
                        id="timeout-duration"
                        type="number"
                        value={config.enrichmentService.timeoutDuration || ''}
                        onChange={(e) => updateConfig('enrichmentService', 'timeoutDuration', e.target.value)}
                        className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                        placeholder="Enter timeout duration in seconds"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Export Service Section */}
      <Card className="border border-gray-200 shadow-sm">
        <Collapsible 
          open={isExpanded('export-service')} 
          onOpenChange={() => toggleSection('export-service')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Activity className="h-5 w-5 text-[#007BFF]" />
                  Export Service
                </CardTitle>
                {isExpanded('export-service') ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              <div className="space-y-6">
                {/* Shared Folder Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Shared Folder</Label>
                      <p className="text-xs text-gray-500">Export to network shared folder</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.exportService.sharedFolder.enabled}
                    onCheckedChange={(checked) => updateNestedConfig('exportService', 'sharedFolder', 'enabled', checked)}
                  />
                </div>
                
                {config.exportService.sharedFolder.enabled && (
                  <div className="ml-8 space-y-2">
                    <Label htmlFor="shared-folder-location" className="text-sm font-medium text-gray-700">Shared Folder Location</Label>
                    <Input
                      id="shared-folder-location"
                      value={config.exportService.sharedFolder.location || ''}
                      onChange={(e) => updateNestedConfig('exportService', 'sharedFolder', 'location', e.target.value)}
                      className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                      placeholder="\\\\server\\shared\\export"
                    />
                  </div>
                )}

                {/* Visiopharm Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Network className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Visiopharm</Label>
                      <p className="text-xs text-gray-500">Pub-sub notification service</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.exportService.visiopharm}
                    onCheckedChange={(checked) => updateConfig('exportService', 'visiopharm', checked)}
                  />
                </div>

                {/* Ibex Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Cloud className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Ibex</Label>
                      <p className="text-xs text-gray-500">Cloud bucket export</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.exportService.ibex}
                    onCheckedChange={(checked) => updateConfig('exportService', 'ibex', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* HL7 Messaging Service Section */}
      <Card className="border border-gray-200 shadow-sm">
        <Collapsible 
          open={isExpanded('hl7-messaging')} 
          onOpenChange={() => toggleSection('hl7-messaging')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <MessageSquare className="h-5 w-5 text-[#007BFF]" />
                  HL7 Messaging Service
                </CardTitle>
                {isExpanded('hl7-messaging') ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hl7-app-name" className="text-sm font-medium text-gray-700">Application Name</Label>
                  <Input
                    id="hl7-app-name"
                    value={config.hl7Messaging.applicationName}
                    onChange={(e) => updateConfig('hl7Messaging', 'applicationName', e.target.value)}
                    className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hl7-ip" className="text-sm font-medium text-gray-700">IP Address</Label>
                  <Input
                    id="hl7-ip"
                    value={config.hl7Messaging.ipAddress}
                    onChange={(e) => updateConfig('hl7Messaging', 'ipAddress', e.target.value)}
                    className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hl7-receiving-port" className="text-sm font-medium text-gray-700">Receiving Port</Label>
                  <Input
                    id="hl7-receiving-port"
                    value={config.hl7Messaging.receivingPort}
                    onChange={(e) => updateConfig('hl7Messaging', 'receivingPort', e.target.value)}
                    className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hl7-output-port" className="text-sm font-medium text-gray-700">Output Port</Label>
                  <Input
                    id="hl7-output-port"
                    value={config.hl7Messaging.outputPort}
                    onChange={(e) => updateConfig('hl7Messaging', 'outputPort', e.target.value)}
                    className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hl7-thread-pool" className="text-sm font-medium text-gray-700">Thread Pool Size</Label>
                  <Input
                    id="hl7-thread-pool"
                    type="number"
                    value={config.hl7Messaging.threadPoolSize}
                    onChange={(e) => updateConfig('hl7Messaging', 'threadPoolSize', e.target.value)}
                    className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
            Reset to Defaults
          </Button>
          <Button className="bg-[#10b981] hover:bg-[#059669] text-white">
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}