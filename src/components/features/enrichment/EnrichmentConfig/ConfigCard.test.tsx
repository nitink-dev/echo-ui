import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ConfigCard } from './ConfigCard';

describe('ConfigCard Component', () => {
  const mockProps = {
    title: 'Test Configuration',
    icon: <span data-testid="test-icon">Icon</span>,
    children: <div data-testid="card-content">Test Content</div>,
    isEditing: false,
    loading: false,
    onEdit: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders card with title and icon', () => {
    render(<ConfigCard {...mockProps} />);
    expect(screen.getByText('Test Configuration')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  test('renders children content', () => {
    render(<ConfigCard {...mockProps} />);
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  test('shows Edit button when not editing', () => {
    render(<ConfigCard {...mockProps} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  test('shows Save and Cancel buttons when editing', () => {
    render(<ConfigCard {...mockProps} isEditing={true} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('calls onEdit when Edit button is clicked', () => {
    render(<ConfigCard {...mockProps} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(mockProps.onEdit).toHaveBeenCalledTimes(1);
  });

  test('calls onSave when Save button is clicked', () => {
    render(<ConfigCard {...mockProps} isEditing={true} />);
    fireEvent.click(screen.getByText('Save'));
    expect(mockProps.onSave).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when Cancel button is clicked', () => {
    render(<ConfigCard {...mockProps} isEditing={true} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('disables Save button when loading', () => {
    render(<ConfigCard {...mockProps} isEditing={true} loading={true} />);
    const saveButton = screen.getByText('Save').closest('button');
    expect(saveButton).toBeDisabled();
  });

  test('card is collapsible by default', () => {
    render(<ConfigCard {...mockProps} />);
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });
});
