"use client";

import { ChatMessage } from './chatbot-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isUser?: boolean;
}

export function MessageBubble({ message, isUser = false }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage 
          src={isUser ? "/images/sample-avatar.png" : "/images/chatbot.jpg"} 
          alt={isUser ? "User" : "AI Assistant"} 
        />
        <AvatarFallback>
          {isUser ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm",
          isUser 
            ? "bg-blue-500 text-white rounded-br-md" 
            : "bg-gray-100 text-gray-900 rounded-bl-md dark:bg-gray-800 dark:text-gray-100"
        )}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        
        <div className={cn(
          "text-xs text-gray-500 mt-1",
          isUser ? "text-right" : "text-left"
        )}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
