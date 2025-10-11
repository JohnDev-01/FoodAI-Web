import { supabaseClient } from './supabaseClient';
import type { ReservationWithRestaurant, ReservationStatus } from '../types';

interface ReservationDbRow {
  id: string;
  user_id: string;
  restaurant_id: string;
  date: string;
  time: string;
  party_size: number;
  status: ReservationStatus;
  notes: string | null;
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
  date: row.date,
  time: row.time,
  partySize: row.party_size,
  status: row.status,
  notes: row.notes ?? undefined,
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
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ReservationDbRow[]).map(mapReservation);
}
