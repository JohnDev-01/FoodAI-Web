import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { ReservationAnalytics } from '../../components/analytics/ReservationAnalytics';
import { useAuth } from '../../context/AuthContext';
import { getRestaurantByOwnerId } from '../../services/restaurantService';
import { BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';
import type { Restaurant } from '../../types';

export function RestaurantAnalytics() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const data = await getRestaurantByOwnerId(user.id);
        setRestaurant(data);
      } catch (error) {
        console.error('Error cargando restaurante:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No se encontró el restaurante
        </h3>
        <p className="text-gray-500">
          No se pudo cargar la información del restaurante para mostrar las estadísticas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics de Reservas
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Estadísticas y tendencias de las reservas de {restaurant.name}
        </p>
      </div>

      {/* Información del restaurante */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Información del Restaurante</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {restaurant.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                restaurant.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {restaurant.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ciudad</p>
              <p className="text-lg text-gray-900 dark:text-white">
                {restaurant.city}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo de Cocina</p>
              <p className="text-lg text-gray-900 dark:text-white">
                {restaurant.cuisineType}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics de reservas */}
      <ReservationAnalytics restaurantId={restaurant.id} />

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Insights</span>
          </CardTitle>
          <CardDescription>
            Información útil sobre el rendimiento de las reservas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Consejos para Mejorar</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Confirma las reservas pendientes rápidamente</span>
                </li>
                <li className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Analiza los días de mayor demanda</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Users className="h-4 w-4 mt-0.5 text-purple-500" />
                  <span>Mantén un registro de las cancelaciones</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Métricas Clave</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Tasa de confirmación de reservas</li>
                <li>• Tiempo promedio de respuesta</li>
                <li>• Días de mayor actividad</li>
                <li>• Patrones de cancelación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
