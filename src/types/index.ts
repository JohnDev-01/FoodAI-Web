import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

export type UserRole = 'client' | 'restaurant' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type UserType = UserRole;

// User types
export interface UserProfile {
  id: string;
  authId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profileImage?: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  authId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  name: string;
  role: UserRole | null;
  status: UserStatus;
  profileImage?: string | null;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Restaurant types
export type RestaurantStatus = 'active' | 'suspended' | 'pending';

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  cuisine?: string | null;
  cuisineType?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  logoUrl?: string | null;
  rating?: number | null;
  status: RestaurantStatus;
  imageUrl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Menu types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  restaurantId: string;
  items: MenuItem[];
}

// Order types
export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

// Reservation types
export interface Reservation {
  id: string;
  userId: string;
  restaurantId: string;
  date: string;
  time: string;
  partySize: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationWithRestaurant extends Reservation {
  restaurantName?: string | null;
  restaurantLogo?: string | null;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Cart types
export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

// Analytics types
export interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  period: string;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  userType: UserType;
}

export interface RestaurantSignupPayload {
  email: string;
  password: string;
}

export interface ClientSignupPayload {
  email: string;
  password: string;
}

export interface RestaurantProfilePayload {
  firstName: string;
  lastName: string;
  profileImage?: string | null;
}

export type ClientProfilePayload = RestaurantProfilePayload;

export interface AuthActionResult {
  success: boolean;
  user?: User | null;
  needsProfile?: boolean;
  error?: string;
  message?: string;
}

export interface RestaurantForm {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string;
  imageUrl?: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  sessionUser: SupabaseAuthUser | null;
  loading: boolean;
  initialising: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  signUpClient: (payload: ClientSignupPayload) => Promise<AuthActionResult>;
  signUpRestaurant: (payload: RestaurantSignupPayload) => Promise<AuthActionResult>;
  completeClientProfile: (payload: ClientProfilePayload) => Promise<AuthActionResult>;
  completeRestaurantProfile: (payload: RestaurantProfilePayload) => Promise<AuthActionResult>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  isClient: () => boolean;
  isRestaurant: () => boolean;
  isAdmin: () => boolean;
}

export interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: MenuItem, restaurantId: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemQuantity: (itemId: string) => number;
  isInCart: (itemId: string) => boolean;
}

// Socket types
export interface SocketContextType {
  socket: any;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Theme types
export interface Theme {
  palette: {
    primary: {
      main: string;
      light: string;
      dark: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
    };
    background: {
      default: string;
      paper: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
  };
  typography: {
    fontFamily: string;
    h1: any;
    h2: any;
    h3: any;
    h4: any;
    h5: any;
    h6: any;
    body1: any;
    body2: any;
  };
  spacing: (value: number) => string;
  breakpoints: {
    up: (key: string) => string;
    down: (key: string) => string;
  };
}
