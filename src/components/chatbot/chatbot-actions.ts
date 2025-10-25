// Custom actions for TechLeet Admin Chatbot
import { useRouter } from "next/navigation";

export const createChatbotActions = () => {
  const router = useRouter();

  return {
    // Navigation actions
    navigateToDashboard: () => {
      router.push('/');
      return "Đã chuyển đến Dashboard!";
    },

    navigateToEmployees: () => {
      router.push('/employees');
      return "Đã chuyển đến trang Quản lý Nhân viên!";
    },

    navigateToRecruitment: () => {
      router.push('/recruitment');
      return "Đã chuyển đến trang Tuyển dụng!";
    },

    navigateToDocuments: () => {
      router.push('/documents');
      return "Đã chuyển đến trang Tài liệu!";
    },

    navigateToCompany: () => {
      router.push('/company');
      return "Đã chuyển đến trang Quản lý Công ty!";
    },

    navigateToSettings: () => {
      router.push('/settings');
      return "Đã chuyển đến trang Cài đặt!";
    },

    // Specific recruitment actions
    navigateToJobPostings: () => {
      router.push('/recruitment/jobs');
      return "Đã chuyển đến trang Tin tuyển dụng!";
    },

    navigateToCandidates: () => {
      router.push('/recruitment/candidate/list');
      return "Đã chuyển đến trang Danh sách ứng viên!";
    },

    navigateToInterviews: () => {
      router.push('/recruitment/interviews');
      return "Đã chuyển đến trang Lịch phỏng vấn!";
    },

    // Specific company actions
    navigateToDepartments: () => {
      router.push('/company/departments');
      return "Đã chuyển đến trang Quản lý Phòng ban!";
    },

    navigateToPositions: () => {
      router.push('/company/positions');
      return "Đã chuyển đến trang Quản lý Vị trí!";
    },

    navigateToHeadquarters: () => {
      router.push('/company/headquarters');
      return "Đã chuyển đến trang Quản lý Văn phòng!";
    },

    // Document actions
    navigateToOnboarding: () => {
      router.push('/documents/onboarding');
      return "Đã chuyển đến trang Quy trình Onboarding!";
    },

    // Utility actions
    showHelp: () => {
      return `🤖 **Trợ lý AI TechLeet** có thể giúp bạn:

📊 **Dashboard**: Xem tổng quan hệ thống
👥 **Nhân viên**: Quản lý thông tin nhân viên
📈 **Tuyển dụng**: Quản lý tin tuyển dụng và ứng viên
📝 **Tài liệu**: Quản lý tài liệu và quy trình
🏢 **Công ty**: Quản lý phòng ban và vị trí
⚙️ **Cài đặt**: Cấu hình hệ thống

Hãy hỏi tôi để điều hướng đến các trang này!`;
    },

    getCurrentPage: () => {
      const currentPath = window.location.pathname;
      const pageMap: Record<string, string> = {
        '/': 'Dashboard',
        '/employees': 'Quản lý Nhân viên',
        '/recruitment': 'Tuyển dụng',
        '/recruitment/jobs': 'Tin tuyển dụng',
        '/recruitment/candidate/list': 'Danh sách ứng viên',
        '/recruitment/interviews': 'Lịch phỏng vấn',
        '/documents': 'Tài liệu',
        '/documents/onboarding': 'Quy trình Onboarding',
        '/company': 'Quản lý Công ty',
        '/company/departments': 'Quản lý Phòng ban',
        '/company/positions': 'Quản lý Vị trí',
        '/company/headquarters': 'Quản lý Văn phòng',
        '/settings': 'Cài đặt'
      };
      
      const currentPage = pageMap[currentPath] || 'Trang không xác định';
      return `Bạn đang ở trang: **${currentPage}**`;
    }
  };
};

// Action mapping for easier use in chatbot
export const actionMap = {
  'dashboard': 'navigateToDashboard',
  'nhân viên': 'navigateToEmployees',
  'employees': 'navigateToEmployees',
  'tuyển dụng': 'navigateToRecruitment',
  'recruitment': 'navigateToRecruitment',
  'tin tuyển dụng': 'navigateToJobPostings',
  'jobs': 'navigateToJobPostings',
  'ứng viên': 'navigateToCandidates',
  'candidates': 'navigateToCandidates',
  'phỏng vấn': 'navigateToInterviews',
  'interviews': 'navigateToInterviews',
  'tài liệu': 'navigateToDocuments',
  'documents': 'navigateToDocuments',
  'onboarding': 'navigateToOnboarding',
  'công ty': 'navigateToCompany',
  'company': 'navigateToCompany',
  'phòng ban': 'navigateToDepartments',
  'departments': 'navigateToDepartments',
  'vị trí': 'navigateToPositions',
  'positions': 'navigateToPositions',
  'văn phòng': 'navigateToHeadquarters',
  'headquarters': 'navigateToHeadquarters',
  'cài đặt': 'navigateToSettings',
  'settings': 'navigateToSettings',
  'help': 'showHelp',
  'trợ giúp': 'showHelp',
  'trang hiện tại': 'getCurrentPage',
  'current page': 'getCurrentPage'
};
