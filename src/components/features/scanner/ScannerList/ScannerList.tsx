import React, { useState } from 'react';
import { SlideScanner } from '../../../../types/scanner.types';
import { ScannerFilters } from './ScannerFilters';
import { ScannerTable } from './ScannerTable';

interface ScannerListProps {
  scanners: SlideScanner[];
  loading: boolean;
  onAddScanner: () => void;
  onEditScanner: (scanner: SlideScanner) => void;
  onViewScanner: (scanner: SlideScanner) => void;
  onDeleteScanner: (scannerId: string) => void;
}

export function ScannerList({
  scanners,
  loading,
  onAddScanner,
  onEditScanner,
  onViewScanner,
  onDeleteScanner,
}: ScannerListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScanners = scanners.filter((scanner) => {
    const term = searchTerm.toLowerCase();
    return (
      (scanner.name?.toLowerCase() || '').includes(term) ||
      (scanner.aeTitle?.toLowerCase() || '').includes(term) ||
      (scanner.deviceSerialNumber?.toLowerCase() || '').includes(term) ||
      (scanner.model?.toLowerCase() || '').includes(term) ||
      (scanner.location?.toLowerCase() || '').includes(term)
    );
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading scanners...</div>;
  }

  if (!scanners) {
    return <div className="p-8 text-center text-red-600">Failed to load scanners</div>;
  }

  return (
    <div className="px-6 space-y-4 min-h-full">
      <ScannerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddScanner={onAddScanner}
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredScanners.length === 0 && searchTerm ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scanners found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <ScannerTable
            scanners={filteredScanners}
            onViewScanner={onViewScanner}
            onEditScanner={onEditScanner}
            onDeleteScanner={onDeleteScanner}
            onAddScanner={onAddScanner}
          />
        )}
      </div>
    </div>
  );
}