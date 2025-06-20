'use client';

import { useParams } from 'next/navigation';
import { InvestigationDetail } from '@/components/investigation/investigation-detail';

export default function InvestigationDetailPage() {
  const params = useParams();
  const investigationId = params.id as string;

  return (
    <div className="container py-8">
      <InvestigationDetail investigationId={investigationId} />
    </div>
  );
}