import { supabaseClient } from './supabaseClient';
import type {
  CreateReservationPayload,
  ReservationWithRestaurant,
  ReservationStatus,
} from '../types';

interface ReservationDbRow {
  id: string;
  user_id: string;
  restaurant_id: string;
  reservation_date: string;
  reservation_time: string;
  guests_count: number;
  status: ReservationStatus;
  special_request: string | null;
  created_at: string;
  updated_at: string;
  restaurant?: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
}

const mapReservation = (row: ReservationDbRow): ReservationWithRestaurant => ({
  id: row.id,
  userId: row.user_id,
  restaurantId: row.restaurant_id,
  reservationDate: row.reservation_date,
  reservationTime: row.reservation_time,
  guestsCount: row.guests_count,
  status: row.status,
  specialRequest: row.special_request ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  restaurantName: row.restaurant?.name ?? null,
  restaurantLogo: row.restaurant?.logo_url ?? null,
});

export async function getReservationsByUserId(userId: string) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('reservations')
    .select(
      `
        *,
        restaurant:restaurants (
          id,
          name,
          logo_url
        )
      `
    )
    .eq('user_id', userId)
    .order('reservation_date', { ascending: false })
    .order('reservation_time', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ReservationDbRow[]).map(mapReservation);
}

export async function createReservation(userId: string, payload: CreateReservationPayload) {
  const { data, error } = await supabaseClient
    .from('reservations')
    .insert({
      user_id: userId,
      restaurant_id: payload.restaurantId,
      reservation_date: payload.reservationDate,
      reservation_time: payload.reservationTime,
      guests_count: payload.guestsCount,
      status: 'pending',
      special_request: payload.specialRequest ?? null,
    })
    .select(
      `
        *,
        restaurant:restaurants (
          id,
          name,
          logo_url
        )
      `
    )
    .single();

  if (error) {
    throw error;
  }

  return mapReservation(data as ReservationDbRow);
}

export async function cancelReservation(reservationId: string) {
  const { data, error } = await supabaseClient
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', reservationId)
    .select(
      `
        *,
        restaurant:restaurants (
          id,
          name,
          logo_url
        )
      `
    )
    .single();

  if (error) {
    throw error;
  }

  return mapReservation(data as ReservationDbRow);
}
