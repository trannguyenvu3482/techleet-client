"use client"

import * as React from "react"
import { 
  FileText, 
  Users, 
  Briefcase, 
  Calendar, 
  Search, 
  Inbox,
  FolderOpen,
  ClipboardList
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EmptyStateIcon = 
  | "file" 
  | "users" 
  | "briefcase" 
  | "calendar" 
  | "search" 
  | "inbox" 
  | "folder" 
  | "clipboard"

interface EmptyStateProps {
  icon?: EmptyStateIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

const iconMap: Record<EmptyStateIcon, React.ElementType> = {
  file: FileText,
  users: Users,
  briefcase: Briefcase,
  calendar: Calendar,
  search: Search,
  inbox: Inbox,
  folder: FolderOpen,
  clipboard: ClipboardList,
}

const sizeConfig = {
  sm: {
    container: "py-8",
    iconWrapper: "h-12 w-12",
    icon: "h-6 w-6",
    title: "text-base",
    description: "text-sm",
  },
  md: {
    container: "py-12",
    iconWrapper: "h-16 w-16",
    icon: "h-8 w-8",
    title: "text-lg",
    description: "text-sm",
  },
  lg: {
    container: "py-16",
    iconWrapper: "h-20 w-20",
    icon: "h-10 w-10",
    title: "text-xl",
    description: "text-base",
  },
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const Icon = iconMap[icon]
  const config = sizeConfig[size]

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      config.container,
      className
    )}>
      <div className="relative mb-4">
        <div className={cn(
          "flex items-center justify-center rounded-full bg-muted/50",
          config.iconWrapper
        )}>
          <Icon className={cn("text-muted-foreground/70", config.icon)} />
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-muted" />
        <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-muted" />
      </div>

      <h3 className={cn("font-semibold text-foreground mb-1", config.title)}>
        {title}
      </h3>
      {description && (
        <p className={cn("text-muted-foreground max-w-sm mb-4", config.description)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-2">
          {secondaryAction && (
            <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function NoJobsEmptyState({ onCreateJob }: { onCreateJob: () => void }) {
  return (
    <EmptyState
      icon="briefcase"
      title="Chưa có vị trí tuyển dụng"
      description="Tạo vị trí tuyển dụng đầu tiên để bắt đầu thu hút ứng viên."
      action={{ label: "Tạo vị trí mới", onClick: onCreateJob }}
    />
  )
}

export function NoCandidatesEmptyState() {
  return (
    <EmptyState
      icon="users"
      title="Chưa có ứng viên"
      description="Các ứng viên sẽ xuất hiện ở đây khi họ nộp đơn ứng tuyển."
    />
  )
}

export function NoInterviewsEmptyState() {
  return (
    <EmptyState
      icon="calendar"
      title="Chưa có lịch phỏng vấn"
      description="Lịch phỏng vấn sẽ xuất hiện ở đây khi bạn lên lịch cho ứng viên."
    />
  )
}

export function NoSearchResultsEmptyState({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="Không tìm thấy kết quả"
      description="Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc."
      secondaryAction={onClearSearch ? { label: "Xóa bộ lọc", onClick: onClearSearch } : undefined}
    />
  )
}

