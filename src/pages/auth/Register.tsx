import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { ROUTES, USER_TYPES } from '../../constants';
import type { RegisterForm } from '../../types';

const MotionWrapper = motion.div as any;
const MotionSection = motion.div as any;

export function Register() {
  const { signUpRestaurant, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'client' | 'restaurant' | 'admin'>('restaurant');
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

  const userTypeOptions = useMemo(
    () =>
      Object.entries(USER_TYPES).map(([key, value]) => {
        const label =
          value === 'client' ? 'Cliente' : value === 'restaurant' ? 'Restaurante' : 'Admin';
        const disabled = value !== 'restaurant';
        return { key, value, label, disabled };
      }),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Únete a FoodAI
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Crea tu cuenta de restaurante, conecta con Google y completa el perfil inteligente que
            sincroniza la tabla de usuarios en Supabase.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <MotionWrapper
            key={isRestaurant && !showEmailForm ? 'restaurant-google' : 'standard-form'}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Card className="shadow-xl shadow-blue-500/10 overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl">Regístrate en FoodAI</CardTitle>
                  <CardDescription>
                    Selecciona el tipo de usuario y sigue los pasos para activar tu panel.
                  </CardDescription>
                </CardHeader>
              </div>
              <CardContent className="relative">
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tipo de usuario
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {userTypeOptions.map(({ key, value, label, disabled }) => (
                      <Button
                        key={key}
                        type="button"
                        variant={userType === value ? 'primary' : 'outline'}
                        size="sm"
                        disabled={disabled}
                        onClick={() => !disabled && setUserType(value as any)}
                        className="text-xs py-2"
                      >
                        {label}
                        {disabled && (
                          <span className="ml-1 text-[10px] uppercase tracking-wide">
                            Próximamente
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {isRestaurant && !showEmailForm ? (
                  <MotionSection
                    className="grid gap-6 md:grid-cols-[1.2fr_1fr]"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-500 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_70%)]" />
                      <div className="relative space-y-6">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm">
                          <span className="text-lg">🚀</span>
                          <span>Alta rápida para restaurantes</span>
                        </div>
                        <h2 className="text-3xl font-semibold leading-tight">
                          Autentícate con Google y activa tu cuenta profesional.
                        </h2>
                        <div className="space-y-4 text-sm text-blue-50">
                          {[
                            {
                              title: 'Conecta con Google',
                              description:
                                'Usamos OAuth para garantizar un acceso seguro y sin contraseñas.',
                            },
                            {
                              title: 'Completa tu perfil',
                              description:
                                'Registra nombre y apellidos para sincronizar la tabla public.users.',
                            },
                            {
                              title: 'Explora tu dashboard',
                              description:
                                'Accede a métricas, pedidos en vivo y automatizaciones con IA.',
                            },
                          ].map((step, index) => (
                            <div key={step.title} className="flex gap-3 items-start">
                              <span className="bg-white/20 rounded-full h-7 w-7 flex items-center justify-center text-sm font-semibold mt-0.5">
                                {index + 1}
                              </span>
                              <div className="space-y-1">
                                <p className="font-semibold text-white">{step.title}</p>
                                <p className="text-blue-100/80">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-inner">
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Conecta tu cuenta Google
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Serás redirigido a Google. Al regresar, te pediremos los datos faltantes
                          para completar el registro de restaurante.
                        </p>
                      </div>

                      <Button
                        onClick={handleGoogleSignup}
                        className="h-12 bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        disabled={googleLoading}
                        loading={googleLoading}
                      >
                        <span className="flex items-center gap-3 text-base">
                          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-red-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">G</span>
                          </span>
                          {googleLoading ? 'Conectando...' : 'Continuar con Google'}
                        </span>
                      </Button>

                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Al continuar aceptas nuestros términos y autorizas a FoodAI a almacenar
                        datos básicos (correo y nombre) en Supabase para identificar tu restaurante.
                      </div>

                     
                    </div>
                  </MotionSection>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {!isRestaurant && (
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 px-4 py-3 text-sm text-blue-700 dark:text-blue-200">
                        Muy pronto habilitaremos la creación de cuentas para este rol. Por ahora el
                        registro se centra en restaurantes.
                      </div>
                    )}

                    <Input
                      label="Nombre Completo"
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
                      label="Correo Electrónico"
                      type="email"
                      placeholder="tu@email.com"
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
                      label="Teléfono (Opcional)"
                      type="tel"
                      placeholder="+1 234 567 8900"
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
                      label="Confirmar Contraseña"
                      type="password"
                      placeholder="Confirma tu contraseña"
                      {...register('confirmPassword', {
                        required: 'Confirma tu contraseña',
                        validate: (value) =>
                          value === password || 'Las contraseñas no coinciden',
                      })}
                      error={errors.confirmPassword?.message}
                    />

                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        className="w-full"
                        loading={loading}
                        disabled={loading || !isRestaurant}
                      >
                        Crear Cuenta
                      </Button>
                      {isRestaurant && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                          onClick={() => setShowEmailForm(false)}
                        >
                          Volver al registro con Google
                        </Button>
                      )}
                    </div>
                  </form>
                )}

                <div className="mt-10">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white dark:bg-gray-900 text-gray-500">
                        ¿Ya tienes cuenta?
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link to={ROUTES.LOGIN}>
                      <Button variant="outline" className="w-full">
                        Iniciar Sesión
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        </AnimatePresence>
      </div>
    </div>
  );
}
