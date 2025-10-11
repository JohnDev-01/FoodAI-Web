import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Loader2, CalendarDays, Clock, Users, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../constants';
import type { ReservationStatus, ReservationWithRestaurant, Restaurant } from '../../types';
import { createReservation, getReservationsByUserId, cancelReservation } from '../../services/reservationService';
import { listActiveRestaurants } from '../../services/restaurantService';

type ReservationFormValues = {
  restaurantId: string;
  reservationDate: string;
  reservationTime: string;
  guestsCount: number;
  specialRequest?: string;
};

const reservationStatusLabels: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const reservationStatusStyles: Record<ReservationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
};

const todayIso = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0] ?? '';
};

export function Reservations() {
  const { user, initialising } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reservations, setReservations] = useState<ReservationWithRestaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(false);
  const [loadingReservations, setLoadingReservations] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    defaultValues: {
      restaurantId: '',
      reservationDate: todayIso(),
      reservationTime: '',
      guestsCount: 2,
      specialRequest: '',
    },
  });

  const selectedRestaurantId = watch('restaurantId');

  useEffect(() => {
    let mounted = true;

    const loadRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const data = await listActiveRestaurants();
        if (mounted) {
          setRestaurants(data);
        }
      } catch (error) {
        console.error('Error al cargar restaurantes:', error);
        toast.error('No pudimos cargar los restaurantes disponibles.');
      } finally {
        if (mounted) {
          setLoadingRestaurants(false);
        }
      }
    };

    loadRestaurants();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadReservations = async () => {
      if (!user?.id) {
        return;
      }

      try {
        setLoadingReservations(true);
        const data = await getReservationsByUserId(user.id);
        if (mounted) {
          setReservations(data);
        }
      } catch (error) {
        console.error('Error al cargar las reservas del usuario:', error);
        toast.error('No pudimos cargar tu historial de reservas.');
      } finally {
        if (mounted) {
          setLoadingReservations(false);
        }
      }
    };

    loadReservations();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const upcomingReservations = useMemo(() => {
    const now = new Date();
    return reservations
      .filter((reservation) => reservation.status !== 'cancelled')
      .filter((reservation) => {
        const time = reservation.reservationTime;
        const date = reservation.reservationDate;
        if (!date) {
          return true;
        }

        const normalizedTime = time?.length === 5 ? `${time}:00` : time ?? '';
        const iso = normalizedTime ? `${date}T${normalizedTime}` : date;
        const parsed = new Date(iso);
        if (Number.isNaN(parsed.getTime())) {
          return true;
        }
        return parsed >= now;
      })
      .slice(0, 3);
  }, [reservations]);

  const handleCreateReservation = async (values: ReservationFormValues) => {
    if (!user?.id) {
      toast.error('Inicia sesión para crear una reserva.');
      return;
    }

    try {
      setFormSubmitting(true);
      const created = await createReservation(user.id, {
        restaurantId: values.restaurantId,
        reservationDate: values.reservationDate,
        reservationTime: values.reservationTime,
        guestsCount: Number(values.guestsCount),
        specialRequest: values.specialRequest?.trim() || undefined,
      });
      setReservations((prev) => [created, ...prev]);
      toast.success('Reserva creada con éxito');
      reset({
        restaurantId: values.restaurantId,
        reservationDate: values.reservationDate,
        reservationTime: '',
        guestsCount: values.guestsCount,
        specialRequest: '',
      });
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      toast.error('No pudimos completar tu reserva.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const updated = await cancelReservation(reservationId);
      setReservations((prev) =>
        prev.map((reservation) => (reservation.id === reservationId ? updated : reservation))
      );
      toast.success('Reserva cancelada');
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      toast.error('No se pudo cancelar la reserva.');
    }
  };

  const formatReservationSchedule = (reservationDate: string, reservationTime: string) => {
    if (!reservationDate) {
      return { dateLabel: 'Sin fecha', timeLabel: reservationTime ?? '' };
    }

    const normalizedTime =
      reservationTime?.length === 5 ? `${reservationTime}:00` : reservationTime ?? '';
    const candidate = normalizedTime ? `${reservationDate}T${normalizedTime}` : reservationDate;
    const parsed = new Date(candidate);

    if (!Number.isNaN(parsed.getTime())) {
      return {
        dateLabel: parsed.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        timeLabel: normalizedTime
          ? parsed.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
      };
    }

    return { dateLabel: reservationDate, timeLabel: reservationTime ?? '' };
  };

  if (initialising) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm opacity-80">Comprobando tu sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <header className="text-white">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-2xl shadow-blue-500/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/80">
                  <Sparkles className="h-4 w-4" />
                  FoodAI Experiences
                </p>
                <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Gestiona tus reservas inteligentes
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-blue-100/80 md:text-base">
                  Agenda nuevas experiencias gastronómicas, gestiona tus visitas confirmadas y revisa tu historial sin salir de FoodAI.
                </p>
              </div>
              <Link to={ROUTES.RESTAURANTS}>
                <Button
                  size="sm"
                  className="rounded-full border border-white/20 bg-white/10 px-6 text-sm font-medium text-blue-100 transition hover:bg-white/20"
                >
                  Explorar restaurantes
                </Button>
              </Link>
            </div>

            {upcomingReservations.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {upcomingReservations.map((reservation) => {
                  const schedule = formatReservationSchedule(
                    reservation.reservationDate,
                    reservation.reservationTime
                  );
                  return (
                    <div
                      key={reservation.id}
                      className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur-xl"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-blue-100/70">Próxima visita</p>
                      <p className="mt-2 text-lg font-semibold">
                        {reservation.restaurantName ?? 'Restaurante'}
                      </p>
                      <p className="text-sm text-blue-100/70">
                        {schedule.dateLabel} {schedule.timeLabel ? `• ${schedule.timeLabel}` : ''}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-blue-100/60">
                        <Users className="h-4 w-4" />
                        {reservation.guestsCount} personas
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        <main className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1.2fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-900/70">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Nueva reserva
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Selecciona el restaurante, fecha y hora. Te enviaremos confirmación y actualizaciones desde este panel.
              </p>

              <form
                className="mt-6 space-y-5"
                onSubmit={handleSubmit(handleCreateReservation)}
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Restaurante
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                      {...register('restaurantId', {
                        required: 'Selecciona un restaurante',
                      })}
                      disabled={loadingRestaurants}
                    >
                      <option value="">
                        {loadingRestaurants ? 'Cargando restaurantes...' : 'Selecciona un restaurante'}
                      </option>
                      {restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                      ▼
                    </span>
                  </div>
                  {errors.restaurantId && (
                    <p className="mt-1 text-xs text-rose-500">{errors.restaurantId.message}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Fecha"
                    type="date"
                    min={todayIso()}
                    {...register('reservationDate', { required: 'Selecciona una fecha' })}
                    error={errors.reservationDate?.message}
                  />
                  <Input
                    label="Hora"
                    type="time"
                    {...register('reservationTime', { required: 'Selecciona una hora' })}
                    error={errors.reservationTime?.message}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Personas"
                    type="number"
                    min={1}
                    max={12}
                    {...register('guestsCount', {
                      required: 'Indica la cantidad de personas',
                      valueAsNumber: true,
                      min: { value: 1, message: 'Debe ser al menos 1 persona' },
                      max: { value: 12, message: 'Máximo 12 personas por reserva' },
                    })}
                    error={errors.guestsCount?.message}
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Solicitud especial (opcional)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                      placeholder="¿Celebración especial o preferencia de mesa?"
                      {...register('specialRequest')}
                    />
                  </div>
                </div>

                {selectedRestaurantId && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-600 dark:border-blue-700/60 dark:bg-blue-900/20 dark:text-blue-200">
                    Recibirás un correo cuando el restaurante confirme la reserva. Puedes revisar el estado en esta misma página.
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40"
                  loading={formSubmitting}
                  disabled={formSubmitting}
                >
                  Crear reserva
                </Button>
              </form>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Historial de reservas</h2>
              <div className="flex items-center gap-2 text-xs text-blue-100/70">
                <CalendarDays className="h-4 w-4" />
                Se actualiza automáticamente
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl text-white">
              {loadingReservations ? (
                <div className="flex items-center justify-center gap-3 py-10 text-sm text-blue-100/70">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Cargando reservas...
                </div>
              ) : reservations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-blue-200/40 bg-white/5 px-6 py-10 text-center text-sm text-blue-100/70">
                  Aún no registras reservas. Completa el formulario para agendar tu primera experiencia.
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => {
                    const { dateLabel, timeLabel } = formatReservationSchedule(
                      reservation.reservationDate,
                      reservation.reservationTime
                    );
                    const statusLabel = reservationStatusLabels[reservation.status];
                    const statusClass =
                      reservationStatusStyles[reservation.status] ??
                      'bg-white/10 text-white/80';

                    return (
                      <div
                        key={reservation.id}
                        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-lg font-semibold text-white">
                            {reservation.restaurantName ?? 'Restaurante'}
                          </p>
                          <p className="flex items-center gap-2 text-sm text-blue-100/80">
                            <Clock className="h-4 w-4" />
                            {dateLabel}
                            {timeLabel ? ` • ${timeLabel}` : ''}
                          </p>
                          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blue-200/60">
                            <Users className="h-4 w-4" />
                            {reservation.guestsCount} personas
                          </p>
                          {reservation.specialRequest && (
                            <p className="mt-2 rounded-xl bg-white/10 px-4 py-2 text-xs text-blue-100/70">
                              “{reservation.specialRequest}”
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-start gap-3 sm:items-end">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                          >
                            {reservation.status === 'confirmed' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : reservation.status === 'cancelled' ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            {statusLabel}
                          </span>
                          {reservation.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-white/30 text-white hover:bg-white/10"
                              onClick={() => handleCancelReservation(reservation.id)}
                            >
                              Cancelar reserva
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
