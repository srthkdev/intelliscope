import { InvestigationForm } from '@/components/investigation/investigation-form';

export default function NewInvestigationPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">New Investigation</h1>
      <InvestigationForm />
    </div>
  );
}