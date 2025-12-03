"use client";

import { CustomChatbot } from './custom-chatbot';
import { useChatbotPageContext } from './chatbot-page-context';
import { useCallback } from 'react';

// Global form fill handler - can be set by pages
let globalFormFillHandler: ((data: any) => void) | undefined = undefined;

export function setGlobalFormFillHandler(handler: ((data: any) => void) | undefined) {
  globalFormFillHandler = handler;
}

export function ChatbotWithContext() {
  const { pageContext } = useChatbotPageContext();

  // Always get the latest handler from the global variable
  const handleFormFill = useCallback((data: any) => {
    // Always get the latest handler from the global variable
    const handler = globalFormFillHandler;
    if (handler) {
      handler(data);
    }
  }, []);

  return <CustomChatbot pageContext={pageContext} onFormFill={handleFormFill} />;
}
