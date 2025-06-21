import { Groq } from 'groq-sdk';
import { AgentDecision } from '@/types/agent';
import { ChatCompletion, ChatCompletionChunk } from 'groq-sdk/resources/chat/completions';

export class GroqClient {
  private client: Groq;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  
  constructor(apiKey: string, model = 'llama-3.3-70b-versatile', temperature = 0.7, maxTokens = 1024) {
    this.client = new Groq({ apiKey });
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }
  
  /**
   * Generate a completion using the Groq API with Llama 3.3
   */
  async generateCompletion(prompt: string, stream = false): Promise<string> {
    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: stream
      });
      
      if (stream) {
        // For streaming, we need to handle the response differently
        // This is a placeholder for streaming implementation
        // In a real implementation, you would return a readable stream
        return 'Streaming not implemented in this method';
      } else {
        // Handle non-streaming response
        return (chatCompletion as ChatCompletion).choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('Error generating completion with Groq:', error);
      throw error;
    }
  }
  
  /**
   * Stream a completion using the Groq API with Llama 3.3
   * Returns an async generator that yields chunks of the response
   */
  async *streamCompletion(prompt: string) {
    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true
      });
      
      for await (const chunk of chatCompletion as AsyncIterable<ChatCompletionChunk>) {
        yield chunk.choices[0]?.delta?.content || '';
      }
    } catch (error) {
      console.error('Error streaming completion with Groq:', error);
      throw error;
    }
  }
  
  /**
   * Analyze a user query to understand the investigation requirements
   */
  async analyzeQuery(query: string, context?: string): Promise<{ entities: string[]; topics: string[]; complexity: string }> {
    const contextText = context ? `\n\nContext: ${context}` : '';
    const prompt = `
      You are an expert research analyst. Analyze the following investigation query and extract:
      1. Named entities (people, organizations, locations, etc.)
      2. Main topics of investigation
      3. Query complexity (simple, moderate, complex)
      
      Format your response as JSON with the following structure:
      {
        "entities": ["entity1", "entity2", ...],
        "topics": ["topic1", "topic2", ...],
        "complexity": "simple" | "moderate" | "complex"
      }
      
      Query: ${query}${contextText}
    `;
    
    try {
      const response = await this.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing query:', error);
      // Return a default structure if parsing fails
      return {
        entities: [],
        topics: [query],
        complexity: 'moderate'
      };
    }
  }
  
  /**
   * Generate an investigation plan based on the query and config
   */
  async generatePlan(query: string, config: any): Promise<{ steps: string[]; estimated_time: string }> {
    const prompt = `
      You are an expert investigation planner. Based on the following query and configuration, create a step-by-step plan for investigation:
      
      Query: ${query}
      
      Configuration:
      - Max steps: ${config.max_steps}
      - Search depth: ${config.search_depth}
      - Enable deep crawl: ${config.enable_deep_crawl}
      
      Create a detailed investigation plan with 5-7 specific steps. Each step should be actionable.
      Format your response as JSON with the following structure:
      {
        "steps": ["step1", "step2", ...],
        "estimated_time": "estimated time in minutes"
      }
    `;
    
    try {
      const response = await this.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating plan:', error);
      // Return a default plan if parsing fails
      return {
        steps: [
          'Search for relevant information',
          'Analyze the search results',
          'Generate findings based on the analysis',
          'Identify potential leads for further investigation'
        ],
        estimated_time: '15-30 minutes'
      };
    }
  }
  
  /**
   * Analyze sources to extract relevant information
   */
  async analyzeSources(query: string, sources: { url: string; title: string; content: string }[]): Promise<{ findings: string[]; relevanceScores: number[] }> {
    const sourcesText = sources.map((source, index) => {
      return `Source ${index + 1}:\nTitle: ${source.title}\nURL: ${source.url}\nContent: ${source.content.substring(0, 1000)}...`;
    }).join('\n\n');
    
    const prompt = `
      You are an expert information analyst. Analyze the following sources in relation to this investigation query: "${query}"
      
      ${sourcesText}
      
      For each source, extract the most relevant information and assign a relevance score from 0.0 to 1.0.
      Format your response as JSON with the following structure:
      {
        "findings": ["finding from source 1", "finding from source 2", ...],
        "relevanceScores": [0.8, 0.6, ...]
      }
    `;
    
    try {
      const response = await this.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing sources:', error);
      // Return default values if parsing fails
      return {
        findings: sources.map(s => `Information from ${s.title}`),
        relevanceScores: sources.map(() => 0.5)
      };
    }
  }
  
  /**
   * Generate a summary of findings based on the collected sources
   */
  async summarizeFindings(sources: { url: string; title: string; content: string }[], query: string): Promise<{ summary: string; confidence: number }> {
    const sourcesText = sources.map(source => `${source.title}: ${source.content.substring(0, 200)}...`).join('\n- ');
    
    const prompt = `
      You are an expert investigator. Based on the following sources, create a comprehensive summary for the investigation query: "${query}"
      
      Sources:
      - ${sourcesText}
      
      Provide a detailed summary that synthesizes these sources and assign an overall confidence score from 0.0 to 1.0.
      Format your response as JSON with the following structure:
      {
        "summary": "your detailed summary here",
        "confidence": 0.8
      }
    `;
    
    try {
      const response = await this.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error summarizing findings:', error);
      // Return default values if parsing fails
      return {
        summary: 'Based on the collected information, the investigation has yielded several insights.',
        confidence: 0.5
      };
    }
  }
  
  /**
   * Generate potential leads for further investigation
   */
  async generateLeads(query: string, findings: string[]): Promise<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }[]> {
    const findingsText = findings.join('\n- ');
    
    const prompt = `
      You are an expert investigator. Based on the following findings for the investigation query: "${query}", generate 3-5 potential leads for further investigation.
      
      Findings:
      - ${findingsText}
      
      For each lead, provide a title, description, and priority level (high, medium, or low).
      Format your response as a JSON array with the following structure:
      [
        {
          "title": "Lead title",
          "description": "Detailed description of the lead",
          "priority": "high" | "medium" | "low"
        },
        ...
      ]
    `;
    
    try {
      const response = await this.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating leads:', error);
      // Return a default lead if parsing fails
      return [{
        title: 'Further research needed',
        description: 'Additional investigation is required to gather more information.',
        priority: 'medium'
      }];
    }
  }
  
  /**
   * Decide the next action for the investigation
   */
  async decideNextAction(query: string, currentState: string): Promise<AgentDecision> {
    const prompt = `
      You are an expert investigation agent. Based on the current state of the investigation for the query: "${query}", decide what action to take next.
      
      Current investigation state:
      ${currentState}
      
      Possible actions:
      - continue: Continue the current investigation path
      - crawl: Deep crawl a specific URL to extract detailed information
      - refine_search: Refine the search query to get better results
      - generate_leads: Generate new leads based on current findings
      - compile_report: Create a summary report of the investigation
      - request_human_input: Ask for human guidance on next steps
      
      Format your response as JSON with the following structure:
      {
        "action": "continue" | "crawl" | "refine_search" | "generate_leads" | "compile_report" | "request_human_input",
        "reasoning": "detailed explanation for this decision",
        "confidence": 0.8,
        "next_query": "optional refined query"
      }
    `;
    
    try {
      const response = await this.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error deciding next action:', error);
      // Return a default decision if parsing fails
      return {
        action: 'continue',
        reasoning: 'Need to gather more information to proceed with the investigation.',
        confidence: 0.5,
        next_query: query
      };
    }
  }
}