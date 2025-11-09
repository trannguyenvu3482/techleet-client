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
  User,
  Users,
  Mail,
  Calendar,
  Star,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  X,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { recruitmentAPI } from "@/lib/api/recruitment"
import { JobApplicationsStats } from "./job-applications-stats"
import { toast } from "sonner"
import Link from "next/link"

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

interface JobApplicationsListProps {
  jobId: number
}

export function JobApplicationsList({ jobId }: JobApplicationsListProps) {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [scoreFilter, setScoreFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"card" | "table">("card")

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await recruitmentAPI.getApplicationsByJobId(jobId)
      setApplications(response.data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Không thể tải danh sách ứng tuyển")
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
      case "pending":
        return <Badge variant="secondary">Đã nộp</Badge>
      case "screening":
        return <Badge variant="default">Đang sàng lọc</Badge>
      case "screening_passed":
        return <Badge variant="default">Đã qua sàng lọc</Badge>
      case "screening_failed":
        return <Badge variant="destructive">Rớt sàng lọc</Badge>
      case "passed_exam":
        return <Badge variant="default">Đã đậu bài thi</Badge>
      case "failed_exam":
        return <Badge variant="destructive">Rớt bài thi</Badge>
      case "interviewing":
      case "interview_scheduled":
        return <Badge variant="default">Phỏng vấn</Badge>
      case "offer":
        return <Badge variant="default">Đề nghị</Badge>
      case "hired":
        return <Badge variant="default" className="bg-green-600">Đã tuyển</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      case "withdrawn":
        return <Badge variant="outline">Rút lui</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      searchTerm === "" ||
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
    
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
    
    return matchesSearch && matchesStatus && matchesScore
  })

  const handleViewDetail = (candidateId: number, applicationId: number) => {
    router.push(`/recruitment/candidate/detail/${candidateId}?applicationId=${applicationId}&jobId=${jobId}`)
  }

  const handleApprove = async (e: React.MouseEvent, applicationId: number) => {
    e.stopPropagation()
    if (!confirm("Bạn có chắc chắn muốn duyệt ứng tuyển này?")) return
    
    try {
      await recruitmentAPI.updateApplication(applicationId, {
        applicationStatus: "interview"
      })
      toast.success("Đã duyệt ứng tuyển thành công")
      fetchApplications()
    } catch (error) {
      console.error("Error approving application:", error)
      toast.error("Không thể duyệt ứng tuyển")
    }
  }

  const handleReject = async (e: React.MouseEvent, applicationId: number) => {
    e.stopPropagation()
    const reason = prompt("Lý do từ chối (tùy chọn):")
    if (reason === null) return
    
    try {
      await recruitmentAPI.updateApplication(applicationId, {
        applicationStatus: "rejected"
      })
      toast.success("Đã từ chối ứng tuyển")
      fetchApplications()
    } catch (error) {
      console.error("Error rejecting application:", error)
      toast.error("Không thể từ chối ứng tuyển")
    }
  }

  const handleScheduleInterview = (e: React.MouseEvent, candidateId: number, applicationId: number) => {
    e.stopPropagation()
    router.push(`/recruitment/candidate/detail/${candidateId}?applicationId=${applicationId}&jobId=${jobId}&action=schedule`)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setScoreFilter("all")
  }

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || scoreFilter !== "all"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <JobApplicationsStats 
        applications={applications} 
        onStatusClick={handleStatusFilter}
      />

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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
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
              <SelectTrigger className="w-[200px]">
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
          </div>
        </CardContent>
      </Card>

      {/* Applications Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Danh sách ứng tuyển</h3>
            <p className="text-sm text-muted-foreground">
              {filteredApplications.length} trong tổng số {applications.length} ứng tuyển
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("card")}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Card
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="mr-2 h-4 w-4" />
              Bảng
            </Button>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {applications.length === 0 
                  ? "Chưa có ứng tuyển nào cho vị trí này"
                  : "Không tìm thấy ứng tuyển nào phù hợp với bộ lọc"
                }
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "card" ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredApplications.map((app) => (
              <Card 
                key={app.applicationId}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                onClick={() => handleViewDetail(app.candidateId, app.applicationId)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">
                          {getInitials(app.firstName, app.lastName)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <CardTitle className="text-base truncate">
                          {app.firstName} {app.lastName}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 min-w-0 overflow-hidden">
                          <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground truncate min-w-0">
                            {app.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {app.score !== null && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          Điểm: {formatScore(app.score)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Nộp: {formatDate(app.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetail(app.candidateId, app.applicationId)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Xem
                      </Button>
                      {(app.status === "submitted" || app.status === "pending" || app.status === "screening") && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => handleApprove(e, app.applicationId)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Duyệt
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => handleReject(e, app.applicationId)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      {(app.status === "screening_passed" || app.status === "passed_exam") && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => handleScheduleInterview(e, app.candidateId, app.applicationId)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          PV
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
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
                      onClick={() => handleViewDetail(app.candidateId, app.applicationId)}
                    >
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
                        {getStatusBadge(app.status)}
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetail(app.candidateId, app.applicationId)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem
                          </Button>
                          {(app.status === "submitted" || app.status === "pending" || app.status === "screening") && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => handleApprove(e, app.applicationId)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Duyệt
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => handleReject(e, app.applicationId)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Từ chối
                              </Button>
                            </>
                          )}
                          {(app.status === "screening_passed" || app.status === "passed_exam") && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => handleScheduleInterview(e, app.candidateId, app.applicationId)}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              PV
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

