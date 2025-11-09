"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageBubble } from './message-bubble';
import { Send, Loader2, X, MessageCircle, AlertTriangle } from 'lucide-react';
import { ChatMessage, ChatbotState } from './chatbot-types';
import { cn } from '@/lib/utils';

interface ChatbotWindowProps {
  state: ChatbotState;
  onSendMessage: (message: string) => void;
  onConfirmAction?: (confirmed: boolean) => void;
  onClose: () => void;
}

export function ChatbotWindow({ state, onSendMessage, onConfirmAction, onClose }: ChatbotWindowProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isLoading]);

  // Focus input when window opens
  useEffect(() => {
    if (state.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && !state.isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col max-h-[calc(100vh-8rem)] max-w-[calc(100vw-2rem)] sm:max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              TechLeet Assistant
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {state.isLoading ? 'Đang trả lời...' : 'Sẵn sàng hỗ trợ'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {state.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Chào mừng đến với TechLeet Assistant!
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tôi có thể giúp bạn quản lý tuyển dụng, phân tích dữ liệu và trả lời các câu hỏi.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {state.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.role === 'user'}
              />
            ))}
            {state.isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">AI</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Đang suy nghĩ...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 shrink-0">
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn của bạn... (Shift+Enter để xuống dòng, Enter để gửi)"
            disabled={state.isLoading || !!state.pendingConfirmation}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || state.isLoading || !!state.pendingConfirmation}
            size="icon"
            className="shrink-0 h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!state.pendingConfirmation} onOpenChange={(open) => {
        if (!open && onConfirmAction) {
          onConfirmAction(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Xác nhận hành động
            </DialogTitle>
            <DialogDescription>
              {state.pendingConfirmation?.message || 'Are you sure you want to proceed?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onConfirmAction && onConfirmAction(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => onConfirmAction && onConfirmAction(true)}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
