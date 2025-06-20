'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentStream } from '@/components/investigation/agent-stream';

export default function StreamDemoPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [completedText, setCompletedText] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsStreaming(true);
    setCompletedText('');
  };
  
  const handleStreamComplete = (fullText: string) => {
    setIsStreaming(false);
    setCompletedText(fullText);
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Groq + Llama 3.3 Streaming Demo</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter your prompt</CardTitle>
            <CardDescription>
              This demo uses Groq API with the Llama 3.3 70B model to stream responses in real-time.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Textarea
                placeholder="Enter your prompt here..."
                className="min-h-32"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPrompt('')}
                disabled={isStreaming}
              >
                Clear
              </Button>
              <Button 
                type="submit" 
                disabled={!prompt.trim() || isStreaming}
              >
                Generate Response
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Response</h2>
          <AgentStream 
            prompt={prompt} 
            isStreaming={isStreaming} 
            onStreamComplete={handleStreamComplete} 
          />
        </div>
      </div>
    </div>
  );
}