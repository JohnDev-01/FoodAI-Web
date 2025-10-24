import { supabaseClient } from './supabaseClient';
import type { 
  Restaurant, 
  RestaurantStatus, 
  CreateRestaurantInput, 
  UpdateRestaurantInput,
  RestaurantSearchOptions,
  RestaurantSearchResult,
  RestaurantWithStats
} from '../types';

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

// Create a new restaurant
export async function createRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {
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

// Update an existing restaurant
export async function updateRestaurant(restaurantId: string, input: UpdateRestaurantInput): Promise<Restaurant> {
  const payload: Record<string, unknown> = {};
  
  if (input.name !== undefined) payload.name = input.name;
  if (input.email !== undefined) payload.email = input.email;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.description !== undefined) payload.description = input.description;
  if (input.address !== undefined) payload.address = input.address;
  if (input.city !== undefined) payload.city = input.city;
  if (input.country !== undefined) payload.country = input.country;
  if (input.cuisineType !== undefined) payload.cuisine_type = input.cuisineType;
  if (input.openTime !== undefined) payload.open_time = input.openTime;
  if (input.closeTime !== undefined) payload.close_time = input.closeTime;
  if (input.logoUrl !== undefined) payload.logo_url = input.logoUrl;
  if (input.status !== undefined) payload.status = input.status;
  if (input.rating !== undefined) payload.rating = input.rating;

  const { data, error } = await supabaseClient
    .from('restaurants')
    .update(payload)
    .eq('id', restaurantId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapToRestaurant(data as RestaurantDbRow);
}

// Get restaurant by ID
export async function getRestaurantById(restaurantId: string): Promise<Restaurant | null> {
  if (!restaurantId) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapToRestaurant(data as RestaurantDbRow) : null;
}

// Delete restaurant
export async function deleteRestaurant(restaurantId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('restaurants')
    .delete()
    .eq('id', restaurantId);

  if (error) {
    throw error;
  }
}

// Get all restaurants (admin only)
export async function getAllRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabaseClient
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as RestaurantDbRow[]).map(mapToRestaurant);
}

// Legacy function for backward compatibility
export async function upsertRestaurant(input: CreateRestaurantInput) {
  const existing = await getRestaurantByOwnerId(input.ownerId);
  
  if (existing) {
    return updateRestaurant(existing.id, input);
  } else {
    return createRestaurant(input);
  }
}

export async function listActiveRestaurants() {
  const { data, error } = await supabaseClient
    .from('restaurants')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data as RestaurantDbRow[]).map(mapToRestaurant);
}

export async function searchRestaurants({
  search,
  page = 1,
  pageSize = 6,
  status = 'active',
  city,
  cuisineType,
  sortBy = 'name',
  sortOrder = 'asc',
}: RestaurantSearchOptions = {}): Promise<RestaurantSearchResult> {
  const currentPage = Math.max(1, page);
  const effectivePageSize = Math.max(1, pageSize);
  const from = (currentPage - 1) * effectivePageSize;
  const to = from + effectivePageSize - 1;

  let query = supabaseClient
    .from('restaurants')
    .select('*', { count: 'exact' });

  // Apply filters
  if (status !== 'all') {
    query = query.eq('status', status ?? 'active');
  }

  if (search && search.trim().length > 0) {
    const normalized = `%${search.trim()}%`;
    query = query.or(`name.ilike.${normalized},description.ilike.${normalized},cuisine_type.ilike.${normalized}`);
  }

  if (city && city.trim().length > 0) {
    query = query.ilike('city', `%${city.trim()}%`);
  }

  if (cuisineType && cuisineType.trim().length > 0) {
    query = query.eq('cuisine_type', cuisineType.trim());
  }

  // Apply sorting
  const sortColumn = sortBy === 'created_at' ? 'created_at' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  const total = count ?? 0;
  const items = ((data ?? []) as RestaurantDbRow[]).map(mapToRestaurant);
  const hasMore = total > 0 ? to + 1 < total : items.length === effectivePageSize;

  return {
    items,
    total,
    page: currentPage,
    pageSize: effectivePageSize,
    hasMore,
  };
}

// Get available cuisine types
export async function getCuisineTypes(): Promise<string[]> {
  const { data, error } = await supabaseClient
    .from('restaurants')
    .select('cuisine_type')
    .not('cuisine_type', 'is', null)
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  const cuisineTypes = new Set<string>();
  data?.forEach(row => {
    if (row.cuisine_type) {
      cuisineTypes.add(row.cuisine_type);
    }
  });

  return Array.from(cuisineTypes).sort();
}

// Get available cities
export async function getCities(): Promise<string[]> {
  const { data, error } = await supabaseClient
    .from('restaurants')
    .select('city')
    .not('city', 'is', null)
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  const cities = new Set<string>();
  data?.forEach(row => {
    if (row.city) {
      cities.add(row.city);
    }
  });

  return Array.from(cities).sort();
}

// Check if restaurant is currently open
export function isRestaurantOpen(restaurant: Restaurant): boolean {
  if (!restaurant.openTime || !restaurant.closeTime) {
    return false;
  }

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  return currentTime >= restaurant.openTime && currentTime <= restaurant.closeTime;
}

// Get restaurant with additional stats
export async function getRestaurantWithStats(restaurantId: string): Promise<RestaurantWithStats | null> {
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    return null;
  }

  // Get reservation count
  const { count: reservationCount } = await supabaseClient
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId);

  // Get average rating (if you have a reviews table)
  // const { data: reviews } = await supabaseClient
  //   .from('reviews')
  //   .select('rating')
  //   .eq('restaurant_id', restaurantId);

  // const averageRating = reviews?.length 
  //   ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
  //   : null;

  return {
    ...restaurant,
    totalReservations: reservationCount ?? 0,
    isOpen: isRestaurantOpen(restaurant),
    // averageRating,
  };
}
