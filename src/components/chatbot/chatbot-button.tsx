"use client";

import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasNewMessage?: boolean;
}

export function ChatbotButton({ isOpen, onClick, hasNewMessage }: ChatbotButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
        "bg-blue-500 hover:bg-blue-600 text-white",
        "animate-pulse hover:animate-none",
        hasNewMessage && "ring-4 ring-blue-200",
        "transform hover:scale-105",
        "sm:bottom-6 sm:right-6 bottom-4 right-4"
      )}
      size="icon"
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <MessageCircle className="w-6 h-6" />
      )}
      
      {hasNewMessage && !isOpen && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce" />
      )}
    </Button>
  );
}
