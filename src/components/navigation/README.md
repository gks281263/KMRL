# Dynamic Navigation System with RBAC

A comprehensive, role-based navigation system built with React, TypeScript, and Tailwind CSS that provides dynamic menu rendering based on user permissions.

## Features

### 🎯 **Role-Based Access Control (RBAC)**
- **5 Supported Roles**: Supervisor, Maintenance Staff, Branding Manager, Depot Ops, Admin
- **Dynamic Menu Rendering**: Only shows menu items the user has access to
- **Secure Navigation**: Prevents unauthorized access to restricted areas
- **Multi-Role Support**: Users can have multiple roles with combined permissions

### 🎨 **Modern UI/UX Design**
- **Google-Style Minimalism**: Clean, spacious design with subtle shadows and rounded corners
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Elegant transitions for collapse/expand and mobile menu
- **Accessibility First**: Full keyboard navigation and screen reader support

### 📱 **Responsive Features**
- **Collapsible Sidebar**: Desktop users can collapse to icons-only view
- **Mobile-First**: Hamburger menu with slide-out navigation
- **Touch-Friendly**: Optimized for mobile interactions
- **Breakpoint Aware**: Adapts layout based on screen size

### 🔒 **Security Features**
- **Admin Warning Icons**: Visual indicators for sensitive admin functions
- **Route Protection**: Built-in path accessibility checking
- **Role Validation**: Server-side role verification support
- **Session Management**: Secure logout and authentication handling

## Architecture

### Component Structure
```
src/components/navigation/
├── Sidebar.tsx          # Main navigation container
├── NavItem.tsx          # Individual navigation item
├── index.ts            # Export barrel
└── README.md           # This documentation

src/config/
└── menuConfig.ts       # Menu configuration and RBAC logic
```

### Data Flow
1. **User Authentication** → Fetch user roles from `/api/auth/me/`
2. **Role Processing** → Filter menu items based on user permissions
3. **Menu Rendering** → Render only accessible navigation items
4. **Route Protection** → Validate path accessibility for navigation

## Usage

### Basic Implementation

```tsx
import { Sidebar } from '@/components/navigation';

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        {/* Your app content */}
      </main>
    </div>
  );
}
```

### Custom Styling

```tsx
<Sidebar className="custom-sidebar-class" />
```

### Role-Based Menu Items

The system automatically renders menu items based on user roles:

| Role | Accessible Items |
|------|------------------|
| **Supervisor** | Dashboard, Data Ingestion, Validation, Setup, Results, Review, Analytics |
| **Maintenance Staff** | Dashboard, Validation |
| **Branding Manager** | Dashboard, Setup |
| **Depot Ops** | Dashboard, Execution Tracking |
| **Admin** | All items + Admin & Config |

## Configuration

### Adding New Menu Items

Edit `src/config/menuConfig.ts`:

```tsx
export const menuItems: MenuItem[] = [
  // ... existing items
  {
    id: "newFeature",
    label: "New Feature",
    path: "/new-feature",
    roles: ["Supervisor", "Admin"],
    icon: NewIcon,
    description: "Description of the new feature"
  }
];
```

### Role Management

```tsx
// Check if a path is accessible
import { isPathAccessible } from '@/config/menuConfig';

const canAccess = isPathAccessible('/admin', userRoles);

// Get menu items for a specific role
import { getMenuItemsForRole } from '@/config/menuConfig';

const menuItems = getMenuItemsForRole(['Supervisor']);
```

## API Integration

### User Profile Endpoint

The system expects a user profile API endpoint:

```typescript
// GET /api/auth/me/
interface UserProfile {
  userId: string;
  name: string;
  roles: string[];
}

// Example response
{
  "userId": "user-123",
  "name": "John Doe",
  "roles": ["Supervisor", "Branding Manager"]
}
```

### Custom API Integration

Replace the mock `fetchUserProfile` function in `Sidebar.tsx`:

```tsx
const fetchUserProfile = async (): Promise<User> => {
  const response = await fetch('/api/auth/me/', {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  
  return response.json();
};
```

## Styling & Theming

### Color Scheme
- **Primary**: Blue (`#0b66ff`) for active states and accents
- **Background**: Light gray (`#f7f7f9`) for sidebar
- **Text**: Neutral grays for readability
- **Admin Warning**: Red (`#dc2626`) for sensitive functions

### CSS Classes
The system uses Tailwind CSS with custom design tokens:
- `bg-blue-50` - Active item background
- `text-blue-700` - Active item text
- `border-l-blue-600` - Active item left border
- `hover:bg-blue-50` - Hover states

### Customization
Override default styles by modifying the component classes or extending the Tailwind config.

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate between menu items
- **Enter/Space**: Activate selected item
- **Escape**: Close mobile menu
- **Arrow Keys**: Navigate menu items (future enhancement)

### Screen Reader Support
- **ARIA Labels**: Proper labeling for all interactive elements
- **Role Attributes**: Semantic HTML roles for navigation
- **Current Page**: `aria-current="page"` for active navigation
- **Descriptions**: Helpful text for complex menu items

### Focus Management
- **Visible Focus**: Clear focus indicators with ring styles
- **Focus Trapping**: Mobile menu keeps focus within navigation
- **Focus Restoration**: Returns focus to trigger button when menu closes

## Testing

### Running Tests

```bash
# Run all navigation tests
npm test src/components/navigation/

# Run specific component tests
npm test src/components/navigation/Sidebar.test.tsx
npm test src/components/navigation/NavItem.test.tsx
npm test src/config/menuConfig.test.tsx
```

### Test Coverage

The test suite covers:
- ✅ Component rendering and props
- ✅ Role-based menu filtering
- ✅ Responsive behavior (collapse/expand)
- ✅ Mobile menu interactions
- ✅ Accessibility features
- ✅ RBAC logic and edge cases
- ✅ User interaction handling

## Performance

### Optimization Features
- **React Query**: Efficient data fetching with caching
- **Memoization**: Prevents unnecessary re-renders
- **Lazy Loading**: Icons and components loaded on demand
- **Debounced Interactions**: Smooth user experience

### Bundle Size
- **Tree Shaking**: Only imports used components
- **Code Splitting**: Navigation can be lazy-loaded
- **Icon Optimization**: Lucide React icons are tree-shakeable

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Troubleshooting

### Common Issues

**Menu items not showing:**
- Check user roles in API response
- Verify role names match exactly (case-sensitive)
- Check browser console for errors

**Mobile menu not working:**
- Ensure proper CSS classes are applied
- Check for conflicting z-index values
- Verify touch event handling

**Styling issues:**
- Confirm Tailwind CSS is properly configured
- Check for CSS class conflicts
- Verify design token values

### Debug Mode

Enable debug logging by setting environment variable:

```bash
REACT_APP_DEBUG_NAVIGATION=true
```

## Contributing

### Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Run tests: `npm test`
4. Build for production: `npm run build`

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Testing**: Minimum 90% coverage required

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with detailed description
5. Ensure all tests pass
6. Request code review

## License

This navigation system is part of the Metro project and follows the same licensing terms.

---

For additional support or questions, please refer to the project documentation or create an issue in the repository.
