import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import { getRestaurantByOwnerId } from '../../services/restaurantService';
import { getRestaurantReservations } from '../../services/reservationService';
import type { Restaurant, ReservationWithRestaurant } from '../../types';

export function RestaurantDashboard() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationWithRestaurant[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      try {
        const data = await getRestaurantByOwnerId(user.id);
        setRestaurant(data);
      } catch (error) {
        console.error('Error cargando restaurante', error);
        toast.error('No pudimos cargar la información del restaurante.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchRestaurant();
  }, [user?.id]);

  // Cargar reservas del restaurante
  useEffect(() => {
    const fetchReservations = async () => {
      if (!restaurant?.id) return;
      
      setReservationsLoading(true);
      try {
        const data = await getRestaurantReservations(restaurant.id);
        setReservations(data);
      } catch (error) {
        console.error('Error cargando reservas:', error);
        toast.error('No pudimos cargar las reservas.');
      } finally {
        setReservationsLoading(false);
      }
    };

    fetchReservations();
  }, [restaurant?.id]);

  // Calcular estadísticas de reservas
  const reservationStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length,
      completed: reservations.filter(r => {
        const resDate = new Date(r.reservationDate);
        return resDate < today && (r.status === 'confirmed' || r.status === 'completed');
      }).length,
    };
  }, [reservations]);

  // Filtrar reservas próximas (futuras y no canceladas)
  const upcomingReservations = useMemo(() => {
    const now = new Date();
    return reservations
      .filter(r => {
        const resDate = new Date(r.reservationDate);
        return resDate >= now && r.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime())
      .slice(0, 5);
  }, [reservations]);

  // Filtrar reservas realizadas (pasadas y completadas)
  const completedReservations = useMemo(() => {
    const now = new Date();
    return reservations
      .filter(r => {
        const resDate = new Date(r.reservationDate);
        return resDate < now && (r.status === 'confirmed' || r.status === 'completed');
      })
      .sort((a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime())
      .slice(0, 5);
  }, [reservations]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center md:text-left space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard del Restaurante</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:mx-0">
          Bienvenido de vuelta. Aquí tienes un resumen de las reservas de tu restaurante.
        </p>
      </div>

      {/* Estadísticas de Reservas */}
      {reservationsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Reservas a la espera de tu confirmación
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reservationStats.pending}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Reservas confirmadas por tu restaurante
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reservationStats.confirmed}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Reservas canceladas por el cliente o el restaurante
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reservationStats.cancelled}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Reservas que ya fueron atendidas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reservationStats.completed}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Próximas Reservas y Reservas Realizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Reservas */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Próximas Reservas</CardTitle>
            <CardDescription>Reservas programadas para el futuro</CardDescription>
          </CardHeader>
          <CardContent>
            {reservationsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : upcomingReservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay reservas próximas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {reservation.user?.firstName && reservation.user?.lastName
                          ? `${reservation.user.firstName} ${reservation.user.lastName}`
                          : reservation.user?.email || 'Cliente'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {reservation.guestsCount} personas • {reservation.reservationTime}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(reservation.reservationDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        reservation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : reservation.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {reservation.status === 'pending' ? 'Pendiente' : 
                         reservation.status === 'confirmed' ? 'Confirmada' : 
                         reservation.status}
                      </span>
                    </div>
                    <Link to={ROUTES.RESTAURANT_RESERVATIONS}>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Ver
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reservas Realizadas */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Reservas Realizadas</CardTitle>
            <CardDescription>Reservas que ya fueron atendidas</CardDescription>
          </CardHeader>
          <CardContent>
            {reservationsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : completedReservations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay reservas realizadas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {reservation.user?.firstName && reservation.user?.lastName
                          ? `${reservation.user.firstName} ${reservation.user.lastName}`
                          : reservation.user?.email || 'Cliente'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {reservation.guestsCount} personas • {reservation.reservationTime}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(reservation.reservationDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Completada
                      </span>
                    </div>
                    <Link to={ROUTES.RESTAURANT_RESERVATIONS}>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Ver
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}