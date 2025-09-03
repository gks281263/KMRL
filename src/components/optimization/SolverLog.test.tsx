import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SolverLog } from './SolverLog';

describe('SolverLog', () => {
  const defaultProps = {
    isRunning: false,
    progress: 0,
    currentIteration: 0,
    currentObjectiveValue: 0,
    feasibility: 'unknown' as const,
    logs: [],
    onCancel: vi.fn(),
  };

  it('renders progress bar with correct percentage', () => {
    render(<SolverLog {...defaultProps} progress={45} />);
    
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('displays live metrics correctly', () => {
    render(<SolverLog {...defaultProps} currentIteration={1234} currentObjectiveValue={0.85} />);
    
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('0.85')).toBeInTheDocument();
  });

  it('shows feasibility status with correct styling', () => {
    const { rerender } = render(<SolverLog {...defaultProps} feasibility="feasible" />);
    
    expect(screen.getByText('Feasibility: Feasible')).toBeInTheDocument();
    
    rerender(<SolverLog {...defaultProps} feasibility="infeasible" />);
    expect(screen.getByText('Feasibility: Infeasible')).toBeInTheDocument();
  });

  it('displays cancel button when optimization is running', () => {
    render(<SolverLog {...defaultProps} isRunning={true} />);
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveClass('bg-danger-500');
  });

  it('shows ready message when not running', () => {
    render(<SolverLog {...defaultProps} isRunning={false} />);
    
    expect(screen.getByText('Ready to run optimization')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<SolverLog {...defaultProps} isRunning={true} onCancel={onCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('displays logs with correct formatting', () => {
    const logs = [
      { timestamp: '10:30:15', message: 'Starting optimization', level: 'info' as const },
      { timestamp: '10:30:20', message: 'Solution found', level: 'success' as const },
      { timestamp: '10:30:25', message: 'Warning: constraint violation', level: 'warning' as const },
    ];
    
    render(<SolverLog {...defaultProps} logs={logs} />);
    
    expect(screen.getByText('Starting optimization')).toBeInTheDocument();
    expect(screen.getByText('Solution found')).toBeInTheDocument();
    expect(screen.getByText('Warning: constraint violation')).toBeInTheDocument();
  });

  it('shows no logs message when logs array is empty', () => {
    render(<SolverLog {...defaultProps} logs={[]} />);
    
    expect(screen.getByText('No logs yet')).toBeInTheDocument();
  });

  it('applies correct colors for different log levels', () => {
    const logs = [
      { timestamp: '10:30:15', message: 'Info message', level: 'info' as const },
      { timestamp: '10:30:20', message: 'Warning message', level: 'warning' as const },
      { timestamp: '10:30:25', message: 'Error message', level: 'error' as const },
      { timestamp: '10:30:30', message: 'Success message', level: 'success' as const },
    ];
    
    render(<SolverLog {...defaultProps} logs={logs} />);
    
    // Check that each log level has appropriate styling
    expect(screen.getByText('Info message')).toHaveClass('text-blue-600');
    expect(screen.getByText('Warning message')).toHaveClass('text-warning-600');
    expect(screen.getByText('Error message')).toHaveClass('text-danger-600');
    expect(screen.getByText('Success message')).toHaveClass('text-success-600');
  });

  it('displays log timestamps', () => {
    const logs = [
      { timestamp: '10:30:15', message: 'Test message', level: 'info' as const },
    ];
    
    render(<SolverLog {...defaultProps} logs={logs} />);
    
    expect(screen.getByText('10:30:15')).toBeInTheDocument();
  });

  it('shows progress bar with smooth transitions', () => {
    render(<SolverLog {...defaultProps} progress={50} />);
    
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toHaveClass('transition-all', 'duration-300', 'ease-out');
  });

  it('has proper accessibility attributes', () => {
    render(<SolverLog {...defaultProps} isRunning={true} />);
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toHaveAttribute('aria-label', 'Cancel optimization');
  });
});
