import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabaseClient } from './supabaseClient';
import {
  sendReservationCreatedEmail,
  sendReservationStatusEmail,
} from './mailService';
import type {
  CreateReservationPayload,
  ReservationWithRestaurant,
  ReservationStatus,
  ReservationAdminView,
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
  reason_cancellation: string | null;
  created_at: string;
  updated_at: string;
  restaurant?: {
    id: string;
    name: string;
    owner_id: string | null;
    logo_url: string | null;
  } | null;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
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
  reasonCancellation: row.reason_cancellation ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  restaurantName: row.restaurant?.name ?? null,
  restaurantLogo: row.restaurant?.logo_url ?? null,
});

const mapAdminReservation = (row: ReservationDbRow): ReservationAdminView => ({
  ...mapReservation(row),
  restaurantOwnerId: row.restaurant?.owner_id ?? null,
  userName:
    [row.user?.first_name, row.user?.last_name]
      .map((piece) => piece?.trim())
      .filter(Boolean)
      .join(' ') || row.user?.email || null,
  userEmail: row.user?.email ?? "",
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
        ),
        user:users (
          id,
          first_name,
          last_name,
          email
        )
      `
    )
    .single();

  if (error) {
    throw error;
  }

  const row = data as ReservationDbRow;
  const mapped = mapReservation(row);

  const guestEmail = row.user?.email;
  if (guestEmail) {
    const guestName =
      [row.user?.first_name, row.user?.last_name]
        .map((piece) => piece?.trim())
        .filter(Boolean)
        .join(' ') || guestEmail;
    await sendReservationCreatedEmail({
      email: guestEmail,
      fullName: guestName,
      reservation: {
        reservationDate: row.reservation_date,
        reservationTime: row.reservation_time,
        guestsCount: row.guests_count,
        restaurantName: row.restaurant?.name ?? null,
        specialRequest: row.special_request ?? undefined,
      },
    });
  }


  return mapped;
}

export async function cancelReservation(reservationId: string, reason?: string) {
  const { data, error } = await supabaseClient
    .from('reservations')
    .update({ status: 'cancelled', reason_cancellation: reason ?? null })
    .eq('id', reservationId)
    .select(
      `
        *,
        restaurant:restaurants (
          id,
          name,
          logo_url
        ),
        user:users (
          id,
          first_name,
          last_name,
          email
        )
      `
    )
    .single();

  if (error) {
    throw error;
  }

  const row = data as ReservationDbRow;
  const mapped = mapReservation(row);
  const guestEmail = row.user?.email;

  if (guestEmail) {
    const guestName =
      [row.user?.first_name, row.user?.last_name]
        .map((piece) => piece?.trim())
        .filter(Boolean)
        .join(' ') || guestEmail;

    await sendReservationStatusEmail({
      email: guestEmail,
      fullName: guestName,
      status: 'cancelled',
      reservation: {
        reservationDate: row.reservation_date,
        reservationTime: row.reservation_time,
        guestsCount: row.guests_count,
        restaurantName: row.restaurant?.name ?? null,
        specialRequest: row.special_request ?? undefined,
        reasonCancellation: row.reason_cancellation ?? reason,
      },
    });
  }


  return mapped;
}

export async function getAllReservations() {
  const { data, error } = await supabaseClient
    .from('reservations')
    .select(
      `
        *,
        restaurant:restaurants (
          id,
          name,
          logo_url,
          owner_id
        ),
        user:users (
          id,
          first_name,
          last_name,
          email
        )
      `
    )
    .order('reservation_date', { ascending: false })
    .order('reservation_time', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReservationDbRow[]).map(mapAdminReservation);
}

export async function getReservationsByRestaurantId(restaurantId: string) {
  if (!restaurantId) {
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
          logo_url,
          owner_id
        ),
        user:users (
          id,
          first_name,
          last_name,
          email
        )
      `
    )
    .eq('restaurant_id', restaurantId)
    .order('reservation_date', { ascending: false })
    .order('reservation_time', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReservationDbRow[]).map(mapAdminReservation);
}

export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus,
  options: { reasonCancellation?: string } = {}
) {
  const payload: Record<string, unknown> = {
    status,
  };

  if (status === 'cancelled') {
    payload.reason_cancellation = options.reasonCancellation ?? null;
  } else {
    payload.reason_cancellation = null;
  }

  const { data, error } = await supabaseClient
    .from('reservations')
    .update(payload)
    .eq('id', reservationId)
    .select(
      `
        *,
        restaurant:restaurants (
          id,
          name,
          logo_url,
          owner_id
        ),
        user:users (
          id,
          first_name,
          last_name,
          email
        )
      `
    )
    .single();

  if (error) {
    throw error;
  }

  const row = data as ReservationDbRow;
  const mapped = mapAdminReservation(row);
  const guestEmail = row.user?.email;

  if (guestEmail && (status === 'confirmed' || status === 'cancelled' || status === 'completed')) {
    const guestName =
      [row.user?.first_name, row.user?.last_name]
        .map((piece) => piece?.trim())
        .filter(Boolean)
        .join(' ') || guestEmail;

    await sendReservationStatusEmail({
      email: guestEmail,
      fullName: guestName,
      status,
      reservation: {
        reservationDate: row.reservation_date,
        reservationTime: row.reservation_time,
        guestsCount: row.guests_count,
        restaurantName: row.restaurant?.name ?? null,
        specialRequest: row.special_request ?? undefined,
        reasonCancellation: row.reason_cancellation ?? options.reasonCancellation,
      },
    });
  }


  return mapped;
}

export function subscribeToReservationUpdates(
  callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: any; old: any }) => void
): RealtimeChannel {
  const channel = supabaseClient
    .channel('reservations-dashboard')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservations',
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: (payload as any).new,
          old: (payload as any).old,
        });
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromReservationUpdates(channel: RealtimeChannel) {
  supabaseClient.removeChannel(channel);
}

export async function getPendingReservationsCount() {
  const { count, error } = await supabaseClient
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getRestaurantReservations(restaurantId: string): Promise<ReservationWithRestaurant[]> {
  const { data, error } = await supabaseClient
    .from('reservations')
    .select(`
      *,
      user:users!reservations_user_id_fkey (
        id,
        first_name,
        last_name,
        email
      ),
      restaurant:restaurants!reservations_restaurant_id_fkey (
        id,
        name,
        address,
        phone,
        email
      )
    `)
    .eq('restaurant_id', restaurantId)
    .order('reservation_date', { ascending: false })
    .order('reservation_time', { ascending: false });

  if (error) {
    console.error('Error fetching restaurant reservations:', error);
    throw error;
  }

  return data?.map((row) => ({
    id: row.id,
    userId: row.user_id,
    restaurantId: row.restaurant_id,
    reservationDate: row.reservation_date,
    reservationTime: row.reservation_time,
    guestsCount: row.guests_count,
    status: row.status as ReservationStatus,
    specialRequest: row.special_request,
    reasonCancellation: row.reason_cancellation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: row.user ? {
      id: row.user.id,
      firstName: row.user.first_name,
      lastName: row.user.last_name,
      email: row.user.email,
    } : undefined,
    restaurant: row.restaurant ? {
      id: row.restaurant.id,
      name: row.restaurant.name,
      address: row.restaurant.address,
      phone: row.restaurant.phone,
      email: row.restaurant.email,
    } : undefined,
  })) || [];
}
