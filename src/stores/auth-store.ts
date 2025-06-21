import { create } from 'zustand';
import { User, Session } from '@/types/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean; // Track if initial check is done
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,
  
  clearError: () => set({ error: null }),
  
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for cookies
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // After successful login, check session to get complete user data
        await get().checkSession();
      } else {
        set({ error: data.error || 'Login failed', loading: false });
      }
    } catch (e: any) {
      console.error('Login error:', e);
      set({ error: e.message || 'Login failed', loading: false });
    }
  },
  
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include' // Important for cookies
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // After successful registration, check session to get complete user data
        await get().checkSession();
      } else {
        set({ error: data.error || 'Registration failed', loading: false });
      }
    } catch (e: any) {
      console.error('Registration error:', e);
      set({ error: e.message || 'Registration failed', loading: false });
    }
  },
  
  logout: async () => {
    set({ loading: true, error: null });
    try {
      // Call logout API endpoint instead of direct client call
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (res.ok) {
        set({ user: null, loading: false, initialized: true });
      } else {
        throw new Error('Logout failed');
      }
    } catch (e: any) {
      console.error('Logout error:', e);
      set({ error: e.message || 'Logout failed', loading: false });
    }
  },
  
  checkSession: async () => {
    const { initialized } = get();
    
    // Only show loading on initial check, not subsequent ones
    if (!initialized) {
      set({ loading: true });
    }
    
    try {
      const res = await fetch('/api/auth/session', {
        credentials: 'include' // Important for cookies
      });
      
      if (res.ok) {
        const { user: appwriteUser, userData } = await res.json();
        
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
        
        set({ 
          user, 
          loading: false, 
          initialized: true, 
          error: null 
        });
      } else if (res.status === 401) {
        // 401 is expected when there's no active session
        set({ 
          user: null, 
          loading: false, 
          initialized: true, 
          error: null 
        });
      } else {
        // Other errors (500, etc.)
        throw new Error(`Session check failed: ${res.status}`);
      }
    } catch (error) {
      console.error('Session check error:', error);
      set({ 
        user: null, 
        loading: false, 
        initialized: true,
        error: initialized ? 'Session check failed' : null // Only show error after initial load
      });
    }
  }
}));