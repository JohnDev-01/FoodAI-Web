import { supabaseClient } from './supabaseClient';
import type { Reservation } from '../types';

export interface ReservationAnalytics {
  totalReservations: number;
  pendingReservations: number;
  upcomingReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  todayReservations: number;
  thisWeekReservations: number;
  thisMonthReservations: number;
}

export interface ReservationTrend {
  date: string;
  count: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

/**
 * Obtiene estadísticas básicas de reservas para un restaurante
 */
export async function getRestaurantReservationAnalytics(
  restaurantId: string
): Promise<ReservationAnalytics> {
  try {
    // Obtener todas las reservas del restaurante
    const { data: reservations, error } = await supabaseClient
      .from('reservations')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (error) {
      console.error('Error fetching reservations for analytics:', error);
      return getEmptyAnalytics();
    }

    if (!reservations || reservations.length === 0) {
      return getEmptyAnalytics();
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filtrar reservas por fechas
    const todayReservations = reservations.filter(res => {
      const resDate = new Date(res.reservation_date);
      return resDate >= today && resDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    const thisWeekReservations = reservations.filter(res => {
      const resDate = new Date(res.reservation_date);
      return resDate >= weekStart;
    });

    const thisMonthReservations = reservations.filter(res => {
      const resDate = new Date(res.reservation_date);
      return resDate >= monthStart;
    });

    // Filtrar reservas futuras (próximas)
    const upcomingReservations = reservations.filter(res => {
      const resDate = new Date(res.reservation_date);
      return resDate >= now && res.status !== 'cancelled';
    });

    // Contar por estado
    const pendingReservations = reservations.filter(res => res.status === 'pending').length;
    const confirmedReservations = reservations.filter(res => res.status === 'confirmed').length;
    const cancelledReservations = reservations.filter(res => res.status === 'cancelled').length;

    return {
      totalReservations: reservations.length,
      pendingReservations,
      upcomingReservations: upcomingReservations.length,
      confirmedReservations,
      cancelledReservations,
      todayReservations: todayReservations.length,
      thisWeekReservations: thisWeekReservations.length,
      thisMonthReservations: thisMonthReservations.length,
    };
  } catch (error) {
    console.error('Error calculating reservation analytics:', error);
    return getEmptyAnalytics();
  }
}

/**
 * Obtiene tendencias de reservas por día para los últimos 7 días
 */
export async function getReservationTrends(
  restaurantId: string,
  days: number = 7
): Promise<ReservationTrend[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const { data: reservations, error } = await supabaseClient
      .from('reservations')
      .select('reservation_date, status')
      .eq('restaurant_id', restaurantId)
      .gte('reservation_date', startDate.toISOString().split('T')[0])
      .lte('reservation_date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching reservation trends:', error);
      return [];
    }

    if (!reservations) return [];

    // Agrupar por fecha y estado
    const trendsMap = new Map<string, { pending: number; confirmed: number; cancelled: number }>();

    reservations.forEach(res => {
      const date = res.reservation_date;
      if (!trendsMap.has(date)) {
        trendsMap.set(date, { pending: 0, confirmed: 0, cancelled: 0 });
      }
      const dayData = trendsMap.get(date)!;
      dayData[res.status as keyof typeof dayData]++;
    });

    // Convertir a array y ordenar por fecha
    const trends: ReservationTrend[] = [];
    trendsMap.forEach((counts, date) => {
      Object.entries(counts).forEach(([status, count]) => {
        if (count > 0) {
          trends.push({
            date,
            count,
            status: status as 'pending' | 'confirmed' | 'cancelled',
          });
        }
      });
    });

    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error calculating reservation trends:', error);
    return [];
  }
}

/**
 * Retorna analytics vacíos en caso de error
 */
function getEmptyAnalytics(): ReservationAnalytics {
  return {
    totalReservations: 0,
    pendingReservations: 0,
    upcomingReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    todayReservations: 0,
    thisWeekReservations: 0,
    thisMonthReservations: 0,
  };
}
