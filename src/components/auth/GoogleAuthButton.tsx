import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function GoogleAuthButton() {
  const { loading } = useAuthStore();
  const router = useRouter();

  const handleGoogleAuth = async () => {
    try {
      router.push('/api/auth/google');
    } catch (error: any) {
      toast.error(error.message || 'Failed to authenticate with Google');
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleAuth}
      disabled={loading}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-google"
      >
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        <path d="M17.5 12h-11" />
        <path d="M12 6.5v11" />
      </svg>
      {loading ? 'Authenticating...' : 'Continue with Google'}
    </Button>
  );
}