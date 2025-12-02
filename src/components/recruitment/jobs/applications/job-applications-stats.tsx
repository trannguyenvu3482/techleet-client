"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, CheckCircle2, XCircle, Briefcase, UserCheck } from "lucide-react"

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

interface JobApplicationsStatsProps {
  applications: Application[]
  onStatusClick?: (status: string) => void
}

export function JobApplicationsStats({ applications, onStatusClick }: JobApplicationsStatsProps) {
  const total = applications.length
  const pending = applications.filter(app => 
    app.status === 'submitted' || app.status === 'pending' || app.status === 'screening'
  ).length
  const interviewing = applications.filter(app => 
    app.status === 'interviewing' || app.status === 'interview_scheduled'
  ).length
  const offer = applications.filter(app => app.status === 'offer').length
  const hired = applications.filter(app => app.status === 'hired').length
  const rejected = applications.filter(app => 
    app.status === 'rejected' || app.status === 'screening_failed' || app.status === 'failed_exam'
  ).length

  const stats = [
    {
      label: "Tổng số",
      value: total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      status: "all"
    },
    {
      label: "Đang xử lý",
      value: pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      status: "pending"
    },
    {
      label: "Phỏng vấn",
      value: interviewing,
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      status: "interviewing"
    },
    {
      label: "Đề nghị",
      value: offer,
      icon: Briefcase,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      status: "offer"
    },
    {
      label: "Đã tuyển",
      value: hired,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      status: "hired"
    },
    {
      label: "Từ chối",
      value: rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      status: "rejected"
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card 
            key={stat.label}
            className={`cursor-pointer transition-all hover:shadow-md ${onStatusClick ? 'hover:border-primary' : ''}`}
            onClick={() => onStatusClick && onStatusClick(stat.status)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {total > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stat.value / total) * 100)}% tổng số
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

