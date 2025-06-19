'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkSession } = useAuthStore();
  useEffect(() => {
    checkSession();
  }, [checkSession]);
  return <>{children}</>;
} 