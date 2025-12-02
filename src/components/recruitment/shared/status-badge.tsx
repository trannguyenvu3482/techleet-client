"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type ApplicationStatus =
  | "submitted"
  | "pending"
  | "screening"
  | "screening_passed"
  | "screening_failed"
  | "passed_exam"
  | "failed_exam"
  | "interviewing"
  | "interview_scheduled"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn"

export type JobStatus = "draft" | "published" | "closed"

export type CandidateStatus =
  | "active"
  | "inactive"
  | "new"
  | ApplicationStatus

interface StatusConfig {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  className?: string
}

const APPLICATION_STATUS_MAP: Record<ApplicationStatus, StatusConfig> = {
  submitted: { label: "Đã nộp", variant: "secondary" },
  pending: { label: "Chờ xử lý", variant: "secondary" },
  screening: { label: "Đang sàng lọc", variant: "default" },
  screening_passed: { label: "Đã qua sàng lọc", variant: "default" },
  screening_failed: { label: "Rớt sàng lọc", variant: "destructive" },
  passed_exam: { label: "Đã đậu bài thi", variant: "default" },
  failed_exam: { label: "Rớt bài thi", variant: "destructive" },
  interviewing: { label: "Phỏng vấn", variant: "default" },
  interview_scheduled: { label: "Đã lên lịch PV", variant: "default" },
  offer: { label: "Đề nghị", variant: "default" },
  hired: { label: "Đã tuyển", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  rejected: { label: "Từ chối", variant: "destructive" },
  withdrawn: { label: "Rút lui", variant: "outline" },
}

const JOB_STATUS_MAP: Record<JobStatus, StatusConfig> = {
  draft: { label: "Nháp", variant: "secondary" },
  published: { label: "Đang tuyển", variant: "default" },
  closed: { label: "Đã đóng", variant: "destructive" },
}

const CANDIDATE_STATUS_MAP: Record<CandidateStatus, StatusConfig> = {
  ...APPLICATION_STATUS_MAP,
  active: { label: "Hoạt động", variant: "default" },
  inactive: { label: "Không hoạt động", variant: "outline" },
  new: { label: "Mới", variant: "secondary" },
}

interface StatusBadgeProps {
  status: ApplicationStatus | JobStatus | CandidateStatus | string
  type?: "application" | "job" | "candidate"
  className?: string
}

export function StatusBadge({ status, type = "application", className }: StatusBadgeProps) {
  let config: StatusConfig | undefined

  switch (type) {
    case "application":
      config = APPLICATION_STATUS_MAP[status as ApplicationStatus]
      break
    case "job":
      config = JOB_STATUS_MAP[status as JobStatus]
      break
    case "candidate":
      config = CANDIDATE_STATUS_MAP[status as CandidateStatus]
      break
  }

  if (!config) {
    // Fallback for unknown statuses
    config = { label: status, variant: "outline" }
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

