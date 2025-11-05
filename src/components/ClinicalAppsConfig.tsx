import React, { useState } from 'react';
import { Activity, Settings, Edit, Save, X, CheckCircle, AlertCircle, Stethoscope, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';

interface ClinicalApplication {
  id: string;
  name: string;
  type: 'lis' | 'synapse';
  projectName: string; // Read-only
  serverUrl: string;
  port: string;
  apiEndpoint: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  description: string;
}

interface ClinicalAppsConfigProps {
  appType: 'lis' | 'synapse';
}

const mockApplications: Record<string, ClinicalApplication> = {
  'lis': {
    id: '1',
    name: 'Laboratory Information System',
    type: 'lis',
    projectName: 'endeavor-health-pathology',
    serverUrl: 'lis.endeavorhealth.org',
    port: '443',
    apiEndpoint: '/api/v2/pathology',
    version: '2.1.4',
    status: 'active',
    lastSync: '2024-01-15 10:45:00',
    description: 'Primary LIS integration for pathology data exchange'
  },
  'synapse': {
    id: '2',
    name: 'Synapse PACS System',
    type: 'synapse',
    projectName: 'endeavor-health-pathology',
    serverUrl: 'synapse.endeavorhealth.org',
    port: '11112',
    apiEndpoint: '/dicom',
    version: '5.2.1',
    status: 'error',
    lastSync: '2024-01-15 08:30:00',
    description: 'PACS integration for digital pathology image management'
  }
};

export function ClinicalAppsConfig({ appType }: ClinicalAppsConfigProps) {
  const [application, setApplication] = useState<ClinicalApplication>(mockApplications[appType]);
  const [editingFields, setEditingFields] = useState<{[key: string]: boolean}>({});
  const [tempValues, setTempValues] = useState<{[key: string]: string}>({});

  const getStatusBadge = (status: ClinicalApplication['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getAppIcon = () => {
    switch (application.type) {
      case 'lis':
        return <Activity className="h-5 w-5" />;
      case 'synapse':
        return <Settings className="h-5 w-5" />;
      default:
        return <Stethoscope className="h-5 w-5" />;
    }
  };

  const handleEditField = (field: string) => {
    setEditingFields(prev => ({ ...prev, [field]: true }));
    setTempValues(prev => ({ 
      ...prev, 
      [field]: application[field as keyof ClinicalApplication] as string 
    }));
  };

  const handleSaveField = (field: string) => {
    if (!tempValues[field]?.trim()) {
      toast.error(`${field} cannot be empty`);
      return;
    }

    setApplication(prev => ({
      ...prev,
      [field]: tempValues[field]
    }));

    setEditingFields(prev => ({ ...prev, [field]: false }));
    toast.success('Configuration updated successfully');
  };

  const handleCancelEdit = (field: string) => {
    setEditingFields(prev => ({ ...prev, [field]: false }));
    setTempValues(prev => {
      const newValues = { ...prev };
      delete newValues[field];
      return newValues;
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setTempValues(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          const success = Math.random() > 0.4; // 60% success rate for demo
          if (success) {
            setApplication(prev => ({ 
              ...prev, 
              status: 'active',
              lastSync: new Date().toLocaleString()
            }));
            resolve('Connection successful');
          } else {
            setApplication(prev => ({ 
              ...prev, 
              status: 'error',
              lastSync: new Date().toLocaleString()
            }));
            throw new Error('Connection failed');
          }
        }, 2500);
      }),
      {
        loading: 'Testing connection...',
        success: 'Connection test successful',
        error: 'Connection test failed',
      }
    );
  };

  const syncData = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setApplication(prev => ({ 
            ...prev, 
            lastSync: new Date().toLocaleString()
          }));
          resolve('Data synchronization completed');
        }, 3000);
      }),
      {
        loading: 'Synchronizing data...',
        success: 'Data synchronized successfully',
        error: 'Synchronization failed',
      }
    );
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Url/, 'URL')
      .replace(/Api/, 'API');
  };

  const editableFields = ['serverUrl', 'port', 'apiEndpoint'];

  return (
    <div className="space-y-6 bg-[rgba(0,0,0,0)]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{application.name}</h1>
        <p className="text-gray-600 mt-1">{application.description}</p>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getAppIcon()}
              <div>
                <div className="text-lg font-medium">{application.name}</div>
                <div className="text-sm text-gray-500">Version {application.version} • Last sync: {application.lastSync}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(application.status)}
              <Button variant="outline" size="sm" onClick={testConnection}>
                Test Connection
              </Button>
              <Button variant="outline" size="sm" onClick={syncData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Configuration */}
      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connection">Connection Settings</TabsTrigger>
          <TabsTrigger value="info">Application Info</TabsTrigger>
        </TabsList>

        {/* Connection Settings Tab */}
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Connection Configuration</CardTitle>
              <CardDescription>
                Manage connection parameters for {application.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Project Name (Read-only) */}
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={application.projectName}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">This field is read-only</p>
                </div>

                {/* Editable Fields */}
                {editableFields.map((field) => {
                  const isEditing = editingFields[field];
                  const fieldValue = isEditing 
                    ? tempValues[field] 
                    : application[field as keyof ClinicalApplication] as string;

                  return (
                    <div key={field} className="space-y-2">
                      <Label>{formatFieldName(field)}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={fieldValue || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          readOnly={!isEditing}
                          className={`flex-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                          placeholder={`Enter ${formatFieldName(field).toLowerCase()}`}
                        />
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveField(field)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCancelEdit(field)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditField(field)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {field === 'apiEndpoint' && (
                        <p className="text-xs text-gray-500">
                          API endpoint path for {application.type.toUpperCase()} integration
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Application Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Application Information</CardTitle>
              <CardDescription>System details and current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Application Name</label>
                    <p className="text-base mt-1">{application.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-base mt-1 uppercase">{application.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Version</label>
                    <p className="text-base mt-1">{application.version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(application.status)}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Server URL</label>
                    <p className="text-base mt-1 font-mono">{application.serverUrl}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Port</label>
                    <p className="text-base mt-1">{application.port}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">API Endpoint</label>
                    <p className="text-base mt-1 font-mono">{application.apiEndpoint}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Synchronization</label>
                    <p className="text-base mt-1">{application.lastSync}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 pt-6 border-t">
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-base mt-2 text-gray-700">{application.description}</p>
              </div>

              {/* System Integration Notes */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Integration Notes</h4>
                {application.type === 'lis' ? (
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Handles pathology report data exchange</li>
                    <li>• Supports HL7 FHIR and legacy message formats</li>
                    <li>• Real-time bidirectional synchronization</li>
                    <li>• Automated order management and result reporting</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• DICOM image storage and retrieval</li>
                    <li>• Supports whole slide imaging (WSI) formats</li>
                    <li>• Advanced viewer integration</li>
                    <li>• Automated archival and backup processes</li>
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}