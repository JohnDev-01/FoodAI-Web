import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  Save,
  Upload,
  MapPin,
  Clock,
  Phone,
  Mail,
  ChefHat,
  Globe,
  Star,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import type { Restaurant, UpdateRestaurantInput } from '../../types';
import { getRestaurantByOwnerId, updateRestaurant, isRestaurantOpen } from '../../services/restaurantService';

interface RestaurantFormData {
  name: string;
  email: string;
  phone: string;
  description: string;
  address: string;
  city: string;
  country: string;
  cuisineType: string;
  openTime: string;
  closeTime: string;
  logoUrl: string;
}

export function RestaurantManagement() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RestaurantFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      description: '',
      address: '',
      city: '',
      country: '',
      cuisineType: '',
      openTime: '',
      closeTime: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!user?.id) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurantByOwnerId(user.id);
        
        if (data) {
          setRestaurant(data);
          reset({
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            description: data.description || '',
            address: data.address || '',
            city: data.city || '',
            country: data.country || '',
            cuisineType: data.cuisineType || '',
            openTime: data.openTime || '',
            closeTime: data.closeTime || '',
            logoUrl: data.logoUrl || '',
          });
        } else {
          setError('No se encontró un restaurante asociado a tu cuenta');
        }
      } catch (err) {
        console.error('Error al cargar el restaurante:', err);
        setError('No se pudo cargar la información del restaurante');
        toast.error('Error al cargar el restaurante');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [user?.id, reset]);

  const onSubmit = async (data: RestaurantFormData) => {
    if (!restaurant) {
      toast.error('No hay restaurante para actualizar');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: UpdateRestaurantInput = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        description: data.description || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        cuisineType: data.cuisineType || null,
        openTime: data.openTime || null,
        closeTime: data.closeTime || null,
        logoUrl: data.logoUrl || null,
      };

      const updatedRestaurant = await updateRestaurant(restaurant.id, updateData);
      setRestaurant(updatedRestaurant);
      toast.success('Restaurante actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar el restaurante:', err);
      toast.error('No se pudo actualizar el restaurante');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm opacity-80">Cargando información del restaurante...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-4">Restaurante no encontrado</h1>
          <p className="text-blue-100/80 mb-6">{error}</p>
          <p className="text-sm text-blue-200/60">
            Si acabas de registrarte, asegúrate de completar el proceso de onboarding.
          </p>
        </div>
      </div>
    );
  }

  const isOpen = isRestaurantOpen(restaurant);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{restaurant.name}</h1>
              <div className="flex items-center gap-4 text-blue-100/80">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  restaurant.status === 'active' 
                    ? 'bg-green-500/20 text-green-200' 
                    : restaurant.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-200'
                    : 'bg-red-500/20 text-red-200'
                }`}>
                  {restaurant.status === 'active' ? 'Activo' : 
                   restaurant.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isOpen ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                }`}>
                  <Clock className="h-3 w-3" />
                  {isOpen ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Información del restaurante
                </CardTitle>
                <CardDescription>
                  Actualiza la información de tu restaurante. Los cambios se reflejarán inmediatamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Información básica</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Nombre del restaurante"
                        {...register('name', { required: 'El nombre es requerido' })}
                        error={errors.name?.message}
                      />
                      <Input
                        label="Email de contacto"
                        type="email"
                        {...register('email', { 
                          required: 'El email es requerido',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Email inválido'
                          }
                        })}
                        error={errors.email?.message}
                      />
                    </div>

                    <Input
                      label="Teléfono"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Describe tu restaurante, especialidades, ambiente..."
                        {...register('description')}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Ubicación
                    </h3>
                    
                    <Input
                      label="Dirección"
                      {...register('address')}
                      error={errors.address?.message}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Ciudad"
                        {...register('city')}
                        error={errors.city?.message}
                      />
                      <Input
                        label="País"
                        {...register('country')}
                        error={errors.country?.message}
                      />
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      Detalles del negocio
                    </h3>
                    
                    <Input
                      label="Tipo de cocina"
                      placeholder="Ej: Italiana, Mexicana, Asiática..."
                      {...register('cuisineType')}
                      error={errors.cuisineType?.message}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Hora de apertura"
                        type="time"
                        {...register('openTime')}
                        error={errors.openTime?.message}
                      />
                      <Input
                        label="Hora de cierre"
                        type="time"
                        {...register('closeTime')}
                        error={errors.closeTime?.message}
                      />
                    </div>
                  </div>

                  {/* Logo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Imagen
                    </h3>
                    
                    <Input
                      label="URL del logo/imagen"
                      placeholder="https://ejemplo.com/logo.jpg"
                      {...register('logoUrl')}
                      error={errors.logoUrl?.message}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving || !isDirty}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Estado actual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : restaurant.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.status === 'active' ? 'Activo' : 
                     restaurant.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Horario:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
                {restaurant.rating && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Calificación:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Información rápida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <div>ID: {restaurant.id}</div>
                <div>Registrado: {new Date(restaurant.createdAt).toLocaleDateString('es-ES')}</div>
                <div>Última actualización: {new Date(restaurant.updatedAt).toLocaleDateString('es-ES')}</div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>{restaurant.email}</span>
                </div>
                {restaurant.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
