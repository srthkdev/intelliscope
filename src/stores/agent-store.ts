import { create } from 'zustand';
import { Investigation, Finding, Source, Lead, AgentThought } from '@/types/investigation';
import { AgentState, AgentConfig } from '@/types/agent';
import { AgentProgress } from '@/types/investigation';

interface AgentStore {
  // Current investigation
  currentInvestigation: Investigation | null;
  investigations: Investigation[];
  isLoading: boolean;
  error: string | null;
  
  // Agent state
  agentState: AgentState | null;
  agentConfig: AgentConfig;
  agentProgress: AgentProgress | null;
  agentThoughts: AgentThought[];
  
  // Actions
  startInvestigation: (query: string) => Promise<Investigation | null>;
  continueInvestigation: (investigationId: string) => Promise<void>;
  pauseInvestigation: (investigationId: string) => Promise<void>;
  getInvestigation: (investigationId: string) => Promise<Investigation | null>;
  getAllInvestigations: () => Promise<Investigation[]>;
  updateAgentConfig: (config: Partial<AgentConfig>) => void;
  addAgentThought: (thought: AgentThought) => void;
  clearAgentThoughts: () => void;
  setError: (error: string | null) => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  // Initial state
  currentInvestigation: null,
  investigations: [],
  isLoading: false,
  error: null,
  agentState: null,
  agentProgress: null,
  agentThoughts: [],
  
  // Default agent configuration
  agentConfig: {
    max_steps: 10,
    confidence_threshold: 0.7,
    max_sources_per_query: 5,
    enable_deep_crawl: true,
    llm_model: 'groq-llama',
    search_depth: 'advanced',
    memory_enabled: true
  },
  
  // Start a new investigation
  startInvestigation: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Call the API to start a new investigation
      const response = await fetch('/api/agent/investigate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          config: get().agentConfig
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start investigation');
      }
      
      const investigation = await response.json();
      
      // Update state with the new investigation
      set(state => ({
        currentInvestigation: investigation,
        investigations: [investigation, ...state.investigations],
        isLoading: false,
        agentProgress: {
          investigationId: investigation.id,
          current_step: 'Starting investigation',
          completion_percentage: 0,
          sources_count: 0,
          confidence: 0,
          findings: [],
          last_updated: new Date()
        }
      }));
      
      return investigation;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
      return null;
    }
  },
  
  // Continue an existing investigation
  continueInvestigation: async (investigationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Call the API to continue the investigation
      const response = await fetch(`/api/agent/investigate/${investigationId}/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: get().agentConfig
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to continue investigation');
      }
      
      const investigation = await response.json();
      
      // Update state with the updated investigation
      set(state => ({
        currentInvestigation: investigation,
        investigations: state.investigations.map(inv => 
          inv.id === investigationId ? investigation : inv
        ),
        isLoading: false,
        agentProgress: {
          investigationId: investigation.id,
          current_step: 'Continuing investigation',
          completion_percentage: investigation.progress || 0,
          sources_count: investigation.sources?.length || 0,
          confidence: investigation.confidenceScore || 0,
          findings: [],
          last_updated: new Date()
        }
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  },
  
  // Pause an investigation
  pauseInvestigation: async (investigationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Call the API to pause the investigation
      const response = await fetch(`/api/agent/investigate/${investigationId}/pause`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to pause investigation');
      }
      
      const investigation = await response.json();
      
      // Update state with the paused investigation
      set(state => ({
        currentInvestigation: investigation,
        investigations: state.investigations.map(inv => 
          inv.id === investigationId ? investigation : inv
        ),
        isLoading: false,
        agentProgress: {
          investigationId: investigation.id,
          current_step: 'Investigation paused',
          completion_percentage: investigation.progress || 0,
          sources_count: investigation.sources?.length || 0,
          confidence: investigation.confidenceScore || 0,
          findings: [],
          last_updated: new Date()
        }
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  },
  
  // Get a specific investigation
  getInvestigation: async (investigationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Call the API to get the investigation
      const response = await fetch(`/api/agent/investigate/${investigationId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get investigation');
      }
      
      const investigation = await response.json();
      
      // Update state with the investigation
      set(state => ({
        currentInvestigation: investigation,
        isLoading: false,
      }));
      
      return investigation;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
      return null;
    }
  },
  
  // Get all investigations
  getAllInvestigations: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Call the API to get all investigations
      const response = await fetch('/api/agent/investigate');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get investigations');
      }
      
      const investigations = await response.json();
      
      // Update state with all investigations
      set({
        investigations,
        isLoading: false,
      });
      
      return investigations;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
      return [];
    }
  },
  
  // Update agent configuration
  updateAgentConfig: (config: Partial<AgentConfig>) => {
    set(state => ({
      agentConfig: {
        ...state.agentConfig,
        ...config
      }
    }));
  },
  
  // Add an agent thought
  addAgentThought: (thought: AgentThought) => {
    set(state => ({
      agentThoughts: [...state.agentThoughts, thought]
    }));
  },
  
  // Clear agent thoughts
  clearAgentThoughts: () => {
    set({ agentThoughts: [] });
  },
  
  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));