import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/Card';
import {
  AlertTriangle,
  BarChart2,
  CalendarDays,
  Clock,
  DollarSign,
  Gauge,
  PieChart,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  getRestaurantAiInsights,
  type RestaurantAiInsights,
} from '../../services/aiInsightsService';

interface AiInsightsDashboardProps {
  restaurantId: string;
}

const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('es-DO', {
  maximumFractionDigits: 1,
});

export function AiInsightsDashboard({ restaurantId }: AiInsightsDashboardProps) {
  const [insights, setInsights] = useState<RestaurantAiInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!restaurantId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getRestaurantAiInsights(restaurantId);
        setInsights(data);
      } catch (err) {
        setError('No se pudieron cargar los insights de IA.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [restaurantId]);

  const retry = () => {
    setInsights(null);
    setError(null);
    setLoading(true);
    getRestaurantAiInsights(restaurantId)
      .then(setInsights)
      .catch(() => setError('No se pudieron cargar los insights de IA.'))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-900 dark:text-red-100">
            <AlertTriangle className="h-5 w-5" />
            <span>Sin datos de IA</span>
          </CardTitle>
          <CardDescription className="text-red-800/80 dark:text-red-200">
            {error ?? 'Intenta nuevamente en unos minutos.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={retry}
            className="inline-flex items-center px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-500"
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }

  const { indicators } = insights;
  const nextPeak = indicators.demand_capacity?.next_peak;
  const hourlyOccupancy = indicators.demand_capacity?.hourly_occupancy ?? [];
  const weekdayDemand = indicators.demand_capacity?.weekday_demand ?? [];
  const cancellationRisks = indicators.cancellations?.cancellation_risk_by_reservation ?? [];
  const usersProneToCancel = indicators.cancellations?.users_prone_to_cancel ?? [];
  const loyalCustomers = indicators.cancellations?.loyal_customers_forecast;
  const popularBookingWindows = indicators.timing_behavior?.popular_booking_windows ?? [];
  const expectedRevenue = indicators.economics?.expected_revenue_next_days ?? [];
  const economicRisk = indicators.economics?.economic_cancellation_risk;
  const expectedTicket = indicators.economics?.expected_ticket;
  const customerSegments = Object.entries(indicators.segmentation?.customer_segments ?? {});
  const lowDemandAlerts = indicators.operations?.low_demand_alerts ?? [];
  const avgLeadTime = indicators.timing_behavior?.average_lead_time_days;
  const leadTrend = indicators.timing_behavior?.lead_time_trend_vs_last_month;
  const trendSeasonality = indicators.trend_seasonality;

  const formatDateTime = (value?: string) =>
    value
      ? new Date(value).toLocaleString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Sin datos';

  const formatDate = (value?: string) =>
    value
      ? new Date(value).toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      : 'Sin fecha';

  const formatCurrency = (value?: number) =>
    value === undefined || value === null ? 'Sin datos' : currencyFormatter.format(value);

  const formatPercent = (value?: number, withSign: boolean = false) => {
    if (value === undefined || value === null) {
      return 'Sin datos';
    }
    const formatted = percentFormatter.format(value);
    if (!withSign) return `${formatted}%`;
    const sign = value > 0 ? '+' : '';
    return `${sign}${formatted}%`;
  };

  const bestRevenueDay = expectedRevenue.reduce<{ date: string; projected_revenue: number } | null>(
    (acc, curr) => {
      if (!acc || curr.projected_revenue > acc.projected_revenue) {
        return curr;
      }
      return acc;
    },
    null
  );

  const statCards = [
    {
      title: 'Próximo pico',
      value: nextPeak ? `${nextPeak.weekday} ${nextPeak.hour}` : 'Sin datos',
      helper: nextPeak ? `${percentFormatter.format(nextPeak.expected_occupancy)}% ocupación` : 'Pendiente',
      icon: Clock,
      accent: 'from-amber-500/20 to-orange-500/20 text-amber-600',
    },
    {
      title: 'Ticket esperado',
      value: formatCurrency(expectedTicket ?? undefined),
      helper: 'Valor medio proyectado',
      icon: DollarSign,
      accent: 'from-emerald-500/20 to-green-500/20 text-emerald-600',
    },
    {
      title: 'Riesgo económico',
      value: economicRisk ? formatCurrency(economicRisk.projected_loss) : 'Sin datos',
      helper: economicRisk?.message ?? 'Sin alertas críticas',
      icon: TrendingUp,
      accent: 'from-rose-500/20 to-red-500/20 text-rose-600',
    },
    {
      title: 'Clientes fieles',
      value: loyalCustomers ? `${loyalCustomers.expected_next_month}` : 'Sin datos',
      helper: loyalCustomers
        ? `Tendencia ${formatPercent(loyalCustomers.trend_vs_last_month, true)}`
        : 'Sin pronóstico',
      icon: Users,
      accent: 'from-indigo-500/20 to-blue-500/20 text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-2xl text-white">
                Insights con IA · {insights.restaurant_name}
              </CardTitle>
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Actualizado {formatDateTime(insights.generated_at)}
              </span>
            </div>
            <CardDescription className="text-white/80">
              Predicciones sobre demanda, cancelaciones y comportamiento económico generadas en tiempo real.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ title, value, helper, icon: Icon, accent }) => (
          <Card
            key={title}
            className={`border-none bg-gradient-to-br ${accent} dark:bg-gray-900/80 dark:border-gray-700`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-300">{title}</p>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-700/80 dark:text-gray-400 mt-1">{helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Demanda y capacidad
            </CardTitle>
            <CardDescription>
              Patrones de ocupación y días con mayor movimiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {nextPeak && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-900/20">
                <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Próximo pico</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-indigo-900 dark:text-white">
                  <div>
                    <p className="text-3xl font-semibold">{nextPeak.weekday}</p>
                    <p className="text-lg">{nextPeak.hour} · {percentFormatter.format(nextPeak.expected_occupancy)}% ocupación</p>
                  </div>
                  <div className="text-sm text-indigo-700/90 dark:text-indigo-200">
                    {nextPeak.insight}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Demanda semanal vs promedio
                </p>
                <div className="space-y-2">
                  {weekdayDemand.map((day) => (
                    <div
                      key={day.weekday}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{day.weekday}</p>
                        {day.insight && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{day.insight}</p>
                        )}
                      </div>
                      <span
                        className={`font-semibold ${day.relative_to_avg >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}
                      >
                        {day.relative_to_avg >= 0 ? '+' : ''}
                        {percentFormatter.format(day.relative_to_avg)}%
                      </span>
                    </div>
                  ))}
                  {weekdayDemand.length === 0 && (
                    <p className="text-sm text-gray-500">Sin datos disponibles.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas de baja demanda
                </p>
                <div className="space-y-2">
                  {lowDemandAlerts.length === 0 && <p className="text-sm text-gray-500">Sin alertas activas.</p>}
                  {lowDemandAlerts.map((alert, index) => (
                    <div
                      key={`${alert.weekday}-${alert.hour}-${index}`}
                      className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/20"
                    >
                      <p className="font-semibold">{alert.weekday} · {alert.hour}</p>
                      <p className="text-xs">
                        Ocupación esperada {percentFormatter.format(alert.expected_occupancy)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              Ocupación por hora
            </CardTitle>
            <CardDescription>
              Proyección de invitados y ocupación diaria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {hourlyOccupancy.length === 0 && <p className="text-sm text-gray-500">Sin datos para mostrar.</p>}
              {hourlyOccupancy.map((slot) => (
                <div key={slot.hour} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{slot.hour}</span>
                    <span className="text-xs text-gray-500">
                      {slot.projected_guests.toFixed(1)} invitados
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-500"
                      style={{ width: `${Math.min(slot.expected_occupancy, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {percentFormatter.format(slot.expected_occupancy)}% ocupación
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Riesgo de cancelaciones
            </CardTitle>
            <CardDescription>
              Reservas bajo observación y clientes con alta probabilidad de cancelar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Reservas más riesgosas
              </p>
              <div className="space-y-3">
                {cancellationRisks.length === 0 && (
                  <p className="text-sm text-gray-500">Sin alertas en este momento.</p>
                )}
                {cancellationRisks.map((reservation) => (
                  <div
                    key={reservation.reservation_id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-800"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{reservation.customer}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(reservation.scheduled_for)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        reservation.probability >= 0.6 ? 'text-rose-600' : 'text-amber-500'
                      }`}
                    >
                      {formatPercent(reservation.probability * 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Usuarios propensos a cancelar
              </p>
              <div className="space-y-2">
                {usersProneToCancel.length === 0 && (
                  <p className="text-sm text-gray-500">No se identificaron patrones de cancelación.</p>
                )}
                {usersProneToCancel.map((user) => (
                  <div
                    key={user.customer}
                    className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:bg-rose-900/20"
                  >
                    <span className="font-medium">{user.customer}</span>
                    <span className="font-semibold">{formatPercent(user.cancel_rate * 100)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-emerald-500" />
              Comportamiento y segmentos
            </CardTitle>
            <CardDescription>
              Ventanas de reserva predilectas y composición de clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Ventanas populares</p>
              <div className="space-y-3">
                {popularBookingWindows.length === 0 && (
                  <p className="text-sm text-gray-500">Aún no hay suficiente data.</p>
                )}
                {popularBookingWindows.map((slot) => (
                  <div key={slot.hour}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{slot.hour}</span>
                      <span className="text-xs text-gray-500">{formatPercent(slot.percentage)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-500"
                        style={{ width: `${Math.min(slot.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Segmentos</p>
              <div className="flex flex-wrap gap-3">
                {customerSegments.length === 0 && <p className="text-sm text-gray-500">Sin segmentación.</p>}
                {customerSegments.map(([segment, value]) => (
                  <div
                    key={segment}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20"
                  >
                    {segment}: {value ?? 0}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500">Lead time prom.</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {avgLeadTime ? `${percentFormatter.format(avgLeadTime)} días` : 'Sin datos'}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500">Tendencia vs mes anterior</p>
                <p className={`mt-1 text-2xl font-semibold ${leadTrend && leadTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {leadTrend !== undefined && leadTrend !== null ? formatPercent(leadTrend, true) : 'Sin datos'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-lime-500" />
              Forecast económico
            </CardTitle>
            <CardDescription>
              Proyección de ingresos y pérdidas potenciales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500">Mejor día proyectado</p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {bestRevenueDay ? formatDate(bestRevenueDay.date) : 'Sin datos'}
                </p>
                <p className="text-sm text-gray-500">{bestRevenueDay ? formatCurrency(bestRevenueDay.projected_revenue) : '---'}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500">Ticket promedio</p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(expectedTicket ?? undefined)}
                </p>
                <p className="text-sm text-gray-500">Por reserva</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500">Pérdida por cancelación</p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {economicRisk ? formatCurrency(economicRisk.projected_loss) : 'Sin datos'}
                </p>
                <p className="text-sm text-gray-500">{economicRisk?.message}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Próximos 7 días</p>
              <div className="space-y-2">
                {expectedRevenue.length === 0 && <p className="text-sm text-gray-500">Sin proyección disponible.</p>}
                {expectedRevenue.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(day.date)}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(day.projected_revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-sky-500" />
              Operaciones y estacionalidad
            </CardTitle>
            <CardDescription>
              Señales tempranas para ajustar la operación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
              <p className="text-xs uppercase tracking-wide text-gray-500">Tendencia mensual</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {trendSeasonality?.monthly_trend_pct !== undefined
                  ? formatPercent(trendSeasonality.monthly_trend_pct, true)
                  : 'Sin datos'}
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
              <p className="text-xs uppercase tracking-wide text-gray-500">Señal estacional</p>
              <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                {trendSeasonality?.seasonality_signal ?? 'Sin datos suficientes'}
              </p>
            </div>

            {trendSeasonality?.max_expected_slot && (
              <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500">Horario mejor desempeño</p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {trendSeasonality.max_expected_slot.weekday} · {trendSeasonality.max_expected_slot.hour}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
