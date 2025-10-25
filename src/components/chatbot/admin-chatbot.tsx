"use client";

import ChatBot from "react-chatbotify";
import MarkdownRenderer from "@rcb-plugins/markdown-renderer";
import LlmConnector, { GeminiProvider } from "@rcb-plugins/llm-connector";
import { createChatbotActions, actionMap } from "./chatbot-actions";
import { useRouter } from "next/navigation";

const apiKey = "AIzaSyBzapCWwqCBz-oAPzZwuC2-jVcgzbvK-nU"

// Chatbot flow with navigation based on example
const createChatbotFlows = (actions: any): any => ({
  start: {
    message: "🤖 **Chào mừng đến với TechLeet Admin!**\n\nTôi là trợ lý AI của bạn. Tôi có thể giúp bạn:",
    renderMarkdown: ["BOT", "USER"],
    transition: {duration: 1000},
    path: "show_options"
  },
  show_options: {
    message: "Hãy chọn chức năng bạn muốn sử dụng:",
    renderMarkdown: ["BOT", "USER"],
    options: [
      "🧭 Điều hướng",
      "📊 Báo cáo",
      "❓ Trợ giúp",
      "🔄 Quay lại menu"
    ],
    path: "process_options"
  },
  prompt_again: {
    message: "Bạn cần hỗ trợ gì khác không?",
    renderMarkdown: ["BOT", "USER"],
    options: [
      "🧭 Điều hướng",
      "📊 Báo cáo",
      "❓ Trợ giúp",
      "🔄 Quay lại menu"
    ],
    path: "process_options"
  },
  unknown_input: {
    message: "Xin lỗi, tôi không hiểu tin nhắn của bạn 😢! Vui lòng chọn một trong các tùy chọn bên dưới.",
    renderMarkdown: ["BOT", "USER"],
    options: [
      "🧭 Điều hướng",
      "📊 Báo cáo",
      "❓ Trợ giúp",
      "🔄 Quay lại menu"
    ],
    path: "process_options"
  },
  process_options: {
    transition: {duration: 0},
    chatDisabled: true,
    path: async (params: any) => {
      console.log("process_options: userInput =", params.userInput);
      
      switch (params.userInput) {
        case "🧭 Điều hướng":
          return "navigation";
        case "📊 Báo cáo":
          return "reports";
        case "❓ Trợ giúp":
          return "help";
        case "🔄 Quay lại menu":
          return "start";
        default:
          return "unknown_input";
      }
    }
  },
  navigation: {
    message: "🧭 **Điều hướng TechLeet Admin**\n\nTôi có thể đưa bạn đến:",
    renderMarkdown: ["BOT", "USER"],
    options: [
      "📊 Dashboard",
      "👥 Nhân viên",
      "📈 Tuyển dụng",
      "📝 Tài liệu",
      "🏢 Công ty",
      "⚙️ Cài đặt",
      "🔄 Quay lại menu"
    ],
    path: "process_navigation"
  },
  process_navigation: {
    transition: {duration: 0},
    chatDisabled: true,
    path: async (params: any) => {
      console.log("process_navigation: userInput =", params.userInput);
      
      let route = "";
      let message = "";
      
      switch (params.userInput) {
        case "📊 Dashboard":
          route = "/";
          message = "Đang chuyển đến Dashboard...";
          break;
        case "👥 Nhân viên":
          route = "/employees";
          message = "Đang chuyển đến trang Nhân viên...";
          break;
        case "📈 Tuyển dụng":
          route = "/recruitment";
          message = "Đang chuyển đến trang Tuyển dụng...";
          break;
        case "📝 Tài liệu":
          route = "/documents";
          message = "Đang chuyển đến trang Tài liệu...";
          break;
        case "🏢 Công ty":
          route = "/company";
          message = "Đang chuyển đến trang Công ty...";
          break;
        case "⚙️ Cài đặt":
          route = "/settings";
          message = "Đang chuyển đến trang Cài đặt...";
          break;
        case "🔄 Quay lại menu":
          return "start";
        default:
          return "unknown_input";
      }
      
      if (route) {
        await params.injectMessage(message);
        setTimeout(() => {
          window.location.href = route;
        }, 1000);
        return "repeat";
      }
      
      return "unknown_input";
    }
  },
  reports: {
    message: "📊 **Báo cáo và Phân tích**\n\nTôi có thể giúp bạn tạo các báo cáo về:\n\n• 📈 Hiệu suất tuyển dụng\n• 👥 Thống kê nhân viên\n• 📋 Báo cáo tài liệu\n• 🏢 Cơ cấu tổ chức",
    renderMarkdown: ["BOT", "USER"],
    options: [
      "📈 Báo cáo tuyển dụng",
      "👥 Thống kê nhân viên",
      "📋 Báo cáo tài liệu",
      "🏢 Cơ cấu tổ chức",
      "🔄 Quay lại menu"
    ],
    path: "process_reports"
  },
  process_reports: {
    transition: {duration: 0},
    chatDisabled: true,
    path: async (params: any) => {
      console.log("process_reports: userInput =", params.userInput);
      
      switch (params.userInput) {
        case "📈 Báo cáo tuyển dụng":
          await params.injectMessage("Đang tạo báo cáo tuyển dụng...");
          break;
        case "👥 Thống kê nhân viên":
          await params.injectMessage("Đang tạo thống kê nhân viên...");
          break;
        case "📋 Báo cáo tài liệu":
          await params.injectMessage("Đang tạo báo cáo tài liệu...");
          break;
        case "🏢 Cơ cấu tổ chức":
          await params.injectMessage("Đang tạo báo cáo cơ cấu tổ chức...");
          break;
        case "🔄 Quay lại menu":
          return "start";
        default:
          return "unknown_input";
      }
      
      return "repeat";
    }
  },
  help: {
    message: actions.showHelp(),
    renderMarkdown: ["BOT", "USER"],
    options: [
      "🔄 Quay lại menu"
    ],
    path: "process_help"
  },
  process_help: {
    transition: {duration: 0},
    chatDisabled: true,
    path: async (params: any) => {
      console.log("process_help: userInput =", params.userInput);
      
      switch (params.userInput) {
        case "🔄 Quay lại menu":
          return "start";
        default:
          return "unknown_input";
      }
    }
  },
  repeat: {
    transition: {duration: 3000},
    path: "prompt_again"
  },
  // Commented out Gemini for now
  // gemini: {
  //   llmConnector: {
  //     provider: new GeminiProvider({
  //       mode: 'direct',
  //       model: 'gemini-2.5-flash',
  //       responseFormat: 'stream',
  //       apiKey: apiKey,
  //     }),
  //     outputType: 'character',
  //   },
  // },
});

