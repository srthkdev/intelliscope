import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, FileText, Zap, Brain } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Intelliscope</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            An AI-powered investigation platform that helps you research, analyze, and discover insights from across the web.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Start an Investigation
              </CardTitle>
              <CardDescription>
                Begin a new investigation with our AI agent to gather information and insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Our AI agent will search the web, analyze sources, and compile findings based on your query.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/investigations/new" className="w-full">
                <Button className="w-full">New Investigation</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                View Investigations
              </CardTitle>
              <CardDescription>
                Browse your existing investigations and their findings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Access all your past and ongoing investigations, review findings, and continue where you left off.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/investigations" className="w-full">
                <Button variant="outline" className="w-full">View Investigations</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Try Streaming Demo
              </CardTitle>
              <CardDescription>
                Experience real-time streaming responses with Llama 3.3 via Groq.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                See how our platform leverages Groq's API to stream Llama 3.3 responses in real-time.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/demo/stream" className="w-full">
                <Button variant="outline" className="w-full">Try Streaming Demo</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                About Intelliscope
              </CardTitle>
              <CardDescription>
                Learn more about how Intelliscope works and its capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Discover the technology behind Intelliscope and how it can help with your research needs.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
