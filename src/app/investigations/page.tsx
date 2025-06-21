import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppSidebar } from '@/components/app-sidebar';
import { InvestigationList } from '@/components/investigation/investigation-list';

export default function InvestigationsPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppSidebar>
        <div className="container py-8">
          <InvestigationList />
        </div>
      </AppSidebar>
    </ProtectedRoute>
  );
}