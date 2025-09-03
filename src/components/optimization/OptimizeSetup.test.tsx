import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { OptimizeSetup } from './OptimizeSetup';

// Mock the translation function
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

// Mock the utility function
vi.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('OptimizeSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all three main panels', () => {
    render(<OptimizeSetup />);
    
    expect(screen.getByText('optimize.weights.title')).toBeInTheDocument();
    expect(screen.getByText('optimize.options.title')).toBeInTheDocument();
    expect(screen.getByText('optimize.solver.title')).toBeInTheDocument();
  });

  it('displays weight sliders with correct initial values', () => {
    render(<OptimizeSetup />);
    
    // Check initial weights from default preset
    expect(screen.getByDisplayValue('50')).toBeInTheDocument(); // branding
    expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // mileage
    
    // For values that appear multiple times, use getAllByDisplayValue and check count
    const shuntingSliders = screen.getAllByDisplayValue('10');
    expect(shuntingSliders).toHaveLength(2); // shunting and risk both have value 10
    
    // Verify the specific sliders by their labels
    expect(screen.getByLabelText('Adjust optimize.weights.branding weight')).toHaveValue('50');
    expect(screen.getByLabelText('Adjust optimize.weights.mileage weight')).toHaveValue('30');
    expect(screen.getByLabelText('Adjust optimize.weights.shunting weight')).toHaveValue('10');
    expect(screen.getByLabelText('Adjust optimize.weights.risk weight')).toHaveValue('10');
  });

  it('shows total weight percentage and validation', () => {
    render(<OptimizeSetup />);
    
    // Should show 100% and be valid
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toHaveClass('bg-success-100', 'text-success-700');
  });

  it('allows weight adjustment and updates total', () => {
    render(<OptimizeSetup />);
    
    const brandingSlider = screen.getByDisplayValue('50');
    fireEvent.change(brandingSlider, { target: { value: '60' } });
    
    // Should now show 110% and be invalid
    expect(screen.getByText('110%')).toBeInTheDocument();
    expect(screen.getByText('110%')).toHaveClass('bg-danger-100', 'text-danger-700');
  });

  it('displays solver options with correct initial values', () => {
    render(<OptimizeSetup />);
    
    const hardRulesCheckbox = screen.getByLabelText('optimize.options.hardRules');
    const softRelaxationsCheckbox = screen.getByLabelText('optimize.options.softRelaxations');
    
    expect(hardRulesCheckbox).toBeChecked();
    expect(softRelaxationsCheckbox).not.toBeChecked();
  });

  it('allows option changes', () => {
    render(<OptimizeSetup />);
    
    const softRelaxationsCheckbox = screen.getByLabelText('optimize.options.softRelaxations');
    fireEvent.click(softRelaxationsCheckbox);
    
    expect(softRelaxationsCheckbox).toBeChecked();
  });

  it('displays preset configurations', () => {
    render(<OptimizeSetup />);
    
    const presetSelect = screen.getByRole('combobox');
    expect(presetSelect).toBeInTheDocument();
    
    // Should have all preset options
    expect(screen.getByText('optimize.presets.default')).toBeInTheDocument();
    expect(screen.getByText('optimize.presets.brandingFirst')).toBeInTheDocument();
    expect(screen.getByText('optimize.presets.reliabilityFirst')).toBeInTheDocument();
    expect(screen.getByText('optimize.presets.energyMinimization')).toBeInTheDocument();
  });

  it('changes weights and options when preset is selected', () => {
    render(<OptimizeSetup />);
    
    const presetSelect = screen.getByRole('combobox');
    fireEvent.change(presetSelect, { target: { value: 'branding-first' } });
    
    // Should update to branding-first preset values
    expect(screen.getByDisplayValue('80')).toBeInTheDocument(); // branding
    expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // mileage
    
    // For values that appear multiple times, verify by specific labels
    expect(screen.getByLabelText('Adjust optimize.weights.branding weight')).toHaveValue('80');
    expect(screen.getByLabelText('Adjust optimize.weights.mileage weight')).toHaveValue('10');
    expect(screen.getByLabelText('Adjust optimize.weights.shunting weight')).toHaveValue('5');
    expect(screen.getByLabelText('Adjust optimize.weights.risk weight')).toHaveValue('5');
  });

  it('disables run button when weights are invalid', () => {
    render(<OptimizeSetup />);
    
    const brandingSlider = screen.getByDisplayValue('50');
    fireEvent.change(brandingSlider, { target: { value: '60' } });
    
    const runButton = screen.getByText('optimize.solver.run');
    expect(runButton).toBeDisabled();
  });

  it('enables run button when weights are valid', () => {
    render(<OptimizeSetup />);
    
    // Default preset should have valid weights (100%)
    const runButton = screen.getByText('optimize.solver.run');
    expect(runButton).not.toBeDisabled();
  });

  it('starts optimization when run button is clicked', async () => {
    render(<OptimizeSetup />);
    
    const runButton = screen.getByText('optimize.solver.run');
    fireEvent.click(runButton);
    
    // Should show progress and logs
    await waitFor(() => {
      expect(screen.getByText('Starting optimization...')).toBeInTheDocument();
    });
    
    // Button should show loading state
    expect(runButton).toBeDisabled();
  });

  it('shows progress bar during optimization', async () => {
    render(<OptimizeSetup />);
    
    const runButton = screen.getByText('optimize.solver.run');
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('allows cancellation of optimization', async () => {
    render(<OptimizeSetup />);
    
    const runButton = screen.getByText('optimize.solver.run');
    fireEvent.click(runButton);
    
    await waitFor(() => {
      const cancelButton = screen.getByText('optimize.solver.cancel');
      expect(cancelButton).toBeInTheDocument();
      
      fireEvent.click(cancelButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Optimization cancelled by user')).toBeInTheDocument();
    });
  });

  it('displays solver metrics during optimization', async () => {
    render(<OptimizeSetup />);
    
    const runButton = screen.getByText('optimize.solver.run');
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText('Iteration')).toBeInTheDocument();
      expect(screen.getByText('Objective Value')).toBeInTheDocument();
    });
  });

  it('shows feasibility status', async () => {
    render(<OptimizeSetup />);
    
    const runButton = screen.getByText('optimize.solver.run');
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Feasibility:/)).toBeInTheDocument();
    });
  });
});
