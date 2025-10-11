import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../constants';
import { uploadProfileImage } from '../../services/storageService';

type PersonalFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
  profileImageFile?: FileList;
};

const MotionContainer = motion.div as any;
const MotionCard = motion.div as any;
const MotionHeader = motion.div as any;
const MotionForm = motion.form as any;

export function ClientOnboarding() {
  const { sessionUser, user, loading, initialising, completeClientProfile } = useAuth();
  const navigate = useNavigate();

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

  const [previewImage, setPreviewImage] = useState<string | null>(inferredProfileImage ?? null);
  const [fileInputKey, setFileInputKey] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    resetField,
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
  const watchedProfileImageFile = watch('profileImageFile');

  useEffect(() => {
    setPreviewImage(inferredProfileImage ?? null);
  }, [inferredProfileImage]);

  useEffect(() => {
    if (!watchedProfileImageFile || watchedProfileImageFile.length === 0) {
      return;
    }

    const file = watchedProfileImageFile[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [watchedProfileImageFile]);

  useEffect(() => {
    if (sessionUser) {
      reset({
        email: sessionUser.email ?? '',
        firstName: inferredFirstName,
        lastName: inferredLastName,
        profileImage: inferredProfileImage,
      });
      setPreviewImage(inferredProfileImage ?? null);
      setFileInputKey((prev) => prev + 1);
    }
  }, [reset, sessionUser, inferredFirstName, inferredLastName, inferredProfileImage]);

  useEffect(() => {
    if (!initialising && !loading && !sessionUser) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [initialising, loading, navigate, sessionUser]);

  useEffect(() => {
    if (user?.role === 'restaurant') {
      navigate(ROUTES.RESTAURANT_ONBOARDING, { replace: true });
      return;
    }

    if (user?.role === 'client' && user.status === 'active') {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [navigate, user?.role, user?.status]);

  const handleRemoveImage = () => {
    resetField('profileImageFile');
    setValue('profileImage', null, { shouldDirty: true });
    setPreviewImage(null);
    setFileInputKey((prev) => prev + 1);
  };

  const handlePersonalSubmit = async (values: PersonalFormValues) => {
    if (!sessionUser?.id) {
      toast.error('No pudimos validar tu sesión. Vuelve a iniciar sesión.');
      return;
    }

    let profileImageUrl = values.profileImage ?? null;
    const fileList = values.profileImageFile;
    const file = fileList && fileList.length > 0 ? fileList[0] : undefined;

    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Selecciona un archivo de imagen válido.');
        resetField('profileImageFile');
        setFileInputKey((prev) => prev + 1);
        return;
      }

      try {
        profileImageUrl = await uploadProfileImage(file, sessionUser.id);
      } catch (error) {
        console.error('Error subiendo la imagen de perfil', error);
        toast.error('No pudimos subir la imagen. Intenta nuevamente.');
        resetField('profileImageFile');
        setFileInputKey((prev) => prev + 1);
        return;
      }
    }

    const result = await completeClientProfile({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      profileImage: profileImageUrl,
    });

    if (result.success) {
      setValue('profileImage', profileImageUrl, { shouldDirty: false });
      resetField('profileImageFile');
      setFileInputKey((prev) => prev + 1);
      setPreviewImage(profileImageUrl ?? null);
      toast.success('Perfil personal actualizado. ¡Bienvenido a FoodAI!');
      navigate(ROUTES.HOME, { replace: true });
    }
  };

  if (initialising || loading) {
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
        className="relative max-w-3xl w-full"
      >
        <MotionCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="rounded-3xl bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-200/20 via-transparent to-purple-200/20 dark:from-blue-500/10 dark:to-purple-500/10" />

          <div className="relative px-8 py-10 md:px-12 md:py-12">
            <MotionHeader
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Completa tu perfil personal
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Estos datos nos ayudan a personalizar tus recomendaciones y reservas.
                </p>
              </div>
            </MotionHeader>

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
                placeholder="Tu nombre"
                {...register('firstName', {
                  required: 'Tu nombre es requerido',
                  minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                })}
                error={errors.firstName?.message}
              />

              <Input
                label="Apellido"
                placeholder="Tu apellido"
                {...register('lastName', {
                  required: 'Tu apellido es requerido',
                  minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                })}
                error={errors.lastName?.message}
              />

              <input type="hidden" {...register('profileImage')} />

              <div className="md:col-span-2">
                <Input
                  key={fileInputKey}
                  label="Imagen de perfil (opcional)"
                  type="file"
                  accept="image/*"
                  {...register('profileImageFile')}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  La imagen se utilizará para tus reservas y mensajes dentro de FoodAI.
                </p>
                {previewImage && (
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      <img
                        src={previewImage}
                        alt="Vista previa de la imagen de perfil"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Vista previa actual
                      </span>
                      <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage}>
                        Quitar imagen
                      </Button>
                    </div>
                  </div>
                )}
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
          </div>
        </MotionCard>
      </MotionContainer>
    </div>
  );
}

