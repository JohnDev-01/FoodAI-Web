import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Bell, User, LogOut, Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import { getRestaurantByOwnerId } from '../../services/restaurantService';
import { getPendingReservationsCountByRestaurant, subscribeToReservationUpdates, getReservationsByRestaurantId } from '../../services/reservationService';
import type { ReservationAdminView } from '../../types';
import { ROUTES } from '../../constants';

export function RestaurantHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [pendingReservations, setPendingReservations] = useState<ReservationAdminView[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Cargar conteo de reservas pendientes
  useEffect(() => {
    let mounted = true;

    const loadPendingReservationsCount = async () => {
      if (!user?.id) return;

      try {
        const restaurant = await getRestaurantByOwnerId(user.id);
        if (!restaurant || !mounted) return;

        const count = await getPendingReservationsCountByRestaurant(restaurant.id);
        if (mounted) {
          setPendingCount(count);
        }

        // Suscribirse a cambios en tiempo real
        const channel = subscribeToReservationUpdates(async (payload) => {
          if (!mounted) return;
          
          // Recargar el conteo cuando hay cambios en las reservas
          const updatedCount = await getPendingReservationsCountByRestaurant(restaurant.id);
          if (mounted) {
            setPendingCount(updatedCount);
          }
        });

        return () => {
          mounted = false;
          if (channel) {
            channel.unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error loading pending reservations:', error);
      }
    };

    loadPendingReservationsCount();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Cargar lista de reservas pendientes cuando se abre el dropdown
  useEffect(() => {
    const loadReservationsList = async () => {
      if (!isNotificationOpen || !user?.id) return;

      try {
        setLoadingReservations(true);
        const restaurant = await getRestaurantByOwnerId(user.id);
        if (!restaurant) return;

        const allReservations = await getReservationsByRestaurantId(restaurant.id);
        const pending = allReservations.filter(r => r.status === 'pending').slice(0, 5);
        setPendingReservations(pending);
      } catch (error) {
        console.error('Error loading reservations list:', error);
      } finally {
        setLoadingReservations(false);
      }
    };

    loadReservationsList();
  }, [isNotificationOpen, user?.id]);

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleViewAllReservations = () => {
    setIsNotificationOpen(false);
    navigate(ROUTES.RESTAURANT_RESERVATIONS);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Panel de Restaurante
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona tu restaurante de manera inteligente
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={handleNotificationClick}
              >
                <Bell className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Button>

              {/* Dropdown de notificaciones */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Reservas Pendientes
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {pendingCount} {pendingCount === 1 ? 'reserva' : 'reservas'} esperando confirmación
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loadingReservations ? (
                      <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : pendingReservations.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No hay reservas pendientes
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {pendingReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                            onClick={handleViewAllReservations}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {reservation.userName || 'Cliente'}
                                </p>
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {formatDate(reservation.reservationDate)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {formatTime(reservation.reservationTime)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Users className="h-4 w-4 mr-2" />
                                    {reservation.guestsCount} {reservation.guestsCount === 1 ? 'persona' : 'personas'}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {pendingReservations.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleViewAllReservations}
                        className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 py-2"
                      >
                        Ver todas las reservas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Restaurante
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}



