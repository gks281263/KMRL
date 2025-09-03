import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { WhatIfPanel } from './WhatIfPanel';
import { WhatIfScenario, PreviewResult } from '@/types/optimization';

// Mock the translation function
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      'review.whatIf.title': 'What-If Analysis',
      'review.whatIf.forceInclude': 'Force Include',
      'review.whatIf.forceExclude': 'Force Exclude',
      'review.whatIf.weightMods': 'Weight Modifications',
      'review.whatIf.branding': 'Branding',
      'review.whatIf.mileage': 'Mileage',
      'review.whatIf.shunting': 'Shunting',
      'review.whatIf.risk': 'Risk',
      'review.whatIf.preview': 'Preview',
      'review.whatIf.previewRunning': 'Preview Running...',
      'review.whatIf.kpiDelta': 'KPI Delta',
      'review.planSummary.punctuality': 'Punctuality',
      'review.planSummary.energy': 'Energy',
      'review.planSummary.brandingHours': 'Branding Hours',
      'review.actions.approve': 'Approve Plan',
      'review.actions.modifyRerun': 'Modify & Re-run',
      'review.actions.confirmApproval': 'Confirm Approval',
      'review.actions.approvalReason': 'Approval Reason',
      'review.actions.digitalSignature': 'Digital Signature',
      'review.actions.password': 'Password',
      'review.actions.confirm': 'Confirm',
      'review.actions.consequences': 'Consequences',
    };
    return translations[key] || key;
  },
}));

