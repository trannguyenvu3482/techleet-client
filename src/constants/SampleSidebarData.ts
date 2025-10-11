import {
  AudioWaveform,
  BookOpen,
  Building2,
  Command,
  FileText,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";

export const sidebarData = {
  user: {
    name: "Hiếu",
    email: "hieu@techleet.me",
    avatar: "/images/sample-avatar.png",
  },
  teams: [
    {
      name: "Phòng Nhân sự",
      logo: GalleryVerticalEnd,
      plan: "Quản lý",
    },
    {
      name: "Phòng Kỹ thuật",
      logo: AudioWaveform,
      plan: "Kỹ sư",
    },
    {
      name: "Phòng Kế toán",
      logo: Command,
      plan: "Tài chính",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: PieChart,
      isActive: true,
    },
    {
      title: "Tuyển dụng",
      url: "/recruitment",
      icon: SquareTerminal,
      items: [
        {
          title: "Tin tuyển dụng",
          url: "/recruitment/jobs",
        },
        {
          title: "Danh sách ứng viên",
          url: "/recruitment/candidate/list",
        },
        {
          title: "Đơn ứng tuyển",
          url: "/recruitment/applications",
        },
        {
          title: "Lịch phỏng vấn",
          url: "/recruitment/interviews",
        },
        {
          title: "So sánh Model",
          url: "/recruitment/model-comparison",
        },
      ],
    },
    {
      title: "Nhân viên",
      url: "/employees",
      icon: Users,
    },
    {
      title: "Tài liệu",
      url: "/documents",
      icon: FileText,
      items: [
        {
          title: "Tất cả tài liệu",
          url: "/documents",
        },
        {
          title: "Quy trình onboarding",
          url: "/documents/onboarding",
        },
        {
          title: "Chính sách công ty",
          url: "/documents/policies",
        },
        {
          title: "Quy định nội bộ",
          url: "/documents/regulations",
        },
        {
          title: "Mẫu biểu & Form",
          url: "/documents/templates",
        },
      ],
    },
    // {
    //   title: "Quản lý người dùng",
    //   url: "/users",
    //   icon: UserCheck,
    //   items: [
    //     {
    //       title: "Danh sách người dùng",
    //       url: "/users",
    //     },
    //     {
    //       title: "Vai trò & Quyền",
    //       url: "/users/roles",
    //     },
    //   ],
    // },
    {
      title: "Công ty",
      url: "/company",
      icon: Building2,
      items: [
        {
          title: "Phòng ban",
          url: "/company/departments",
        },
        {
          title: "Vị trí công việc",
          url: "/company/positions",
        },
        {
          title: "Văn phòng",
          url: "/company/headquarters",
        },
      ],
    },
    {
      title: "Báo cáo",
      url: "/reports",
      icon: BookOpen,
      items: [
        {
          title: "Báo cáo tuyển dụng",
          url: "/reports/recruitment",
        },
        {
          title: "Báo cáo nhân sự",
          url: "/reports/employees",
        },
        {
          title: "Thống kê hiệu suất",
          url: "/reports/performance",
        },
      ],
    },
    {
      title: "Cài đặt",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Cấu hình chung",
          url: "/settings/general",
        },
        // {
        //   title: "Cài đặt công ty",
        //   url: "/settings/company",
        // },
        // {
        //   title: "Cài đặt hệ thống",
        //   url: "/settings/system",
        // },
      ],
    },
  ],
  projects: [
  ],
};
