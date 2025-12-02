"use client"

import { cn } from "@/lib/utils"

type RecruitmentStatus = 
  | "draft" | "published" | "closed" | "cancelled"
  | "submitted" | "screening" | "interviewing" | "offer" | "hired" | "rejected" | "withdrawn"
  | "scheduled" | "in_progress" | "completed" | "no_show"
  | "active" | "inactive" | "pending" | "reviewing" | "interview" | "accepted"

interface StatusBadgeProps {
  status: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Job statuses
  draft: { label: "Nháp", className: "bg-slate-100 text-slate-700 border-slate-200" },
  published: { label: "Đang tuyển", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Đã đóng", className: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "Đã hủy", className: "bg-gray-100 text-gray-600 border-gray-200" },
  
  // Application statuses
  submitted: { label: "Đã nộp", className: "bg-blue-50 text-blue-700 border-blue-200" },
  screening: { label: "Đang sàng lọc", className: "bg-amber-50 text-amber-700 border-amber-200" },
  interviewing: { label: "Phỏng vấn", className: "bg-purple-50 text-purple-700 border-purple-200" },
  offer: { label: "Đề nghị", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  hired: { label: "Đã tuyển", className: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Từ chối", className: "bg-red-50 text-red-700 border-red-200" },
  withdrawn: { label: "Rút lui", className: "bg-gray-100 text-gray-600 border-gray-200" },
  
  // Interview statuses
  scheduled: { label: "Đã lên lịch", className: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "Đang diễn ra", className: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Hoàn thành", className: "bg-green-50 text-green-700 border-green-200" },
  no_show: { label: "Vắng mặt", className: "bg-red-50 text-red-700 border-red-200" },
  
  // General statuses
  active: { label: "Hoạt động", className: "bg-green-50 text-green-700 border-green-200" },
  inactive: { label: "Không hoạt động", className: "bg-gray-100 text-gray-600 border-gray-200" },
  pending: { label: "Chờ xử lý", className: "bg-amber-50 text-amber-700 border-amber-200" },
  reviewing: { label: "Đang xem xét", className: "bg-blue-50 text-blue-700 border-blue-200" },
  interview: { label: "Phỏng vấn", className: "bg-purple-50 text-purple-700 border-purple-200" },
  accepted: { label: "Đã chấp nhận", className: "bg-green-50 text-green-700 border-green-200" },
  new: { label: "Mới", className: "bg-blue-50 text-blue-700 border-blue-200" },
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { 
    label: status, 
    className: "bg-gray-100 text-gray-700 border-gray-200" 
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-medium transition-colors",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5 mr-1.5">
        <span className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75",
          status === "published" || status === "active" || status === "hired" || status === "completed" || status === "accepted"
            ? "animate-ping bg-current"
            : ""
        )} />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
      </span>
      {config.label}
    </span>
  )
}

export { statusConfig }
export type { RecruitmentStatus }

