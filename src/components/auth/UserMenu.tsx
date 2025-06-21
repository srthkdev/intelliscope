'use client';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export function UserMenu() {
  const { user, logout, loading } = useAuthStore();
  if (!user) return null;
  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
  };
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">{user.email}</span>
      {user.userData?.name && (
        <span className="text-sm font-medium">{user.userData.name}</span>
      )}
      <button 
        onClick={handleLogout} 
        className="btn btn-outline btn-sm" 
        disabled={loading}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}