"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { PageContext } from './chatbot-types';

interface ChatbotPageContextType {
  pageContext: PageContext | undefined;
  setPageContext: (context: PageContext | undefined) => void;
}

const ChatbotPageContext = createContext<ChatbotPageContextType | undefined>(undefined);

export function ChatbotPageContextProvider({ children }: { children: ReactNode }) {
  const [pageContext, setPageContext] = useState<PageContext | undefined>(undefined);

  return (
    <ChatbotPageContext.Provider value={{ pageContext, setPageContext }}>
      {children}
    </ChatbotPageContext.Provider>
  );
}

export function useChatbotPageContext() {
  const context = useContext(ChatbotPageContext);
  if (!context) {
    throw new Error('useChatbotPageContext must be used within ChatbotPageContextProvider');
  }
  return context;
}

