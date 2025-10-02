import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { ROUTES, USER_TYPES } from '../../constants';
import type { LoginForm } from '../../types';

export function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'client' | 'restaurant' | 'admin'>('client');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login(data.email, data.password, userType);
      if (result.success) {
        // Redirigir según el tipo de usuario
        if (userType === 'admin') {
          navigate(ROUTES.ADMIN_DASHBOARD);
        } else if (userType === 'restaurant') {
          navigate(ROUTES.RESTAURANT_DASHBOARD);
        } else {
          navigate(ROUTES.HOME);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            O{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              regístrate aquí
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Accede a tu cuenta</CardTitle>
            <CardDescription>
              Selecciona tu tipo de usuario e ingresa tus credenciales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Usuario
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(USER_TYPES).map(([key, value]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={userType === value ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setUserType(value as any)}
                      className="text-xs"
                    >
                      {value === 'client' ? 'Cliente' : 
                       value === 'restaurant' ? 'Restaurante' : 'Admin'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
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
              </div>

              {/* Password */}
              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Tu contraseña"
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres',
                    },
                  })}
                  error={errors.password?.message}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Iniciar Sesión
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                    ¿No tienes cuenta?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link to={ROUTES.REGISTER}>
                  <Button variant="outline" className="w-full">
                    Crear Nueva Cuenta
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



