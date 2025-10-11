import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants';

const MotionContainer = motion.div as any;
const MotionCard = motion.div as any;
const MotionGlow = motion.div as any;

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-purple-950 text-white">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-1/4 -left-1/3 h-[60vw] w-[60vw] rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute -bottom-1/3 right-0 h-[50vw] w-[50vw] rounded-full bg-purple-600 blur-3xl" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_55%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <MotionContainer
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.2fr_1fr]"
        >
          <MotionCard
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl"
          >
            <MotionGlow
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_65%)]"
            />

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-blue-100">
                <Sparkles className="h-4 w-4" />
                Acceso Seguro
              </div>

              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Inicia sesión con Google y gestiona tu experiencia FoodAI.
              </h1>

              <p className="text-lg text-blue-100/80">
                Accede al centro de control para restaurantes con Analytics en tiempo real, pedidos
                inteligentes y herramientas potenciadas por IA.
              </p>

              <div className="grid gap-4">
                {[
                  {
                    title: 'Acceso ultra seguro',
                    description: 'Autenticación OAuth 2.0 manejada por Supabase + Google.',
                  },
                  {
                    title: 'Sin contraseñas manuales',
                    description: 'Evita credenciales duplicadas; basta tu cuenta corporativa de Google.',
                  },
                  {
                    title: 'Continuidad inmediata',
                    description:
                      'Si tu restaurante ya está registrado, te llevamos directo al dashboard.',
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-5 w-5 text-blue-300" />
                    <div>
                      <p className="font-semibold text-white">{feature.title}</p>
                      <p className="text-sm text-blue-100/70">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-100/60">¿Nuevo aquí?</p>
              <div className="mt-3 flex items-center gap-3">
                <Link to={ROUTES.REGISTER}>
                  <Button variant="outline" className="border-white/30 bg-white/10 text-white">
                    Crear cuenta de restaurante
                  </Button>
                </Link>
                <Link to={ROUTES.HOME} className="group inline-flex items-center text-sm text-blue-200">
                  Volver al inicio
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            className="relative flex h-full flex-col justify-between rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white shadow-lg shadow-blue-500/40">
                  F
                </div>
              </div>

              <h2 className="text-center text-2xl font-semibold text-white">
                Bienvenido de nuevo
              </h2>
              <p className="text-center text-sm text-blue-100/70">
                Accede con tu cuenta de Google registrada. Si aún no te has dado de alta, crea tu
                perfil de restaurante en segundos.
              </p>

              {missingAccount && (
                <div className="rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  <strong className="block text-red-200">Tu correo no está registrado.</strong>
                  Completa el formulario de registro para crear tu cuenta de restaurante y habilitar
                  el acceso.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                className="h-12 w-full border border-white/20 bg-white text-gray-900 hover:bg-white/90 dark:bg-gray-100 dark:text-gray-900"
                disabled={authLoading}
                loading={authLoading}
              >
                <span className="flex items-center justify-center gap-3 text-base">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-red-500 text-xs font-bold text-white">
                    G
                  </span>
                  Continuar con Google
                </span>
              </Button>

              <p className="text-center text-xs text-blue-100/60">
                FoodAI solo permitirá el acceso si el correo autenticado pertenece a un restaurante
                dado de alta.
              </p>
            </div>
          </MotionCard>
        </MotionContainer>
      </div>
    </div>
  );
}
