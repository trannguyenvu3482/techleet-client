"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  Calendar, 
  Star, 
  Eye, 
  CheckCircle2, 
  XCircle,
  User
} from "lucide-react"
import { recruitmentAPI } from "@/lib/api/recruitment"
import { StatusBadge } from "@/components/recruitment/status-badge"
import { toast } from "sonner"

interface Application {
  applicationId: number
  candidateId: number
  firstName: string
  lastName: string
  email: string
  status: string
  createdAt: string
  score: number | null
}

interface JobApplicationsKanbanProps {
  applications: Application[]
  onApplicationUpdate: () => void
  jobId: number
}

interface KanbanColumn {
  id: string
  title: string
  statuses: string[]
  color: string
}

const columns: KanbanColumn[] = [
  { 
    id: "submitted", 
    title: "Đã nộp", 
    statuses: ["submitted", "pending"], 
    color: "bg-blue-50 border-blue-200" 
  },
  { 
    id: "screening", 
    title: "Đang sàng lọc", 
    statuses: ["screening", "screening_passed", "screening_failed"], 
    color: "bg-yellow-50 border-yellow-200" 
  },
  { 
    id: "exam", 
    title: "Bài thi", 
    statuses: ["passed_exam", "failed_exam"], 
    color: "bg-purple-50 border-purple-200" 
  },
  { 
    id: "interview", 
    title: "Phỏng vấn", 
    statuses: ["interviewing", "interview_scheduled"], 
    color: "bg-indigo-50 border-indigo-200" 
  },
  { 
    id: "offer", 
    title: "Đề nghị", 
    statuses: ["offer"], 
    color: "bg-orange-50 border-orange-200" 
  },
  { 
    id: "hired", 
    title: "Đã tuyển", 
    statuses: ["hired"], 
    color: "bg-green-50 border-green-200" 
  },
  { 
    id: "rejected", 
    title: "Từ chối", 
    statuses: ["rejected"], 
    color: "bg-red-50 border-red-200" 
  },
]

export function JobApplicationsKanban({ 
  applications, 
  onApplicationUpdate, 
  jobId 
}: JobApplicationsKanbanProps) {
  const router = useRouter()
  const [draggedApplication, setDraggedApplication] = useState<Application | null>(null)
  const [targetColumn, setTargetColumn] = useState<string | null>(null)

  const getApplicationsForColumn = (column: KanbanColumn): Application[] => {
    return applications.filter(app => 
      column.statuses.includes(app.status)
    )
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatScore = (score: number | null) => {
    if (score === null) return "Đang xử lý"
    return `${Math.round(score)}%`
  }

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || ""
    const last = lastName?.charAt(0)?.toUpperCase() || ""
    return `${first}${last}`
  }

  const handleDragStart = (e: React.DragEvent, application: Application) => {
    setDraggedApplication(application)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("application/json", JSON.stringify(application))
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setTargetColumn(columnId)
  }

  const handleDragLeave = () => {
    setTargetColumn(null)
  }

  const handleDrop = useCallback(async (e: React.DragEvent, targetColumn: KanbanColumn) => {
    e.preventDefault()
    setTargetColumn(null)

    if (!draggedApplication) return

    const newStatus = targetColumn.statuses[0]
    
    if (targetColumn.statuses.includes(draggedApplication.status)) {
      return
    }

    const statusMap: Record<string, "pending" | "reviewing" | "interview" | "rejected" | "accepted"> = {
      "submitted": "pending",
      "pending": "pending",
      "screening": "reviewing",
      "screening_passed": "reviewing",
      "passed_exam": "reviewing",
      "interviewing": "interview",
      "interview_scheduled": "interview",
      "offer": "accepted",
      "hired": "accepted",
      "rejected": "rejected",
      "screening_failed": "rejected",
      "failed_exam": "rejected"
    }

    const apiStatus = statusMap[newStatus] || "pending"

    try {
      await recruitmentAPI.updateApplication(draggedApplication.applicationId, {
        applicationStatus: apiStatus
      })
      
      toast.success(`Đã chuyển ứng tuyển sang "${targetColumn.title}"`)
      onApplicationUpdate()
    } catch (error) {
      console.error("Error updating application status:", error)
      toast.error("Không thể cập nhật trạng thái ứng tuyển")
    } finally {
      setDraggedApplication(null)
    }
  }, [draggedApplication, onApplicationUpdate])

  const handleViewDetail = (candidateId: number, applicationId: number) => {
    router.push(`/recruitment/candidate/detail/${candidateId}?applicationId=${applicationId}&jobId=${jobId}`)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnApplications = getApplicationsForColumn(column)
        const isTarget = targetColumn === column.id

        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 ${column.color} rounded-lg border-2 transition-colors ${
              isTarget ? "border-primary shadow-lg" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {column.title}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {columnApplications.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {columnApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Không có ứng tuyển
                </div>
              ) : (
                columnApplications.map((app) => (
                  <Card
                    key={app.applicationId}
                    className={`cursor-move hover:shadow-md transition-shadow ${
                      draggedApplication?.applicationId === app.applicationId 
                        ? "opacity-50" 
                        : ""
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">
                              {getInitials(app.firstName, app.lastName)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {app.firstName} {app.lastName}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground truncate">
                                {app.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {app.score !== null && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">
                              {formatScore(app.score)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(app.createdAt)}
                          </div>
                          <StatusBadge status={app.status} type="application" />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleViewDetail(app.candidateId, app.applicationId)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Xem
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </div>
        )
      })}
    </div>
  )
}

