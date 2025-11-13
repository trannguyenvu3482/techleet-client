"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Activity,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { analyticsAPI, HiringFunnelData, ActivityItem, DashboardStats } from "@/lib/api/analytics"
import { recruitmentAPI } from "@/lib/api/recruitment"
import { RecruitmentBreadcrumb } from "@/components/recruitment/recruitment-breadcrumb"
import { toast } from "sonner"

interface PipelineStage {
  stage: string
  count: number
  color: string
  icon: React.ReactNode
}

export function RecruitmentDashboardClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [funnel, setFunnel] = useState<HiringFunnelData[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [topJobs, setTopJobs] = useState<any[]>([])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [statsData, funnelData, activityData, jobsData] = await Promise.all([
        analyticsAPI.getDashboardStats().catch(() => null),
        analyticsAPI.getHiringFunnel().catch(() => []),
        analyticsAPI.getRecentActivity(10).catch(() => []),
        recruitmentAPI.getJobPostings({ page: 0, limit: 5, sortBy: "applicationCount", sortOrder: "DESC" }).catch(() => ({ data: [], total: 0, totalPages: 0 }))
      ])

      if (statsData) setStats(statsData)
      if (funnelData) setFunnel(funnelData)
      if (activityData) setRecentActivity(activityData)
      if (jobsData) setTopJobs(jobsData.data || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Không thể tải dữ liệu dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getStageCount = (stageName: string): number => {
    const funnelStage = funnel.find(s => 
      s.stage.toLowerCase().includes(stageName.toLowerCase()) ||
      stageName.toLowerCase().includes(s.stage.toLowerCase())
    )
    return funnelStage ? funnelStage.count : 0
  }

  const pipelineStages: PipelineStage[] = [
    { stage: "Đã nộp", count: getStageCount("submitted") || stats?.pendingApplications || 0, color: "bg-blue-500", icon: <FileText className="h-4 w-4" /> },
    { stage: "Đang sàng lọc", count: getStageCount("screening") || 0, color: "bg-yellow-500", icon: <Clock className="h-4 w-4" /> },
    { stage: "Phỏng vấn", count: getStageCount("interview") || stats?.totalInterviews || 0, color: "bg-purple-500", icon: <Calendar className="h-4 w-4" /> },
    { stage: "Đề nghị", count: getStageCount("offer") || 0, color: "bg-orange-500", icon: <TrendingUp className="h-4 w-4" /> },
    { stage: "Đã tuyển", count: getStageCount("hired") || 0, color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "interview":
        return <Calendar className="h-4 w-4 text-purple-500" />
      case "job":
        return <Briefcase className="h-4 w-4 text-green-500" />
      case "candidate":
        return <Users className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Vừa xong"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <RecruitmentBreadcrumb items={[
        { label: "Dashboard" }
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruitment Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan về quy trình tuyển dụng và pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/recruitment/jobs">
            <Button variant="outline" size="sm">
              <Briefcase className="mr-2 h-4 w-4" />
              Việc làm
            </Button>
          </Link>
          <Link href="/recruitment/applications">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Đơn ứng tuyển
            </Button>
          </Link>
          <Link href="/recruitment/candidate/list">
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Ứng viên
            </Button>
          </Link>
          <Link href="/recruitment/jobs/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo vị trí mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng việc làm</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeJobs || 0} đang tuyển
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn ứng tuyển</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingApplications || 0} đang chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng ứng viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCandidates || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.recentCandidates || 0} mới trong tuần
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch phỏng vấn</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInterviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.interviewsThisWeek || 0} tuần này
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pipeline Overview
          </CardTitle>
          <CardDescription>
            Tổng quan về số lượng ứng viên ở mỗi giai đoạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {pipelineStages.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`${stage.color} text-white p-2 rounded-lg`}>
                    {stage.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{stage.stage}</p>
                    <p className="text-2xl font-bold">{stage.count}</p>
                  </div>
                </div>
                {index < pipelineStages.length - 1 && (
                  <div className="hidden md:block">
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Top Vị trí Tuyển dụng
                </CardTitle>
                <CardDescription>
                  Các vị trí có nhiều ứng tuyển nhất
                </CardDescription>
              </div>
              <Link href="/recruitment/jobs">
                <Button variant="ghost" size="sm">
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có dữ liệu
              </div>
            ) : (
              <div className="space-y-4">
                {topJobs.map((job) => (
                  <div
                    key={job.jobPostingId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/recruitment/jobs/detail/${job.jobPostingId}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.applicationCount || 0} ứng tuyển
                      </p>
                    </div>
                    <Badge variant={job.status === "published" ? "default" : "secondary"}>
                      {job.status === "published" ? "Đang tuyển" : job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Hoạt động gần đây
                </CardTitle>
                <CardDescription>
                  Các hoạt động mới nhất trong hệ thống
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có hoạt động nào
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>
            Truy cập nhanh các chức năng thường dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/recruitment/jobs/create">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Tạo vị trí mới
              </Button>
            </Link>
            <Link href="/recruitment/jobs">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" />
                Quản lý việc làm
              </Button>
            </Link>
            <Link href="/recruitment/candidate/list">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Danh sách ứng viên
              </Button>
            </Link>
            <Link href="/recruitment/interviews">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Lịch phỏng vấn
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

