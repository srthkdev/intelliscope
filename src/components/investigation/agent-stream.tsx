'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AgentStreamProps {
  streamUrl?: string;
  prompt?: string;
  isStreaming?: boolean;
  onStreamComplete?: (fullText: string) => void;
}

export function AgentStream({ 
  streamUrl, 
  prompt, 
  isStreaming = false,
  onStreamComplete 
}: AgentStreamProps) {
  const [streamedText, setStreamedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    if (!isStreaming || !prompt) return;
    
    const fetchStream = async () => {
      setIsLoading(true);
      setError(null);
      setStreamedText('');
      
      try {
        // Create a new AbortController for this stream request
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;
        
        const response = await fetch('/api/agent/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
          signal,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (!response.body) {
          throw new Error('ReadableStream not supported');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setStreamedText(fullText);
        }
        
        if (onStreamComplete) {
          onStreamComplete(fullText);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Streaming error:', err);
          setError((err as Error).message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStream();
    
    return () => {
      // Abort the fetch request if the component unmounts or the effect runs again
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isStreaming, prompt, onStreamComplete]);
  
  // Function to format the text with proper line breaks and spacing
  const formatText = (text: string) => {
    return text
      .replace(/\n/g, '<br />')
      .replace(/\s{2,}/g, ' ')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4">
        {isLoading && streamedText === '' ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Generating response...</span>
          </div>
        ) : error ? (
          <div className="text-destructive py-4">
            <p>Error: {error}</p>
          </div>
        ) : (
          <div className="py-2">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatText(streamedText) || 'Waiting for response...' }}
            />
            {isLoading && streamedText !== '' && (
              <div className="flex items-center mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Generating...</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}