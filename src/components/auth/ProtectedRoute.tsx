import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
}

export function ProtectedRoute({ children, requireProfile = true }: ProtectedRouteProps) {
  const { user, sessionUser, initialising } = useAuth();

  if (initialising) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!sessionUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requireProfile && !user) {
    return <Navigate to={ROUTES.RESTAURANT_ONBOARDING} replace />;
  }

  return <>{children}</>;
}

