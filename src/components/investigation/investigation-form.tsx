'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgentStore } from '@/stores/agent-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

export function InvestigationForm() {
  const router = useRouter();
  const { startInvestigation, updateAgentConfig, agentConfig, isLoading, error } = useAgentStore();
  
  const [query, setQuery] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const investigation = await startInvestigation(query);
    
    if (investigation) {
      router.push(`/dashboard/investigations/${investigation.id}`);
    }
  };
  
  const handleModelChange = (value: string) => {
    updateAgentConfig({ llm_model: value as 'gpt-4' | 'claude-3-sonnet' | 'groq-llama' });
  };
  
  const handleSearchDepthChange = (value: string) => {
    updateAgentConfig({ search_depth: value as 'basic' | 'advanced' });
  };
  
  const handleDeepCrawlChange = (checked: boolean) => {
    updateAgentConfig({ enable_deep_crawl: checked });
  };
  
  const handleMemoryChange = (checked: boolean) => {
    updateAgentConfig({ memory_enabled: checked });
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Start New Investigation</CardTitle>
        <CardDescription>
          Enter your investigation query and configure the agent settings.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Investigation Query</Label>
            <Input
              id="query"
              placeholder="Enter your investigation query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add additional context or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select
                defaultValue={agentConfig.llm_model}
                onValueChange={handleModelChange}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groq-llama">Llama 3.3 (Groq)</SelectItem>
                  <SelectItem value="gpt-4">GPT-4 (OpenAI)</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Anthropic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search-depth">Search Depth</Label>
              <Select
                defaultValue={agentConfig.search_depth}
                onValueChange={handleSearchDepthChange}
              >
                <SelectTrigger id="search-depth">
                  <SelectValue placeholder="Select Search Depth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deep-crawl">Enable Deep Crawl</Label>
                <p className="text-sm text-muted-foreground">
                  Extract detailed content from sources
                </p>
              </div>
              <Switch
                id="deep-crawl"
                checked={agentConfig.enable_deep_crawl}
                onCheckedChange={handleDeepCrawlChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="memory">Enable Memory</Label>
                <p className="text-sm text-muted-foreground">
                  Use past investigations to improve results
                </p>
              </div>
              <Switch
                id="memory"
                checked={agentConfig.memory_enabled}
                onCheckedChange={handleMemoryChange}
              />
            </div>
          </div>
          
          {error && (
            <div className="text-sm font-medium text-destructive mt-2">
              {error}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Investigation...
              </>
            ) : (
              'Start Investigation'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}