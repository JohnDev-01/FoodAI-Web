import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';

interface RestaurantRouteProps {
  children: ReactNode;
}

export function RestaurantRoute({ children }: RestaurantRouteProps) {
  const { user, sessionUser, initialising, isRestaurant } = useAuth();

  if (initialising) {
    return null;
  }

  if (!sessionUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!user) {
    return <Navigate to={ROUTES.RESTAURANT_ONBOARDING} replace />;
  }

  if (!isRestaurant()) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}
