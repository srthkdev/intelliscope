export interface Investigation {
  id: string
  title: string
  description: string
  query: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
  userId: string
  teamId?: string
  tags: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  confidenceScore: number
  estimatedCompletion?: Date
  actualCompletion?: Date
  findings: Finding[]
  sources: Source[]
  leads: Lead[]
}

export interface Source {
  id: string
  investigationId: string
  url: string
  title: string
  content: string
  summary: string
  credibilityScore: number
  sourceType: 'web' | 'document' | 'manual' | 'api'
  extractedAt: Date
  metadata: {
    domain?: string
    author?: string
    publishDate?: Date
    wordCount?: number
    language?: string
  }
  tags: string[]
  isVerified: boolean
}

export interface Finding {
  id: string
  investigationId: string
  sourceId: string
  content: string
  summary: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  confidenceLevel: number
  extractedAt: Date
  verifiedBy?: string
  verifiedAt?: Date
  tags: string[]
  relatedFindings: string[]
}

export interface Lead {
  id: string
  investigationId: string
  query: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'investigating' | 'completed' | 'abandoned'
  createdAt: Date
  completedAt?: Date
  generatedBy: 'agent' | 'user'
  parentLeadId?: string
  estimatedEffort: number
}

export interface InvestigationState {
  investigation_id: string
  query: string
  context: string[]
  leads: Lead[]
  sources: Source[]
  findings: Finding[]
  next_actions: string[]
  confidence_score: number
  human_input_required: boolean
  current_step: string
  progress_percentage: number
  error_message?: string
}

export interface AgentProgress {
  investigationId: string
  current_step: string
  completion_percentage: number
  sources_count: number
  confidence: number
  findings: Array<{
    summary: string
    importance: string
    timestamp: Date
  }>
  estimated_completion?: Date
  last_updated: Date
}

export interface AgentThought {
  step: string
  reasoning: string
  confidence: number
  action?: string
  timestamp: Date
}