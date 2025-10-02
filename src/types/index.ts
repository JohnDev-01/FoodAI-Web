// User types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserType = 'client' | 'restaurant' | 'admin';

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  isActive: boolean;
  ownerId: string;
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
  userType: UserType | null;
  loading: boolean;
  login: (email: string, password: string, type?: UserType) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (formData: RegisterForm) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
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
