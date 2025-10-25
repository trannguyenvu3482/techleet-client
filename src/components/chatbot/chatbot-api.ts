import { ChatRequest, ChatResponse, ChatSession } from './chatbot-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export class ChatbotAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async createSession(userId: number): Promise<ChatSession> {
    const response = await this.request<{data: ChatSession}>('/api/v1/recruitment-service/chatbot-agent/session', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return response.data;
  }

  static async getSession(sessionId: string): Promise<ChatSession> {
    const response = await this.request<{data: ChatSession}>(`/api/v1/recruitment-service/chatbot-agent/session/${sessionId}`);
    return response.data;
  }

  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/v1/recruitment-service/chatbot-agent/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async triggerIndexing(entityTypes?: string[], forceReindex?: boolean): Promise<void> {
    return this.request<void>('/api/v1/recruitment-service/chatbot-agent/index/trigger', {
      method: 'POST',
      body: JSON.stringify({ entityTypes, forceReindex }),
    });
  }
}
