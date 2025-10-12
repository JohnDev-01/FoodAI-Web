import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX2,
  MapPin,
  Sparkles,
  Users,
  Mail,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  getAllReservations,
  subscribeToReservationUpdates,
  unsubscribeFromReservationUpdates,
  updateReservationStatus,
} from '../../services/reservationService';
import type { ReservationAdminView, ReservationStatus } from '../../types';

type ReservationGroupKey = ReservationStatus;

const groupMeta: Record<
  ReservationGroupKey,
  { label: string; description: string; icon: React.ReactNode; accent: string }
> = {
  pending: {
    label: 'Pendientes',
    description: 'Reservas a la espera de aprobación',
    icon: <CalendarClock className="h-5 w-5" />,
    accent: 'from-amber-500/20 via-amber-500/10 to-transparent',
  },
  confirmed: {
    label: 'Confirmadas',
    description: 'Reservas confirmadas por el administrador o restaurante',
    icon: <CalendarCheck className="h-5 w-5" />,
    accent: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
  },
  cancelled: {
    label: 'Canceladas',
    description: 'Reservas canceladas por cliente, restaurante o administrador',
    icon: <CalendarX2 className="h-5 w-5" />,
    accent: 'from-rose-500/20 via-rose-500/10 to-transparent',
  },
  completed: {
    label: 'Completadas',
    description: 'Reservas completadas exitosamente',
    icon: <Calendar className="h-5 w-5" />,
    accent: 'from-indigo-500/20 via-indigo-500/10 to-transparent',
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 12, scale: 0.98 },
};

function buildBadgeClasses(status: ReservationStatus) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200';
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200';
    case 'completed':
    default:
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200';
  }
}

const statusOrder: ReservationGroupKey[] = ['pending', 'confirmed', 'cancelled', 'completed'];

export function AdminReservations() {
  const [reservations, setReservations] = useState<ReservationAdminView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        } else {
          setRefreshing(true);
        }
        const data = await getAllReservations();
        setReservations(data);
      } catch (err) {
        console.error('Error al obtener reservas:', err);
        setError('No pudimos cargar las reservas. Intenta de nuevo.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;
    fetchReservations();

    const channel = subscribeToReservationUpdates(() => {
      if (!isMounted) {
        return;
      }
      fetchReservations(true);
    });

    return () => {
      isMounted = false;
      unsubscribeFromReservationUpdates(channel);
    };
  }, [fetchReservations]);

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

  const handleApproveReservation = useCallback(
    async (reservationId: string) => {
      try {
        const optimistic = reservations.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: 'confirmed' as ReservationStatus }
            : reservation
        );
        setReservations(optimistic);
        const updated = await updateReservationStatus(reservationId, 'confirmed');
        setReservations((current) =>
          current.map((reservation) =>
            reservation.id === reservationId ? updated : reservation
          )
        );
        toast.success('Reserva aprobada correctamente');
      } catch (err) {
        console.error('Error aprobando reserva:', err);
        toast.error('No se pudo aprobar la reserva');
        fetchReservations(true);
      }
    },
    [fetchReservations, reservations]
  );

  const isEmpty = reservations.length === 0;

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
              Gestiona las reservas de toda la plataforma, aprueba solicitudes pendientes y revisa sus detalles.
            </p>
          </div>
        </div>
        {refreshing && (
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Actualizando en tiempo real...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {statusOrder.map((status) => (
          <div
            key={status}
            className="rounded-2xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-700/70 dark:bg-gray-900/70"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                {groupMeta[status].label}
              </div>
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${groupMeta[status].accent}`}
              >
                {groupMeta[status].icon}
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {totalByStatus[status]}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {groupMeta[status].description}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando reservas...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-sm text-rose-600 shadow-sm dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : isEmpty ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white/80 px-6 py-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-200">
            <Calendar className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
            Sin reservas registradas
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            A medida que los clientes creen reservas, aparecerán aquí para su gestión.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {statusOrder.map((status) => {
            const items = groupedReservations[status];
            if (items.length === 0) {
              return null;
            }

            return (
              <section key={status} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {groupMeta[status].label}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {groupMeta[status].description}
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <AnimatePresence>
                    {items.map((reservation) => (
                      <motion.div
                        key={reservation.id}
                        layout
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={itemVariants}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/75"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-transparent to-transparent opacity-60 dark:from-white/5" />
                        <div className="relative space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
                                <Users className="h-4 w-4" />
                                {reservation.userName ?? 'Cliente'}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                {reservation.userEmail && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    <Mail className="h-3.5 w-3.5" />
                                    {reservation.userEmail}
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${buildBadgeClasses(reservation.status)}`}>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  {groupMeta[reservation.status].label}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {reservation.restaurantName ?? 'Restaurante'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  ID {reservation.restaurantId.slice(0, 8)}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 rounded-2xl border border-gray-200/70 bg-gray-50/70 p-4 text-sm dark:border-gray-800/70 dark:bg-gray-900/60">
                            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                              <span>Fecha</span>
                              <span className="font-medium">
                                {formatDate(reservation.reservationDate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                              <span>Hora</span>
                              <span className="font-medium">
                                {formatTime(reservation.reservationTime)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                              <span>Personas</span>
                              <span className="font-medium">{reservation.guestsCount}</span>
                            </div>
                          </div>

                          {reservation.specialRequest && (
                            <div className="rounded-2xl border border-blue-200/70 bg-blue-50/70 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/15 dark:text-blue-200">
                              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400 dark:text-blue-500">
                                Solicitud especial
                              </p>
                              <p className="mt-1">{reservation.specialRequest}</p>
                            </div>
                          )}

                          {reservation.status === 'cancelled' && reservation.reasonCancellation && (
                            <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/15 dark:text-rose-200">
                              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-400 dark:text-rose-500">
                                Motivo de cancelación
                              </p>
                              <p className="mt-1">{reservation.reasonCancellation}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Creada {formatRelativeDate(reservation.createdAt)}
                            </p>
                            {reservation.status === 'pending' && (
                              <Button
                                size="sm"
                                className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:via-teal-500 hover:to-sky-500"
                                onClick={() => handleApproveReservation(reservation.id)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Aprobar
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(isoDate: string) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(time: string) {
  if (!time) {
    return '—';
  }
  const candidate = time.length === 5 ? `${time}:00` : time;
  const parsed = new Date(`1970-01-01T${candidate}`);
  if (Number.isNaN(parsed.getTime())) {
    return time;
  }
  return parsed.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeDate(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  const formatter = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' });
  const diff = parsed.getTime() - Date.now();
  const minutes = Math.round(diff / 60000);

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, 'minute');
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, 'hour');
  }

  const days = Math.round(hours / 24);
  return formatter.format(days, 'day');
}
