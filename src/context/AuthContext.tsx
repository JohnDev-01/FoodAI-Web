import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import type { User, UserType, AuthContextType, RegisterForm } from '../types';
import { STORAGE_KEYS } from '../constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario logueado en localStorage
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const storedUserType = localStorage.getItem(STORAGE_KEYS.USER_TYPE);
    
    if (storedUser && storedUserType) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType as UserType);
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, type: UserType = 'client') => {
    try {
      setLoading(true);
      
      // Simulación de login - en producción esto sería una llamada a la API
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        phone: '',
        avatar: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simular diferentes tipos de usuario
      if (type === 'restaurant') {
        (mockUser as any).restaurantId = Math.random().toString(36).substr(2, 9);
        (mockUser as any).restaurantName = 'Mi Restaurante';
      }

      setUser(mockUser);
      setUserType(type);
      
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser));
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, type);
      
      toast.success(`Bienvenido ${mockUser.name}!`);
      return { success: true, user: mockUser };
    } catch (error) {
      toast.error('Error al iniciar sesión');
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterForm) => {
    try {
      setLoading(true);
      
      // Simulación de registro
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        name: userData.name,
        phone: userData.phone || '',
        avatar: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(newUser);
      setUserType(userData.userType);
      
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, userData.userType);
      
      toast.success('Registro exitoso!');
      return { success: true, user: newUser };
    } catch (error) {
      toast.error('Error al registrarse');
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_TYPE);
    toast.success('Sesión cerrada');
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        toast.success('Perfil actualizado');
      }
    } catch (error) {
      toast.error('Error al actualizar perfil');
      throw error;
    }
  };

  const isClient = () => userType === 'client';
  const isRestaurant = () => userType === 'restaurant';
  const isAdmin = () => userType === 'admin';

  const value: AuthContextType = {
    user,
    userType,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isClient,
    isRestaurant,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
