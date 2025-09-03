import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { NavItem } from './NavItem';
import { MenuItem } from '@/config/menuConfig';
import { Home, Shield } from 'lucide-react';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Home: ({ className }: { className?: string }) => <div data-testid="home-icon" className={className}>🏠</div>,
  Shield: ({ className }: { className?: string }) => <div data-testid="shield-icon" className={className}>🛡️</div>,
}));

const mockMenuItem: MenuItem = {
  id: 'home',
  label: 'Dashboard',
  path: '/',
  roles: ['Supervisor'],
  icon: Home,
  description: 'Main dashboard overview'
};

const adminMenuItem: MenuItem = {
  id: 'admin',
  label: 'Admin & Config',
  path: '/admin',
  roles: ['Admin'],
  icon: Shield,
  description: 'System administration',
  isAdmin: true
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NavItem', () => {
  it('renders with label and icon when not collapsed', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={false}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Main dashboard overview')).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('renders only icon when collapsed', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={true}
        isActive={false}
      />
    );

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Main dashboard overview')).not.toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('applies active styles when isActive is true', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={true}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('bg-blue-50', 'text-blue-700', 'border-l-4', 'border-l-blue-600', 'font-semibold');
  });

  it('applies inactive styles when isActive is false', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={false}
      />
    );

    const link = screen.getByRole('link');
    // Note: NavLink automatically sets aria-current="page" for the current route
    // We can't control this behavior, so we test the styling instead
    expect(link).toHaveClass('text-neutral-700');
    expect(link).not.toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('shows admin warning icon for admin items', () => {
    renderWithRouter(
      <NavItem
        item={adminMenuItem}
        isCollapsed={false}
        isActive={false}
      />
    );

    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toHaveAttribute('aria-label', 'Admin only');
    expect(screen.getByText('⚠️')).toHaveAttribute('title', 'Admin only');
  });

  it('does not show admin warning for non-admin items', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={false}
      />
    );

    expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
  });

  it('applies hover styles on hover', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={false}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('hover:bg-blue-50', 'hover:text-blue-700');
  });

  it('applies focus styles on focus', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={false}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-offset-2');
  });

  it('renders with correct href attribute', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={false}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('calls onClick handler when provided', () => {
    const handleClick = vi.fn();
    
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={false}
        onClick={handleClick}
      />
    );

    const link = screen.getByRole('link');
    link.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies collapsed styles when isCollapsed is true', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={true}
        isActive={false}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('justify-center', 'px-2');
  });

  it('applies expanded styles when isCollapsed is false', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={false}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('px-3');
  });

  it('shows tooltip when collapsed', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={true}
        isActive={false}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('title', 'Dashboard');
  });

  it('does not show tooltip when expanded', () => {
    renderWithRouter(
      <NavItem
        item={mockMenuItem}
        isCollapsed={false}
        isActive={false}
      />
    );

    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('title');
  });
});
