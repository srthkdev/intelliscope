import { BaseMessage } from '@langchain/core/messages'
import { Investigation, Source, Finding, Lead } from './investigation'

export interface AgentState {
  messages: BaseMessage[]
  investigation_id: string
  current_query: string
  context: string[]
  leads: Lead[]
  sources: Source[]
  findings: Finding[]
  next_action: string
  confidence: number
  step_count: number
  max_steps: number
  human_input_required: boolean
  error_message?: string
}

export interface AgentConfig {
  max_steps: number
  confidence_threshold: number
  max_sources_per_query: number
  enable_deep_crawl: boolean
  llm_model: 'gpt-4' | 'claude-3-sonnet' | 'groq-llama'
  search_depth: 'basic' | 'advanced'
  memory_enabled: boolean
}

export interface SearchResult {
  url: string
  title: string
  content: string
  snippet: string
  score: number
  published_date?: string
  raw_content?: string
}

export interface CrawlResult {
  url: string
  title: string
  content: string
  links: string[]
  images: string[]
  metadata: Record<string, any>
  success: boolean
  error?: string
}

export interface MemoryQuery {
  query: string
  user_id: string
  limit?: number
  threshold?: number
}

export interface MemoryResult {
  id: string
  text: string
  score: number
  metadata: Record<string, any>
  created_at: string
}

export interface AgentDecision {
  action: 'continue' | 'crawl' | 'refine_search' | 'generate_leads' | 'compile_report' | 'request_human_input'
  reasoning: string
  confidence: number
  next_query?: string
  suggested_actions?: string[]
}

export interface AgentCapabilities {
  web_search: boolean
  deep_crawl: boolean
  memory_access: boolean
  report_generation: boolean
  lead_generation: boolean
  source_validation: boolean
}

export interface AgentMetrics {
  total_investigations: number
  success_rate: number
  average_confidence: number
  average_sources_per_investigation: number
  average_completion_time: number
  most_successful_strategies: string[]
}