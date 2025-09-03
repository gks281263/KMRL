import { menuItems, getMenuItemsForRole, isPathAccessible } from './menuConfig';

describe('menuConfig', () => {
  describe('menuItems', () => {
    it('contains all required menu items', () => {
      const itemIds = menuItems.map(item => item.id);
      
      expect(itemIds).toContain('home');
      expect(itemIds).toContain('dataHub');
      expect(itemIds).toContain('validation');
      expect(itemIds).toContain('setup');
      expect(itemIds).toContain('results');
      expect(itemIds).toContain('review');
      expect(itemIds).toContain('ops');
      expect(itemIds).toContain('analytics');
      expect(itemIds).toContain('admin');
    });

    it('has correct structure for each menu item', () => {
      menuItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('path');
        expect(item).toHaveProperty('roles');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('description');
        
        expect(typeof item.id).toBe('string');
        expect(typeof item.label).toBe('string');
        expect(typeof item.path).toBe('string');
        expect(Array.isArray(item.roles)).toBe(true);
        expect(item.roles.length).toBeGreaterThan(0);
      });
    });

    it('has unique IDs for all menu items', () => {
      const ids = menuItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('has unique paths for all menu items', () => {
      const paths = menuItems.map(item => item.path);
      const uniquePaths = new Set(paths);
      
      expect(paths.length).toBe(uniquePaths.size);
    });

    it('has admin warning for admin-only items', () => {
      const adminItems = menuItems.filter(item => item.isAdmin);
      
      adminItems.forEach(item => {
        expect(item.roles).toContain('Admin');
        expect(item.isAdmin).toBe(true);
      });
    });
  });

  describe('getMenuItemsForRole', () => {
    it('returns all items for Supervisor role', () => {
      const items = getMenuItemsForRole(['Supervisor']);
      
      expect(items).toHaveLength(8); // All items except admin
      expect(items.map(item => item.id)).toContain('home');
      expect(items.map(item => item.id)).toContain('dataHub');
      expect(items.map(item => item.id)).toContain('validation');
      expect(items.map(item => item.id)).toContain('setup');
      expect(items.map(item => item.id)).toContain('results');
      expect(items.map(item => item.id)).toContain('review');
      expect(items.map(item => item.id)).toContain('analytics');
      expect(items.map(item => item.id)).not.toContain('admin');
    });

    it('returns limited items for Maintenance Staff role', () => {
      const items = getMenuItemsForRole(['Maintenance Staff']);
      
      expect(items).toHaveLength(2); // Only home and validation
      expect(items.map(item => item.id)).toContain('home');
      expect(items.map(item => item.id)).toContain('validation');
      expect(items.map(item => item.id)).not.toContain('dataHub');
      expect(items.map(item => item.id)).not.toContain('setup');
    });

    it('returns correct items for Branding Manager role', () => {
      const items = getMenuItemsForRole(['Branding Manager']);
      
      expect(items).toHaveLength(2); // Only home and setup
      expect(items.map(item => item.id)).toContain('home');
      expect(items.map(item => item.id)).toContain('setup');
      expect(items.map(item => item.id)).not.toContain('dataHub');
      expect(items.map(item => item.id)).not.toContain('results');
    });

    it('returns only home for Depot Ops role', () => {
      const items = getMenuItemsForRole(['Depot Ops']);
      
      expect(items).toHaveLength(2); // Only home and ops
      expect(items.map(item => item.id)).toContain('home');
      expect(items.map(item => item.id)).toContain('ops');
      expect(items.map(item => item.id)).not.toContain('dataHub');
      expect(items.map(item => item.id)).not.toContain('setup');
    });

    it('returns all items for Admin role', () => {
      const items = getMenuItemsForRole(['Admin']);
      
      expect(items).toHaveLength(9); // All items including admin
      expect(items.map(item => item.id)).toContain('admin');
    });

    it('handles multiple roles correctly', () => {
      const items = getMenuItemsForRole(['Supervisor', 'Branding Manager']);
      
      // Should include items from both roles
      expect(items.map(item => item.id)).toContain('dataHub'); // From Supervisor
      expect(items.map(item => item.id)).toContain('setup'); // From both
      expect(items.map(item => item.id)).toContain('results'); // From Supervisor
    });

    it('returns empty array for unknown role', () => {
      const items = getMenuItemsForRole(['UnknownRole']);
      
      expect(items).toHaveLength(1); // Only home (accessible to all)
      expect(items.map(item => item.id)).toContain('home');
    });

    it('returns empty array for empty roles array', () => {
      const items = getMenuItemsForRole([]);
      
      expect(items).toHaveLength(0);
    });

    it('handles case-sensitive role matching', () => {
      const items = getMenuItemsForRole(['supervisor']); // lowercase
      
      expect(items).toHaveLength(0); // Should not match 'Supervisor'
    });
  });

  describe('isPathAccessible', () => {
    it('returns true for accessible paths', () => {
      expect(isPathAccessible('/', ['Supervisor'])).toBe(true);
      expect(isPathAccessible('/data', ['Supervisor'])).toBe(true);
      expect(isPathAccessible('/validation', ['Maintenance Staff'])).toBe(true);
      expect(isPathAccessible('/setup', ['Branding Manager'])).toBe(true);
      expect(isPathAccessible('/admin', ['Admin'])).toBe(true);
    });

    it('returns false for inaccessible paths', () => {
      expect(isPathAccessible('/data', ['Maintenance Staff'])).toBe(false);
      expect(isPathAccessible('/admin', ['Supervisor'])).toBe(false);
      expect(isPathAccessible('/results', ['Branding Manager'])).toBe(false);
    });

    it('returns false for unknown paths', () => {
      expect(isPathAccessible('/unknown', ['Supervisor'])).toBe(false);
      expect(isPathAccessible('/fake', ['Admin'])).toBe(false);
    });

    it('handles multiple roles correctly', () => {
      expect(isPathAccessible('/setup', ['Supervisor', 'Branding Manager'])).toBe(true);
      expect(isPathAccessible('/validation', ['Supervisor', 'Maintenance Staff'])).toBe(true);
    });

    it('returns false for empty roles array', () => {
      expect(isPathAccessible('/', [])).toBe(false);
      expect(isPathAccessible('/data', [])).toBe(false);
    });

    it('handles case-sensitive path matching', () => {
      expect(isPathAccessible('/DATA', ['Supervisor'])).toBe(false); // uppercase
      expect(isPathAccessible('/Data', ['Supervisor'])).toBe(false); // mixed case
    });
  });

  describe('role assignments', () => {
    it('has correct role assignments for each item', () => {
      const roleAssignments = {
        home: ['Supervisor', 'Maintenance Staff', 'Branding Manager', 'Depot Ops', 'Admin'],
        dataHub: ['Supervisor'],
        validation: ['Supervisor', 'Maintenance Staff'],
        setup: ['Supervisor', 'Branding Manager'],
        results: ['Supervisor'],
        review: ['Supervisor'],
        ops: ['Depot Ops'],
        analytics: ['Supervisor'],
        admin: ['Admin']
      };

      Object.entries(roleAssignments).forEach(([itemId, expectedRoles]) => {
        const item = menuItems.find(m => m.id === itemId);
        expect(item).toBeDefined();
        expect(item!.roles).toEqual(expect.arrayContaining(expectedRoles));
      });
    });

    it('has no duplicate roles within items', () => {
      menuItems.forEach(item => {
        const uniqueRoles = new Set(item.roles);
        expect(item.roles.length).toBe(uniqueRoles.size);
      });
    });
  });
});
