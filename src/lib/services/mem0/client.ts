import { MemoryQuery, MemoryResult } from '@/types/agent'

export interface Mem0Memory {
  id: string
  text: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  user_id: string
}

export interface Mem0SearchParams {
  query: string
  user_id: string
  limit?: number
  threshold?: number
  filters?: Record<string, any>
}

export interface Mem0AddParams {
  text: string
  user_id: string
  metadata?: Record<string, any>
  category?: string
}

export class Mem0Client {
  private apiKey: string
  private baseUrl = 'https://api.mem0.ai/v1'
  private userId: string

  constructor(apiKey?: string, userId?: string) {
    this.apiKey = apiKey || process.env.MEM0_API_KEY || ''
    this.userId = userId || process.env.MEM0_USER_ID || ''
    
    if (!this.apiKey) {
      throw new Error('Mem0 API key is required')
    }
    if (!this.userId) {
      throw new Error('Mem0 User ID is required')
    }
  }

  async searchMemories(params: Mem0SearchParams): Promise<MemoryResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/memories/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query: params.query,
          user_id: params.user_id || this.userId,
          limit: params.limit || 10,
          threshold: params.threshold || 0.7,
          filters: params.filters
        })
      })

      if (!response.ok) {
        throw new Error(`Mem0 search failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.results?.map((result: any) => ({
        id: result.id,
        text: result.text,
        score: result.score,
        metadata: result.metadata || {},
        created_at: result.created_at
      })) || []
    } catch (error) {
      console.error('Mem0 search error:', error)
      return []
    }
  }

  async addMemory(params: Mem0AddParams): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          text: params.text,
          user_id: params.user_id || this.userId,
          metadata: {
            ...params.metadata,
            category: params.category || 'investigation',
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Mem0 add memory failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Mem0 add memory error:', error)
      throw error
    }
  }

  async addInvestigationMemory(
    investigationId: string,
    data: {
      query: string
      successful_strategies: string[]
      source_quality_patterns: any[]
      findings: any[]
      confidence: number
    }
  ): Promise<string> {
    const memoryText = `Investigation: ${data.query}
` +
      `Confidence: ${data.confidence}
` +
      `Successful strategies: ${data.successful_strategies.join(', ')}
` +
      `Key findings: ${data.findings.map(f => f.summary || f.content).slice(0, 3).join('; ')}`

    return this.addMemory({
      text: memoryText,
      user_id: this.userId,
      metadata: {
        investigation_id: investigationId,
        type: 'investigation_outcome',
        confidence: data.confidence,
        strategies: data.successful_strategies,
        findings_count: data.findings.length,
        source_patterns: data.source_quality_patterns
      },
      category: 'investigation'
    })
  }

  async getInvestigationContext(query: string, investigationId: string): Promise<MemoryResult[]> {
    return this.searchMemories({
      query,
      user_id: this.userId,
      limit: 5,
      threshold: 0.6,
      filters: {
        category: 'investigation'
      }
    })
  }

  async deleteMemory(memoryId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/memories/${memoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      return response.ok
    } catch (error) {
      console.error('Mem0 delete memory error:', error)
      return false
    }
  }

  async getAllMemories(userId?: string): Promise<Mem0Memory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/memories?user_id=${userId || this.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Mem0 get memories failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.memories || []
    } catch (error) {
      console.error('Mem0 get memories error:', error)
      return []
    }
  }
}