import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin';
}

/**
 * Route guard that redirects unauthenticated users to /login
 * and unauthorized users (wrong role) to /.
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner size="large" message="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
