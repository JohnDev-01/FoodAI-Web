import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';

interface RestaurantRouteProps {
  children: ReactNode;
}

export function RestaurantRoute({ children }: RestaurantRouteProps) {
  const { user, isRestaurant } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!isRestaurant()) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}



