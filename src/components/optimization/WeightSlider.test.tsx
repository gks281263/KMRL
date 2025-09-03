import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { WeightSlider } from './WeightSlider';

describe('WeightSlider', () => {
  const defaultProps = {
    label: 'Test Weight',
    value: 50,
    onChange: vi.fn(),
    tooltip: 'Test tooltip text',
    preview: 'Test preview text',
    color: 'primary' as const,
  };

  it('renders with correct label and value', () => {
    render(<WeightSlider {...defaultProps} />);
    
    expect(screen.getByText('Test Weight')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('calls onChange when slider value changes', () => {
    const onChange = vi.fn();
    render(<WeightSlider {...defaultProps} onChange={onChange} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it('displays preview text', () => {
    render(<WeightSlider {...defaultProps} />);
    
    expect(screen.getByText('Test preview text')).toBeInTheDocument();
  });

  it('shows tooltip on info button hover', () => {
    render(<WeightSlider {...defaultProps} />);
    
    const infoButton = screen.getByText('ℹ️ Info');
    expect(infoButton).toBeInTheDocument();
    
    // Tooltip should be present but hidden initially
    expect(screen.getByText('Test tooltip text')).toBeInTheDocument();
  });

  it('applies correct color classes based on color prop', () => {
    const { rerender } = render(<WeightSlider {...defaultProps} color="primary" />);
    
    // Check that the slider has the correct color styling
    const slider = screen.getByRole('slider');
    expect(slider).toHaveStyle({
      background: expect.stringContaining('bg-primary-500')
    });
    
    // Test with different color
    rerender(<WeightSlider {...defaultProps} color="success" />);
    expect(slider).toHaveStyle({
      background: expect.stringContaining('bg-success-500')
    });
  });

  it('shows greyed state when value is 0', () => {
    render(<WeightSlider {...defaultProps} value={0} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveStyle({
      background: expect.stringContaining('bg-neutral-300')
    });
  });

  it('can be disabled', () => {
    render(<WeightSlider {...defaultProps} disabled={true} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(<WeightSlider {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label', 'Adjust Test Weight weight');
    expect(slider).toHaveAttribute('aria-describedby', 'test weight-tooltip');
  });

  it('displays percentage with correct formatting', () => {
    render(<WeightSlider {...defaultProps} value={25.5} />);
    
    expect(screen.getByText('25.5%')).toBeInTheDocument();
  });
});
