"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis, Cell } from "recharts"
import { Users, Briefcase, Calendar, UserCheck } from "lucide-react"
import { analyticsAPI, DashboardStats, AnalyticsSummary, TrendData, DepartmentStats, ActivityItem } from "@/lib/api/analytics"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  applications: {
    label: "Applications",
    color: "#2563eb",
  },
  hired: {
    label: "Hired",
    color: "#10b981",
  },
} satisfies ChartConfig

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [statsData, summaryData, trendsData, deptData, activityData] = await Promise.all([
          analyticsAPI.getDashboardStats({ period: '30d' }),
          analyticsAPI.getSummary({ period: '30d' }),
          analyticsAPI.getTrends({ period: '30d', type: 'applications' }),
          analyticsAPI.getDepartmentStats({ period: '30d' }),
          analyticsAPI.getRecentActivity(10),
        ])

        setStats(statsData)
        setSummary(summaryData)
        setTrends(trendsData)
        setDepartmentStats(deptData)
        setActivity(activityData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatTrendMonth = (dateStr: string) => {
    const monthNames = ["thg 1", "thg 2", "thg 3", "thg 4", "thg 5", "thg 6", "thg 7", "thg 8", "thg 9", "thg 10", "thg 11", "thg 12"]
    const isoMonth = dateStr.match(/^\d{4}[-/](\d{1,2})/)
    if (isoMonth) {
      const monthIndex = Number(isoMonth[1]) - 1
      if (monthIndex >= 0 && monthIndex <= 11) return monthNames[monthIndex]
    }

    const monthNameMatch = dateStr.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)
    if (monthNameMatch) {
      const idx = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].indexOf(monthNameMatch[1].toLowerCase())
      if (idx >= 0) return monthNames[idx]
    }

    const parsedDate = new Date(dateStr)
    if (!Number.isNaN(parsedDate.getTime())) {
      return new Intl.DateTimeFormat("vi-VN", { month: "short" }).format(parsedDate)
    }

    return dateStr
  }

  const monthlyAggregated = Array.from(
    trends.reduce((map, item) => {
      const key = (item.date.match(/^\d{4}-\d{2}/)?.[0])
        || (item.date.match(/^\d{4}\/\d{2}/)?.[0])
        || (() => {
          const parsed = new Date(item.date)
          if (Number.isNaN(parsed.getTime())) return null
          return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`
        })()

      if (!key) return map
      const current = map.get(key) || 0
      map.set(key, current + item.value)
      return map
    }, new Map<string, number>())
  )
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-6)
    .map(([key, value]) => ({
      month: formatTrendMonth(key),
      applications: value,
      hired: 0,
    }))



  const applicationStatusData = summary?.applicationStatusBreakdown.map((item, index) => ({
    status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    count: item.count,
    fill: ["#fbbf24", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"][index] || "#8884d8",
  })) || []

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-green-500'
      case 'interview':
        return 'bg-blue-500'
      case 'job':
        return 'bg-yellow-500'
      case 'candidate':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const translateActivityText = (text: string | undefined) => {
    if (!text) return ''
    const normalized = text.trim().toLowerCase()
    const dictionary: Record<string, string> = {
      'interview scheduled': 'Đã lên lịch phỏng vấn',
      'interview rescheduled': 'Dời lịch phỏng vấn',
      'interview completed': 'Hoàn thành phỏng vấn',
      'new candidate added': 'Thêm ứng viên mới',
      'new application received': 'Nhận đơn ứng tuyển mới',
      'application received': 'Đã nhận đơn ứng tuyển',
      'application submitted': 'Đã nộp đơn ứng tuyển',
      'application reviewed': 'Đã xem xét đơn',
      'application shortlisted': 'Đưa vào danh sách phỏng vấn',
      'offer sent': 'Đã gửi offer',
      'offer accepted': 'Ứng viên đã nhận offer',
      'offer declined': 'Ứng viên từ chối offer',
      'job posted': 'Đã đăng tin tuyển dụng',
      'job posting published': 'Tin tuyển dụng đã được đăng',
      'job closed': 'Đã đóng tin tuyển dụng',
      'candidate moved to interview': 'Ứng viên chuyển sang phỏng vấn',
      'candidate moved to offer': 'Ứng viên chuyển sang giai đoạn offer',
      'candidate moved to hired': 'Ứng viên đã được tuyển',
    }

    if (dictionary[normalized]) return dictionary[normalized]
    return text
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return new Intl.DateTimeFormat('vi-VN').format(date)
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nhân viên đang hoạt động
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tin tuyển dụng đang mở</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalJobs || 0} tổng tin
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn ứng tuyển đang chờ</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalApplications || 0} tổng đơn
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phỏng vấn trong tuần</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.interviewsThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalInterviews || 0} tổng lịch phỏng vấn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recruitment Trends */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Xu hướng tuyển dụng</CardTitle>
            <CardDescription>
              Lượt ứng tuyển theo thời gian
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={monthlyAggregated}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="applications" fill="var(--color-applications)" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu xu hướng
              </div>
            )}
          </CardContent>
        </Card>



        {/* Application Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái ứng tuyển</CardTitle>
            <CardDescription>
              Phân bổ pipeline hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applicationStatusData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-square">
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu trạng thái
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Cập nhật và thao tác mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 ${getActivityColor(item.type)} rounded-full`}></div>
                    <div className="flex-1">
                    <p className="text-sm font-medium">{translateActivityText(item.title)}</p>
                    <p className="text-xs text-muted-foreground">
                      {translateActivityText(item.description)} - {formatTimeAgo(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Chưa có hoạt động
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
