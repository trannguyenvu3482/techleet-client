import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

export const sidebarData = {
  user: {
    name: "Hiếu",
    email: "hieu@techleet.me",
    avatar: "/avatars/shadcn.jpg",
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
      title: "Tuyển dụng",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Danh sách ứng viên",
          url: "#",
        },
        {
          title: "Tin tuyển dụng",
          url: "#",
        },
        {
          title: "Lịch phỏng vấn",
          url: "#",
        },
      ],
    },
    {
      title: "Nhân sự",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Hồ sơ nhân viên",
          url: "#",
        },
        {
          title: "Chấm công",
          url: "#",
        },
        {
          title: "Lương & Bảo hiểm",
          url: "#",
        },
      ],
    },
    {
      title: "Báo cáo",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Tuyển dụng",
          url: "#",
        },
        {
          title: "Hiệu suất",
          url: "#",
        },
        {
          title: "Thống kê nghỉ phép",
          url: "#",
        },
        {
          title: "Biến động nhân sự",
          url: "#",
        },
      ],
    },
    {
      title: "Cài đặt",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Cấu hình chung",
          url: "#",
        },
        {
          title: "Phân quyền",
          url: "#",
        },
        {
          title: "Thông tin công ty",
          url: "#",
        },
        {
          title: "Giới hạn truy cập",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Quản lý nhân sự",
      url: "#",
      icon: Frame,
    },
    {
      name: "Tuyển dụng thực tập",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Đào tạo nội bộ",
      url: "#",
      icon: Map,
    },
  ],
};
