import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { XAIModal } from './XAIModal';
import { XAIAnalysis } from '@/types/optimization';

// Mock the translation function
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

// Mock the utility function
vi.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock the Modal component
vi.mock('@/components/ui/Modal', () => ({
  Modal: ({ children, isOpen, onClose }: any) => 
    isOpen ? (
      <div data-testid="modal-overlay" onClick={onClose}>
        <div data-testid="modal-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    ) : null,
}));

// Mock the Button component
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('XAIModal', () => {
  const mockData: XAIAnalysis = {
    trainId: 'T101',
    factorWeights: [
      { factor: 'branding', weight: 0.35, impact: 'positive', evidence: 'High-visibility route, peak hours' },
      { factor: 'mileage', weight: 0.28, impact: 'neutral', evidence: 'Balanced with fleet average' },
      { factor: 'shunting', weight: 0.22, impact: 'neutral', evidence: 'Minimal yard movements required' },
    ],
    constraintViolations: [
      { constraint: 'maintenance_schedule', severity: 'low', impact: 'Minor maintenance due in 72h' },
    ],
    alternativeRanks: [
      { scenario: 'branding_priority', rank: 1, score: 0.92, factors: ['branding', 'route_visibility'] },
      { scenario: 'mileage_balance', rank: 3, score: 0.87, factors: ['mileage', 'fleet_balance'] },
      { scenario: 'risk_mitigation', rank: 5, score: 0.78, factors: ['safety', 'compliance'] },
    ],
    recommendations: [
      'Maintain current assignment for optimal branding exposure',
      'Consider peak hour branding opportunities',
      'Monitor maintenance schedule for upcoming requirements',
    ],
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    data: mockData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when open', () => {
    render(<XAIModal {...defaultProps} />);
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<XAIModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
  });

  it('displays train ID in title', () => {
    render(<XAIModal {...defaultProps} />);
    expect(screen.getByText(/Train T101/)).toBeInTheDocument();
  });

  it('displays factor weights section', () => {
    render(<XAIModal {...defaultProps} />);
    expect(screen.getByText('review.xai.factorWeights')).toBeInTheDocument();
    
    // Check individual factors
    expect(screen.getByText('positive')).toBeInTheDocument();
    expect(screen.getAllByText('neutral')).toHaveLength(2);
    
    // Check weights
    expect(screen.getByText(/Weight: 35%/)).toBeInTheDocument();
    expect(screen.getByText(/Weight: 28%/)).toBeInTheDocument();
    expect(screen.getByText(/Weight: 22%/)).toBeInTheDocument();
  });

  it('displays impact levels with correct styling', () => {
    render(<XAIModal {...defaultProps} />);
    
    // Positive impact should have appropriate styling
    const positiveImpactFactor = screen.getByText('positive').closest('span');
    expect(positiveImpactFactor).toHaveClass('text-success-600');
    
    // Neutral impact should have appropriate styling (use first one)
    const neutralImpactFactors = screen.getAllByText('neutral');
    expect(neutralImpactFactors[0].closest('span')).toHaveClass('text-neutral-600');
  });

  it('displays evidence for each factor', () => {
    render(<XAIModal {...defaultProps} />);
    
    expect(screen.getByText('High-visibility route, peak hours')).toBeInTheDocument();
    expect(screen.getByText('Balanced with fleet average')).toBeInTheDocument();
    expect(screen.getByText('Minimal yard movements required')).toBeInTheDocument();
  });

  it('displays constraint violations section', () => {
    render(<XAIModal {...defaultProps} />);
    expect(screen.getByText('review.xai.constraintViolations')).toBeInTheDocument();
    
    // Check constraint details
    expect(screen.getByText('maintenance_schedule')).toBeInTheDocument();
    expect(screen.getByText(/Minor maintenance due in 72h/)).toBeInTheDocument();
  });

  it('displays constraint severity with correct styling', () => {
    render(<XAIModal {...defaultProps} />);
    
    const lowSeverity = screen.getByText('LOW').closest('span');
    expect(lowSeverity).toHaveClass('text-success-600');
  });

  it('displays alternative ranks section', () => {
    render(<XAIModal {...defaultProps} />);
    expect(screen.getByText('review.xai.alternativeRanks')).toBeInTheDocument();
    
    // Check scenarios
    expect(screen.getByText('branding_priority')).toBeInTheDocument();
    expect(screen.getByText('mileage_balance')).toBeInTheDocument();
    expect(screen.getByText('risk_mitigation')).toBeInTheDocument();
  });

  it('displays rank and score information', () => {
    render(<XAIModal {...defaultProps} />);
    
    expect(screen.getByText(/Rank: #1/)).toBeInTheDocument();
    expect(screen.getByText(/Rank: #3/)).toBeInTheDocument();
    expect(screen.getByText(/Rank: #5/)).toBeInTheDocument();
    
    expect(screen.getByText(/Score: 0.92/)).toBeInTheDocument();
    expect(screen.getByText(/Score: 0.87/)).toBeInTheDocument();
    expect(screen.getByText(/Score: 0.78/)).toBeInTheDocument();
  });

  it('displays factors for each alternative scenario', () => {
    render(<XAIModal {...defaultProps} />);
    
    expect(screen.getByText('branding, route_visibility')).toBeInTheDocument();
    expect(screen.getByText('mileage, fleet_balance')).toBeInTheDocument();
    expect(screen.getByText('safety, compliance')).toBeInTheDocument();
  });

  it('displays recommendations section', () => {
    render(<XAIModal {...defaultProps} />);
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    
    // Check individual recommendations
    expect(screen.getByText('Maintain current assignment for optimal branding exposure')).toBeInTheDocument();
    expect(screen.getByText('Consider peak hour branding opportunities')).toBeInTheDocument();
    expect(screen.getByText('Monitor maintenance schedule for upcoming requirements')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<XAIModal {...defaultProps} />);
    
    const closeButton = screen.getByText('review.xai.close');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking outside modal content', () => {
    render(<XAIModal {...defaultProps} />);
    
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside modal content', () => {
    render(<XAIModal {...defaultProps} />);
    
    const content = screen.getByTestId('modal-content');
    fireEvent.click(content);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('handles empty constraint violations gracefully', () => {
    const dataWithoutViolations: XAIAnalysis = {
      ...mockData,
      constraintViolations: [],
    };
    
    render(<XAIModal {...defaultProps} data={dataWithoutViolations} />);
    
    expect(screen.getByText('review.xai.constraintViolations')).toBeInTheDocument();
    // Should show "No violations" or similar message
    expect(screen.getByText('No constraint violations')).toBeInTheDocument();
  });

  it('handles empty alternative ranks gracefully', () => {
    const dataWithoutAlternatives: XAIAnalysis = {
      ...mockData,
      alternativeRanks: [],
    };
    
    render(<XAIModal {...defaultProps} data={dataWithoutAlternatives} />);
    
    expect(screen.getByText('review.xai.alternativeRanks')).toBeInTheDocument();
    // Should show "No alternatives" or similar message
    expect(screen.getByText('No alternative scenarios available')).toBeInTheDocument();
  });

  it('handles empty recommendations gracefully', () => {
    const dataWithoutRecommendations: XAIAnalysis = {
      ...mockData,
      recommendations: [],
    };
    
    render(<XAIModal {...defaultProps} data={dataWithoutRecommendations} />);
    
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    // Should show "No recommendations" or similar message
    expect(screen.getByText('No recommendations available')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<XAIModal {...defaultProps} className="custom-class" />);
    
    // The className should be passed to the Modal component
    // We can't directly test it on the content div due to mocking
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
  });

  it('displays critical impact level correctly', () => {
    const dataWithCriticalImpact: XAIAnalysis = {
      ...mockData,
      factorWeights: [
        { factor: 'risk', weight: 0.60, impact: 'negative', evidence: 'Safety inspection overdue' },
      ],
    };
    
    render(<XAIModal {...defaultProps} data={dataWithCriticalImpact} />);
    
    const criticalImpact = screen.getByText('negative').closest('span');
    expect(criticalImpact).toHaveClass('text-danger-600');
  });

  it('displays constraint severity levels with correct colors', () => {
    const dataWithMultipleSeverities: XAIAnalysis = {
      ...mockData,
      constraintViolations: [
        { constraint: 'safety', severity: 'high', impact: 'Safety critical' },
        { constraint: 'maintenance', severity: 'medium', impact: 'Maintenance due' },
        { constraint: 'schedule', severity: 'low', impact: 'Minor delay' },
      ],
    };
    
    render(<XAIModal {...defaultProps} data={dataWithMultipleSeverities} />);
    
    const highSeverity = screen.getByText('HIGH').closest('span');
    expect(highSeverity).toHaveClass('text-danger-600');
    
    const mediumSeverity = screen.getByText('MEDIUM').closest('span');
    expect(mediumSeverity).toHaveClass('text-warning-600');
    
    const lowSeverity = screen.getByText('LOW').closest('span');
    expect(lowSeverity).toHaveClass('text-success-600');
  });
});
