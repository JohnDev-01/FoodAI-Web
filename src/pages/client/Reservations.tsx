import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';
import {
  Loader2,
  CalendarDays,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  XCircle,
  Search,
  MapPin,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../constants';
import type { ReservationStatus, ReservationWithRestaurant, Restaurant, Dish, SelectedDish } from '../../types';
import { createReservation, getReservationsByUserId, cancelReservation } from '../../services/reservationService';
import { searchRestaurants } from '../../services/restaurantService';
import { getDishesByRestaurant } from '../../services/dishService';

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
  const location = useLocation();
  const [reservations, setReservations] = useState<ReservationWithRestaurant[]>([]);
  const [loadingReservations, setLoadingReservations] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [restaurantPickerOpen, setRestaurantPickerOpen] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<Record<string, number>>({});
  const [loadingDishes, setLoadingDishes] = useState<boolean>(false);

  // Obtener datos del restaurante desde la navegación
  const restaurantFromNavigation = location.state?.restaurant as Restaurant | undefined;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
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
  const {
    ref: restaurantIdRef,
    ...restaurantIdField
  } = register('restaurantId', {
    required: 'Selecciona un restaurante',
  });

  const handleRestaurantSelect = useCallback(
    (restaurant: Restaurant) => {
      setSelectedRestaurant(restaurant);
      setValue('restaurantId', restaurant.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      clearErrors('restaurantId');
      setRestaurantPickerOpen(false);
    },
    [clearErrors, setValue]
  );

  // Configurar restaurante cuando viene de la navegación
  useEffect(() => {
    if (restaurantFromNavigation) {
      setSelectedRestaurant(restaurantFromNavigation);
      setValue('restaurantId', restaurantFromNavigation.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      clearErrors('restaurantId');
    }
  }, [restaurantFromNavigation, setValue, clearErrors]);

  // Cargar platos cuando se selecciona un restaurante
  useEffect(() => {
    const loadDishes = async () => {
      if (!selectedRestaurant?.id) {
        setDishes([]);
        setSelectedDishes({});
        return;
      }

      try {
        setLoadingDishes(true);
        const restaurantDishes = await getDishesByRestaurant(selectedRestaurant.id);
        setDishes(restaurantDishes);
      } catch (error) {
        console.error('Error al cargar los platos:', error);
        toast.error('No se pudieron cargar los platos del restaurante');
      } finally {
        setLoadingDishes(false);
      }
    };

    loadDishes();
  }, [selectedRestaurant?.id]);

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

  const updateDishQuantity = (dishId: string, quantity: number) => {
    setSelectedDishes((prev) => {
      if (quantity <= 0) {
        const { [dishId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [dishId]: quantity,
      };
    });
  };

  const increaseDishQuantity = (dishId: string) => {
    setSelectedDishes((prev) => {
      const currentQuantity = prev[dishId] || 0;
      return {
        ...prev,
        [dishId]: currentQuantity + 1,
      };
    });
  };

  const decreaseDishQuantity = (dishId: string) => {
    setSelectedDishes((prev) => {
      const currentQuantity = prev[dishId] || 0;
      if (currentQuantity <= 1) {
        const { [dishId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [dishId]: currentQuantity - 1,
      };
    });
  };

  const handleCreateReservation = async (values: ReservationFormValues) => {
    if (!user?.id) {
      toast.error('Inicia sesión para crear una reserva.');
      return;
    }

    try {
      setFormSubmitting(true);
      
      // Convertir el objeto de platos seleccionados a array
      const dishesArray: SelectedDish[] = Object.entries(selectedDishes).map(([dishId, quantity]) => ({
        dishId,
        quantity,
      }));

      const created = await createReservation(user.id, {
        restaurantId: values.restaurantId,
        reservationDate: values.reservationDate,
        reservationTime: values.reservationTime,
        guestsCount: Number(values.guestsCount),
        specialRequest: values.specialRequest?.trim() || undefined,
        selectedDishes: dishesArray.length > 0 ? dishesArray : undefined,
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
      setSelectedDishes({});
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
                  <input type="hidden" ref={restaurantIdRef} {...restaurantIdField} />
                  <button
                    type="button"
                    onClick={() => setRestaurantPickerOpen(true)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-left text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-100 dark:hover:border-blue-400 dark:focus:ring-blue-500/20"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      {selectedRestaurant ? (
                        selectedRestaurant.logoUrl ? (
                          <img
                            src={selectedRestaurant.logoUrl}
                            alt={`Logo de ${selectedRestaurant.name}`}
                            className="h-10 w-10 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-sm font-semibold text-white">
                            {selectedRestaurant.name[0]?.toUpperCase() ?? 'R'}
                          </div>
                        )
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-200">
                          <Search className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1">
                        {selectedRestaurant ? (
                          <>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedRestaurant.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {selectedRestaurant.city ?? 'Ubicación no disponible'}
                              </span>
                              {selectedRestaurant.cuisineType
                                ? ` • ${selectedRestaurant.cuisineType}`
                                : ''}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Buscar y seleccionar un restaurante
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                      Abrir
                    </span>
                  </button>
                  {errors.restaurantId && (
                    <p className="mt-1 text-xs text-rose-500">{errors.restaurantId.message}</p>
                  )}
                </div>

                {/* Selección de Platos */}
                {selectedRestaurant && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selecciona tus platos (opcional)
                    </label>
                    {loadingDishes ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      </div>
                    ) : dishes.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                        No hay platos disponibles en este restaurante
                      </div>
                    ) : (
                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                        {dishes.map((dish) => {
                          const quantity = selectedDishes[dish.id] || 0;
                          const isSelected = quantity > 0;

                          return (
                            <div
                              key={dish.id}
                              className={`flex w-full items-center gap-3 rounded-lg border p-3 transition ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                              }`}
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {dish.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {dish.category} • ${dish.price.toFixed(2)}
                                </p>
                              </div>
                              
                              {/* Controles de cantidad */}
                              {isSelected ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => decreaseDishQuantity(dish.id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                  >
                                    <span className="text-lg font-semibold">−</span>
                                  </button>
                                  <span className="min-w-[2rem] text-center font-semibold text-gray-900 dark:text-white">
                                    {quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => increaseDishQuantity(dish.id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                  >
                                    <span className="text-lg font-semibold">+</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => increaseDishQuantity(dish.id)}
                                  className="flex h-8 items-center gap-1 rounded-full bg-blue-500 px-4 text-sm font-medium text-white transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                >
                                  <span className="text-lg font-semibold">+</span>
                                  <span>Agregar</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {Object.keys(selectedDishes).length > 0 && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {Object.keys(selectedDishes).length} plato(s) seleccionado(s) •{' '}
                        {Object.values(selectedDishes).reduce((sum, qty) => sum + qty, 0)} unidades en total
                      </p>
                    )}
                  </div>
                )}

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

                {selectedRestaurant && (
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
                          {reservation.status === 'cancelled' && reservation.reasonCancellation && (
                            <p className="mt-2 rounded-xl bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
                              Motivo de cancelación: “{reservation.reasonCancellation}”
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
      <RestaurantSearchModal
        open={restaurantPickerOpen}
        onClose={() => setRestaurantPickerOpen(false)}
        onSelect={handleRestaurantSelect}
        selectedRestaurantId={selectedRestaurant?.id ?? null}
      />
    </div>
  );
}

interface RestaurantSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (restaurant: Restaurant) => void;
  selectedRestaurantId?: string | null;
}

function RestaurantSearchModal({
  open,
  onClose,
  onSelect,
  selectedRestaurantId,
}: RestaurantSearchModalProps) {
  const pageSize = 6;
  const [pendingTerm, setPendingTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (!open) {
      fetchIdRef.current += 1;
      setPendingTerm('');
      setDebouncedTerm('');
      setResults([]);
      setError(null);
      setPage(1);
      setHasMore(false);
      setTotal(0);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedTerm(pendingTerm.trim());
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [pendingTerm, open]);

  const fetchPage = useCallback(
    async ({ term, targetPage, replace }: { term: string; targetPage: number; replace: boolean }) => {
      setLoading(true);
      setError(null);
      const requestId = ++fetchIdRef.current;

      try {
        const response = await searchRestaurants({
          search: term,
          page: targetPage,
          pageSize,
        });

        if (fetchIdRef.current !== requestId) {
          return;
        }

        setResults((prev) => (replace ? response.items : [...prev, ...response.items]));
        setTotal(response.total);
        setHasMore(response.hasMore);
        setPage(response.page);
      } catch (err) {
        if (fetchIdRef.current !== requestId) {
          return;
        }
        console.error('Error buscando restaurantes:', err);
        setError('No se pudieron cargar los restaurantes.');
      } finally {
        if (fetchIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [pageSize]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setResults([]);
    setError(null);
    setHasMore(false);
    setPage(1);
    fetchPage({ term: debouncedTerm, targetPage: 1, replace: true });
  }, [debouncedTerm, open, fetchPage]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const handleLoadMore = () => {
    if (loading || !hasMore) {
      return;
    }

    fetchPage({ term: debouncedTerm, targetPage: page + 1, replace: false });
  };

  if (!open) {
    return null;
  }

  const displayedCount = results.length;
  const totalLabel = total > 0 ? total : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-600 transition hover:bg-white hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Cerrar buscador de restaurantes"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-slate-200/60 px-6 py-6 dark:border-slate-700">
          <h2 className="text-xl font-semibold">Buscar restaurante</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Escribe para filtrar por nombre y selecciona el restaurante ideal para tu reserva.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-blue-400 dark:focus-within:ring-blue-500/30">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={pendingTerm}
              onChange={(event) => setPendingTerm(event.target.value)}
              placeholder="Buscar por nombre"
              className="w-full bg-transparent text-sm text-slate-800 outline-none dark:text-slate-100"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500 dark:text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando restaurantes...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
              No encontramos restaurantes coincidentes.
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((restaurant) => {
                const isSelected = restaurant.id === selectedRestaurantId;
                return (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => onSelect(restaurant)}
                    className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-500/10'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-400 dark:hover:bg-blue-500/10'
                    }`}
                  >
                    {restaurant.logoUrl ? (
                      <img
                        src={restaurant.logoUrl}
                        alt={`Logo de ${restaurant.name}`}
                        className="h-14 w-14 flex-shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-600"
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-lg font-semibold text-white">
                        {restaurant.name[0]?.toUpperCase() ?? 'R'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-base font-semibold text-slate-900 dark:text-white">
                        {restaurant.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {(restaurant.city || restaurant.country) && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {[restaurant.city, restaurant.country].filter(Boolean).join(', ') || 'Ubicación no disponible'}
                          </span>
                        )}
                        {restaurant.cuisineType && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-700/70 dark:text-slate-200">
                            {restaurant.cuisineType}
                          </span>
                        )}
                      </div>
                      {restaurant.description && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {restaurant.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200/60 px-6 py-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300">
          <span>
            Mostrando {displayedCount}
            {totalLabel ? ` de ${totalLabel}` : ''} restaurantes
          </span>
          {hasMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Cargar más'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
