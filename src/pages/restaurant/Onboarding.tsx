import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES, STORAGE_KEYS } from '../../constants';
import type { Restaurant, RestaurantProfilePayload } from '../../types';
import { getRestaurantByOwnerId, upsertRestaurant } from '../../services/restaurantService';

type PersonalFormValues = RestaurantProfilePayload & { email: string };

type CompanyFormValues = {
  restaurantName: string;
  restaurantEmail: string;
  phone?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  cuisineType?: string;
  openTime?: string;
  closeTime?: string;
  logoUrl?: string;
};

const MotionContainer = motion.div as any;
const MotionCard = motion.div as any;
const MotionHeader = motion.div as any;
const MotionForm = motion.form as any;

const defaultCountry = 'República Dominicana';

export function RestaurantOnboarding() {
  const { sessionUser, user, loading, initialising, completeRestaurantProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [checkingRestaurant, setCheckingRestaurant] = useState(true);
  const [companySubmitting, setCompanySubmitting] = useState(false);

  const metadata = useMemo(
    () => ((sessionUser?.user_metadata ?? {}) as Record<string, any>),
    [sessionUser?.user_metadata]
  );

  const inferredFirstName =
    user?.firstName ??
    (metadata.first_name as string | undefined) ??
    (metadata.given_name as string | undefined) ??
    ((metadata.full_name as string | undefined)?.split(' ')[0] ?? '');
  const inferredLastName =
    user?.lastName ??
    (metadata.last_name as string | undefined) ??
    (metadata.family_name as string | undefined) ??
    ((metadata.full_name as string | undefined)?.split(' ').slice(1).join(' ') ?? '');
  const inferredProfileImage =
    user?.profileImage ?? (metadata.avatar_url as string | undefined) ?? undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonalFormValues>({
    defaultValues: {
      email: sessionUser?.email ?? '',
      firstName: inferredFirstName,
      lastName: inferredLastName,
      profileImage: inferredProfileImage,
    },
  });

  const {
    register: registerCompany,
    handleSubmit: handleSubmitCompany,
    formState: { errors: companyErrors },
    reset: resetCompany,
  } = useForm<CompanyFormValues>({
    defaultValues: {
      restaurantName: '',
      restaurantEmail: sessionUser?.email ?? '',
      phone: '',
      description: '',
      address: '',
      city: '',
      country: defaultCountry,
      cuisineType: '',
      openTime: '',
      closeTime: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (sessionUser) {
      reset({
        email: sessionUser.email ?? '',
        firstName: inferredFirstName,
        lastName: inferredLastName,
        profileImage: inferredProfileImage,
      });

      resetCompany((prev) => ({
        ...prev,
        restaurantEmail: sessionUser.email ?? '',
        country: prev.country || defaultCountry,
      }));
    }
  }, [reset, resetCompany, sessionUser, inferredFirstName, inferredLastName, inferredProfileImage]);

  useEffect(() => {
    if (user?.role === 'restaurant' && user.status === 'active') {
      setStep(2);
    }
  }, [user]);

  useEffect(() => {
    if (!sessionUser) {
      if (!loading) {
        navigate(ROUTES.LOGIN, { replace: true });
      }
      return;
    }

    const fetchRestaurant = async () => {
      if (!user?.id) {
        setCheckingRestaurant(false);
        return;
      }

      setCheckingRestaurant(true);
      try {
        const existing = await getRestaurantByOwnerId(user.id);
        if (existing) {
          hydrateCompanyForm(existing);
          localStorage.removeItem(STORAGE_KEYS.SUPABASE_PENDING_ROLE);
          localStorage.removeItem(STORAGE_KEYS.SUPABASE_POST_AUTH_ROUTE);
          toast.success('Tu restaurante ya está configurado.');
          navigate(ROUTES.RESTAURANT_DASHBOARD, { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error cargando el restaurante', error);
        toast.error('No se pudo cargar la información del restaurante.');
      } finally {
        setCheckingRestaurant(false);
      }
    };

    fetchRestaurant();
  }, [sessionUser, user?.id, navigate, loading]);

  const hydrateCompanyForm = (restaurant: Restaurant) => {
    resetCompany({
      restaurantName: restaurant.name,
      restaurantEmail: restaurant.email,
      phone: restaurant.phone ?? '',
      description: restaurant.description ?? '',
      address: restaurant.address ?? '',
      city: restaurant.city ?? '',
      country: restaurant.country ?? defaultCountry,
      cuisineType: restaurant.cuisineType ?? restaurant.cuisine ?? '',
      openTime: restaurant.openTime ?? '',
      closeTime: restaurant.closeTime ?? '',
      logoUrl: restaurant.logoUrl ?? '',
    });
  };

  const handlePersonalSubmit = async (values: PersonalFormValues) => {
    const result = await completeRestaurantProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      profileImage: values.profileImage,
    });

    if (result.success) {
      toast.success('Perfil personal actualizado. Completa los datos de tu restaurante.');
      setStep(2);
    }
  };

  const handleCompanySubmit = async (values: CompanyFormValues) => {
    if (!user?.id) {
      toast.error('No pudimos identificar tu usuario. Inténtalo nuevamente.');
      return;
    }

    setCompanySubmitting(true);
    try {
      await upsertRestaurant({
        ownerId: user.id,
        name: values.restaurantName,
        email: values.restaurantEmail,
        phone: values.phone?.trim() || null,
        description: values.description?.trim() || null,
        address: values.address?.trim() || null,
        city: values.city?.trim() || null,
        country: values.country?.trim() || defaultCountry,
        cuisineType: values.cuisineType?.trim() || null,
        openTime: values.openTime || null,
        closeTime: values.closeTime || null,
        logoUrl: values.logoUrl?.trim() || null,
        status: 'active',
      });

      localStorage.removeItem(STORAGE_KEYS.SUPABASE_PENDING_ROLE);
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_POST_AUTH_ROUTE);
      toast.success('¡Restaurante configurado correctamente!');
      navigate(ROUTES.RESTAURANT_DASHBOARD, { replace: true });
    } catch (error) {
      console.error('Error completando el restaurante', error);
      toast.error('No pudimos guardar los datos de tu restaurante.');
    } finally {
      setCompanySubmitting(false);
    }
  };

  if (initialising || loading || checkingRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <MotionContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative max-w-4xl w-full"
      >
        <MotionCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="rounded-3xl bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-200/20 via-transparent to-purple-200/20 dark:from-blue-500/10 dark:to-purple-500/10" />

          <div className="relative px-8 py-10 md:px-12 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
              <MotionHeader
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Completemos tu presencia en FoodAI
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Primero confirma tus datos personales y luego registra tu restaurante.
                  </p>
                </div>
              </MotionHeader>

              <div className="flex items-center gap-4">
                {[1, 2].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold ${
                        step === item
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : item < step
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                      }`}
                    >
                      {item}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 hidden sm:block">
                      {item === 1 ? 'Datos personales' : 'Datos del restaurante'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {step === 1 ? (
              <MotionForm
                onSubmit={handleSubmit(handlePersonalSubmit)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="md:col-span-2">
                  <Input
                    label="Correo"
                    type="email"
                    readOnly
                    className="bg-white/70 dark:bg-gray-800/70 cursor-not-allowed"
                    {...register('email')}
                  />
                </div>

                <Input
                  label="Nombre"
                  placeholder="Nombre del representante"
                  {...register('firstName', {
                    required: 'Tu nombre es requerido',
                    minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                  })}
                  error={errors.firstName?.message}
                />

                <Input
                  label="Apellido"
                  placeholder="Apellido del representante"
                  {...register('lastName', {
                    required: 'Tu apellido es requerido',
                    minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                  })}
                  error={errors.lastName?.message}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Imagen de perfil (URL)"
                    placeholder="https://tu-imagen.com/avatar.png"
                    {...register('profileImage')}
                    error={errors.profileImage?.message}
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Esta imagen se mostrará en tu panel y comunicaciones con clientes.
                  </p>
                </div>

                <div className="md:col-span-2 mt-6 flex justify-end">
                  <Button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 text-base font-semibold shadow-lg shadow-blue-500/20"
                    loading={loading}
                    disabled={loading}
                  >
                    Guardar y continuar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </MotionForm>
            ) : (
              <MotionForm
                onSubmit={handleSubmitCompany(handleCompanySubmit)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nombre del Restaurante"
                    placeholder="Ej. FoodAI Bistro"
                    {...registerCompany('restaurantName', {
                      required: 'El nombre del restaurante es requerido',
                      minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                    })}
                    error={companyErrors.restaurantName?.message}
                  />

                  <Input
                    label="Correo del Restaurante"
                    type="email"
                    placeholder="contacto@turestaurante.com"
                    {...registerCompany('restaurantEmail', {
                      required: 'El correo del restaurante es requerido',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Formato de correo inválido',
                      },
                    })}
                    error={companyErrors.restaurantEmail?.message}
                  />

                  <Input
                    label="Teléfono"
                    placeholder="+1 809 000 0000"
                    {...registerCompany('phone')}
                    error={companyErrors.phone?.message}
                  />

                  <Input
                    label="Tipo de cocina"
                    placeholder="Italiana, Mexicana, Fusión..."
                    {...registerCompany('cuisineType')}
                    error={companyErrors.cuisineType?.message}
                  />

                  <Input
                    label="Hora de apertura"
                    type="time"
                    {...registerCompany('openTime')}
                    error={companyErrors.openTime?.message}
                  />

                  <Input
                    label="Hora de cierre"
                    type="time"
                    {...registerCompany('closeTime')}
                    error={companyErrors.closeTime?.message}
                  />

                  <Input
                    label="Ciudad"
                    placeholder="Ej. Santo Domingo"
                    {...registerCompany('city')}
                    error={companyErrors.city?.message}
                  />

                  <Input
                    label="País"
                    placeholder="República Dominicana"
                    {...registerCompany('country')}
                    error={companyErrors.country?.message}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Dirección"
                      placeholder="Calle 123, Sector, Provincia"
                      {...registerCompany('address')}
                      error={companyErrors.address?.message}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      rows={4}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                      placeholder="Cuenta la historia de tu restaurante, estilo de cocina y servicios especiales."
                      {...registerCompany('description')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Logo o imagen destacada (URL)"
                      placeholder="https://storage.supabase.co/.../logo.png"
                      {...registerCompany('logoUrl')}
                      error={companyErrors.logoUrl?.message}
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Recomendamos usar imágenes cuadradas (512x512) almacenadas en Supabase Storage.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-8">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Estos datos se mostrarán en tu perfil público dentro de FoodAI.</span>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      Volver
                    </Button>
                    <Button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 text-base font-semibold shadow-lg shadow-blue-500/20"
                      loading={companySubmitting}
                      disabled={companySubmitting}
                    >
                      Finalizar configuración
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </MotionForm>
            )}
          </div>
        </MotionCard>
      </MotionContainer>
    </div>
  );
}
