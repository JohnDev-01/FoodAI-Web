import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES, USER_TYPES } from '../../constants';
import type { RegisterForm } from '../../types';

type MotionDivProps = MotionProps & React.HTMLAttributes<HTMLDivElement>;
type MotionFormProps = MotionProps & React.FormHTMLAttributes<HTMLFormElement>;

const createMotionDiv = (displayName: string) => {
  const Component = React.forwardRef<HTMLDivElement, MotionDivProps>(
    (props, ref) => <motion.div ref={ref} {...props} />
  );
  Component.displayName = displayName;
  return Component;
};

const createMotionForm = (displayName: string) => {
  const Component = React.forwardRef<HTMLFormElement, MotionFormProps>(
    (props, ref) => <motion.form ref={ref} {...props} />
  );
  Component.displayName = displayName;
  return Component;
};

const MotionBackdrop = createMotionDiv('MotionBackdrop');
const MotionAccent = createMotionDiv('MotionAccent');
const MotionCard = createMotionDiv('MotionCard');
const MotionOverlay = createMotionDiv('MotionOverlay');
const MotionSectionCard = createMotionDiv('MotionSectionCard');
const MotionForm = createMotionForm('MotionForm');

export function Register() {
  const { signUpRestaurant, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'client' | 'restaurant'>('restaurant');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');
  const isRestaurant = userType === 'restaurant';

  const userTypeOptions = useMemo(() => {
    const entries = Object.entries(USER_TYPES) as Array<[string, 'client' | 'restaurant']>;
    return entries.map(([key, value]) => ({
      key,
      value,
      label: value === 'client' ? 'Cliente' : 'Restaurante',
      disabled: value !== 'restaurant',
    }));
  }, []);

  const highlights = useMemo(
    () => [
      {
        title: 'Identidad verificada',
        description: 'Autenticación con Google y Supabase para asegurar tus datos y sesiones.',
      },
      {
        title: 'Onboarding asistido',
        description: 'Dirigimos cada paso: datos personales, restaurante y activación inmediata.',
      },
      {
        title: 'Ecosistema inteligente',
        description: 'Accede a métricas en vivo, pedidos automatizados y herramientas con IA.',
      },
    ],
    []
  );

  const onSubmit = async (data: RegisterForm) => {
    try {
      if (!isRestaurant) {
        toast.error('Por ahora el alta está disponible solo para restaurantes.');
        return;
      }

      const result = await signUpRestaurant({
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        navigate(ROUTES.RESTAURANT_ONBOARDING);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle('restaurant');
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error('No se pudo iniciar la autenticación con Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#040713] via-[#0a112a] to-[#141e3f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <MotionBackdrop
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.45, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute -top-36 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/60 via-indigo-400/40 to-purple-500/30 blur-3xl"
        />
        <MotionAccent
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="absolute bottom-[-130px] right-[-80px] h-[400px] w-[320px] rounded-full bg-gradient-to-tr from-purple-500/35 via-indigo-400/20 to-blue-400/15 blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_65%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-14">
        <MotionCard
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative w-full max-w-4xl overflow-hidden rounded-[36px] border border-white/12 bg-white/12 p-10 shadow-[0_35px_120px_-45px_rgba(15,40,120,0.65)] backdrop-blur-2xl"
        >
          <MotionOverlay
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_70%)]"
          />

          <div className="relative space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link to={ROUTES.LOGIN}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100 transition hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
              <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/80">
                <Sparkles className="h-4 w-4" />
                FoodAI
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Crea tu cuenta de restaurante con una experiencia guiada
              </h1>
              <p className="text-sm text-blue-100/75 sm:text-base">
                Usa tu cuenta de Google para empezar en segundos o completa el formulario si prefieres correo. 
                Te acompañamos paso a paso para activar tu panel inteligente.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-100/70">
                Tipos de cuenta
              </p>
              <div className="flex flex-wrap gap-3">
                {userTypeOptions.map(({ key, value, label, disabled }) => (
                  <Button
                    key={key}
                    type="button"
                    variant={userType === value ? 'primary' : 'outline'}
                    size="sm"
                    disabled={disabled}
                    onClick={() => !disabled && setUserType(value)}
                    className={`rounded-full px-5 ${
                      userType === value
                        ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white border-0'
                        : 'border-white/20 bg-white/10 text-blue-100 hover:bg-white/20'
                    } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {label}
                    {disabled && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-blue-100/70">
                        Próximamente
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              {!isRestaurant && (
                <div className="rounded-2xl border border-blue-400/30 bg-blue-500/15 px-4 py-3 text-sm text-blue-100">
                  Muy pronto habilitaremos el registro para clientes. Por ahora, enfocamos el alta en restaurantes.
                </div>
              )}
            </div>

            {isRestaurant && (
              <AnimatePresence mode="wait">
                {showEmailForm ? (
                  <MotionForm
                    key="email-form"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid gap-5"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Nombre completo"
                        placeholder="Tu nombre completo"
                        {...register('name', {
                          required: 'El nombre es requerido',
                          minLength: {
                            value: 2,
                            message: 'El nombre debe tener al menos 2 caracteres',
                          },
                        })}
                        error={errors.name?.message}
                      />
                      <Input
                        label="Correo electrónico"
                        type="email"
                        placeholder="tu@restaurante.com"
                        {...register('email', {
                          required: 'El correo es requerido',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Formato de correo inválido',
                          },
                        })}
                        error={errors.email?.message}
                      />
                      <Input
                        label="Teléfono (opcional)"
                        type="tel"
                        placeholder="+1 809 000 0000"
                        {...register('phone')}
                      />
                      <Input
                        label="Contraseña"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        {...register('password', {
                          required: 'La contraseña es requerida',
                          minLength: {
                            value: 8,
                            message: 'La contraseña debe tener al menos 8 caracteres',
                          },
                        })}
                        error={errors.password?.message}
                      />
                      <Input
                        label="Confirmar contraseña"
                        type="password"
                        placeholder="Repite tu contraseña"
                        {...register('confirmPassword', {
                          required: 'Confirma tu contraseña',
                          validate: (value) =>
                            value === password || 'Las contraseñas no coinciden',
                        })}
                        error={errors.confirmPassword?.message}
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        loading={loading}
                        disabled={loading}
                      >
                        Crear cuenta de restaurante
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-sm text-blue-200 hover:text-white sm:w-auto"
                        onClick={() => setShowEmailForm(false)}
                      >
                        Prefiero continuar con Google
                      </Button>
                    </div>
                  </MotionForm>
                ) : (
                  <MotionSectionCard
                    key="google-flow"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="space-y-6"
                  >
                    <div className="grid gap-4 sm:grid-cols-3">
                      {highlights.map((item) => (
                        <div
                          key={item.title}
                          className="rounded-2xl border border-white/10 bg-white/12 px-4 py-5"
                        >
                          <ShieldCheck className="mb-3 h-5 w-5 text-blue-100" />
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-1 text-xs text-blue-100/70">{item.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleGoogleSignup}
                        className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white text-gray-900 transition-all hover:shadow-[0_0_40px_-12px_rgba(59,130,246,0.7)] dark:bg-gray-100 dark:text-gray-900"
                        disabled={googleLoading}
                        loading={googleLoading}
                      >
                        <span className="relative z-10 flex items-center gap-3 text-base font-medium">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-red-500 text-xs font-bold text-white">
                            G
                          </span>
                          {googleLoading ? 'Conectando...' : 'Continuar con Google'}
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </Button>
                     
                    </div>

                    <p className="text-xs text-blue-100/60">
                      Al continuar aceptas nuestros términos y autorizas a FoodAI a sincronizar tus datos con Supabase
                      para identificar tu restaurante dentro del ecosistema.
                    </p>
                  </MotionSectionCard>
                )}
              </AnimatePresence>
            )}

            <div className="flex flex-col gap-3 pt-2 text-sm text-blue-100/70 sm:flex-row sm:items-center sm:justify-between">
              <span>
                ¿Ya tienes cuenta?{' '}
                <Link to={ROUTES.LOGIN} className="text-blue-200 underline underline-offset-4">
                  Inicia sesión aquí
                </Link>
              </span>
              <span>
                Soporte:{' '}
                <Link to="mailto:soporte@foodai.app" className="text-blue-200 underline underline-offset-4">
                  soporte@foodai.app
                </Link>
              </span>
            </div>
          </div>
        </MotionCard>
      </div>
    </div>
  );
}
