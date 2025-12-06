"use client";

import { CustomChatbot } from './custom-chatbot';
import { useChatbotPageContext } from './chatbot-page-context';
import { useCallback } from 'react';

// Global form fill handler - can be set by pages
let globalFormFillHandler: ((data: any) => void) | undefined = undefined;

export function setGlobalFormFillHandler(handler: ((data: any) => void) | undefined) {
  globalFormFillHandler = handler;
}

import { useRouter, usePathname } from 'next/navigation';

export function ChatbotWithContext() {
  const { pageContext } = useChatbotPageContext();
  const router = useRouter();
  const pathname = usePathname();

  // Always get the latest handler from the global variable
  const handleFormFill = useCallback((data: any) => {
    // Check if we are already on the job creation page
    if (pathname === '/recruitment/jobs/create') {
      const handler = globalFormFillHandler;
      if (handler) {
        handler(data);
      }
    } else {
      // If not, save data to session storage and navigate
      sessionStorage.setItem('pendingJobFormData', JSON.stringify(data));
      router.push('/recruitment/jobs/create');
    }
  }, [pathname, router]);

  return <CustomChatbot pageContext={pageContext} onFormFill={handleFormFill} />;
}