// Mock the utility function
vi.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('WhatIfPanel', () => {
  const mockOnPreview = vi.fn();
  const mockOnApprove = vi.fn();
  const mockOnModifyRerun = vi.fn();

  const defaultProps = {
    onPreview: mockOnPreview,
    onApprove: mockOnApprove,
    onModifyRerun: mockOnModifyRerun,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title', () => {
    render(<WhatIfPanel {...defaultProps} />);
    expect(screen.getByText('What-If Analysis')).toBeInTheDocument();
  });

  it('renders force include and exclude sections', () => {
    render(<WhatIfPanel {...defaultProps} />);
    expect(screen.getByText('Force Include')).toBeInTheDocument();
    expect(screen.getByText('Force Exclude')).toBeInTheDocument();
  });

  it('renders weight modification controls', () => {
    render(<WhatIfPanel {...defaultProps} />);
    expect(screen.getByText('Weight Modifications')).toBeInTheDocument();
    expect(screen.getByText('Branding')).toBeInTheDocument();
    expect(screen.getByText('Mileage')).toBeInTheDocument();
    expect(screen.getByText('Shunting')).toBeInTheDocument();
    expect(screen.getByText('Risk')).toBeInTheDocument();
  });

  it('allows adding trains to force include', () => {
    render(<WhatIfPanel {...defaultProps} />);
    const input = screen.getByPlaceholderText('Add train ID');
    
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    // Should not add empty value
    expect(screen.queryByText('T101 ✕')).not.toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: 'T101' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('T101 ✕')).toBeInTheDocument();
  });

  it('allows adding trains to force exclude', () => {
    render(<WhatIfPanel {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('Add train ID');
    const excludeInput = inputs[1]; // Second input is for exclude
    
    fireEvent.change(excludeInput, { target: { value: 'T102' } });
    fireEvent.keyPress(excludeInput, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('T102 ✕')).toBeInTheDocument();
  });

  it('allows removing trains by clicking on them', () => {
    render(<WhatIfPanel {...defaultProps} />);
    const input = screen.getByPlaceholderText('Add train ID');
    
    // Add a train
    fireEvent.change(input, { target: { value: 'T101' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('T101 ✕')).toBeInTheDocument();
    
    // Remove it by clicking
    fireEvent.click(screen.getByText('T101 ✕'));
    expect(screen.queryByText('T101 ✕')).not.toBeInTheDocument();
  });

  it('prevents same train from being in both include and exclude', () => {
    render(<WhatIfPanel {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('Add train ID');
    const includeInput = inputs[0];
    const excludeInput = inputs[1];
    
    // Add to include first
    fireEvent.change(includeInput, { target: { value: 'T101' } });
    fireEvent.keyPress(includeInput, { key: 'Enter', code: 'Enter' });
    
    // Try to add to exclude - should remove from include
    fireEvent.change(excludeInput, { target: { value: 'T101' } });
    fireEvent.keyPress(excludeInput, { key: 'Enter', code: 'Enter' });
    
    expect(screen.queryByText('T101 ✕')).toBeInTheDocument();
    expect(screen.getByText('T101 ✕')).toHaveClass('bg-danger-100');
  });

  it('allows weight modifications with +/- buttons', () => {
    render(<WhatIfPanel {...defaultProps} />);
    
    const brandingRow = screen.getByText('review.whatIf.branding').closest('div');
    const minusButton = brandingRow?.querySelector('button:first-of-type');
    const plusButton = brandingRow?.querySelector('button:last-of-type');
    
    expect(minusButton).toHaveTextContent('-10%');
    expect(plusButton).toHaveTextContent('+10%');
    
    // Click plus button
    fireEvent.click(plusButton!);
    expect(screen.getByText(/10%/)).toBeInTheDocument();
    
    // Click minus button
    fireEvent.click(minusButton!);
    // There are multiple 0% elements, so use getAllByText
    expect(screen.getAllByText(/0%/)).toHaveLength(4);
  });

  it('runs preview when preview button is clicked', async () => {
    const mockPreviewResult: PreviewResult = {
      kpiDelta: {
        punctuality: 2.1,
        energy: -1.5,
        brandingHours: 8.2,
        impact: 'improved',
      },
      topAssignments: [
        { trainId: 'T101', previousRank: 1, newRank: 1, reason: 'No change in ranking' },
      ],
      estimatedRuntime: 45,
      confidence: 0.92,
    };
    
    mockOnPreview.mockResolvedValue(mockPreviewResult);
    
    render(<WhatIfPanel {...defaultProps} />);
    
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    // Button should show loading state
    expect(screen.getByText('Preview Running...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockOnPreview).toHaveBeenCalledWith({
        forceInclude: [],
        forceExclude: [],
        weightMods: {},
      });
    });
    
    // Should show results after preview
    expect(screen.getByText(/KPI Delta/)).toBeInTheDocument();
    expect(screen.getByText(/\+2\.1%/)).toBeInTheDocument();
    expect(screen.getByText(/-1\.5/)).toBeInTheDocument();
    expect(screen.getByText(/\+8\.2h/)).toBeInTheDocument();
  });

  it('shows approval modal when approve button is clicked', async () => {
    const mockPreviewResult: PreviewResult = {
      kpiDelta: {
        punctuality: 1.0,
        energy: 0,
        brandingHours: 0,
        impact: 'improved',
      },
      topAssignments: [],
      estimatedRuntime: 25,
      confidence: 0.88,
    };
    
    mockOnPreview.mockResolvedValue(mockPreviewResult);
    
    render(<WhatIfPanel {...defaultProps} />);
    
    // Run preview first
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText(/KPI Delta/)).toBeInTheDocument();
    });
    
    // Now approve button should be enabled
    const approveButton = screen.getByText('Approve Plan');
    fireEvent.click(approveButton);
    
    // Modal should appear
    expect(screen.getByText(/Confirm Approval/)).toBeInTheDocument();
    expect(screen.getByText(/Approval Reason/)).toBeInTheDocument();
    expect(screen.getByText(/Digital Signature/)).toBeInTheDocument();
    expect(screen.getByText(/Password/)).toBeInTheDocument();
  });

  it('requires approval reason to submit approval', async () => {
    const mockPreviewResult: PreviewResult = {
      kpiDelta: {
        punctuality: 1.0,
        energy: 0,
        brandingHours: 0,
        impact: 'improved',
      },
      topAssignments: [],
      estimatedRuntime: 25,
      confidence: 0.88,
    };
    
    mockOnPreview.mockResolvedValue(mockPreviewResult);
    
    render(<WhatIfPanel {...defaultProps} />);
    
    // Run preview first
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText(/KPI Delta/)).toBeInTheDocument();
    });
    
    // Open approval modal
    const approveButton = screen.getByText('Approve Plan');
    fireEvent.click(approveButton);
    
    // Try to confirm without reason
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeDisabled();
    
    // Add reason
    const reasonTextarea = screen.getByPlaceholderText("Explain why you're approving this plan...");
    fireEvent.change(reasonTextarea, { target: { value: 'This plan looks good' } });
    
    // Now confirm should be enabled
    expect(confirmButton).not.toBeDisabled();
  });

  it('calls onApprove with correct data when approval is submitted', async () => {
    const mockPreviewResult: PreviewResult = {
      kpiDelta: {
        punctuality: 1.0,
        energy: 0,
        brandingHours: 0,
        impact: 'improved',
      },
      topAssignments: [],
      estimatedRuntime: 25,
      confidence: 0.88,
    };
    
    mockOnPreview.mockResolvedValue(mockPreviewResult);
    
    render(<WhatIfPanel {...defaultProps} />);
    
    // Run preview first
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText(/KPI Delta/)).toBeInTheDocument();
    });
    
    // Open approval modal
    const approveButton = screen.getByText('Approve Plan');
    fireEvent.click(approveButton);
    
    // Fill in approval details
    const reasonTextarea = screen.getByPlaceholderText("Explain why you're approving this plan...");
    fireEvent.change(reasonTextarea, { target: { value: 'This plan looks good' } });
    
    const signatureInput = screen.getByPlaceholderText('Your digital signature');
    fireEvent.change(signatureInput, { target: { value: 'John Doe' } });
    
    const passwordInput = screen.getByPlaceholderText('Your password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit approval
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    expect(mockOnApprove).toHaveBeenCalledWith({
      reason: 'This plan looks good',
      digitalSignature: 'John Doe',
      password: 'password123',
      timestamp: expect.any(String),
      approverId: 'current-user',
    });
  });

  it('calls onModifyRerun when modify button is clicked', () => {
    render(<WhatIfPanel {...defaultProps} />);
    
    const modifyButton = screen.getByText('Modify & Re-run');
    fireEvent.click(modifyButton);
    
    expect(mockOnModifyRerun).toHaveBeenCalled();
  });

  it('shows consequences warning in approval modal', async () => {
    const mockPreviewResult: PreviewResult = {
      kpiDelta: {
        punctuality: 1.0,
        energy: 0,
        brandingHours: 0,
        impact: 'improved',
      },
      topAssignments: [],
      estimatedRuntime: 25,
      confidence: 0.88,
    };
    
    mockOnPreview.mockResolvedValue(mockPreviewResult);
    
    render(<WhatIfPanel {...defaultProps} />);
    
    // Run preview first
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText(/KPI Delta/)).toBeInTheDocument();
    });
    
    // Open approval modal
    const approveButton = screen.getByText('Approve Plan');
    fireEvent.click(approveButton);
    
    // Check consequences warning
    expect(screen.getByText(/Consequences/)).toBeInTheDocument();
    expect(screen.getByText(/Notifications will be sent/)).toBeInTheDocument();
    expect(screen.getByText(/Records will be locked/)).toBeInTheDocument();
  });

  it('shows top assignment changes when preview results are available', async () => {
    const mockPreviewResult: PreviewResult = {
      kpiDelta: {
        punctuality: 1.0,
        energy: 0,
        brandingHours: 0,
        impact: 'improved',
      },
      topAssignments: [
        { trainId: 'T101', previousRank: 1, newRank: 1, reason: 'No change in ranking' },
        { trainId: 'T102', previousRank: 3, newRank: 2, reason: 'Improved performance' },
        { trainId: 'T103', previousRank: 2, newRank: 3, reason: 'Slight decline' },
      ],
      estimatedRuntime: 25,
      confidence: 0.88,
    };
    
    mockOnPreview.mockResolvedValue(mockPreviewResult);
    
    render(<WhatIfPanel {...defaultProps} />);
    
    // Run preview
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText('Top Assignment Changes')).toBeInTheDocument();
    });
    
    // Check assignment changes
    expect(screen.getByText('T101')).toBeInTheDocument();
    expect(screen.getByText('T102')).toBeInTheDocument();
    expect(screen.getByText('T103')).toBeInTheDocument();
    expect(screen.getByText('#1 → #1')).toBeInTheDocument();
    expect(screen.getByText('#3 → #2')).toBeInTheDocument();
    expect(screen.getByText('#2 → #3')).toBeInTheDocument();
  });
});
