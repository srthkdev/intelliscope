import { SearchResult, CrawlResult } from '@/types/agent'

export interface TavilySearchParams {
  query: string
  search_depth?: 'basic' | 'advanced'
  max_results?: number
  include_domains?: string[]
  exclude_domains?: string[]
  include_answer?: boolean
  include_raw_content?: boolean
}

export interface TavilyCrawlParams {
  urls: string[]
  max_depth?: number
  respect_robots_txt?: boolean
  extract_content?: boolean
  follow_links?: boolean
}

export class TavilyClient {
  private apiKey: string
  private baseUrl = 'https://api.tavily.com'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('Tavily API key is required')
    }
  }

  async search(params: TavilySearchParams): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query: params.query,
          search_depth: params.search_depth || 'basic',
          max_results: params.max_results || 10,
          include_domains: params.include_domains,
          exclude_domains: params.exclude_domains,
          include_answer: params.include_answer || false,
          include_raw_content: params.include_raw_content || false
        })
      })

      if (!response.ok) {
        throw new Error(`Tavily search failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.results?.map((result: any) => ({
        url: result.url,
        title: result.title,
        content: result.content,
        snippet: result.snippet || result.content?.substring(0, 200),
        score: result.score || 0.5,
        published_date: result.published_date,
        raw_content: result.raw_content
      })) || []
    } catch (error) {
      console.error('Tavily search error:', error)
      throw error
    }
  }

  async crawl(params: TavilyCrawlParams): Promise<CrawlResult[]> {
    try {
      const results: CrawlResult[] = []
      
      for (const url of params.urls) {
        try {
          const response = await fetch(`${this.baseUrl}/extract`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              urls: [url],
              extract_content: params.extract_content !== false
            })
          })

          if (!response.ok) {
            results.push({
              url,
              title: '',
              content: '',
              links: [],
              images: [],
              metadata: {},
              success: false,
              error: `HTTP ${response.status}: ${response.statusText}`
            })
            continue
          }

          const data = await response.json()
          const result = data.results?.[0]
          
          if (result) {
            results.push({
              url: result.url,
              title: result.title || '',
              content: result.content || '',
              links: result.links || [],
              images: result.images || [],
              metadata: result.metadata || {},
              success: true
            })
          } else {
            results.push({
              url,
              title: '',
              content: '',
              links: [],
              images: [],
              metadata: {},
              success: false,
              error: 'No content extracted'
            })
          }
        } catch (error) {
          results.push({
            url,
            title: '',
            content: '',
            links: [],
            images: [],
            metadata: {},
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      return results
    } catch (error) {
      console.error('Tavily crawl error:', error)
      throw error
    }
  }

  async getAnswer(query: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query,
          search_depth: 'advanced',
          include_answer: true,
          max_results: 5
        })
      })

      if (!response.ok) {
        throw new Error(`Tavily answer failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.answer || 'No answer found'
    } catch (error) {
      console.error('Tavily answer error:', error)
      throw error
    }
  }
}