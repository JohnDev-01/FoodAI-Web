import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants';

const MotionContainer = motion.div as any;
const MotionCard = motion.div as any;

export function Login() {
  const { loginWithGoogle, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(false);

  const status = useMemo(
    () => new URLSearchParams(location.search).get('status'),
    [location.search]
  );
  const missingAccount = status === 'no-account';

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    if (user.role === 'restaurant') {
      navigate(ROUTES.RESTAURANT_DASHBOARD, { replace: true });
    } else if (user.role === 'admin') {
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    } else {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [loading, user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Google auth error:', error);
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#06091c] via-[#0b1332] to-[#151d3f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.45, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute -top-32 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/60 via-indigo-400/40 to-purple-500/30 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="absolute bottom-[-120px] right-[-80px] h-[380px] w-[320px] rounded-full bg-gradient-to-tr from-purple-500/40 via-indigo-400/25 to-blue-400/20 blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_65%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-14">
        <MotionContainer
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-xl"
        >
          <MotionCard
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[34px] border border-white/12 bg-white/12 p-10 shadow-[0_35px_120px_-45px_rgba(15,40,120,0.6)] backdrop-blur-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_70%)]"
            />

            <div className="relative flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <Link to={ROUTES.HOME}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100 transition hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Inicio
                  </Button>
                </Link>
                <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/80">
                  <Sparkles className="h-4 w-4" />
                  FoodAI
                </div>
              </div>

              <div className="space-y-5">
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Ingresa a tu panel inteligente con un toque
                </h1>
                <p className="text-sm text-blue-100/75 sm:text-base">
                  Conéctate con Google para sincronizar dashboards, pedidos en vivo y automatizaciones IA. 
                </p>
              </div>

              {missingAccount && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100"
                >
                  <strong className="block text-red-200">Tu correo no está registrado.</strong>
                  Completa el registro de restaurante para habilitar el acceso seguro.
                </motion.div>
              )}

              <div className="space-y-4">
                <Button
                  onClick={handleGoogleSignIn}
                  className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white text-gray-900 transition-all hover:shadow-[0_0_40px_-12px_rgba(59,130,246,0.7)] dark:bg-gray-100 dark:text-gray-900"
                  disabled={authLoading}
                  loading={authLoading}
                >
                  <span className="relative z-10 flex items-center gap-3 text-base font-medium">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-red-500 text-xs font-bold text-white">
                      G
                    </span>
                    Continuar con Google
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Button>

                <div className="grid gap-2 text-xs text-blue-100/65 sm:text-sm">
                  {[
                    'OAuth 2.0',
                    'Asignamos automáticamente el flujo correcto según tu estado.',
                    'Tus métricas, pedidos y automatizaciones te esperan al volver.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-blue-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 text-sm text-blue-100/70">
                <span>
                  ¿Aún no eres parte de FoodAI?{' '}
                  <Link to={ROUTES.REGISTER} className="text-blue-200 underline underline-offset-4">
                    Crear cuenta
                  </Link>
                </span>
                {/* <span>
                  Soporte de acceso:{' '}
                  <Link to="mailto:soporte@foodai.app" className="text-blue-200 underline underline-offset-4">
                    soporte@foodai.app
                  </Link>
                </span> */}
              </div>
            </div>
          </MotionCard>
        </MotionContainer>
      </div>
    </div>
  );
}
