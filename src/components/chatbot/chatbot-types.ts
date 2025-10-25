export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  toolName: string;
  parameters: any;
  result?: any;
}

export interface ChatSession {
  sessionId: string;
  userId: number;
  messages: ChatMessage[];
  context: SessionContext;
  lastActiveAt: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface SessionContext {
  currentFocus: 'job_postings' | 'candidates' | 'applications' | 'interviews' | 'general';
  recentEntityIds: number[];
  preferences: {
    language: 'vi' | 'en';
    responseStyle: 'detailed' | 'concise';
    includeSources: boolean;
  };
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  data: {
    reply: string;
    sessionId: string;
    sources: any[];
    toolCalls: any[];
  };
}

export interface ChatbotState {
  isOpen: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  sessionId?: string;
  error?: string;
}
