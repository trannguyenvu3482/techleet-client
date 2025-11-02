import { ChatRequest, ChatResponse, ChatSession } from './chatbot-types';
import { api } from '@/lib/api';

type ChatResponseData = ChatResponse['data'];

export class ChatbotAPI {
  static async createSession(userId: number): Promise<ChatSession> {
    const response = await api.post<ChatSession>('/api/v1/recruitment-service/chatbot-agent/session', {
      userId,
    });
    return response;
  }

  static async getSession(sessionId: string): Promise<ChatSession> {
    const response = await api.get<ChatSession>(`/api/v1/recruitment-service/chatbot-agent/session/${sessionId}`);
    return response;
  }

  static async sendMessage(request: ChatRequest): Promise<ChatResponseData> {
    return api.post<ChatResponseData>('/api/v1/recruitment-service/chatbot-agent/chat', request);
  }

  static async triggerIndexing(entityTypes?: string[], forceReindex?: boolean): Promise<void> {
    return api.post<void>('/api/v1/recruitment-service/chatbot-agent/index/trigger', {
      entityTypes,
      forceReindex,
    });
  }
}
