import { create } from 'zustand';

interface AuthState {
  user: any;
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
        set({ user: data.session, loading: false });
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
        set({ user: data.user, loading: false });
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
      const user = await account.get();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  }
})); 