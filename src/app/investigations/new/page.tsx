import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppSidebar } from '@/components/app-sidebar';
import { InvestigationForm } from '@/components/investigation/investigation-form';

export default function NewInvestigationPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppSidebar>
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-6">New Investigation</h1>
          <InvestigationForm />
        </div>
      </AppSidebar>
    </ProtectedRoute>
  );
}