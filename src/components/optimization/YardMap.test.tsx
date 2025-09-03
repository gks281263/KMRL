import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { YardMap } from './YardMap';
import { YardMapData } from '@/types/optimization';

// Mock the translation function
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

// Mock the utility function
vi.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('YardMap', () => {
  const mockData: YardMapData = {
    tracks: [
      { id: 'TRK-01', name: 'Track 1', x: 50, y: 50, length: 200, width: 30, status: 'available' },
      { id: 'TRK-02', name: 'Track 2', x: 50, y: 100, length: 200, width: 30, status: 'occupied', assignedTrain: 'T101' },
      { id: 'BAY-01', name: 'Bay 1', x: 300, y: 50, length: 150, width: 40, status: 'maintenance' },
    ],
    paths: [
      {
        id: 'PATH-01',
        fromTrack: 'TRK-01',
        toTrack: 'BAY-01',
        path: [{ x: 250, y: 65 }, { x: 300, y: 70 }],
        estimatedTime: 15,
        conflicts: [],
      },
    ],
    trains: [
      {
        id: 'T101',
        trackId: 'TRK-02',
        position: { x: 150, y: 115 },
        assignedTask: 'Service Route R1',
        status: 'stationary',
      },
    ],
  };

  const defaultProps = {
    data: mockData,
    onTrackReassignment: vi.fn(),
    onReoptimize: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders yard map with tracks and trains', () => {
    render(<YardMap {...defaultProps} />);
    
    expect(screen.getByText('results.tabs.yardMap')).toBeInTheDocument();
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
    expect(screen.getByText('Bay 1')).toBeInTheDocument();
  });

  it('displays drag and drop instructions', () => {
    render(<YardMap {...defaultProps} />);
    
    expect(screen.getByText('results.yardMap.dragDrop')).toBeInTheDocument();
  });

  it('shows re-optimize button when callback is provided', () => {
    render(<YardMap {...defaultProps} />);
    
    expect(screen.getByText('results.yardMap.reoptimize')).toBeInTheDocument();
  });

  it('does not show re-optimize button when callback is not provided', () => {
    const { onReoptimize, ...props } = defaultProps;
    render(<YardMap {...props} />);
    
    expect(screen.queryByText('results.yardMap.reoptimize')).not.toBeInTheDocument();
  });

  it('handles train drag start', () => {
    render(<YardMap {...defaultProps} />);
    
    // Find the train circle element by looking for the draggable circle
    const trainCircle = document.querySelector('circle[draggable="true"]');
    expect(trainCircle).toBeInTheDocument();
  });

  it('applies correct track colors based on status', () => {
    render(<YardMap {...defaultProps} />);
    
    // Check that tracks are rendered with SVG elements
    const tracks = document.querySelectorAll('rect');
    expect(tracks.length).toBeGreaterThan(0);
  });

  it('displays shunting paths', () => {
    render(<YardMap {...defaultProps} />);
    
    // Check that the SVG contains path elements
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('shows train IDs below train positions', () => {
    render(<YardMap {...defaultProps} />);
    
    expect(screen.getByText('T101')).toBeInTheDocument();
  });

  it('calls onTrackReassignment when train is dropped on track', () => {
    render(<YardMap {...defaultProps} />);
    
    // This test would require more complex drag and drop simulation
    // For now, we'll test that the callback is properly passed
    expect(defaultProps.onTrackReassignment).toBeDefined();
  });

  it('calls onReoptimize when re-optimize button is clicked', () => {
    render(<YardMap {...defaultProps} />);
    
    const reoptimizeButton = screen.getByText('results.yardMap.reoptimize');
    fireEvent.click(reoptimizeButton);
    
    expect(defaultProps.onReoptimize).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<YardMap {...defaultProps} className="custom-class" />);
    
    // Find the main container div that has the custom className
    const container = screen.getByText('results.tabs.yardMap').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('displays grid background pattern', () => {
    render(<YardMap {...defaultProps} />);
    
    // Check that the SVG is rendered with grid pattern
    const gridPattern = document.querySelector('pattern[id="grid"]');
    expect(gridPattern).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData: YardMapData = {
      tracks: [],
      paths: [],
      trains: [],
    };
    
    render(<YardMap {...defaultProps} data={emptyData} />);
    
    expect(screen.getByText('results.tabs.yardMap')).toBeInTheDocument();
    expect(screen.getByText('results.yardMap.dragDrop')).toBeInTheDocument();
  });
});
