import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'react-hot-toast';
import type {
  AuthActionResult,
  AuthContextType,
  RestaurantProfilePayload,
  RestaurantSignupPayload,
  User,
  UserProfile,
  UserRole,
} from '../types';
import { ROUTES, STORAGE_KEYS } from '../constants';
import { supabaseClient } from '../services/supabaseClient';
import { getUserProfileByAuthId, upsertUserProfile } from '../services/userProfileService';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const buildUserFromSources = (
  profile: UserProfile | null,
  authUser: SupabaseAuthUser | null
): User | null => {
  if (!authUser && !profile) {
    return null;
  }

  const email = profile?.email ?? authUser?.email ?? '';
  const metadata = (authUser?.user_metadata ?? {}) as Record<string, any>;
  const metadataFullName = (metadata.full_name as string | undefined) ?? '';

  const derivedFirstName =
    profile?.firstName ??
    (metadata.first_name as string | undefined) ??
    (metadata.given_name as string | undefined) ??
    metadataFullName.split(' ')[0] ??
    '';

  const derivedLastName =
    profile?.lastName ??
    (metadata.last_name as string | undefined) ??
    (metadata.family_name as string | undefined) ??
    metadataFullName.split(' ').slice(1).join(' ') ??
    '';

  const fullNameCandidate = `${derivedFirstName} ${derivedLastName}`.trim();
  const fullName = fullNameCandidate.length > 0 ? fullNameCandidate : metadataFullName || email;

  const role = profile?.role ?? (metadata.role as UserRole | undefined) ?? null;
  const status = profile?.status ?? 'pending';

  return {
    id: profile?.id ?? authUser?.id ?? email,
    authId: authUser?.id ?? profile?.authId ?? '',
    email,
    firstName: derivedFirstName,
    lastName: derivedLastName,
    fullName,
    name: fullName,
    role,
    status,
    profileImage: profile?.profileImage ?? (metadata.avatar_url as string | undefined) ?? null,
    phone: null,
    createdAt: profile?.createdAt ?? authUser?.created_at,
    updatedAt:
      profile?.updatedAt ??
      profile?.createdAt ??
      authUser?.updated_at ??
      authUser?.created_at ??
      undefined,
  };
};

