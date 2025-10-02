import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import type { CartItem, MenuItem, CartContextType } from '../types';
import { STORAGE_KEYS } from '../constants';

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    const savedRestaurantId = localStorage.getItem(STORAGE_KEYS.CART_RESTAURANT_ID);
    
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    if (savedRestaurantId) {
      setRestaurantId(savedRestaurantId);
    }
  }, []);

  useEffect(() => {
    // Guardar carrito en localStorage
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    if (restaurantId) {
      localStorage.setItem(STORAGE_KEYS.CART_RESTAURANT_ID, restaurantId);
    }
  }, [items, restaurantId]);

  const addItem = (item: MenuItem, newRestaurantId: string) => {
    // Si es un restaurante diferente, limpiar el carrito
    if (newRestaurantId !== restaurantId && items.length > 0) {
      setItems([]);
      toast('Carrito actualizado para el nuevo restaurante');
    }

    setRestaurantId(newRestaurantId);

    const existingItem = items.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setItems(items.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setItems([...items, { 
        id: item.id,
        menuItem: item, 
        quantity: 1 
      }]);
    }
    
    toast.success(`${item.name} agregado al carrito`);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    toast.success('Item removido del carrito');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.CART_RESTAURANT_ID);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const getItemQuantity = (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const isInCart = (itemId: string) => {
    return items.some(item => item.id === itemId);
  };

  const value: CartContextType = {
    items,
    restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
}



