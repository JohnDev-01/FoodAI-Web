import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX2,
  Loader2,
  Mail,
  Sparkles,
  Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getRestaurantByOwnerId } from '../../services/restaurantService';
import {
  getReservationsByRestaurantId,
  subscribeToReservationUpdates,
  unsubscribeFromReservationUpdates,
  updateReservationStatus,
} from '../../services/reservationService';
import type { ReservationAdminView, ReservationStatus, Restaurant } from '../../types';

type ReservationGroupKey = ReservationStatus;

const statusOrder: ReservationGroupKey[] = ['pending', 'confirmed', 'cancelled', 'completed'];

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const statusDescriptions: Record<ReservationStatus, string> = {
  pending: 'Reservas a la espera de tu confirmación',
  confirmed: 'Reservas confirmadas por tu restaurante',
  cancelled: 'Reservas canceladas por el cliente o el restaurante',
  completed: 'Reservas que ya fueron atendidas',
};

const statusBadgeClasses: Record<ReservationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200',
  completed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
};

const statusIcon: Record<ReservationStatus, React.ReactNode> = {
  pending: <CalendarClock className="h-5 w-5" />,
  confirmed: <CalendarCheck className="h-5 w-5" />,
  cancelled: <CalendarX2 className="h-5 w-5" />,
  completed: <Calendar className="h-5 w-5" />,
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(value: string) {
  return value?.slice(0, 5) ?? value;
}

export function RestaurantReservations() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurantLoading, setRestaurantLoading] = useState<boolean>(true);
  const [reservations, setReservations] = useState<ReservationAdminView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchRestaurant = async () => {
      if (!user?.id) {
        if (!ignore) {
          setRestaurant(null);
          setRestaurantLoading(false);
        }
        return;
      }

      setRestaurantLoading(true);
      try {
        const data = await getRestaurantByOwnerId(user.id);
        if (!ignore) {
          setRestaurant(data);
        }
      } catch (err) {
        console.error('Error cargando restaurante:', err);
        if (!ignore) {
          setRestaurant(null);
          setError('No pudimos cargar los datos del restaurante.');
        }
      } finally {
        if (!ignore) {
          setRestaurantLoading(false);
        }
      }
    };

    fetchRestaurant();

    return () => {
      ignore = true;
    };
  }, [user?.id]);

  const fetchReservations = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!restaurant?.id) {
        setReservations([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!silent) {
        setLoading(true);
        setError(null);
      } else {
        setRefreshing(true);
      }

      try {
        const data = await getReservationsByRestaurantId(restaurant.id);
        setReservations(data);
      } catch (err) {
        console.error('Error al obtener reservas del restaurante:', err);
        if (!silent) {
          setError('No pudimos cargar las reservas. Intenta de nuevo.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [restaurant?.id]
  );

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    if (!restaurant?.id) {
      return;
    }

    const channel = subscribeToReservationUpdates((payload) => {
      const newRestaurantId = (payload.new as { restaurant_id?: string } | null)?.restaurant_id;
      const oldRestaurantId = (payload.old as { restaurant_id?: string } | null)?.restaurant_id;
      if (newRestaurantId === restaurant.id || oldRestaurantId === restaurant.id) {
        fetchReservations({ silent: true });
      }
    });

    return () => {
      unsubscribeFromReservationUpdates(channel);
    };
  }, [restaurant?.id, fetchReservations]);

  const groupedReservations = useMemo(() => {
    const groups: Record<ReservationGroupKey, ReservationAdminView[]> = {
      pending: [],
      confirmed: [],
      cancelled: [],
      completed: [],
    };

    for (const reservation of reservations) {
      groups[reservation.status].push(reservation);
    }

    return groups;
  }, [reservations]);

  const totalByStatus = useMemo(
    () =>
      statusOrder.reduce<Record<ReservationStatus, number>>((acc, status) => {
        acc[status] = groupedReservations[status].length;
        return acc;
      }, {} as Record<ReservationStatus, number>),
    [groupedReservations]
  );

  const handleStatusChange = useCallback(
    async (reservationId: string, status: ReservationStatus) => {
      try {
        setReservations((current) =>
          current.map((reservation) =>
            reservation.id === reservationId ? { ...reservation, status } : reservation
          )
        );
        await updateReservationStatus(reservationId, status);
        fetchReservations({ silent: true });

        const successMessage =
          status === 'confirmed'
            ? 'Reserva confirmada correctamente.'
            : status === 'completed'
              ? 'Reserva marcada como completada.'
              : status === 'cancelled'
                ? 'Reserva cancelada correctamente.'
                : 'Reserva actualizada.';

        toast.success(successMessage);
      } catch (err) {
        console.error('Error actualizando el estado de la reserva:', err);
        toast.error('No pudimos actualizar el estado de la reserva.');
        fetchReservations({ silent: true });
      }
    },
    [fetchReservations]
  );

  const isEmpty = !loading && reservations.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/40">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reservas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona las reservas que llegan a tu restaurante en tiempo real.
            </p>
          </div>
        </div>
        {refreshing && (
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Actualizando reservas...
          </div>
        )}
      </div>

      {restaurantLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !restaurant ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Aún no tienes un restaurante configurado</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Completa el proceso de onboarding para comenzar a recibir reservas.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statusOrder.map((status) => (
              <div
                key={status}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {statusDescriptions[status]}
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
                      {totalByStatus[status]}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 text-blue-600 dark:text-indigo-300">
                    {statusIcon[status]}
                  </div>
                </div>
                <div className="mt-6 h-24 w-full rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/20 blur-2xl" />
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-56 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-200">
                <Calendar className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                Aún no tienes reservas
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Las reservas aparecerán aquí en cuanto tus clientes comiencen a solicitarlas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {reservation.userName ?? 'Cliente sin nombre'}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[reservation.status]}`}
                        >
                          {statusLabels[reservation.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(reservation.reservationDate)} · {formatTime(reservation.reservationTime)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {reservation.guestsCount} {reservation.guestsCount === 1 ? 'persona' : 'personas'}
                        </span>
                        {reservation.userEmail && (
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {reservation.userEmail}
                          </span>
                        )}
                      </div>

                      {reservation.specialRequest && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nota del cliente: {reservation.specialRequest}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                      {reservation.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                          >
                            Confirmar reserva
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {reservation.status === 'confirmed' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusChange(reservation.id, 'completed')}
                          >
                            Marcar como completada
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {reservation.status === 'cancelled' && reservation.reasonCancellation && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Motivo: {reservation.reasonCancellation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
