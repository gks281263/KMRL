import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // For demo purposes, allow access if user exists or if we're in development/GitHub Pages mode
  const isDemoMode = window.location.hostname.includes('github.io') || import.meta.env.DEV;
  
  if (isDemoMode) {
    // In demo mode, always allow access
    return <>{children}</>;
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
