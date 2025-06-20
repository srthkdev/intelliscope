'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAgentStore } from '@/stores/agent-store';
import { Investigation } from '@/types/investigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, FileText } from 'lucide-react';

export function InvestigationList() {
  const { getAllInvestigations, investigations, isLoading, error } = useAgentStore();
  const router = useRouter();

  useEffect(() => {
    getAllInvestigations();
  }, [getAllInvestigations]);

  const handleNewInvestigation = () => {
    router.push('/investigations/new');
  };

  const handleViewInvestigation = (id: string) => {
    router.push(`/investigations/${id}`);
  };

  if (isLoading && investigations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading investigations...</span>
      </div>
    );
  }

  if (error && investigations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button onClick={getAllInvestigations}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Investigations</h1>
        <Button onClick={handleNewInvestigation}>
          <Plus className="h-4 w-4 mr-2" />
          New Investigation
        </Button>
      </div>

      {investigations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No investigations yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Start your first investigation to begin gathering insights and findings.
          </p>
          <Button onClick={handleNewInvestigation}>
            <Plus className="h-4 w-4 mr-2" />
            Start New Investigation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investigations.map((investigation) => (
            <InvestigationCard 
              key={investigation.id} 
              investigation={investigation} 
              onView={handleViewInvestigation}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface InvestigationCardProps {
  investigation: Investigation;
  onView: (id: string) => void;
}

function InvestigationCard({ investigation, onView }: InvestigationCardProps) {
  const statusColor = {
    'active': 'bg-blue-500',
    'completed': 'bg-green-500',
    'draft': 'bg-yellow-500',
    'archived': 'bg-gray-500'
  }[investigation.status] || 'bg-gray-500';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate">{investigation.title}</CardTitle>
          <Badge 
            variant="outline" 
            className={`${statusColor} text-white capitalize px-2 py-0.5 text-xs`}
          >
            {investigation.status.replace('_', ' ')}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {investigation.description || investigation.query}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium">Progress</span>
              <span className="text-xs">{Math.round(investigation.confidenceScore * 100)}%</span>
            </div>
            <Progress value={investigation.confidenceScore * 100} className="h-1.5" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center">
              <p className="text-sm font-bold">{investigation.findings?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Findings</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">{investigation.sources?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Sources</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">{investigation.leads?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Leads</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {new Date(investigation.createdAt).toLocaleDateString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(investigation.id)}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}