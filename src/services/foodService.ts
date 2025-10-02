import { apiService } from './api';
import type { MenuItem, PaginatedResponse } from '../types';

export class FoodService {
  // Food Items
  async getFoodItems(params?: any) {
    return apiService.getPaginated<MenuItem>('/food-items', params);
  }

  async getFoodItemById(id: string) {
    return apiService.get<MenuItem>(`/food-items/${id}`);
  }

  async createFoodItem(data: Partial<MenuItem>) {
    return apiService.post<MenuItem>('/food-items', data);
  }

  async updateFoodItem(id: string, data: Partial<MenuItem>) {
    return apiService.put<MenuItem>(`/food-items/${id}`, data);
  }

  async deleteFoodItem(id: string) {
    return apiService.delete(`/food-items/${id}`);
  }

  async searchFoodItems(query: string, filters?: any) {
    return apiService.getPaginated<MenuItem>('/food-items/search', {
      query,
      ...filters,
    });
  }
}

export const foodService = new FoodService();
export default foodService;