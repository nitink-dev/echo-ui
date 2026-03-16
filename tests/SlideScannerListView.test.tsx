import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SlideScannerListView } from '../src/components/SlideScannerListView'

const mockScanners = [
  {
    id: '1',
    name: 'Scanner A',
    aeTitle: 'AE_A',
    model: 'Model X',
    deviceSerialNumber: '12345',
    location: 'Lab 1',
    hospitalName: 'Endeavor Health',
    department: 'Pathology',
    ipAddress: '192.168.0.1',
    port: '104',
    vendor: 'Leica',
    status: 'online',
    lastSeen: '2025-10-10T12:00:00Z'
  }
]

describe('SlideScannerListView', () => {
  it('renders scanner list', () => {
    render(
      <SlideScannerListView
        scanners={mockScanners}
        onAddScanner={vi.fn()}
        onEditScanner={vi.fn()}
        onViewScanner={vi.fn()}
        onDeleteScanner={vi.fn()}
      />
    )

    expect(screen.getByText('Slide Scanners')).toBeInTheDocument()
    expect(screen.getByText('Scanner A')).toBeInTheDocument()
    expect(screen.getByText('AE_A')).toBeInTheDocument()
  })
})
