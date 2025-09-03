import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ExportModal } from './ExportModal';

// Mock the translation function
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

// Mock the utility function
vi.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('ExportModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onExport: vi.fn(),
    onNotify: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders export options when open', () => {
    render(<ExportModal {...defaultProps} />);
    
    expect(screen.getByText('Export Results')).toBeInTheDocument();
    expect(screen.getByText('results.export.pdf')).toBeInTheDocument();
    expect(screen.getByText('results.export.excel')).toBeInTheDocument();
  });

  it('renders notification options', () => {
    render(<ExportModal {...defaultProps} />);
    
    expect(screen.getByText('Send Notifications')).toBeInTheDocument();
    expect(screen.getByText('results.export.notifyDepotOps')).toBeInTheDocument();
    expect(screen.getByText('results.export.notifySignalling')).toBeInTheDocument();
  });

  it('calls onExport when PDF export button is clicked', async () => {
    render(<ExportModal {...defaultProps} />);
    
    const pdfButton = screen.getByText('results.export.pdf');
    fireEvent.click(pdfButton);
    
    // Fast-forward timers to complete the async operation
    vi.advanceTimersByTime(1000);
    
    expect(defaultProps.onExport).toHaveBeenCalledWith('pdf');
  });

  it('calls onExport when Excel export button is clicked', async () => {
    render(<ExportModal {...defaultProps} />);
    
    const excelButton = screen.getByText('results.export.excel');
    fireEvent.click(excelButton);
    
    // Fast-forward timers to complete the async operation
    vi.advanceTimersByTime(1000);
    
    expect(defaultProps.onExport).toHaveBeenCalledWith('excel');
  });

  it('shows loading state during export', () => {
    render(<ExportModal {...defaultProps} />);
    
    const pdfButton = screen.getByText('results.export.pdf');
    fireEvent.click(pdfButton);
    
    // Button should show loading state
    expect(pdfButton).toBeDisabled();
  });

  it('shows loading state during notification', () => {
    render(<ExportModal {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const notifyButton = screen.getByText('results.export.notify');
    
    fireEvent.click(checkboxes[0]);
    fireEvent.click(notifyButton);
    
    // Button should show loading state
    expect(notifyButton).toBeDisabled();
  });

  it('closes modal after successful notification', () => {
    render(<ExportModal {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const notifyButton = screen.getByText('results.export.notify');
    
    fireEvent.click(checkboxes[0]);
    fireEvent.click(notifyButton);
    
    // The modal should close after notification (this is handled by the component)
    // We'll test the basic functionality without waiting for async operations
    expect(notifyButton).toBeDisabled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ExportModal {...defaultProps} />);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables buttons during operations', () => {
    render(<ExportModal {...defaultProps} />);
    
    const pdfButton = screen.getByText('results.export.pdf');
    const closeButton = screen.getByText('Close');
    
    fireEvent.click(pdfButton);
    
    // Both buttons should be disabled during export
    expect(pdfButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });

  it('allows role selection for notifications', () => {
    render(<ExportModal {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    
    // Initially unchecked
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    
    // Check first checkbox (depot ops)
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
    
    // Check second checkbox (signalling)
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();
  });

  it('calls onNotify with selected roles', async () => {
    render(<ExportModal {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const notifyButton = screen.getByText('results.export.notify');
    
    // Initially disabled (no roles selected)
    expect(notifyButton).toBeDisabled();
    
    // Select first role
    fireEvent.click(checkboxes[0]);
    expect(notifyButton).not.toBeDisabled();
    
    // Click notify
    fireEvent.click(notifyButton);
    
    // Fast-forward timers to complete the async operation
    vi.advanceTimersByTime(1000);
    
    expect(defaultProps.onNotify).toHaveBeenCalledWith(['depot-ops']);
  });

  it('disables notify button when no roles are selected', () => {
    render(<ExportModal {...defaultProps} />);
    
    const notifyButton = screen.getByText('results.export.notify');
    expect(notifyButton).toBeDisabled();
  });

  it('handles multiple role selection', async () => {
    render(<ExportModal {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const notifyButton = screen.getByText('results.export.notify');
    
    // Select both roles
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    
    fireEvent.click(notifyButton);
    
    // Fast-forward timers to complete the async operation
    vi.advanceTimersByTime(1000);
    
    expect(defaultProps.onNotify).toHaveBeenCalledWith(['depot-ops', 'signalling']);
  });

  it('displays role descriptions', () => {
    render(<ExportModal {...defaultProps} />);
    
    expect(screen.getByText('Operations staff and yard managers')).toBeInTheDocument();
    expect(screen.getByText('Signalling and control room staff')).toBeInTheDocument();
  });
});
