# KMRL Train Induction Web Application

A secure, modern web application for KMRL (Kochi Metro Rail Limited) train induction system with role-based access control and multi-factor authentication.

## Features

### 🔐 Secure Authentication
- **Multi-Factor Authentication (MFA)**: OTP-based two-factor authentication
- **Role-Based Access Control**: Support for Supervisor, Maintenance Staff, Branding Manager, Depot Ops, and Admin roles
- **Session Management**: Secure token-based authentication with automatic refresh
- **Rate Limiting**: Protection against brute force attacks

### 🎨 Modern UI/UX
- **Google-like Minimal Design**: Clean, authoritative government product aesthetic
- **Responsive Design**: Desktop-first with mobile breakpoints at 1024/768/480px
- **Accessibility**: Full keyboard navigation, ARIA attributes, WCAG AA compliance
- **Color Psychology**: Blue for trust/reliability, green for success, amber for warnings, red for errors

### 🛠 Technical Excellence
- **TypeScript**: Strict mode for type safety
- **React 18**: Functional components with hooks
- **React Query**: Efficient data fetching and caching
- **Form Validation**: Zod schema validation with React Hook Form
- **Testing**: Comprehensive unit tests with Vitest and Testing Library

## Project Structure

```
src/
├── components/ui/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Toggle.tsx
│   └── Select.tsx
├── pages/                  # Page components
│   ├── Login.tsx
│   ├── Login.test.tsx
│   └── Login.stories.tsx
├── services/api/           # API service layer
│   └── auth.ts
├── hooks/                  # Custom React hooks
│   └── useAuth.ts
├── types/                  # TypeScript type definitions
│   ├── auth.ts
│   └── common.ts
├── utils/                  # Utility functions
│   ├── cn.ts
│   └── i18n.ts
├── styles/                 # Styling and design tokens
│   └── design-tokens.css
└── test/                   # Test setup
    └── setup.ts
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kmrl-train-induction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
```

## Testing

### Unit Tests
The application includes comprehensive unit tests for:
- Form validation
- Authentication flows
- Component rendering
- Error handling
- Accessibility features

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

### E2E Testing
```bash
# Test login as Supervisor
npm run test:e2e
```

## API Integration

### Backend Requirements
The frontend expects a Django REST API with the following endpoints:

- `POST /api/auth/login/` - User authentication
- `POST /api/auth/verify-otp/` - MFA OTP verification
- `GET /api/auth/me/` - Get current user info
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Token refresh

See `API_STUBS.md` for detailed API documentation and example responses.

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.kmrl.gov.in/api
VITE_APP_NAME=KMRL Train Induction
```

## Design System

### Colors
- **Primary Blue**: `#0b66ff` - Trust, reliability, main actions
- **Success Green**: `#22c55e` - Valid certificates, on-time status
- **Warning Amber**: `#f59e0b` - Near-expiry items, attention needed
- **Danger Red**: `#ef4444` - Expired certificates, failed sync
- **Neutral Gray**: `#f5f5f5` - Clean surfaces, backgrounds
- **Accent Teal**: `#14b8a6` - Branding manager elements

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line Heights**: 1.25 (tight), 1.5 (normal), 1.75 (relaxed)

### Spacing
- **Base Unit**: 4px
- **Scale**: xs (4px), sm (8px), md (16px), lg (24px), xl (32px), 2xl (48px), 3xl (64px)

### Border Radius
- **Cards**: 16px (2xl)
- **Buttons**: 8px (lg)
- **Inputs**: 8px (lg)

## Accessibility

The application follows WCAG AA standards:

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: Sufficient contrast ratios for all text
- **Focus Management**: Clear focus indicators and logical tab order
- **Error Handling**: Accessible error messages and validation

## Internationalization

The application is i18n-ready using a simple translation function:

```typescript
import { t } from '@/utils/i18n';

// Usage
t('login.title') // "KMRL Train Induction — Secure Access"
t('login.mfa.countdown', { seconds: 30 }) // "Resend available in 30s"
```

## Deployment

### Production Build
```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Recommended Hosting
- **Vercel**: Zero-config deployment with automatic HTTPS
- **Netlify**: Easy deployment with form handling
- **AWS S3 + CloudFront**: Scalable static hosting
- **GitHub Pages**: Free hosting for public repositories

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript strict mode
- Use functional components and hooks
- Write comprehensive tests
- Follow accessibility guidelines
- Use the established design system

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For technical support or questions:
- **Email**: ops@kmrl.gov.in
- **Documentation**: See `API_STUBS.md` for API details
- **Issues**: Use GitHub Issues for bug reports and feature requests

---

**KMRL Train Induction** - Secure, Modern, Accessible