const persistUserLocally = (user: User | null) => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_TYPE);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  if (user.role) {
    localStorage.setItem(STORAGE_KEYS.USER_TYPE, user.role);
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [sessionUser, setSessionUser] = useState<SupabaseAuthUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialising, setInitialising] = useState<boolean>(true);

  const handleSessionChange = useCallback(
    async (authUser: SupabaseAuthUser | null) => {
      setSessionUser(authUser);

      if (!authUser) {
        setUser(null);
        persistUserLocally(null);
        return;
      }

      try {
        const profile = await getUserProfileByAuthId(authUser.id);
        const mappedUser = profile ? buildUserFromSources(profile, authUser) : null;
        setUser(mappedUser);
        persistUserLocally(mappedUser);
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        const mappedUser = buildUserFromSources(null, authUser);
        setUser(mappedUser);
        persistUserLocally(mappedUser);
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const initialise = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        if (!isMounted) return;

        const currentUser = data.session?.user ?? null;
        await handleSessionChange(currentUser);
      } catch (error) {
        console.error('Error inicializando la sesión:', error);
      } finally {
        if (isMounted) {
          setInitialising(false);
        }
      }
    };

    initialise();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        await handleSessionChange(session?.user ?? null);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  const refreshProfile = useCallback(async () => {
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        throw error;
      }

      const currentUser = data.session?.user ?? null;
      await handleSessionChange(currentUser);
    } catch (error) {
      console.error('Error al refrescar la sesión:', error);
    }
  }, [handleSessionChange]);

  const login = useCallback<AuthContextType['login']>(
    async (email, password) => {
      setLoading(true);
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        const authUser = data.user ?? null;
        await handleSessionChange(authUser);

        let profile: UserProfile | null = null;
        if (authUser) {
          try {
            profile = await getUserProfileByAuthId(authUser.id);
          } catch {
            profile = null;
          }
        }

        const mappedUser = buildUserFromSources(profile, authUser);
        const needsProfile = !profile;

        if (needsProfile) {
          localStorage.setItem(STORAGE_KEYS.SUPABASE_POST_AUTH_ROUTE, ROUTES.RESTAURANT_ONBOARDING);
        }

        toast.success('Inicio de sesión exitoso');
        return {
          success: true,
          user: mappedUser,
          needsProfile,
        };
      } catch (error) {
        const message = (error as Error).message ?? 'Error desconocido';
        toast.error('No se pudo iniciar sesión');
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [handleSessionChange]
  );

  const loginWithGoogle = useCallback<AuthContextType['loginWithGoogle']>(
    async (role) => {
      try {
        setLoading(true);
        if (role) {
          localStorage.setItem(STORAGE_KEYS.SUPABASE_PENDING_ROLE, role);
        }
        localStorage.setItem(
          STORAGE_KEYS.SUPABASE_POST_AUTH_ROUTE,
          role === 'restaurant' ? ROUTES.RESTAURANT_ONBOARDING : ROUTES.HOME
        );

        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            scopes: 'email profile',
          },
        });

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error al iniciar sesión con Google:', error);
        toast.error('No se pudo autenticar con Google');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signUpRestaurant = useCallback<AuthContextType['signUpRestaurant']>(
    async ({ email, password }) => {
      setLoading(true);
      try {
        localStorage.setItem(STORAGE_KEYS.SUPABASE_PENDING_ROLE, 'restaurant');
        localStorage.setItem(STORAGE_KEYS.SUPABASE_POST_AUTH_ROUTE, ROUTES.RESTAURANT_ONBOARDING);

        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'restaurant' },
            emailRedirectTo: `${window.location.origin}${ROUTES.RESTAURANT_ONBOARDING}`,
          },
        });

        if (error) {
          throw error;
        }

        const authUser = data.user ?? null;
        await handleSessionChange(authUser);

        toast.success('Cuenta creada. Completa tu perfil para continuar.');

        return {
          success: true,
          user: buildUserFromSources(null, authUser),
          needsProfile: true,
        };
      } catch (error) {
        const message = (error as Error).message ?? 'Error desconocido';
        toast.error('No se pudo crear la cuenta de restaurante');
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [handleSessionChange]
  );

  const completeRestaurantProfile = useCallback<
    AuthContextType['completeRestaurantProfile']
  >(
    async ({ firstName, lastName, profileImage }) => {
      if (!sessionUser || !sessionUser.email) {
        return { success: false, error: 'No hay sesión activa' };
      }

      setLoading(true);

      try {
        const profile = await upsertUserProfile({
          authId: sessionUser.id,
          email: sessionUser.email,
          firstName,
          lastName,
          role: 'restaurant',
          profileImage: profileImage ?? null,
          status: 'active',
        });

        await handleSessionChange(sessionUser);

        toast.success('Perfil de restaurante completado');

        return {
          success: true,
          user: buildUserFromSources(profile, sessionUser),
          needsProfile: false,
        };
      } catch (error) {
        const message = (error as Error).message ?? 'Error desconocido';
        toast.error('No se pudo completar el perfil');
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [handleSessionChange, sessionUser]
  );

  const updateProfile = useCallback<AuthContextType['updateProfile']>(
    async (data) => {
      if (!sessionUser || !sessionUser.email) {
        throw new Error('No hay sesión activa');
      }

      const merged: RestaurantProfilePayload = {
        firstName: data.firstName ?? user?.firstName ?? '',
        lastName: data.lastName ?? user?.lastName ?? '',
        profileImage: data.profileImage ?? user?.profileImage ?? null,
      };

      await upsertUserProfile({
        authId: sessionUser.id,
        email: data.email ?? sessionUser.email,
        firstName: merged.firstName,
        lastName: merged.lastName,
        role: (data.role ?? user?.role ?? 'client') as UserRole,
        profileImage: merged.profileImage ?? null,
        status: data.status ?? user?.status ?? 'pending',
      });

      await handleSessionChange(sessionUser);
      toast.success('Perfil actualizado');
    },
    [handleSessionChange, sessionUser, user]
  );

  const logout = useCallback<AuthContextType['logout']>(async () => {
    await supabaseClient.auth.signOut();
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_PENDING_ROLE);
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_POST_AUTH_ROUTE);
    await handleSessionChange(null);
    toast.success('Sesión cerrada correctamente');
  }, [handleSessionChange]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      sessionUser,
      loading,
      initialising,
      login,
      loginWithGoogle,
      signUpRestaurant,
      completeRestaurantProfile,
      updateProfile,
      refreshProfile,
      logout,
      isClient: () => user?.role === 'client',
      isRestaurant: () => user?.role === 'restaurant',
      isAdmin: () => user?.role === 'admin',
    }),
    [
      completeRestaurantProfile,
      initialising,
      login,
      loginWithGoogle,
      logout,
      refreshProfile,
      sessionUser,
      signUpRestaurant,
      updateProfile,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
