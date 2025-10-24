// Constantes de la aplicación
export const USER_TYPES = {
  CLIENT: 'client',
  RESTAURANT: 'restaurant',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
} as const;

export const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Restaurantes
  RESTAURANTS: '/restaurants',
  RESTAURANT_DETAIL: '/restaurants/:id',
  
  // Menú
  MENU_ITEMS: '/menu-items',
  MENU_CATEGORIES: '/menu-categories',
  
  // Pedidos
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  
  // Reservas
  RESERVATIONS: '/reservations',
  RESERVATION_DETAIL: '/reservations/:id',
  
  // Inventario
  INVENTORY: '/inventory',
  INVENTORY_ITEMS: '/inventory/items',
  
  // Reports
  REPORTS: '/reports',
  
  // ML
  PREDICTIONS: '/predictions',
  MODELS: '/models',
} as const;

export const ROUTES = {
  // Cliente
  HOME: '/',
  RESTAURANTS: '/restaurants',
  RESTAURANT_DETAIL: '/restaurant/:id',
  MENU: '/restaurant/:id/menu',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_TRACKING: '/order/:id',
  RESERVATIONS: '/reservations',
  ACCOUNT: '/account',
  CLIENT_ONBOARDING: '/client/onboarding',
  
  // Autenticación
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Restaurante
  RESTAURANT_DASHBOARD: '/restaurant/dashboard',
  RESTAURANT_ONBOARDING: '/restaurant/onboarding',
  RESTAURANT_MENU: '/restaurant/menu',
  RESTAURANT_ORDERS: '/restaurant/orders',
  RESTAURANT_RESERVATIONS: '/restaurant/reservations',
  RESTAURANT_INVENTORY: '/restaurant/inventory',
  RESTAURANT_PREDICTIONS: '/restaurant/predictions',
  RESTAURANT_ANALYTICS: '/restaurant/analytics',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_RESTAURANTS: '/admin/restaurants',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_ML: '/admin/ml',
  ADMIN_RESERVATIONS: '/admin/reservations',
} as const;

export const APP_CONFIG = {
  name: 'FoodAI',
  version: '1.0.0',
  description: 'Plataforma inteligente para restaurantes',
  apiUrl: 'http://localhost:3000/api',
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

export const STORAGE_KEYS = {
  USER_TOKEN: 'foodai_user_token',
  USER_DATA: 'foodai_user_data',
  USER_TYPE: 'userType',
  SUPABASE_PENDING_ROLE: 'supabasePendingRole',
  SUPABASE_POST_AUTH_ROUTE: 'supabasePostAuthRoute',
  CART: 'cart',
  CART_RESTAURANT_ID: 'cartRestaurantId',
  THEME: 'foodai_theme',
} as const;
