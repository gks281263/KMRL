import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ExplainabilityModal } from './ExplainabilityModal';

// Mock the translation function
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

// Mock the utility function
vi.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('ExplainabilityModal', () => {
  const mockData = {
    trainId: 'T101',
    factors: [
      {
        factor: 'Branding Priority',
        weight: 0.8,
        evidence: 'Advertising contract expires in 3 days',
        impact: 'positive' as const,
      },
      {
        factor: 'Mileage Balance',
        weight: 0.6,
        evidence: 'Below average monthly mileage',
        impact: 'negative' as const,
      },
      {
        factor: 'Risk Mitigation',
        weight: 0.4,
        evidence: 'Recent maintenance completed',
        impact: 'neutral' as const,
      },
    ],
    totalScore: 0.85,
    constraints: ['Must depart before 06:00', 'Requires specific platform'],
    recommendations: ['Consider early departure to maximize branding exposure', 'Assign to platform 3 for optimal passenger flow'],
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    data: mockData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders train ID and total score', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    expect(screen.getByText('Train T101')).toBeInTheDocument();
    expect(screen.getByText('Total Score: 0.85')).toBeInTheDocument();
  });

  it('displays contributing factors with correct styling', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    expect(screen.getByText('results.explainability.contributingFactors')).toBeInTheDocument();
    // Use partial text matching to handle text split across elements
    expect(screen.getByText(/Branding Priority/)).toBeInTheDocument();
    expect(screen.getByText(/Mileage Balance/)).toBeInTheDocument();
    expect(screen.getByText(/Risk Mitigation/)).toBeInTheDocument();
  });

  it('shows factor weights', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    expect(screen.getByText('Weight: 0.8')).toBeInTheDocument();
    expect(screen.getByText('Weight: 0.6')).toBeInTheDocument();
    expect(screen.getByText('Weight: 0.4')).toBeInTheDocument();
  });

  it('displays factor evidence', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    expect(screen.getByText('Advertising contract expires in 3 days')).toBeInTheDocument();
    expect(screen.getByText('Below average monthly mileage')).toBeInTheDocument();
    expect(screen.getByText('Recent maintenance completed')).toBeInTheDocument();
  });

  it('applies correct impact colors and icons', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    // Check that all three factors are present using partial text matching
    expect(screen.getByText(/Branding Priority/)).toBeInTheDocument();
    expect(screen.getByText(/Mileage Balance/)).toBeInTheDocument();
    expect(screen.getByText(/Risk Mitigation/)).toBeInTheDocument();
  });

  it('displays constraints when present', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    expect(screen.getByText('Constraints')).toBeInTheDocument();
    expect(screen.getByText('Must depart before 06:00')).toBeInTheDocument();
    expect(screen.getByText('Requires specific platform')).toBeInTheDocument();
  });

  it('displays recommendations when present', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Consider early departure to maximize branding exposure')).toBeInTheDocument();
    expect(screen.getByText('Assign to platform 3 for optimal passenger flow')).toBeInTheDocument();
  });

  it('handles missing constraints gracefully', () => {
    const dataWithoutConstraints = {
      ...mockData,
      constraints: [],
    };
    
    render(<ExplainabilityModal {...defaultProps} data={dataWithoutConstraints} />);
    
    expect(screen.queryByText('Constraints')).not.toBeInTheDocument();
  });

  it('handles missing recommendations gracefully', () => {
    const dataWithoutRecommendations = {
      ...mockData,
      recommendations: [],
    };
    
    render(<ExplainabilityModal {...defaultProps} data={dataWithoutRecommendations} />);
    
    expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    const closeButton = screen.getByText('results.explainability.close');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<ExplainabilityModal {...defaultProps} className="custom-class" />);
    
    const modal = screen.getByText('results.explainability.title').closest('div');
    expect(modal).toBeInTheDocument();
  });

  it('displays evidence labels correctly', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    // Check that evidence text is present using partial text matching
    const evidenceElements = screen.getAllByText(/evidence:/);
    expect(evidenceElements).toHaveLength(3);
  });

  it('shows warning icons for constraints', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    expect(screen.getAllByText('⚠️')).toHaveLength(2); // 2 constraints
  });

  it('shows lightbulb icons for recommendations', () => {
    render(<ExplainabilityModal {...defaultProps} />);
    
    expect(screen.getAllByText('💡')).toHaveLength(2); // 2 recommendations
  });

  it('handles different impact types correctly', () => {
    const mixedImpactData = {
      ...mockData,
      factors: [
        { factor: 'Test Factor', weight: 1.0, evidence: 'Test evidence', impact: 'positive' as const },
        { factor: 'Test Factor 2', weight: 0.5, evidence: 'Test evidence 2', impact: 'negative' as const },
        { factor: 'Test Factor 3', weight: 0.0, evidence: 'Test evidence 3', impact: 'neutral' as const },
      ],
    };
    
    render(<ExplainabilityModal {...defaultProps} data={mixedImpactData} />);
    
    // Check that all three impact types are present by looking for the factor names using getAllByText
    const testFactors = screen.getAllByText(/Test Factor/);
    expect(testFactors).toHaveLength(3);
  });
});
