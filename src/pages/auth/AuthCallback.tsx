import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, STORAGE_KEYS } from '../../constants';
import { supabaseClient } from '../../services/supabaseClient';

const MotionWrapper = motion.div as any;

export function AuthCallback() {
  const { sessionUser, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const finishAuth = async () => {
      setChecking(true);
      await refreshProfile();
      setChecking(false);
    };

    finishAuth();
  }, [refreshProfile]);

  useEffect(() => {
    if (checking) {
      return;
    }

    const handleNavigation = async () => {
      const query = new URLSearchParams(location.search);
      const errorDescription = query.get('error_description');

      if (errorDescription) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (!sessionUser) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      const pendingRole = localStorage.getItem(STORAGE_KEYS.SUPABASE_PENDING_ROLE);

      const clearPending = () => {
        localStorage.removeItem(STORAGE_KEYS.SUPABASE_PENDING_ROLE);
        localStorage.removeItem(STORAGE_KEYS.SUPABASE_POST_AUTH_ROUTE);
      };

      if (!user) {
        if (pendingRole === 'restaurant') {
          navigate(ROUTES.RESTAURANT_ONBOARDING, { replace: true });
          return;
        }

        clearPending();
        await supabaseClient.auth.signOut();
        navigate(`${ROUTES.LOGIN}?status=no-account`, { replace: true });
        return;
      }

      if (user.role === 'restaurant') {
        if (user.status === 'active') {
          clearPending();
          navigate(ROUTES.RESTAURANT_DASHBOARD, { replace: true });
          return;
        }

        clearPending();
        navigate(ROUTES.RESTAURANT_ONBOARDING, { replace: true });
        return;
      }

      if (user.role === 'admin') {
        clearPending();
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        return;
      }

      if (pendingRole === 'restaurant') {
        clearPending();
        navigate(ROUTES.RESTAURANT_ONBOARDING, { replace: true });
        return;
      }

      clearPending();
      navigate(ROUTES.HOME, { replace: true });
    };

    handleNavigation();
  }, [checking, location.search, navigate, sessionUser, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <MotionWrapper
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4 bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg px-12 py-10 rounded-3xl shadow-2xl"
      >
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Conectando con tu experiencia FoodAI
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Estamos validando tu autenticación. Esto tomará unos segundos.
          </p>
        </div>
      </MotionWrapper>
    </div>
  );
}
