import { create } from 'zustand';
import { User, Session } from '@/types/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Combine user data with session
        const user = {
          ...data.user,
          userData: null // Will be populated by checkSession
        };
        set({ user, loading: false });
        // Trigger checkSession to get additional user data from database
        await useAuthStore.getState().checkSession();
      } else {
        set({ error: data.error, loading: false });
      }
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Combine user data with session
        const user = {
          ...data.user,
          userData: {
            id: '', // Will be populated by checkSession
            user_id: data.user.$id,
            name,
            email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            auth_provider: 'email'
          }
        };
        set({ user, loading: false });
        // Trigger checkSession to get complete user data from database
        await useAuthStore.getState().checkSession();
      } else {
        set({ error: data.error, loading: false });
      }
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      const { account } = await import('@/lib/services/appwrite/client');
      await account.deleteSession('current');
      set({ user: null, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  checkSession: async () => {
    set({ loading: true });
    try {
      const { account } = await import('@/lib/services/appwrite/client');
      const { getUserByAppwriteId } = await import('@/lib/services/appwrite/database');
      
      // Get the Appwrite account
      const appwriteUser = await account.get();
      
      // Get additional user data from database if it exists
      const userData = await getUserByAppwriteId(appwriteUser.$id);
      
      // Combine Appwrite user with database user data
      const user = {
        ...appwriteUser,
        userData: userData ? {
          id: userData.$id,
          user_id: userData.user_id,
          name: userData.name,
          email: userData.email,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          auth_provider: userData.auth_provider,
          profile_image: userData.profile_image,
          preferences: userData.preferences
        } : null
      } as User;
      
      set({ user, loading: false });
    } catch (error) {
      console.error('Session check error:', error);
      set({ user: null, loading: false });
    }
  }
}));