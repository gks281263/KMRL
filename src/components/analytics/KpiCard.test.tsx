import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { KpiCard } from '@/components/analytics/KpiCard';
import { KpiData } from '@/types/analytics';

// Mock the modules
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

describe('KpiCard', () => {
  const mockKpi: KpiData = {
    id: 'punctuality',
    name: 'Punctuality',
    value: 94.2,
    unit: '%',
    delta: 2.1,
    trend: 'up',
    sparkline: [92.1, 93.5, 94.2, 93.8, 94.5, 94.2, 94.8],
    lastUpdated: '2024-01-01T08:00:00Z'
  };

  it('renders KPI card with correct data', () => {
    render(<KpiCard kpi={mockKpi} />);
    
    expect(screen.getByText('Punctuality')).toBeInTheDocument();
    expect(screen.getByText('94.2%')).toBeInTheDocument();
    expect(screen.getByText('+2.1%')).toBeInTheDocument();
  });

  it('displays trend icon correctly', () => {
    render(<KpiCard kpi={mockKpi} />);
    
    expect(screen.getByText('↗️')).toBeInTheDocument();
  });

  it('shows down trend correctly', () => {
    const downTrendKpi = { ...mockKpi, trend: 'down' as const, delta: -1.5 };
    render(<KpiCard kpi={downTrendKpi} />);
    
    expect(screen.getByText('↘️')).toBeInTheDocument();
    expect(screen.getByText('-1.5%')).toBeInTheDocument();
  });

  it('shows stable trend correctly', () => {
    const stableTrendKpi = { ...mockKpi, trend: 'stable' as const, delta: 0 };
    render(<KpiCard kpi={stableTrendKpi} />);
    
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('renders sparkline SVG', () => {
    render(<KpiCard kpi={mockKpi} />);
    
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });

  it('formats different units correctly', () => {
    const kmKpi = { ...mockKpi, value: 5.3, unit: 'km' };
    render(<KpiCard kpi={kmKpi} />);
    
    expect(screen.getByText('5 km')).toBeInTheDocument();
  });

  it('formats minutes correctly', () => {
    const minKpi = { ...mockKpi, value: 15.7, unit: 'min' };
    render(<KpiCard kpi={minKpi} />);
    
    expect(screen.getByText('16 min')).toBeInTheDocument();
  });

  it('shows last updated timestamp', () => {
    render(<KpiCard kpi={mockKpi} />);
    
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('handles empty sparkline data', () => {
    const emptySparklineKpi = { ...mockKpi, sparkline: [] };
    render(<KpiCard kpi={emptySparklineKpi} />);
    
    expect(screen.getByText('Punctuality')).toBeInTheDocument();
    expect(screen.getByText('94.2%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<KpiCard kpi={mockKpi} className="custom-class" />);
    
    const card = screen.getByText('Punctuality').closest('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('handles zero delta correctly', () => {
    const zeroDeltaKpi = { ...mockKpi, delta: 0 };
    render(<KpiCard kpi={zeroDeltaKpi} />);
    
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('handles negative delta correctly', () => {
    const negativeDeltaKpi = { ...mockKpi, delta: -3.2 };
    render(<KpiCard kpi={negativeDeltaKpi} />);
    
    expect(screen.getByText('-3.2%')).toBeInTheDocument();
  });

  it('handles large numbers correctly', () => {
    const largeValueKpi = { ...mockKpi, value: 12345.67, unit: 'km' };
    render(<KpiCard kpi={largeValueKpi} />);
    
    expect(screen.getByText('12346 km')).toBeInTheDocument();
  });

  it('handles decimal values correctly', () => {
    const decimalKpi = { ...mockKpi, value: 94.25, unit: '%' };
    render(<KpiCard kpi={decimalKpi} />);
    
    expect(screen.getByText('94.3%')).toBeInTheDocument();
  });
});
