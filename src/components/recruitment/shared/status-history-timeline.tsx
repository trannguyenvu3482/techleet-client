"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, ApplicationStatus } from "./status-badge"
import { Clock, CheckCircle2, XCircle, User } from "lucide-react"
// Using native Date API instead of date-fns

interface StatusHistoryEntry {
  status: ApplicationStatus | string
  changedAt: string
  changedBy?: string
  note?: string
}

interface StatusHistoryTimelineProps {
  history: StatusHistoryEntry[]
  currentStatus: ApplicationStatus | string
}

export function StatusHistoryTimeline({
  history,
  currentStatus,
}: StatusHistoryTimelineProps) {
  // Sort history by date (newest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  )

  const getStatusIcon = (status: ApplicationStatus | string) => {
    if (status === "rejected" || status === "screening_failed" || status === "failed_exam") {
      return <XCircle className="h-4 w-4 text-destructive" />
    }
    if (status === "hired") {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) return "Vừa xong"
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`
      return `${Math.floor(diffInSeconds / 31536000)} năm trước`
    } catch {
      return new Date(dateString).toLocaleDateString("vi-VN")
    }
  }

  if (sortedHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chưa có lịch sử thay đổi</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lịch sử trạng thái</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-start gap-3 pb-4 border-b">
            <div className="mt-1">{getStatusIcon(currentStatus)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={currentStatus} type="application" />
                <span className="text-xs text-muted-foreground">Hiện tại</span>
              </div>
            </div>
          </div>

          {/* History */}
          {sortedHistory.map((entry, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-1">{getStatusIcon(entry.status)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={entry.status} type="application" />
                  <span className="text-xs text-muted-foreground">
                    {formatTime(entry.changedAt)}
                  </span>
                </div>
                {entry.changedBy && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{entry.changedBy}</span>
                  </div>
                )}
                {entry.note && (
                  <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

