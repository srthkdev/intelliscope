'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from '@/stores/agent-store';
import { Investigation, Finding, Source, Lead } from '@/types/investigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, Pause, ExternalLink, FileText, Lightbulb, Link2 } from 'lucide-react';

interface InvestigationDetailProps {
  investigationId: string;
}

export function InvestigationDetail({ investigationId }: InvestigationDetailProps) {
  const { 
    getInvestigation, 
    continueInvestigation, 
    pauseInvestigation,
    currentInvestigation, 
    isLoading, 
    error,
    agentThoughts
  } = useAgentStore();
  
  const [activeTab, setActiveTab] = useState('findings');
  
  useEffect(() => {
    if (investigationId) {
      getInvestigation(investigationId);
    }
  }, [investigationId, getInvestigation]);
  
  if (isLoading && !currentInvestigation) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading investigation...</span>
      </div>
    );
  }
  
  if (error && !currentInvestigation) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button onClick={() => getInvestigation(investigationId)}>Retry</Button>
      </div>
    );
  }
  
  if (!currentInvestigation) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="mb-4">Investigation not found</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }
  
  const handleContinue = () => {
    continueInvestigation(investigationId);
  };
  
  const handlePause = () => {
    pauseInvestigation(investigationId);
  };
  
  const statusColor = {
    'active': 'bg-blue-500',
    'completed': 'bg-green-500',
    'draft': 'bg-yellow-500',
    'archived': 'bg-gray-500'
  }[currentInvestigation.status] || 'bg-gray-500';
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{currentInvestigation.title}</CardTitle>
              <CardDescription className="mt-2">
                {currentInvestigation.description || currentInvestigation.query}
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`${statusColor} text-white capitalize px-3 py-1`}
            >
              {currentInvestigation.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm">{Math.round(currentInvestigation.confidenceScore * 100)}%</span>
              </div>
              <Progress value={currentInvestigation.confidenceScore * 100} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold">{currentInvestigation.findings?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Findings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{currentInvestigation.sources?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Sources</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{currentInvestigation.leads?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Leads</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Started: {new Date(currentInvestigation.createdAt).toLocaleString()}
          </div>
          <div>
            {currentInvestigation.status === 'active' ? (
              <Button onClick={handlePause} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : currentInvestigation.status === 'draft' ? (
              <Button onClick={handleContinue} variant="default" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Continue
              </Button>
            ) : null}
          </div>
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="findings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="thoughts">Agent Thoughts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="findings" className="space-y-4">
          {currentInvestigation.findings?.length ? (
            currentInvestigation.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))
          ) : (
            <EmptyState 
              icon={<FileText className="h-12 w-12 text-muted-foreground" />}
              title="No findings yet"
              description="The agent hasn't discovered any findings yet. Continue the investigation to gather more information."
            />
          )}
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-4">
          {currentInvestigation.sources?.length ? (
            currentInvestigation.sources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))
          ) : (
            <EmptyState 
              icon={<Link2 className="h-12 w-12 text-muted-foreground" />}
              title="No sources yet"
              description="The agent hasn't found any sources yet. Continue the investigation to gather more information."
            />
          )}
        </TabsContent>
        
        <TabsContent value="leads" className="space-y-4">
          {currentInvestigation.leads?.length ? (
            currentInvestigation.leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))
          ) : (
            <EmptyState 
              icon={<Lightbulb className="h-12 w-12 text-muted-foreground" />}
              title="No leads yet"
              description="The agent hasn't generated any leads yet. Continue the investigation to discover potential leads."
            />
          )}
        </TabsContent>
        
        <TabsContent value="thoughts" className="space-y-4">
          {agentThoughts?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Agent Thoughts</CardTitle>
                <CardDescription>
                  The agent's thought process during the investigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {agentThoughts.map((thought, index) => (
                      <div key={index} className="pb-4">
                        <div className="flex items-start">
                          <div className="bg-primary/10 p-2 rounded-full mr-3">
                            <Lightbulb className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm">{thought.reasoning}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(thought.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {index < agentThoughts.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <EmptyState 
              icon={<Lightbulb className="h-12 w-12 text-muted-foreground" />}
              title="No agent thoughts yet"
              description="The agent hasn't recorded any thoughts yet. Continue the investigation to see the agent's thought process."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{finding.content.substring(0, 50)}...</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{finding.content}</p>
        {finding.summary && (
          <p className="text-sm font-medium mt-2">{finding.summary}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Badge variant="outline" className="text-xs">
          Confidence: {Math.round(finding.confidenceLevel * 100)}%
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(finding.extractedAt).toLocaleString()}
        </span>
      </CardFooter>
    </Card>
  );
}

function SourceCard({ source }: { source: Source }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="truncate">{source.title || 'Untitled Source'}</span>
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{source.summary || source.content.substring(0, 200)}...</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Badge variant="outline" className="text-xs">
          Relevance: {Math.round(source.credibilityScore * 100)}%
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(source.extractedAt).toLocaleString()}
        </span>
      </CardFooter>
    </Card>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{lead.query}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{lead.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex space-x-2">
          <Badge variant="outline" className="capitalize text-xs">
            Priority: {lead.priority}
          </Badge>
          <Badge variant="outline" className="capitalize text-xs">
            Status: {lead.status}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(lead.createdAt).toLocaleString()}
        </span>
      </CardFooter>
    </Card>
  );
}

function EmptyState({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {description}
      </p>
    </div>
  );
}