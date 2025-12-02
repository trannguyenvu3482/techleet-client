"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search,
  Mail,
  Calendar,
  Star,
  Eye,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  X,
  Briefcase,
  Users,
  FileText,
  Clock
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { recruitmentAPI, JobPosting } from "@/lib/api/recruitment"
import { RecruitmentBreadcrumb } from "../shared/recruitment-breadcrumb"
import { StatusBadge } from "../shared/status-badge"
import { toast } from "sonner"
import Link from "next/link"

interface Application {
  applicationId: number
  candidateId: number
  jobPostingId: number
  firstName: string
  lastName: string
  email: string
  status: string
  createdAt: string
  score: number | null
  jobTitle?: string
}

export function ApplicationsClient() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [jobFilter, setJobFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [scoreFilter, setScoreFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all")
  const [selectedApplications, setSelectedApplications] = useState<number[]>([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [jobsResponse, allApplications] = await Promise.all([
        recruitmentAPI.getJobPostings({ page: 0, limit: 100 }).catch(() => ({ data: [], total: 0, totalPages: 0 })),
        Promise.all(
          Array.from({ length: 10 }, (_, i) => 
            recruitmentAPI.getApplicationsByJobId(i + 1).catch(() => ({ data: [] }))
          )
        )
      ])

      setJobs(jobsResponse.data || [])
      
      const allApps: Application[] = []
      allApplications.forEach((response, index) => {
        if (response && response.data) {
          const job = jobsResponse.data.find(j => j.jobPostingId === index + 1)
          response.data.forEach((app: any) => {
            allApps.push({
              ...app,
              jobTitle: job?.title
            })
          })
        }
      })
      
      setApplications(allApps)
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Không thể tải danh sách ứng tuyển")
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatScore = (score: number | null) => {
    if (score === null) return "Đang xử lý"
    return `${Math.round(score)}%`
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      searchTerm === "" ||
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesJob = 
      jobFilter === "all" ||
      app.jobPostingId.toString() === jobFilter
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "pending" && (app.status === "submitted" || app.status === "pending" || app.status === "screening")) ||
      (statusFilter === "interviewing" && (app.status === "interviewing" || app.status === "interview_scheduled")) ||
      (statusFilter === "offer" && app.status === "offer") ||
      (statusFilter === "hired" && app.status === "hired") ||
      (statusFilter === "rejected" && (app.status === "rejected" || app.status === "screening_failed" || app.status === "failed_exam")) ||
      app.status === statusFilter
    
    const matchesScore =
      scoreFilter === "all" ||
      (scoreFilter === "high" && app.score !== null && app.score >= 80) ||
      (scoreFilter === "medium" && app.score !== null && app.score >= 60 && app.score < 80) ||
      (scoreFilter === "low" && app.score !== null && app.score < 60) ||
      (scoreFilter === "pending" && app.score === null)
    
    const matchesDateRange = dateRangeFilter === "all" || (() => {
      const appDate = new Date(app.createdAt)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (dateRangeFilter) {
        case "today":
          return daysDiff === 0
        case "week":
          return daysDiff <= 7
        case "month":
          return daysDiff <= 30
        case "quarter":
          return daysDiff <= 90
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesJob && matchesStatus && matchesScore && matchesDateRange
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(filteredApplications.map(app => app.applicationId))
    } else {
      setSelectedApplications([])
    }
  }

  const handleSelectApplication = (applicationId: number, checked: boolean) => {
    if (checked) {
      setSelectedApplications([...selectedApplications, applicationId])
    } else {
      setSelectedApplications(selectedApplications.filter(id => id !== applicationId))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedApplications.length === 0) return
    if (!confirm(`Bạn có chắc chắn muốn duyệt ${selectedApplications.length} ứng tuyển?`)) return

    try {
      await Promise.all(
        selectedApplications.map(id =>
          recruitmentAPI.updateApplication(id, { applicationStatus: "interview" })
        )
      )
      toast.success(`Đã duyệt ${selectedApplications.length} ứng tuyển`)
      setSelectedApplications([])
      fetchData()
    } catch (error) {
      console.error("Error bulk approving:", error)
      toast.error("Không thể duyệt một số ứng tuyển")
    }
  }

  const handleBulkReject = async () => {
    if (selectedApplications.length === 0) return
    if (!confirm(`Bạn có chắc chắn muốn từ chối ${selectedApplications.length} ứng tuyển?`)) return

    try {
      await Promise.all(
        selectedApplications.map(id =>
          recruitmentAPI.updateApplication(id, { applicationStatus: "rejected" })
        )
      )
      toast.success(`Đã từ chối ${selectedApplications.length} ứng tuyển`)
      setSelectedApplications([])
      fetchData()
    } catch (error) {
      console.error("Error bulk rejecting:", error)
      toast.error("Không thể từ chối một số ứng tuyển")
    }
  }

  const handleViewDetail = (candidateId: number, applicationId: number, jobId: number) => {
    router.push(`/recruitment/candidate/detail/${candidateId}?applicationId=${applicationId}&jobId=${jobId}`)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setJobFilter("all")
    setStatusFilter("all")
    setScoreFilter("all")
    setDateRangeFilter("all")
  }

  const hasActiveFilters = searchTerm !== "" || jobFilter !== "all" || statusFilter !== "all" || scoreFilter !== "all" || dateRangeFilter !== "all"

  const handleExport = () => {
    const csvContent = [
      ["ID", "Họ tên", "Email", "Vị trí", "Trạng thái", "Điểm số", "Ngày nộp"].join(","),
      ...filteredApplications.map(app => [
        app.applicationId,
        `"${app.firstName} ${app.lastName}"`,
        app.email,
        `"${app.jobTitle || ""}"`,
        app.status,
        app.score || "",
        formatDate(app.createdAt)
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `applications_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        { label: "Đơn ứng tuyển" }
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn ứng tuyển</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả đơn ứng tuyển từ mọi vị trí
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedApplications.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleBulkApprove}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Duyệt ({selectedApplications.length})
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkReject}>
                <XCircle className="mr-2 h-4 w-4" />
                Từ chối ({selectedApplications.length})
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === "submitted" || app.status === "pending" || app.status === "screening").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phỏng vấn</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === "interviewing" || app.status === "interview_scheduled").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã tuyển</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === "hired").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
              <CardDescription>
                Tìm kiếm và lọc ứng tuyển theo tiêu chí
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vị trí" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vị trí</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.jobPostingId} value={job.jobPostingId.toString()}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="interviewing">Phỏng vấn</SelectItem>
                <SelectItem value="offer">Đề nghị</SelectItem>
                <SelectItem value="hired">Đã tuyển</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Điểm số" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả điểm số</SelectItem>
                <SelectItem value="high">Cao (≥80%)</SelectItem>
                <SelectItem value="medium">Trung bình (60-79%)</SelectItem>
                <SelectItem value="low">Thấp (&lt;60%)</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">7 ngày qua</SelectItem>
                <SelectItem value="month">30 ngày qua</SelectItem>
                <SelectItem value="quarter">90 ngày qua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách ứng tuyển</CardTitle>
          <CardDescription>
            {filteredApplications.length} trong tổng số {applications.length} ứng tuyển
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {applications.length === 0 
                  ? "Chưa có ứng tuyển nào"
                  : "Không tìm thấy ứng tuyển nào phù hợp với bộ lọc"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Điểm số</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow 
                    key={app.applicationId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetail(app.candidateId, app.applicationId, app.jobPostingId)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedApplications.includes(app.applicationId)}
                        onCheckedChange={(checked) => handleSelectApplication(app.applicationId, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {app.applicationId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {app.firstName} {app.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {app.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/recruitment/jobs/detail/${app.jobPostingId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Briefcase className="h-4 w-4" />
                        {app.jobTitle || "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} type="application" />
                    </TableCell>
                    <TableCell>
                      {app.score !== null ? (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{formatScore(app.score)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Đang xử lý</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(app.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(app.candidateId, app.applicationId, app.jobPostingId)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

