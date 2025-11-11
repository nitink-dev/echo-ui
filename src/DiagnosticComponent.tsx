// src/DiagnosticComponent.tsx
// TEMPORARY - Use this to diagnose the issue
import React from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from './hooks';

export function DiagnosticComponent() {
  const dispatch = useAppDispatch();
  
  // Try to get Redux state
  let scanners, loading, error;
  let storeError = null;
  
  try {
    scanners = useSelector((state: any) => state.scanners?.items);
    loading = useSelector((state: any) => state.scanners?.loading);
    error = useSelector((state: any) => state.scanners?.error);
  } catch (e: any) {
    storeError = e.message;
  }

  // Check imports
  const checks = {
    hooks: {
      status: typeof dispatch === 'function',
      error: typeof dispatch !== 'function' ? 'useAppDispatch not working' : null
    },
    redux: {
      status: storeError === null,
      error: storeError
    },
    scanners: {
      status: scanners !== undefined,
      data: scanners,
      loading,
      error
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔍 Diagnostic Report</h1>
      
      {/* Hooks Check */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">1. Hooks</h2>
        <div className={`p-3 rounded ${checks.hooks.status ? 'bg-green-100' : 'bg-red-100'}`}>
          {checks.hooks.status ? (
            <p className="text-green-800">✅ Hooks working correctly</p>
          ) : (
            <div className="text-red-800">
              <p className="font-bold">❌ Hooks Error</p>
              <p>{checks.hooks.error}</p>
              <p className="mt-2 text-sm">
                <strong>Fix:</strong> Make sure src/hooks/index.ts exists and exports useAppDispatch
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Redux Store Check */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">2. Redux Store</h2>
        <div className={`p-3 rounded ${checks.redux.status ? 'bg-green-100' : 'bg-red-100'}`}>
          {checks.redux.status ? (
            <p className="text-green-800">✅ Redux store accessible</p>
          ) : (
            <div className="text-red-800">
              <p className="font-bold">❌ Redux Error</p>
              <p>{checks.redux.error}</p>
              <p className="mt-2 text-sm">
                <strong>Fix:</strong> Check your store configuration in src/store/index.ts or src/store.ts
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scanners Data Check */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">3. Scanners State</h2>
        <div className={`p-3 rounded ${checks.scanners.status ? 'bg-green-100' : 'bg-red-100'}`}>
          {checks.scanners.status ? (
            <div className="text-green-800">
              <p className="font-bold">✅ Scanners state exists</p>
              <p className="mt-2">Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Scanner count: {scanners?.length || 0}</p>
              {error && <p className="text-red-600 mt-2">Error: {error}</p>}
            </div>
          ) : (
            <div className="text-red-800">
              <p className="font-bold">❌ Scanners state not found</p>
              <p className="mt-2 text-sm">
                <strong>Fix:</strong> Check if scannerSlice is added to store reducers
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Component Import Check */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">4. Component Imports</h2>
        <div className="space-y-2">
          {[
            { name: 'ScannerList', path: './components/features/scanner/ScannerList/ScannerList' },
            { name: 'ScannerForm', path: './components/features/scanner/ScannerForm/ScannerForm' },
            { name: 'ScannerDetails', path: './components/features/scanner/ScannerDetails/ScannerDetails' },
            { name: 'QAConfig', path: './components/features/qa/QAConfig/QAConfig' },
          ].map(comp => {
            let importStatus = 'Unknown';
            try {
              require(comp.path);
              importStatus = 'Success';
            } catch (e: any) {
              importStatus = e.message;
            }
            
            return (
              <div key={comp.name} className={`p-2 rounded ${importStatus === 'Success' ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="font-mono text-sm">
                  {importStatus === 'Success' ? '✅' : '❌'} {comp.name}
                </p>
                {importStatus !== 'Success' && (
                  <p className="text-xs text-red-600 mt-1">{importStatus}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* File Structure Check */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">5. Expected File Structure</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-xs overflow-x-auto">
{`src/
├── components/
│   ├── features/
│   │   ├── scanner/
│   │   │   ├── ScannerList/
│   │   │   │   ├── ScannerList.tsx
│   │   │   │   ├── ScannerTable.tsx
│   │   │   │   └── ScannerFilters.tsx
│   │   │   ├── ScannerForm/
│   │   │   │   ├── ScannerForm.tsx
│   │   │   │   └── ScannerFormFields.tsx
│   │   │   └── ScannerDetails/
│   │   │       ├── ScannerDetails.tsx
│   │   │       ├── ScannerInfo.tsx
│   │   │       └── AnalysisReports.tsx
│   │   └── qa/
│   │       └── QAConfig/
│   │           └── QAConfig.tsx
├── hooks/
│   └── index.ts
├── store/
│   └── slices/
├── types/
│   ├── scanner.types.ts
│   ├── common.types.ts
│   └── index.ts
└── utils/
    ├── helpers.ts
    └── constants.ts`}
          </pre>
        </div>
      </div>

      {/* Action Items */}
      <div className="p-4 border-2 border-blue-500 rounded bg-blue-50">
        <h2 className="text-xl font-bold mb-2">📋 Next Steps:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Check console for any error messages (F12)</li>
          <li>Verify all files from artifacts are copied</li>
          <li>Ensure folder structure matches exactly</li>
          <li>Check import paths in App.tsx</li>
          <li>Verify store configuration includes all slices</li>
        </ol>
      </div>

      {/* Raw State Dump */}
      <div className="mt-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">🔬 Raw State (Debug)</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
          <pre className="text-xs">
            {JSON.stringify({ scanners, loading, error }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}