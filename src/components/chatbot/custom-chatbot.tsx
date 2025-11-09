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

    // Wait a bit to ensure token is fully persisted to localStorage
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const session = await ChatbotAPI.createSession(user.employeeId);
      setState(prev => ({
        ...prev,
        sessionId: session.sessionId,
        messages: session.messages || [],
      }));
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      // Don't set error state if it's a 401 - user might not be authenticated yet
      if (error instanceof Error && error.message.includes('401')) {
        return;
      }
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

  const handleSendMessage = useCallback(async (message: string, confirmation?: { toolName: string; parameters: Record<string, unknown>; confirmed: boolean }) => {
    if (!state.sessionId || !user?.employeeId) return;

    if (!confirmation) {
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
        pendingConfirmation: undefined,
      }));
    }

    try {
      const request: ChatRequest = {
        message: confirmation ? '' : message,
        sessionId: state.sessionId,
        confirmation: confirmation,
      };

      const response = await ChatbotAPI.sendMessage(request);
      
      const toolCalls = response.toolCalls || [];
      const requiresConfirmation = response.requiresConfirmation || false;
      const confirmationToolCall = toolCalls.find((tc: any) => tc.requiresConfirmation);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
        toolCalls: toolCalls.map((tc: any) => ({
          toolName: tc.toolName,
          parameters: tc.parameters,
          result: tc.result
        })),
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, assistantMessage],
        sessionId: response.sessionId || state.sessionId,
        pendingConfirmation: confirmationToolCall ? {
          toolName: confirmationToolCall.toolName,
          parameters: confirmationToolCall.parameters,
          message: confirmationToolCall.confirmationMessage || 'Are you sure?'
        } : undefined,
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Không thể gửi tin nhắn. Vui lòng thử lại.',
        pendingConfirmation: undefined,
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
          onConfirmAction={(confirmed) => {
            if (state.pendingConfirmation) {
              handleSendMessage('', {
                toolName: state.pendingConfirmation.toolName,
                parameters: state.pendingConfirmation.parameters,
                confirmed
              });
            }
          }}
          onClose={() => setState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </>
  );
}
