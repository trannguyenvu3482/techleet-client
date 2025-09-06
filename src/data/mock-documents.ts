// Mock data types
export interface Document {
  documentId: number;
  title: string;
  description?: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  tags: string[];
  version: string;
  isActive: boolean;
  isPublic: boolean;
  isPinned: boolean;
  downloadCount: number;
  uploadedBy: {
    employeeId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedBy?: {
    employeeId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedAt?: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  color: string;
  icon: string;
  parentCategoryId?: number;
  isActive: boolean;
  documentCount?: number;
}

// Mock categories data
export const mockCategories: DocumentCategory[] = [
  { categoryId: 1, categoryName: 'Onboarding', description: 'Tài liệu hướng dẫn nhân viên mới', color: '#3b82f6', icon: '👋', isActive: true, documentCount: 15 },
  { categoryId: 2, categoryName: 'Chính sách', description: 'Chính sách công ty', color: '#10b981', icon: '📜', isActive: true, documentCount: 18 },
  { categoryId: 3, categoryName: 'Quy định', description: 'Quy định nội bộ', color: '#ef4444', icon: '⚖️', isActive: true, documentCount: 12 },
  { categoryId: 4, categoryName: 'Mẫu biểu', description: 'Forms và templates', color: '#8b5cf6', icon: '📄', isActive: true, documentCount: 25 },
  { categoryId: 5, categoryName: 'Đào tạo', description: 'Tài liệu đào tạo', color: '#f59e0b', icon: '🎓', isActive: true, documentCount: 30 },
  { categoryId: 6, categoryName: 'Quy trình', description: 'Quy trình làm việc', color: '#06b6d4', icon: '🔄', isActive: true, documentCount: 20 },
  { categoryId: 7, categoryName: 'Hợp đồng', description: 'Mẫu hợp đồng và thỏa thuận', color: '#8b5cf6', icon: '📝', isActive: true, documentCount: 10 },
  { categoryId: 8, categoryName: 'An toàn', description: 'Hướng dẫn an toàn lao động', color: '#dc2626', icon: '🛡️', isActive: true, documentCount: 8 },
]

// Mock documents data (expanded)
export const mockDocuments: Document[] = [
  // Onboarding documents
  {
    documentId: 1,
    title: 'Hướng dẫn Onboarding toàn diện cho nhân viên mới gia nhập công ty TechLeet',
    description: 'Tài liệu hướng dẫn chi tiết quy trình đón nhận nhân viên mới, bao gồm các bước chuẩn bị, giới thiệu văn hóa công ty và quy trình làm việc',
    fileName: 'onboarding-comprehensive-guide-v3.pdf',
    originalFileName: 'Hướng dẫn Onboarding toàn diện v3.0.pdf',
    filePath: '/documents/onboarding/onboarding-comprehensive-guide-v3.pdf',
    fileSize: 4547843,
    mimeType: 'application/pdf',
    category: mockCategories[0],
    tags: ['onboarding', 'hướng dẫn', 'nhân viên mới', 'văn hóa công ty'],
    version: '3.0',
    isActive: true,
    isPublic: true,
    isPinned: true,
    downloadCount: 145,
    uploadedBy: {
      employeeId: 1,
      firstName: 'Nguyễn',
      lastName: 'Văn An',
      email: 'an.nguyen@techleet.com'
    },
    approvedBy: {
      employeeId: 2,
      firstName: 'Trần',
      lastName: 'Thị Bình',
      email: 'binh.tran@techleet.com'
    },
    approvedAt: '2024-08-15T10:30:00Z',
    createdAt: '2024-08-10T14:20:00Z',
    updatedAt: '2024-08-15T10:30:00Z'
  },
  {
    documentId: 2,
    title: 'Checklist hoàn thành onboarding trong 30 ngày đầu tiên',
    description: 'Danh sách kiểm tra chi tiết các nhiệm vụ cần hoàn thành trong 30 ngày đầu tiên của nhân viên mới',
    fileName: 'onboarding-30-day-checklist.xlsx',
    originalFileName: 'Checklist Onboarding 30 ngày.xlsx',
    filePath: '/documents/onboarding/onboarding-30-day-checklist.xlsx',
    fileSize: 856432,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: mockCategories[0],
    tags: ['checklist', 'onboarding', '30 ngày', 'theo dõi'],
    version: '2.1',
    isActive: true,
    isPublic: true,
    isPinned: false,
    downloadCount: 89,
    uploadedBy: {
      employeeId: 3,
      firstName: 'Lê',
      lastName: 'Văn Cường',
      email: 'cuong.le@techleet.com'
    },
    createdAt: '2024-07-20T09:15:00Z',
    updatedAt: '2024-08-01T16:45:00Z'
  },
  {
    documentId: 3,
    title: 'Giới thiệu về văn hóa công ty và các giá trị cốt lõi của TechLeet',
    description: 'Tài liệu trình bày về mission, vision, values và văn hóa làm việc tại TechLeet',
    fileName: 'company-culture-values.pptx',
    originalFileName: 'Văn hóa và Giá trị TechLeet.pptx',
    filePath: '/documents/onboarding/company-culture-values.pptx',
    fileSize: 3456789,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    category: mockCategories[0],
    tags: ['văn hóa', 'giá trị', 'mission', 'vision'],
    version: '1.5',
    isActive: true,
    isPublic: true,
    isPinned: true,
    downloadCount: 234,
    uploadedBy: {
      employeeId: 4,
      firstName: 'Phạm',
      lastName: 'Văn Đức',
      email: 'duc.pham@techleet.com'
    },
    createdAt: '2024-06-15T11:30:00Z',
    updatedAt: '2024-07-10T14:20:00Z'
  },

  // Policy documents
  {
    documentId: 4,
    title: 'Chính sách nghỉ phép, làm việc từ xa và chế độ đãi ngộ nhân viên',
    description: 'Quy định chi tiết về các loại nghỉ phép, điều kiện làm việc từ xa và các chế độ đãi ngộ',
    fileName: 'comprehensive-leave-remote-policy.docx',
    originalFileName: 'Chính sách Nghỉ phép và Remote Work.docx',
    filePath: '/documents/policies/comprehensive-leave-remote-policy.docx',
    fileSize: 1856432,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: mockCategories[1],
    tags: ['chính sách', 'remote work', 'nghỉ phép', 'đãi ngộ'],
    version: '2.3',
    isActive: true,
    isPublic: false,
    isPinned: true,
    downloadCount: 167,
    uploadedBy: {
      employeeId: 5,
      firstName: 'Hoàng',
      lastName: 'Thị Mai',
      email: 'mai.hoang@techleet.com'
    },
    approvedBy: {
      employeeId: 2,
      firstName: 'Trần',
      lastName: 'Thị Bình',
      email: 'binh.tran@techleet.com'
    },
    approvedAt: '2024-07-25T16:45:00Z',
    createdAt: '2024-07-20T09:15:00Z',
    updatedAt: '2024-07-25T16:45:00Z'
  },
  {
    documentId: 5,
    title: 'Chính sách bảo mật thông tin và sử dụng thiết bị công ty',
    description: 'Quy định về bảo mật dữ liệu, sử dụng thiết bị và phần mềm của công ty',
    fileName: 'security-device-usage-policy.pdf',
    originalFileName: 'Chính sách Bảo mật và Thiết bị.pdf',
    filePath: '/documents/policies/security-device-usage-policy.pdf',
    fileSize: 2234567,
    mimeType: 'application/pdf',
    category: mockCategories[1],
    tags: ['bảo mật', 'thiết bị', 'chính sách', 'IT'],
    version: '1.8',
    isActive: true,
    isPublic: false,
    isPinned: false,
    downloadCount: 203,
    uploadedBy: {
      employeeId: 6,
      firstName: 'Vũ',
      lastName: 'Minh Tuấn',
      email: 'tuan.vu@techleet.com'
    },
    createdAt: '2024-08-05T13:45:00Z',
    updatedAt: '2024-08-20T10:15:00Z'
  },

  // Templates
  {
    documentId: 6,
    title: 'Mẫu đơn xin nghỉ phép và các loại leave request khác nhau',
    description: 'Form chuẩn để nhân viên xin nghỉ phép các loại: annual leave, sick leave, maternity leave',
    fileName: 'comprehensive-leave-request-forms.pdf',
    originalFileName: 'Mẫu đơn xin nghỉ phép toàn diện.pdf',
    filePath: '/documents/templates/comprehensive-leave-request-forms.pdf',
    fileSize: 634567,
    mimeType: 'application/pdf',
    category: mockCategories[3],
    tags: ['form', 'nghỉ phép', 'template', 'annual leave', 'sick leave'],
    version: '2.0',
    isActive: true,
    isPublic: true,
    isPinned: true,
    downloadCount: 287,
    uploadedBy: {
      employeeId: 7,
      firstName: 'Đặng',
      lastName: 'Văn Hùng',
      email: 'hung.dang@techleet.com'
    },
    createdAt: '2024-06-01T08:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z'
  },
  {
    documentId: 7,
    title: 'Template báo cáo tuần và monthly report cho các phòng ban',
    description: 'Mẫu báo cáo chuẩn hóa cho việc báo cáo tiến độ công việc hàng tuần và hàng tháng',
    fileName: 'weekly-monthly-report-templates.docx',
    originalFileName: 'Template Báo cáo Tuần và Tháng.docx',
    filePath: '/documents/templates/weekly-monthly-report-templates.docx',
    fileSize: 445678,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: mockCategories[3],
    tags: ['template', 'báo cáo', 'weekly', 'monthly', 'report'],
    version: '1.4',
    isActive: true,
    isPublic: true,
    isPinned: false,
    downloadCount: 198,
    uploadedBy: {
      employeeId: 8,
      firstName: 'Bùi',
      lastName: 'Thị Lan',
      email: 'lan.bui@techleet.com'
    },
    createdAt: '2024-05-20T10:30:00Z',
    updatedAt: '2024-06-25T11:45:00Z'
  },

  // Training documents
  {
    documentId: 8,
    title: 'Khóa học TypeScript và React advanced cho team Frontend Development',
    description: 'Tài liệu đào tạo TypeScript và React nâng cao, bao gồm hooks, performance optimization và testing',
    fileName: 'typescript-react-advanced-training.pdf',
    originalFileName: 'TypeScript React Advanced Course.pdf',
    filePath: '/documents/training/typescript-react-advanced-training.pdf',
    fileSize: 8678901,
    mimeType: 'application/pdf',
    category: mockCategories[4],
    tags: ['đào tạo', 'typescript', 'react', 'frontend', 'advanced'],
    version: '3.2',
    isActive: true,
    isPublic: true,
    isPinned: false,
    downloadCount: 356,
    uploadedBy: {
      employeeId: 9,
      firstName: 'Lương',
      lastName: 'Văn Nam',
      email: 'nam.luong@techleet.com'
    },
    createdAt: '2024-08-01T14:30:00Z',
    updatedAt: '2024-08-25T09:20:00Z'
  },
  {
    documentId: 9,
    title: 'Hướng dẫn sử dụng Git và GitHub workflow cho team development',
    description: 'Training material về Git fundamentals, branching strategy, code review process và CI/CD workflow',
    fileName: 'git-github-workflow-training.pptx',
    originalFileName: 'Git GitHub Workflow Training.pptx',
    filePath: '/documents/training/git-github-workflow-training.pptx',
    fileSize: 5234567,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    category: mockCategories[4],
    tags: ['git', 'github', 'workflow', 'development', 'CI/CD'],
    version: '2.1',
    isActive: true,
    isPublic: true,
    isPinned: false,
    downloadCount: 278,
    uploadedBy: {
      employeeId: 10,
      firstName: 'Ngô',
      lastName: 'Thị Hương',
      email: 'huong.ngo@techleet.com'
    },
    createdAt: '2024-07-10T16:00:00Z',
    updatedAt: '2024-08-05T13:30:00Z'
  },

  // Regulations
  {
    documentId: 10,
    title: 'Quy trình đánh giá hiệu suất và KPI tracking cho toàn bộ nhân viên',
    description: 'Hướng dẫn chi tiết quy trình đánh giá hiệu suất nhân viên hàng quý, bao gồm cách đặt KPI và tracking',
    fileName: 'performance-review-kpi-process.pptx',
    originalFileName: 'Quy trình đánh giá hiệu suất và KPI.pptx',
    filePath: '/documents/regulations/performance-review-kpi-process.pptx',
    fileSize: 4456789,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    category: mockCategories[2],
    tags: ['quy trình', 'đánh giá', 'hiệu suất', 'KPI', 'performance'],
    version: '4.0',
    isActive: true,
    isPublic: false,
    isPinned: true,
    downloadCount: 134,
    uploadedBy: {
      employeeId: 11,
      firstName: 'Đỗ',
      lastName: 'Văn Minh',
      email: 'minh.do@techleet.com'
    },
    expirationDate: '2024-12-31T23:59:59Z',
    createdAt: '2024-09-01T10:00:00Z',
    updatedAt: '2024-09-01T10:00:00Z'
  },
  {
    documentId: 11,
    title: 'Quy định về dress code và quy tắc ứng xử trong môi trường làm việc',
    description: 'Hướng dẫn về trang phục phù hợp và quy tắc ứng xử chuyên nghiệp tại nơi làm việc',
    fileName: 'dress-code-workplace-conduct.pdf',
    originalFileName: 'Quy định Dress Code và Ứng xử.pdf',
    filePath: '/documents/regulations/dress-code-workplace-conduct.pdf',
    fileSize: 1234567,
    mimeType: 'application/pdf',
    category: mockCategories[2],
    tags: ['dress code', 'ứng xử', 'quy định', 'workplace'],
    version: '1.3',
    isActive: true,
    isPublic: true,
    isPinned: false,
    downloadCount: 156,
    uploadedBy: {
      employeeId: 12,
      firstName: 'Cao',
      lastName: 'Thị Phương',
      email: 'phuong.cao@techleet.com'
    },
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-06-20T14:15:00Z'
  },

  // Process documents
  {
    documentId: 12,
    title: 'Quy trình recruitment và onboarding cho các vị trí kỹ thuật',
    description: 'Hướng dẫn chi tiết quy trình tuyển dụng từ việc đăng tin đến onboarding nhân viên mới',
    fileName: 'technical-recruitment-onboarding-process.docx',
    originalFileName: 'Quy trình Recruitment Kỹ thuật.docx',
    filePath: '/documents/process/technical-recruitment-onboarding-process.docx',
    fileSize: 2567890,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: mockCategories[5],
    tags: ['recruitment', 'onboarding', 'kỹ thuật', 'quy trình'],
    version: '2.5',
    isActive: true,
    isPublic: false,
    isPinned: false,
    downloadCount: 98,
    uploadedBy: {
      employeeId: 13,
      firstName: 'Tạ',
      lastName: 'Văn Đức',
      email: 'duc.ta@techleet.com'
    },
    createdAt: '2024-08-20T11:30:00Z',
    updatedAt: '2024-08-30T15:45:00Z'
  },

  // Contract templates
  {
    documentId: 13,
    title: 'Mẫu hợp đồng lao động và các phụ lục kèm theo cho nhân viên full-time',
    description: 'Template hợp đồng lao động chuẩn bao gồm các điều khoản về lương, phúc lợi và quyền lợi',
    fileName: 'fulltime-employment-contract-template.docx',
    originalFileName: 'Mẫu Hợp đồng Lao động Full-time.docx',
    filePath: '/documents/contracts/fulltime-employment-contract-template.docx',
    fileSize: 1567890,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: mockCategories[6],
    tags: ['hợp đồng', 'lao động', 'full-time', 'template'],
    version: '3.1',
    isActive: true,
    isPublic: false,
    isPinned: false,
    downloadCount: 67,
    uploadedBy: {
      employeeId: 14,
      firstName: 'Lý',
      lastName: 'Thị Mai',
      email: 'mai.ly@techleet.com'
    },
    createdAt: '2024-07-01T08:30:00Z',
    updatedAt: '2024-08-10T12:15:00Z'
  },

  // Safety documents
  {
    documentId: 14,
    title: 'Hướng dẫn an toàn lao động và phòng chống cháy nổ tại văn phòng',
    description: 'Tài liệu hướng dẫn các biện pháp an toàn lao động, sử dụng thiết bị và phòng chống cháy nổ',
    fileName: 'workplace-safety-fire-prevention.pdf',
    originalFileName: 'Hướng dẫn An toàn Lao động.pdf',
    filePath: '/documents/safety/workplace-safety-fire-prevention.pdf',
    fileSize: 3234567,
    mimeType: 'application/pdf',
    category: mockCategories[7],
    tags: ['an toàn', 'lao động', 'cháy nổ', 'phòng chống'],
    version: '1.2',
    isActive: true,
    isPublic: true,
    isPinned: false,
    downloadCount: 145,
    uploadedBy: {
      employeeId: 15,
      firstName: 'Phan',
      lastName: 'Văn Hải',
      email: 'hai.phan@techleet.com'
    },
    createdAt: '2024-06-10T14:00:00Z',
    updatedAt: '2024-07-05T16:30:00Z'
  },
  {
    documentId: 15,
    title: 'Quy trình xử lý sự cố và emergency response plan cho toàn công ty',
    description: 'Hướng dẫn các bước xử lý sự cố khẩn cấp, liên lạc và ứng phó trong các tình huống bất ngờ',
    fileName: 'emergency-response-incident-handling.docx',
    originalFileName: 'Quy trình Xử lý Sự cố Khẩn cấp.docx',
    filePath: '/documents/safety/emergency-response-incident-handling.docx',
    fileSize: 1789012,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: mockCategories[7],
    tags: ['emergency', 'sự cố', 'xử lý', 'khẩn cấp'],
    version: '2.0',
    isActive: true,
    isPublic: false,
    isPinned: false,
    downloadCount: 89,
    uploadedBy: {
      employeeId: 16,
      firstName: 'Võ',
      lastName: 'Thị Ngọc',
      email: 'ngoc.vo@techleet.com'
    },
    createdAt: '2024-08-15T13:20:00Z',
    updatedAt: '2024-08-25T10:45:00Z'
  }
]
