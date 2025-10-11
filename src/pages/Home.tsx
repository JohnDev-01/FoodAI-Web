import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { ROUTES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { getReservationsByUserId } from '../services/reservationService';
import type { ReservationStatus, ReservationWithRestaurant } from '../types';

export function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'datos' | 'reservas'>('datos');
  const [reservations, setReservations] = useState<ReservationWithRestaurant[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState<boolean>(false);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  const isClient = user?.role === 'client';
  const roleLabels: Record<string, string> = {
    client: 'Cliente',
    restaurant: 'Restaurante',
    admin: 'Administrador',
  };
  const reservationStatusLabels: Record<ReservationStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
  };
  const reservationStatusStyles: Record<ReservationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-200',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200',
  };
  const userStatusLabels: Record<string, string> = {
    active: 'Activo',
    pending: 'Pendiente',
    suspended: 'Suspendido',
  };

  useEffect(() => {
    setActiveTab('datos');
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadReservations = async () => {
      if (!user?.id || user.role !== 'client') {
        if (isMounted) {
          setReservations([]);
          setReservationsError(null);
        }
        return;
      }

      try {
        if (isMounted) {
          setReservationsLoading(true);
          setReservationsError(null);
        }
        const data = await getReservationsByUserId(user.id);
        if (isMounted) {
          setReservations(data);
        }
      } catch (error) {
        console.error('Error al cargar las reservas del usuario:', error);
        if (isMounted) {
          setReservationsError('No pudimos cargar tus reservas en este momento.');
        }
      } finally {
        if (isMounted) {
          setReservationsLoading(false);
        }
      }
    };

    loadReservations();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.role]);

  const formatReservationSchedule = (reservationDate: string, reservationTime: string) => {
    if (!reservationDate) {
      return {
        dateLabel: 'Sin fecha',
        timeLabel: reservationTime ?? '',
      };
    }

    const sanitizedTime =
      reservationTime && reservationTime.length === 5
        ? `${reservationTime}:00`
        : reservationTime ?? '';
    const isoCandidate = sanitizedTime ? `${reservationDate}T${sanitizedTime}` : reservationDate;
    const parsed = new Date(isoCandidate);

    if (!Number.isNaN(parsed.getTime())) {
      const dateLabel = parsed.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      const timeLabel = sanitizedTime
        ? parsed.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';

      return { dateLabel, timeLabel };
    }

    return {
      dateLabel: reservationDate,
      timeLabel: reservationTime ?? '',
    };
  };

  const features = [
    {
      title: 'Restaurantes Inteligentes',
      description: 'Descubre restaurantes con tecnología de vanguardia y menús personalizados.',
      icon: '🍽️',
    },
    {
      title: 'Pedidos en Tiempo Real',
      description: 'Realiza pedidos y recibe actualizaciones en tiempo real del estado de tu orden.',
      icon: '📱',
    },
    {
      title: 'Reservas Inteligentes',
      description: 'Reserva tu mesa con anticipación y disfruta de una experiencia sin esperas.',
      icon: '📅',
    },
    {
      title: 'Analytics Avanzados',
      description: 'Los restaurantes pueden analizar su rendimiento y optimizar sus operaciones.',
      icon: '📊',
    },
  ];

  const cuisines = [
    { name: 'Italiana', icon: '🍝', color: 'bg-red-100 text-red-800' },
    { name: 'Mexicana', icon: '🌮', color: 'bg-green-100 text-green-800' },
    { name: 'Asiática', icon: '🍜', color: 'bg-blue-100 text-blue-800' },
    { name: 'Mediterránea', icon: '🥗', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Americana', icon: '🍔', color: 'bg-purple-100 text-purple-800' },
    { name: 'Francesa', icon: '🥐', color: 'bg-pink-100 text-pink-800' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Bienvenido a{' '}
            <span className="text-blue-600 dark:text-blue-400">FoodAI</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            La plataforma inteligente que revoluciona la experiencia gastronómica 
            con tecnología de vanguardia y análisis predictivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user?.role === 'restaurant' && (
              <Link to={ROUTES.RESTAURANT_DASHBOARD}>
                <Button size="lg" className="text-lg px-8 py-3">
                  Ir al Dashboard
                </Button>
              </Link>
            )}
            <Link to={ROUTES.RESTAURANTS}>
              <Button size="lg" className="text-lg px-8 py-3">
                Explorar Restaurantes
              </Button>
            </Link>
            {!user && (
              <Link to={ROUTES.REGISTER}>
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Registrarse
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
      {user && (
        <section className="px-4 -mt-12 pb-12">
          <div className="container mx-auto">
            <div className="mx-auto max-w-4xl rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/70">
              <div className="flex flex-col gap-6 text-left md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`Foto de ${user.fullName ?? user.name ?? 'usuario'}`}
                      className="h-16 w-16 rounded-full border-2 border-blue-200 object-cover dark:border-blue-500/50"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-2xl font-semibold text-white shadow-lg shadow-blue-500/20">
                      {(user.firstName?.[0] ?? user.name?.[0] ?? 'U').toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.fullName ?? user.name ?? 'Usuario FoodAI'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{user.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-500/15 dark:text-blue-200">
                        {roleLabels[user.role ?? ''] ?? 'Sin rol'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/40 dark:text-gray-200">
                        {userStatusLabels[user.status ?? 'pending'] ?? 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/60 p-1 dark:bg-gray-800/80">
                  {[
                    { key: 'datos' as const, label: 'Mis datos' },
                    { key: 'reservas' as const, label: 'Mis reservas' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        activeTab === tab.key
                          ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
                {activeTab === 'datos' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        label: 'Nombre completo',
                        value: user.fullName ?? user.name ?? '—',
                      },
                      {
                        label: 'Correo',
                        value: user.email ?? '—',
                      },
                      {
                        label: 'Rol',
                        value: roleLabels[user.role ?? ''] ?? 'Sin asignar',
                      },
                      {
                        label: 'Estado',
                        value: userStatusLabels[user.status ?? 'pending'] ?? 'Pendiente',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/80"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>
                        <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {!isClient ? (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-5 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
                        Las reservas están disponibles para cuentas de cliente. Cambia a una cuenta de cliente para ver tu historial.
                      </div>
                    ) : reservationsLoading ? (
                      <div className="flex items-center justify-center py-6 text-sm text-gray-500 dark:text-gray-300">
                        Cargando tus reservas...
                      </div>
                    ) : reservationsError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/30 dark:text-red-200">
                        {reservationsError}
                      </div>
                    ) : reservations.length === 0 ? (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-5 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
                        Aún no tienes reservas registradas. Cuando hagas tu primera reserva aparecerá aquí.
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {reservations.map((reservation) => {
                          const { dateLabel, timeLabel } = formatReservationSchedule(
                            reservation.reservationDate,
                            reservation.reservationTime
                          );
                          const restaurantName =
                            reservation.restaurantName ??
                            `Restaurante #${reservation.restaurantId.slice(0, 6)}`;
                          const statusLabel =
                            reservationStatusLabels[reservation.status] ?? reservation.status;
                          const statusClass =
                            reservationStatusStyles[reservation.status] ??
                            'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-200';
                          const createdAtDate = reservation.createdAt
                            ? new Date(reservation.createdAt)
                            : null;
                          const createdAtLabel =
                            createdAtDate && !Number.isNaN(createdAtDate.getTime())
                              ? createdAtDate.toLocaleDateString('es-ES', { dateStyle: 'medium' })
                              : reservation.createdAt;

                          return (
                            <div
                              key={reservation.id}
                              className="rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80"
                            >
                              <div className="flex items-center gap-3">
                                {reservation.restaurantLogo ? (
                                  <img
                                    src={reservation.restaurantLogo}
                                    alt={`Logo de ${restaurantName}`}
                                    className="h-12 w-12 rounded-full border border-gray-100 object-cover dark:border-gray-700"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-sm font-semibold text-white">
                                    {restaurantName[0]?.toUpperCase() ?? 'R'}
                                  </div>
                                )}
                                <div>
                                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                                    {restaurantName}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Mesa para {reservation.guestsCount}
                                    {timeLabel ? ` • ${timeLabel}` : ''}
                                  </p>
                                </div>
                                <span
                                  className={`ml-auto inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                                >
                                  {statusLabel}
                                </span>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Fecha
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {dateLabel}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  Reservado el {createdAtLabel}
                                </p>
                              </div>

                              {reservation.specialRequest && (
                                <p className="mt-3 text-sm italic text-gray-500 dark:text-gray-400">
                                  “{reservation.specialRequest}”
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Por qué elegir FoodAI?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Nuestra plataforma combina inteligencia artificial con análisis de datos 
              para ofrecer la mejor experiencia gastronómica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisines Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explora Diferentes Cocinas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubre una amplia variedad de restaurantes con diferentes tipos de cocina.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {cuisines.map((cuisine) => (
              <Link
                key={cuisine.name}
                to={`${ROUTES.RESTAURANTS}?cuisine=${cuisine.name.toLowerCase()}`}
                className="group"
              >
                <Card className="text-center hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-2">{cuisine.icon}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {cuisine.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Listo para Revolucionar tu Experiencia Gastronómica?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están disfrutando de la mejor experiencia gastronómica con FoodAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" className="text-lg px-8 py-3">
                Comenzar Ahora
              </Button>
            </Link>
            <Link to={ROUTES.RESTAURANTS}>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Ver Restaurantes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
