import { NextRequest, NextResponse } from 'next/server';
import { InvestigationAgent } from '@/lib/agent/investigation-agent';
import { AgentConfig } from '@/types/agent';
import { Investigation } from '@/types/investigation';
import { v4 as uuidv4 } from 'uuid';

// GET handler to retrieve all investigations
export async function GET(req: NextRequest) {
  try {
    // In a real implementation, we would fetch investigations from a database
    // For now, we'll return a mock response
    return NextResponse.json([
      {
        id: 'mock-investigation-1',
        title: 'Example Investigation',
        description: 'This is an example investigation',
        query: 'Example query',
        status: 'completed',
        progress: 100,
        findings: [],
        sources: [],
        leads: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user-1',
        metadata: {}
      }
    ]);
  } catch (error) {
    console.error('Error fetching investigations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch investigations' },
      { status: 500 }
    );
  }
}

// POST handler to create a new investigation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, config } = body;

    if (!query) {
      return NextResponse.json(
        { message: 'Query is required' },
        { status: 400 }
      );
    }

    // Create a new investigation ID
    const investigationId = uuidv4();

    // Initialize the agent with the provided configuration
    const agent = new InvestigationAgent(config as Partial<AgentConfig>);

    // Start the investigation
    const investigation = await agent.startInvestigation(query, investigationId);

    // In a real implementation, we would save the investigation to a database

    return NextResponse.json(investigation);
  } catch (error) {
    console.error('Error creating investigation:', error);
    return NextResponse.json(
      { message: 'Failed to create investigation', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}