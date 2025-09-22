import React, { useState } from 'react';
import { Database, Edit, Save, X, CheckCircle, AlertCircle, Activity, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';

interface DataStore {
  id: string;
  name: string;
  type: 'google-dicom-temp' | 'google-dicom-final' | 'hl7-store';
  projectName: string; // Read-only
  ipAddress: string;
  port: string;
  connectionString?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastChecked: string;
}

interface DataStoreConfigProps {
  storeType: 'google-dicom-temp' | 'google-dicom-final' | 'hl7-store';
}

const mockDataStores: Record<string, DataStore> = {
  'google-dicom-temp': {
    id: '1',
    name: 'Google DICOM Temp Store',
    type: 'google-dicom-temp',
    projectName: 'endeavor-health-pathology',
    ipAddress: '34.102.136.180',
    port: '443',
    connectionString: 'projects/endeavor-health-pathology/locations/us-central1/datasets/temp/dicomStores/staging',
    status: 'connected',
    lastChecked: '2024-01-15 10:30:00'
  },
  'google-dicom-final': {
    id: '2',
    name: 'Google DICOM Final Store',
    type: 'google-dicom-final',
    projectName: 'endeavor-health-pathology',
    ipAddress: '34.102.136.181',
    port: '443',
    connectionString: 'projects/endeavor-health-pathology/locations/us-central1/datasets/production/dicomStores/final',
    status: 'connected',
    lastChecked: '2024-01-15 10:32:00'
  },
  'hl7-store': {
    id: '3',
    name: 'HL7 FHIR Store',
    type: 'hl7-store',
    projectName: 'endeavor-health-pathology',
    ipAddress: '34.102.136.182',
    port: '8080',
    connectionString: 'projects/endeavor-health-pathology/locations/us-central1/datasets/hl7/fhirStores/pathology',
    status: 'error',
    lastChecked: '2024-01-15 10:28:00'
  }
};

export function DataStoreConfig({ storeType }: DataStoreConfigProps) {
  const [dataStore, setDataStore] = useState<DataStore>(mockDataStores[storeType]);
  const [editingFields, setEditingFields] = useState<{[key: string]: boolean}>({});
  const [tempValues, setTempValues] = useState<{[key: string]: string}>({});

  const getStatusBadge = (status: DataStore['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            🟢 Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">
            ⚫ Disconnected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            🔴 Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStoreIcon = () => {
    switch (dataStore.type) {
      case 'hl7-store':
        return <Activity className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const handleEditField = (field: string) => {
    setEditingFields(prev => ({ ...prev, [field]: true }));
    setTempValues(prev => ({ 
      ...prev, 
      [field]: dataStore[field as keyof DataStore] as string 
    }));
  };

  const handleSaveField = (field: string) => {
    if (!tempValues[field]?.trim()) {
      toast.error(`${field} cannot be empty`);
      return;
    }

    setDataStore(prev => ({
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
          const success = Math.random() > 0.3; // 70% success rate for demo
          if (success) {
            setDataStore(prev => ({ 
              ...prev, 
              status: 'connected',
              lastChecked: new Date().toLocaleString()
            }));
            resolve('Connection successful');
          } else {
            setDataStore(prev => ({ 
              ...prev, 
              status: 'error',
              lastChecked: new Date().toLocaleString()
            }));
            throw new Error('Connection failed');
          }
        }, 2000);
      }),
      {
        loading: 'Testing connection...',
        success: 'Connection test successful',
        error: 'Connection test failed',
      }
    );
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Ip/, 'IP');
  };

  const editableFields = ['ipAddress', 'port', 'connectionString'];

  return (
    <div className="px-6 space-y-4 min-h-full">
      {/* Optimized Header Section - matching slide scanner layout */}
      <div className="grid grid-cols-12 gap-6 items-center py-4 min-h-[80px]">
        {/* Left: Title and Description */}
        <div className="col-span-12 lg:col-span-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">{dataStore.name}</h1>
          <p className="text-sm text-gray-600">Configure connection parameters and monitor data store status</p>
        </div>
        
        {/* Right: Action Controls */}
        <div className="col-span-12 lg:col-span-4 flex items-center gap-3 lg:justify-end">
          <Button 
            variant="outline" 
            onClick={testConnection}
            className="border-gray-200 hover:bg-[#f8faff] hover:border-[#007BFF] px-4 h-10 flex-shrink-0"
            aria-label="Test connection"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
        </div>
      </div>

      {/* Configuration Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div>
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-200 bg-gray-50">
                <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[25%]">Parameter</TableHead>
                <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[45%]">Value</TableHead>
                <TableHead className="font-semibold text-gray-700 px-4 py-3 w-[20%]">Status</TableHead>
                <TableHead className="w-[10%] px-4 py-3" aria-label="Actions"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Store Information Row */}
              <TableRow className="hover:bg-[#f8faff] border-gray-200 transition-colors bg-white">
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStoreIcon()}
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Store Name</div>
                      <div className="text-xs text-gray-500">Data store identifier</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{dataStore.name}</div>
                    <div className="text-xs text-gray-500">Type: {dataStore.type.replace('-', ' ')}</div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">{getStatusBadge(dataStore.status)}</TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs text-gray-400">Read-only</span>
                </TableCell>
              </TableRow>

              {/* Project Name Row */}
              <TableRow className="hover:bg-[#f8faff] border-gray-200 transition-colors bg-gray-50/30">
                <TableCell className="px-4 py-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Project Name</div>
                    <div className="text-xs text-gray-500">Google Cloud project</div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <code className="bg-[#e8f2ff] text-[#007BFF] px-2 py-1 rounded text-xs font-medium border border-[#c7e2ff] block w-fit">
                    {dataStore.projectName}
                  </code>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                    🔗 Linked
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs text-gray-400">Read-only</span>
                </TableCell>
              </TableRow>

              {/* Editable Fields */}
              {editableFields.map((field, index) => {
                const isEditing = editingFields[field];
                const fieldValue = isEditing 
                  ? tempValues[field] 
                  : dataStore[field as keyof DataStore] as string;

                return (
                  <TableRow 
                    key={field}
                    className={`hover:bg-[#f8faff] border-gray-200 transition-colors ${
                      (index + 2) % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{formatFieldName(field)}</div>
                        <div className="text-xs text-gray-500">
                          {field === 'connectionString' 
                            ? 'Full resource path' 
                            : field === 'ipAddress' 
                              ? 'Server endpoint' 
                              : 'Service port'
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={fieldValue || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="h-8 text-sm"
                          placeholder={
                            field === 'connectionString' 
                              ? 'Enter the full connection string/path'
                              : `Enter ${formatFieldName(field).toLowerCase()}`
                          }
                        />
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {field === 'connectionString' ? (
                              <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono">
                                {fieldValue || 'Not configured'}
                              </code>
                            ) : field === 'ipAddress' ? (
                              <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono">
                                {fieldValue}:{dataStore.port}
                              </code>
                            ) : (
                              fieldValue
                            )}
                          </div>
                          {field === 'ipAddress' && (
                            <div className="text-xs text-gray-500">Last checked: {dataStore.lastChecked}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {field === 'ipAddress' ? getStatusBadge(dataStore.status) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          ⚙️ Config
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveField(field)}
                            className="bg-green-600 hover:bg-green-700 h-6 w-6 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCancelEdit(field)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditField(field)}
                          className="h-6 w-6 p-0 hover:bg-[#f0f7ff]"
                          aria-label={`Edit ${formatFieldName(field)}`}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Configuration Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Configuration last updated: {dataStore.lastChecked}
          </p>
        </div>
      </div>
    </div>
  );
}