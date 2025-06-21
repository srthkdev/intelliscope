'use client';

import { useParams } from 'next/navigation';
import { InvestigationDetail } from '@/components/investigation/investigation-detail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppSidebar } from '@/components/app-sidebar';

export default function InvestigationDetailPage({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const investigationId = params.id as string;

  return (
    <ProtectedRoute>
      <AppSidebar>
        <div className="container py-8">
          <InvestigationDetail investigationId={investigationId} />
        </div>
      </AppSidebar>
    </ProtectedRoute>
  );
}