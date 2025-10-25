"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChatbotButton } from './chatbot-button';
import { ChatbotWindow } from './chatbot-window';
import { ChatbotAPI } from './chatbot-api';
import { ChatbotState, ChatMessage, ChatRequest } from './chatbot-types';
import { useAuthStore } from '@/store/auth-store';

export function CustomChatbot() {
  const { user } = useAuthStore();
  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    isLoading: false,
    messages: [],
  });

  const initializeSession = useCallback(async () => {
    if (!user?.employeeId) return;

    try {
      const session = await ChatbotAPI.createSession(user.employeeId);
      setState(prev => ({
        ...prev,
        sessionId: session.sessionId,
        messages: session.messages || [],
      }));
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      setState(prev => ({
        ...prev,
        error: 'Không thể khởi tạo phiên chat. Vui lòng thử lại.',
      }));
    }
  }, [user?.employeeId]);

  // Initialize session when user is available
  useEffect(() => {
    if (user?.employeeId && !state.sessionId) {
      initializeSession();
    }
  }, [user?.employeeId, state.sessionId, initializeSession]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!state.sessionId || !user?.employeeId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      isLoading: true,
      messages: [...prev.messages, userMessage],
      error: undefined,
    }));

    try {
      const request: ChatRequest = {
        message,
        sessionId: state.sessionId,
      };

      const response = await ChatbotAPI.sendMessage(request);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date(response.timestamp),
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, assistantMessage],
        sessionId: response.data.sessionId,
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Không thể gửi tin nhắn. Vui lòng thử lại.',
      }));
    }
  }, [state.sessionId, user?.employeeId]);

  const toggleChatbot = () => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      error: undefined,
    }));
  };

  if (!user?.employeeId) {
    return null; // Don't show chatbot if user is not authenticated
  }

  return (
    <>
      <ChatbotButton
        isOpen={state.isOpen}
        onClick={toggleChatbot}
        hasNewMessage={false} // TODO: Implement new message detection
      />
      
      {state.isOpen && (
        <ChatbotWindow
          state={state}
          onSendMessage={handleSendMessage}
          onClose={() => setState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </>
  );
}
