"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ArrowLeft, Calendar, MapPin, DollarSign, Building, Users, Clock } from "lucide-react"
import Link from "next/link"
import { recruitmentAPI, JobPosting } from "@/lib/api/recruitment"

export function JobDetailClient() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchJob = useCallback(async (jobId: number) => {
    try {
      setLoading(true)
      const jobData = await recruitmentAPI.getJobPostingById(jobId)
      setJob(jobData)
    } catch (error) {
      console.error("Error fetching job:", error)
      router.push("/recruitment/jobs")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (params.id) {
      fetchJob(Number(params.id))
    }
  }, [params.id, fetchJob])

  const handleDeleteJob = async () => {
    if (!job) return
    
    if (confirm("Bạn có chắc chắn muốn xóa vị trí tuyển dụng này?")) {
      try {
        await recruitmentAPI.deleteJobPosting(job.jobPostingId)
        router.push("/recruitment/jobs")
      } catch (error) {
        console.error("Error deleting job:", error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Nháp</Badge>
      case "published":
        return <Badge variant="default">Đang tuyển</Badge>
      case "closed":
        return <Badge variant="destructive">Đã đóng</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatSalary = (min: string, max: string) => {
    const minNum = parseFloat(min).toLocaleString();
    const maxNum = parseFloat(max).toLocaleString();
    return `${minNum} - ${maxNum} VND`;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không tìm thấy vị trí tuyển dụng</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/recruitment/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-muted-foreground">
              Chi tiết vị trí tuyển dụng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/recruitment/jobs/edit/${job.jobPostingId}`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteJob}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Job Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Thông tin tổng quan
                {getStatusBadge(job.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                                 <div className="flex items-center gap-2">
                   <Building className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm">
                     <strong>Phòng ban:</strong> {job.departmentId}
                   </span>
                 </div>
                 <div className="flex items-center gap-2">
                   <Users className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm">
                     <strong>Vị trí:</strong> {job.positionId}
                   </span>
                 </div>
                 <div className="flex items-center gap-2">
                   <MapPin className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm">
                     <strong>Địa điểm:</strong> {job.location || "N/A"}
                   </span>
                 </div>
                 <div className="flex items-center gap-2">
                   <DollarSign className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm">
                     <strong>Mức lương:</strong> {formatSalary(job.salaryMin, job.salaryMax)}
                   </span>
                 </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Loại việc làm:</strong> {job.employmentType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Hạn nộp:</strong> {formatDate(job.applicationDeadline)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả công việc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{job.description}</div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{job.requirements}</div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Phúc lợi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{job.benefits}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Trạng thái</span>
                {getStatusBadge(job.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Kinh nghiệm</span>
                <span className="text-sm font-medium">{job.experienceLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ngày tạo</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(job.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cập nhật lần cuối</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(job.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/recruitment/jobs/edit/${job.jobPostingId}`}>
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa vị trí
                </Button>
              </Link>
              {job.status === "draft" && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      await recruitmentAPI.publishJobPosting(job.jobPostingId)
                      fetchJob(job.jobPostingId)
                    } catch (error) {
                      console.error("Error publishing job:", error)
                    }
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Xuất bản
                </Button>
              )}
              {job.status === "published" && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      await recruitmentAPI.closeJobPosting(job.jobPostingId)
                      fetchJob(job.jobPostingId)
                    } catch (error) {
                      console.error("Error closing job:", error)
                    }
                  }}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Đóng tuyển dụng
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
