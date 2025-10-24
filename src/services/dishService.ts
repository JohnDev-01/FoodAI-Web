import { supabaseClient } from './supabaseClient';
import type { Dish, CreateDishInput, UpdateDishInput, DishImage } from '../types';

// Obtener platos de un restaurante (solo disponibles)
export async function getDishesByRestaurant(restaurantId: string): Promise<Dish[]> {
  const { data, error } = await supabaseClient
    .from('dishes')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching dishes:', error);
    throw error;
  }

  return data?.map((row) => ({
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    imageUrl: row.image_url,
    isAvailable: row.is_available,
    ingredients: row.ingredients || [],
    allergens: row.allergens || [],
    preparationTime: row.preparation_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) || [];
}

// Obtener todos los platos de un restaurante (incluyendo no disponibles) - para administración
export async function getAllDishesByRestaurant(restaurantId: string): Promise<Dish[]> {
  const { data, error } = await supabaseClient
    .from('dishes')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching all dishes:', error);
    throw error;
  }

  return data?.map((row) => ({
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    imageUrl: row.image_url,
    isAvailable: row.is_available,
    ingredients: row.ingredients || [],
    allergens: row.allergens || [],
    preparationTime: row.preparation_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) || [];
}

// Obtener imágenes de platos
export async function getDishImages(dishId: string): Promise<DishImage[]> {
  const { data, error } = await supabaseClient
    .from('dish_images')
    .select('*')
    .eq('dish_id', dishId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching dish images:', error);
    throw error;
  }

  return data?.map((row) => ({
    id: row.id,
    dishId: row.dish_id,
    imageUrl: row.image_url,
    altText: row.alt_text,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  })) || [];
}

// Obtener todas las imágenes de platos de un restaurante
export async function getRestaurantDishImages(restaurantId: string): Promise<DishImage[]> {
  const { data, error } = await supabaseClient
    .from('dish_images')
    .select(`
      *,
      dish:dishes!dish_images_dish_id_fkey (
        restaurant_id
      )
    `)
    .eq('dish.restaurant_id', restaurantId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching restaurant dish images:', error);
    throw error;
  }

  return data?.map((row) => ({
    id: row.id,
    dishId: row.dish_id,
    imageUrl: row.image_url,
    altText: row.alt_text,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  })) || [];
}

// Crear plato
export async function createDish(restaurantId: string, dishData: CreateDishInput): Promise<Dish> {
  const { data, error } = await supabaseClient
    .from('dishes')
    .insert({
      restaurant_id: restaurantId,
      name: dishData.name,
      description: dishData.description,
      price: dishData.price,
      category: dishData.category,
      image_url: dishData.imageUrl,
      is_available: dishData.isAvailable ?? true,
      ingredients: dishData.ingredients || [],
      allergens: dishData.allergens || [],
      preparation_time: dishData.preparationTime,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating dish:', error);
    throw error;
  }

  return {
    id: data.id,
    restaurantId: data.restaurant_id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    imageUrl: data.image_url,
    isAvailable: data.is_available,
    ingredients: data.ingredients || [],
    allergens: data.allergens || [],
    preparationTime: data.preparation_time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Actualizar plato
export async function updateDish(dishId: string, dishData: UpdateDishInput): Promise<Dish> {
  const { data, error } = await supabaseClient
    .from('dishes')
    .update({
      name: dishData.name,
      description: dishData.description,
      price: dishData.price,
      category: dishData.category,
      image_url: dishData.imageUrl,
      is_available: dishData.isAvailable,
      ingredients: dishData.ingredients,
      allergens: dishData.allergens,
      preparation_time: dishData.preparationTime,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dishId)
    .select()
    .single();

  if (error) {
    console.error('Error updating dish:', error);
    throw error;
  }

  return {
    id: data.id,
    restaurantId: data.restaurant_id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    imageUrl: data.image_url,
    isAvailable: data.is_available,
    ingredients: data.ingredients || [],
    allergens: data.allergens || [],
    preparationTime: data.preparation_time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Eliminar plato
export async function deleteDish(dishId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('dishes')
    .delete()
    .eq('id', dishId);

  if (error) {
    console.error('Error deleting dish:', error);
    throw error;
  }
}
