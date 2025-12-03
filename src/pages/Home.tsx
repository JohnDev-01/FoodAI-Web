import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
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

  const heroHighlights = [
    {
      title: 'Impacto inmediato',
      detail: 'Automatizamos la experiencia desde el descubrimiento hasta la fidelización.',
    },
    {
      title: 'Comunidad leal',
      detail: 'Diseñamos cada interacción para que el comensal regrese con entusiasmo.',
    },
    {
      title: 'Operación impecable',
      detail: 'Tu equipo recibe soporte continuo con insights accionables.',
    },
  ];

  const features = [
    {
      title: 'Recomendaciones hiperpersonalizadas',
      description: 'Nuestra IA propone el plato ideal considerando tus hábitos y contexto.',
      symbol: 'IA',
      badge: 'IA predictiva',
    },
    {
      title: 'Gestión de reservas sin fricción',
      description: 'Automatizamos recordatorios, confirmaciones y asignación de mesas para cero esperas.',
      symbol: 'FX',
      badge: 'Automatización',
    },
    {
      title: 'Analytics accionables',
      description: 'Panel inteligente con insights de demanda, rotación y satisfacción listos para actuar.',
      symbol: 'IQ',
      badge: 'Insights',
    },
    {
      title: 'Experiencias inmersivas',
      description: 'Convierte cada visita en una historia memorable con storytelling gastronómico.',
      symbol: 'UX',
      badge: 'Engagement',
    },
  ];

  const cuisines = [
    {
      name: 'Italiana',
      description: 'Sabores intensos y maridajes guiados por IA.',
    },
    {
      name: 'Mexicana',
      description: 'Tradición reinventada con experiencias inmersivas.',
    },
    {
      name: 'Asiática',
      description: 'Técnicas ancestrales con precisión futurista.',
    },
    {
      name: 'Mediterránea',
      description: 'Frescura consciente y narrativa sensorial.',
    },
    {
      name: 'Americana',
      description: 'Comfort food elevado con curvas de sabor dinámicas.',
    },
    {
      name: 'Francesa',
      description: 'Alta cocina guiada por data creativa.',
    },
  ];

  const journeySteps = [
    {
      title: 'Explora con IA',
      description: 'Descubre propuestas gastronómicas alineadas a tu mood y estilo.',
      tag: 'Explora',
    },
    {
      title: 'Reserva sin esperas',
      description: 'Confirma tu mesa y recibe acompañamiento proactivo en cada fase.',
      tag: 'Reserva',
    },
    {
      title: 'Vive la experiencia',
      description: 'La IA amplifica la visita con recomendaciones in situ y seguimiento emotivo.',
      tag: 'Vive',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-[#eef6ff] to-white dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:border-blue-500/30 dark:bg-white/10 dark:text-blue-200">
                Nueva era gastronómica
              </p>
              <h1 className="mt-8 text-4xl font-bold leading-tight text-gray-900 md:text-5xl dark:text-white">
                Bienvenido a{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  FoodAI
                </span>
                , la plataforma que anticipa tus antojos.
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 md:text-xl">
                Storytelling sensorial, automatizaciones discretas y analítica inteligente para que la primera impresión sea impecable.
              </p>
              <div className="mt-8 flex flex-col flex-wrap gap-4 sm:flex-row">
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
                    <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-2">
                      Registrarse
                    </Button>
                  </Link>
                )}
              </div>
              <div className="mt-10 space-y-4">
                {heroHighlights.map((highlight) => (
                  <div
                    key={highlight.title}
                    className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-left dark:border-gray-800 dark:bg-gray-900/70"
                  >
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{highlight.title}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{highlight.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Respuestas guiadas
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Experiencias editoriales
                </span>
              </div>
            </div>
            <div className="rounded-3xl border border-white/50 bg-white/80 p-8 text-left shadow-xl backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Escenas FoodAI</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">Experiencias editoriales</p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Compartimos con tu equipo guiones breves para recibir, sorprender y despedir a cada comensal con calma.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  {
                    title: 'Curaduría sensorial',
                    detail: 'Storytelling gastronómico coherente de principio a fin.',
                  },
                  {
                    title: 'Ejecución ligera',
                    detail: 'Automatizaciones discretas que acompañan al equipo.',
                  },
                  {
                    title: 'Seguimiento humano',
                    detail: 'Mensajes cálidos antes y después de cada visita.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-gray-200/70 bg-white/70 p-4 dark:border-gray-800/60 dark:bg-gray-950/40">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                {['Ambientación', 'Hospitalidad', 'Fidelización'].map((tag) => (
                  <span key={tag} className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
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
                              {reservation.status === 'cancelled' && reservation.reasonCancellation && (
                                <p className="mt-3 text-sm text-rose-500 dark:text-rose-300">
                                  Motivo de cancelación: “{reservation.reasonCancellation}”
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
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500 dark:text-blue-300">
              ¿Por qué elegir FoodAI?
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Simplificamos la innovación gastronómica.
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Seleccionamos solo lo esencial para explicar con claridad cómo conectamos datos, hospitalidad y creatividad culinaria.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-left transition hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-sm font-semibold text-white">
                  {feature.symbol}
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">
                  {feature.badge}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900/80">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">Tu recorrido</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {journeySteps.map((step) => (
                <div key={step.title}>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500 dark:text-blue-300">
                    {step.tag}
                  </span>
                  <h4 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h4>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cuisines Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
              Explora Diferentes Cocinas
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Selecciona tu universo gastronómico.
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Cada categoría combina curaduría humana y herramientas inteligentes para que descubras propuestas auténticas.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cuisines.map((cuisine) => (
              <Link
                key={cuisine.name}
                to={`${ROUTES.RESTAURANTS}?cuisine=${cuisine.name.toLowerCase()}`}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-left transition hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">Colección</p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{cuisine.name}</h3>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{cuisine.description}</p>
                <span className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-300">
                  Ver restaurantes
                  <span aria-hidden="true" className="ml-1">→</span>
                </span>
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
