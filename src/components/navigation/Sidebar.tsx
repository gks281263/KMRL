import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';
import { Menu, X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { NavItem } from './NavItem';
import { getMenuItemsForRole, MenuItem } from '@/config/menuConfig';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  className?: string;
}

interface User {
  userId: string;
  name: string;
  roles: string[];
}

// Mock API function - replace with actual API call
const fetchUserProfile = async (): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock user data - in real app, this would come from your auth context
  return {
    userId: 'user-123',
    name: 'John Doe',
    roles: ['Supervisor'] // Change this to test different roles
  };
};

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user profile and roles
  const { data: user, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get menu items based on user roles
  const menuItems = user ? getMenuItemsForRole(user.roles) : [];

  // Handle logout
  const handleLogout = () => {
    // In real app, clear auth tokens and redirect to login
    console.log('Logging out...');
    navigate('/login');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsMobileOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('bg-neutral-50 p-4', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-neutral-200 rounded"></div>
          <div className="h-4 bg-neutral-200 rounded"></div>
          <div className="h-4 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        'flex items-center gap-3 p-4 border-b border-neutral-200',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-neutral-900 truncate">
              Metro System
            </h1>
            {user && (
              <p className="text-sm text-neutral-600 truncate">
                {user.name} • {user.roles.join(', ')}
              </p>
            )}
          </div>
        )}
        
        {/* Collapse/Expand button (desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'hidden md:flex items-center justify-center w-8 h-8 rounded-lg',
            'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100',
            'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id} className="relative">
            <NavItem
              item={item}
              isCollapsed={isCollapsed}
              isActive={location.pathname === item.path}
            />
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-neutral-200">
        <Button
          onClick={handleLogout}
          variant="secondary"
          className={cn(
            'w-full justify-start gap-3 text-neutral-700 hover:text-red-700 hover:bg-red-50',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>{t('nav.logout')}</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-neutral-200"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5 text-neutral-700" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
        />
      )}

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h1 className="text-lg font-semibold text-neutral-900">Metro System</h1>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {sidebarContent}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-white border-r border-neutral-200 shadow-sm transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-80',
          className
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
