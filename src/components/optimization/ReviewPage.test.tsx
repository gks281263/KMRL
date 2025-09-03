import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ReviewPage } from './ReviewPage';
import { PlanSummary, XAIAnalysis } from '@/types/optimization';

// Mock the translation function
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

// Mock the utility function
vi.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock the XAIModal component
vi.mock('./XAIModal', () => ({
  XAIModal: ({ isOpen, onClose, data }: any) => 
    isOpen ? (
      <div data-testid="xai-modal">
        <h2>XAI Analysis for {data.trainId}</h2>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock the WhatIfPanel component
vi.mock('./WhatIfPanel', () => ({
  WhatIfPanel: ({ onPreview, onApprove, onModifyRerun }: any) => (
    <div data-testid="what-if-panel">
      <h3>What-If Panel</h3>
      <button onClick={() => onPreview({ forceInclude: [], forceExclude: [], weightMods: {} })}>
        Test Preview
      </button>
      <button onClick={() => onApprove({ reason: 'test' })}>Test Approve</button>
      <button onClick={onModifyRerun}>Test Modify</button>
    </div>
  ),
}));

describe('ReviewPage', () => {
  const mockPlanSummary: PlanSummary = {
    punctuality: 94.2,
    energy: 87.5,
    brandingHours: 156.8,
    totalTrains: 42,
    estimatedSavings: 125000,
  };

  const mockTrains = [
    {
      id: 'T101',
      type: 'service' as const,
      status: 'approved',
      explainability: {
        trainId: 'T101',
        factorWeights: [
          { factor: 'branding', weight: 0.35, impact: 'positive', evidence: 'High-visibility route' },
          { factor: 'mileage', weight: 0.28, impact: 'neutral', evidence: 'Balanced with fleet' },
        ],
        constraintViolations: [],
        alternativeRanks: [
          { scenario: 'branding_priority', rank: 1, score: 0.92, factors: ['branding'] },
        ],
        recommendations: ['Maintain current assignment'],
      } as XAIAnalysis,
    },
    {
      id: 'T102',
      type: 'standby' as const,
      status: 'pending',
      explainability: {
        trainId: 'T102',
        factorWeights: [
          { factor: 'risk', weight: 0.45, impact: 'negative', evidence: 'Maintenance due' },
        ],
        constraintViolations: [
          { constraint: 'maintenance_schedule', severity: 'medium', impact: 'Required maintenance' },
        ],
        alternativeRanks: [
          { scenario: 'risk_mitigation', rank: 2, score: 0.78, factors: ['safety'] },
        ],
        recommendations: ['Schedule maintenance'],
      } as XAIAnalysis,
    },
  ];

  const mockOnPreview = vi.fn();
  const mockOnApprove = vi.fn();
  const mockOnModifyRerun = vi.fn();

  const defaultProps = {
    planSummary: mockPlanSummary,
    trains: mockTrains,
    onPreview: mockOnPreview,
    onApprove: mockOnApprove,
    onModifyRerun: mockOnModifyRerun,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title', () => {
    render(<ReviewPage {...defaultProps} />);
    expect(screen.getByText('review.title')).toBeInTheDocument();
  });

  it('displays last updated timestamp', () => {
    render(<ReviewPage {...defaultProps} />);
    expect(screen.getByText(/review\.lastUpdated/)).toBeInTheDocument();
  });

  it('renders plan summary with correct values', () => {
    render(<ReviewPage {...defaultProps} />);
    
    expect(screen.getByText('review.planSummary.title')).toBeInTheDocument();
    expect(screen.getByText('94.2%')).toBeInTheDocument();
    expect(screen.getByText('87.5')).toBeInTheDocument();
    expect(screen.getByText('156.8h')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('$125,000')).toBeInTheDocument();
  });

  it('renders train list with correct information', () => {
    render(<ReviewPage {...defaultProps} />);
    
    expect(screen.getByText('review.trains.title')).toBeInTheDocument();
    
    // Check first train
    expect(screen.getByText('review.trains.trainId: T101')).toBeInTheDocument();
    expect(screen.getByText('review.trains.type: service')).toBeInTheDocument();
    expect(screen.getByText('✅ approved')).toBeInTheDocument();
    
    // Check second train
    expect(screen.getByText('review.trains.trainId: T102')).toBeInTheDocument();
    expect(screen.getByText('review.trains.type: standby')).toBeInTheDocument();
    expect(screen.getByText('⏳ pending')).toBeInTheDocument();
  });

  it('renders WhatIfPanel component', () => {
    render(<ReviewPage {...defaultProps} />);
    expect(screen.getByTestId('what-if-panel')).toBeInTheDocument();
    expect(screen.getByText('What-If Panel')).toBeInTheDocument();
  });

  it('opens XAI modal when train is clicked', () => {
    render(<ReviewPage {...defaultProps} />);
    
    // Click on first train
    const firstTrain = screen.getByText('review.trains.trainId: T101').closest('div');
    fireEvent.click(firstTrain!);
    
    // XAI modal should open
    expect(screen.getByTestId('xai-modal')).toBeInTheDocument();
    expect(screen.getByText('XAI Analysis for T101')).toBeInTheDocument();
  });

  it('opens XAI modal when explainability button is clicked', () => {
    render(<ReviewPage {...defaultProps} />);
    
    // Click on explainability button for first train
    const explainabilityButton = screen.getAllByText('review.trains.viewExplainability')[0];
    fireEvent.click(explainabilityButton);
    
    // XAI modal should open
    expect(screen.getByTestId('xai-modal')).toBeInTheDocument();
    expect(screen.getByText('XAI Analysis for T101')).toBeInTheDocument();
  });

  it('closes XAI modal when close button is clicked', () => {
    render(<ReviewPage {...defaultProps} />);
    
    // Open modal first
    const firstTrain = screen.getByText('review.trains.trainId: T101').closest('div');
    fireEvent.click(firstTrain!);
    
    expect(screen.getByTestId('xai-modal')).toBeInTheDocument();
    
    // Close modal
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('xai-modal')).not.toBeInTheDocument();
  });

  it('renders action buttons at the bottom', () => {
    render(<ReviewPage {...defaultProps} />);
    
    expect(screen.getByText('review.actions.approvePlan')).toBeInTheDocument();
    expect(screen.getByText('review.actions.modifyRerun')).toBeInTheDocument();
  });

  it('calls onModifyRerun when modify button is clicked', () => {
    render(<ReviewPage {...defaultProps} />);
    
    const modifyButton = screen.getByText('review.actions.modifyRerun');
    fireEvent.click(modifyButton);
    
    expect(mockOnModifyRerun).toHaveBeenCalled();
  });

  it('logs to console when approve plan button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<ReviewPage {...defaultProps} />);
    
    const approveButton = screen.getByText('review.actions.approvePlan');
    fireEvent.click(approveButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Opening comprehensive approval flow');
    consoleSpy.mockRestore();
  });

  it('displays correct status icons and colors', () => {
    render(<ReviewPage {...defaultProps} />);
    
    // Approved status should show checkmark
    expect(screen.getByText('✅ approved')).toBeInTheDocument();
    
    // Pending status should show clock
    expect(screen.getByText('⏳ pending')).toBeInTheDocument();
  });

  it('handles different train types correctly', () => {
    const trainsWithAllTypes = [
      ...mockTrains,
      {
        id: 'T103',
        type: 'maintenance' as const,
        status: 'under_review',
        explainability: {
          trainId: 'T103',
          factorWeights: [],
          constraintViolations: [],
          alternativeRanks: [],
          recommendations: [],
        } as XAIAnalysis,
      },
    ];
    
    render(<ReviewPage {...defaultProps} trains={trainsWithAllTypes} />);
    
    expect(screen.getByText('review.trains.type: service')).toBeInTheDocument();
    expect(screen.getByText('review.trains.type: standby')).toBeInTheDocument();
    expect(screen.getByText('review.trains.type: maintenance')).toBeInTheDocument();
  });

  it('prevents event propagation when explainability button is clicked', () => {
    render(<ReviewPage {...defaultProps} />);
    
    // Click on explainability button
    const explainabilityButton = screen.getAllByText('review.trains.viewExplainability')[0];
    fireEvent.click(explainabilityButton);
    
    // Modal should open
    expect(screen.getByTestId('xai-modal')).toBeInTheDocument();
    
    // Click on train row - should not open another modal
    const firstTrain = screen.getByText('review.trains.trainId: T101').closest('div');
    fireEvent.click(firstTrain!);
    
    // Should still show the same modal (not duplicate)
    expect(screen.getAllByTestId('xai-modal')).toHaveLength(1);
  });

  it('displays plan summary values with correct formatting', () => {
    render(<ReviewPage {...defaultProps} />);
    
    // Check that values are formatted correctly
    expect(screen.getByText('94.2%')).toBeInTheDocument();
    expect(screen.getByText('87.5')).toBeInTheDocument();
    expect(screen.getByText('156.8h')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('$125,000')).toBeInTheDocument();
  });

  it('shows hover effects on train rows', () => {
    render(<ReviewPage {...defaultProps} />);
    
    const firstTrain = screen.getByText('review.trains.trainId: T101').closest('div');
    expect(firstTrain).toHaveClass('hover:border-primary-300', 'hover:bg-primary-50');
  });

  it('renders WhatIfPanel with correct props', () => {
    render(<ReviewPage {...defaultProps} />);
    
    // Check that WhatIfPanel is rendered
    expect(screen.getByTestId('what-if-panel')).toBeInTheDocument();
    
    // Test that the panel's buttons work
    const testPreviewButton = screen.getByText('Test Preview');
    fireEvent.click(testPreviewButton);
    
    expect(mockOnPreview).toHaveBeenCalledWith({
      forceInclude: [],
      forceExclude: [],
      weightMods: {},
    });
  });
});
