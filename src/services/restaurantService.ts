import { supabaseClient } from './supabaseClient';
import type { Restaurant, RestaurantStatus } from '../types';

interface RestaurantDbRow {
  id: string;
  owner_id: string;
  name: string;
  email: string;
  phone: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  cuisine_type: string | null;
  open_time: string | null;
  close_time: string | null;
  logo_url: string | null;
  rating: number | null;
  status: RestaurantStatus;
  created_at: string;
  updated_at: string;
}

const mapToRestaurant = (row: RestaurantDbRow): Restaurant => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  description: row.description,
  address: row.address,
  city: row.city,
  country: row.country,
  cuisine: row.cuisine_type ?? undefined,
  cuisineType: row.cuisine_type,
  openTime: row.open_time,
  closeTime: row.close_time,
  logoUrl: row.logo_url,
  rating: row.rating,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function getRestaurantByOwnerId(ownerId: string) {
  if (!ownerId) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('restaurants')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapToRestaurant(data as RestaurantDbRow) : null;
}

export interface RestaurantUpsertInput {
  ownerId: string;
  name: string;
  email: string;
  phone?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  cuisineType?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  logoUrl?: string | null;
  status?: RestaurantStatus;
}

export async function upsertRestaurant(input: RestaurantUpsertInput) {
  const payload = {
    owner_id: input.ownerId,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    description: input.description ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    country: input.country ?? null,
    cuisine_type: input.cuisineType ?? null,
    open_time: input.openTime ?? null,
    close_time: input.closeTime ?? null,
    logo_url: input.logoUrl ?? null,
    status: input.status ?? 'pending',
  };

  const existing = await getRestaurantByOwnerId(input.ownerId);

  if (existing) {
    const { data, error } = await supabaseClient
      .from('restaurants')
      .update(payload)
      .eq('owner_id', input.ownerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapToRestaurant(data as RestaurantDbRow);
  }

  const { data, error } = await supabaseClient
    .from('restaurants')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapToRestaurant(data as RestaurantDbRow);
}
