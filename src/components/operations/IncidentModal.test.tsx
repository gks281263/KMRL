import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { IncidentModal } from '@/components/operations/IncidentModal';
import { operationsApi } from '@/services/api/operations';

// Mock the modules
vi.mock('@/services/api/operations');
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

const mockOperationsApi = vi.mocked(operationsApi);

describe('IncidentModal', () => {
  const mockFaultTemplates = [
    {
      id: 'template-1',
      code: 'MECH-001',
      description: 'Brake system malfunction',
      category: 'mechanical' as const,
      severity: 'high' as const,
      commonSolutions: ['Check brake fluid', 'Inspect brake pads'],
      estimatedResolutionTime: 30
    },
    {
      id: 'template-2',
      code: 'ELEC-002',
      description: 'Electrical system failure',
      category: 'electrical' as const,
      severity: 'critical' as const,
      commonSolutions: ['Check circuit breakers', 'Inspect wiring'],
      estimatedResolutionTime: 60
    }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    trainId: 'T001',
    serviceId: 'dep-1'
  };

  beforeEach(() => {
    mockOperationsApi.getFaultTemplates.mockResolvedValue({
      success: true,
      data: mockFaultTemplates,
      timestamp: '2024-01-01T08:00:00Z'
    });
  });

  it('renders the incident modal with correct title', () => {
    render(<IncidentModal {...defaultProps} />);
    
    expect(screen.getByText('ops.incident.title')).toBeInTheDocument();
  });

  it('loads fault templates when modal opens', async () => {
    render(<IncidentModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockOperationsApi.getFaultTemplates).toHaveBeenCalled();
    });
  });

  it('displays quick templates when available', async () => {
    render(<IncidentModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('ops.incident.quickTemplates')).toBeInTheDocument();
      expect(screen.getByText('MECH-001')).toBeInTheDocument();
      expect(screen.getByText('ELEC-002')).toBeInTheDocument();
    });
  });

  it('pre-fills form with provided train and service IDs', () => {
    render(<IncidentModal {...defaultProps} />);
    
    const trainIdInput = screen.getByLabelText('ops.incident.trainId *') as HTMLInputElement;
    const serviceIdInput = screen.getByLabelText('ops.incident.serviceId') as HTMLInputElement;
    
    expect(trainIdInput.value).toBe('T001');
    expect(serviceIdInput.value).toBe('dep-1');
  });

  it('allows selecting fault templates to pre-fill form', async () => {
    render(<IncidentModal {...defaultProps} />);
    
    await waitFor(() => {
      const templateButton = screen.getByText('MECH-001');
      fireEvent.click(templateButton);
    });
    
    const typeSelect = screen.getByLabelText('ops.incident.type *') as HTMLSelectElement;
    const severitySelect = screen.getByLabelText('ops.incident.severity *') as HTMLSelectElement;
    const descriptionTextarea = screen.getByLabelText('ops.incident.description *') as HTMLTextAreaElement;
    const faultCodeInput = screen.getByLabelText('ops.incident.faultCode') as HTMLInputElement;
    
    expect(typeSelect.value).toBe('mechanical');
    expect(severitySelect.value).toBe('high');
    expect(descriptionTextarea.value).toBe('Brake system malfunction');
    expect(faultCodeInput.value).toBe('MECH-001');
  });

  it('validates required fields before submission', async () => {
    render(<IncidentModal {...defaultProps} />);
    
    const submitButton = screen.getByText('ops.incident.report');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
  });

  it('submits incident data when form is valid', async () => {
    render(<IncidentModal {...defaultProps} />);
    
    // Fill in required fields
    const descriptionTextarea = screen.getByLabelText('ops.incident.description *') as HTMLTextAreaElement;
    fireEvent.change(descriptionTextarea, { target: { value: 'Test incident description' } });
    
    const submitButton = screen.getByText('ops.incident.report');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        trainId: 'T001',
        serviceId: 'dep-1',
        type: 'mechanical',
        severity: 'medium',
        description: 'Test incident description',
        faultCode: '',
        reportedBy: 'current_user'
      });
    });
  });

  it('closes modal and resets form after successful submission', async () => {
    render(<IncidentModal {...defaultProps} />);
    
    // Fill in required fields
    const descriptionTextarea = screen.getByLabelText('ops.incident.description *') as HTMLTextAreaElement;
    fireEvent.change(descriptionTextarea, { target: { value: 'Test incident description' } });
    
    const submitButton = screen.getByText('ops.incident.report');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('shows error message when submission fails', async () => {
    const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));
    
    render(<IncidentModal {...defaultProps} onSubmit={mockOnSubmit} />);
    
    // Fill in required fields
    const descriptionTextarea = screen.getByLabelText('ops.incident.description *') as HTMLTextAreaElement;
    fireEvent.change(descriptionTextarea, { target: { value: 'Test incident description' } });
    
    const submitButton = screen.getByText('ops.incident.report');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });
  });

  it('clears error when form fields are changed', async () => {
    const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));
    
    render(<IncidentModal {...defaultProps} onSubmit={mockOnSubmit} />);
    
    // Fill in required fields and submit to trigger error
    const descriptionTextarea = screen.getByLabelText('ops.incident.description *') as HTMLTextAreaElement;
    fireEvent.change(descriptionTextarea, { target: { value: 'Test incident description' } });
    
    const submitButton = screen.getByText('ops.incident.report');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });
    
    // Change a field to clear error
    fireEvent.change(descriptionTextarea, { target: { value: 'Updated description' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Submission failed')).not.toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<IncidentModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('common.cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles fault template loading error gracefully', async () => {
    mockOperationsApi.getFaultTemplates.mockRejectedValue(new Error('Failed to load templates'));
    
    render(<IncidentModal {...defaultProps} />);
    
    // Should not crash and should still render the form
    expect(screen.getByText('ops.incident.title')).toBeInTheDocument();
    expect(screen.getByLabelText('ops.incident.description *')).toBeInTheDocument();
  });

  it('uses initial type when provided', () => {
    render(<IncidentModal {...defaultProps} initialType="electrical" />);
    
    const typeSelect = screen.getByLabelText('ops.incident.type *') as HTMLSelectElement;
    expect(typeSelect.value).toBe('electrical');
  });

  it('handles empty fault templates gracefully', async () => {
    mockOperationsApi.getFaultTemplates.mockResolvedValue({
      success: true,
      data: [],
      timestamp: '2024-01-01T08:00:00Z'
    });
    
    render(<IncidentModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByText('ops.incident.quickTemplates')).not.toBeInTheDocument();
    });
  });

  it('limits quick templates to 6 items', async () => {
    const manyTemplates = Array.from({ length: 10 }, (_, i) => ({
      id: `template-${i}`,
      code: `CODE-${i}`,
      description: `Description ${i}`,
      category: 'mechanical' as const,
      severity: 'medium' as const,
      commonSolutions: [],
      estimatedResolutionTime: 30
    }));
    
    mockOperationsApi.getFaultTemplates.mockResolvedValue({
      success: true,
      data: manyTemplates,
      timestamp: '2024-01-01T08:00:00Z'
    });
    
    render(<IncidentModal {...defaultProps} />);
    
    await waitFor(() => {
      // Should only show first 6 templates
      expect(screen.getByText('CODE-0')).toBeInTheDocument();
      expect(screen.getByText('CODE-5')).toBeInTheDocument();
      expect(screen.queryByText('CODE-6')).not.toBeInTheDocument();
    });
  });
});
