import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { MenuItem } from '@/config/menuConfig';

interface NavItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  isActive: boolean;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  item,
  isCollapsed,
  isActive,
  onClick
}) => {
  const Icon = item.icon;
  
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
        'hover:bg-blue-50 hover:text-blue-700',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isActive && 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600 font-semibold',
        !isActive && 'text-neutral-700 hover:border-l-4 hover:border-l-blue-200',
        isCollapsed ? 'justify-center px-2' : 'px-3'
      )}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.label : undefined}
    >
      <div className="relative flex-shrink-0">
        <Icon 
          className={cn(
            'h-5 w-5 transition-colors duration-200',
            isActive ? 'text-blue-600' : 'text-neutral-500 group-hover:text-blue-600'
          )}
          aria-hidden="true"
        />
        {item.isAdmin && (
          <span 
            className="absolute -top-1 -right-1 text-xs text-red-600"
            aria-label="Admin only"
            title="Admin only"
          >
            ⚠️
          </span>
        )}
      </div>
      
      {!isCollapsed && (
        <span className="flex-1 min-w-0">
          <span className="block truncate">{item.label}</span>
          {item.description && (
            <span className="block text-xs text-neutral-500 truncate">
              {item.description}
            </span>
          )}
        </span>
      )}
      
      {/* Active indicator for collapsed state */}
      {isCollapsed && isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
      )}
    </NavLink>
  );
};