// Enhanced chatbot settings
const chatbotSettings = {
  chatHistory: {
    storageKey: "techleet_admin_bot",
  },
  header: {
    title: "🤖 Trợ lý AI TechLeet",
    avatar: "/images/chatbot.jpg",
  },
  notification: {
    disabled: true,
  },
  chatWindow: {
    defaultOpen: false,
    autoJumpToBottom: true,
    showMessagePrompt: true,
    showTypingIndicator: true,
    showScrollbar: true,
  },
  chatInput: {
    enabledPlaceholderText: "Nhập tin nhắn của bạn...",
  },
  chatButton: {
    icon: "/images/chatbot.jpg",
  },
  tooltip: {
    text: "💬 Bạn cần trợ giúp?",
  },
  // Enhanced features
  botBubbleStyle: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    borderRadius: "12px",
  },
  userBubbleStyle: {
    backgroundColor: "#f1f5f9",
    color: "#1f2937",
    borderRadius: "12px",
  },
};

export function AdminChatBot() {
  // Debug logging
  console.log("AdminChatBot: Initializing with Gemini API Key:", apiKey ? "Present" : "Missing");
  
  const router = useRouter();
  const actions = createChatbotActions();
  const chatbotFlows = createChatbotFlows(actions);
  
  return (
    <ChatBot
      settings={chatbotSettings}
      flow={chatbotFlows}
      plugins={[MarkdownRenderer()]}
    />
  );
}
