"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Edit, Trash2, ArrowLeft, Calendar, MapPin, DollarSign, Building, Users, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { recruitmentAPI, JobPosting, questionAPI, QuestionSet } from "@/lib/api/recruitment"
import { JobApplicationsList } from "./job-applications-list"
import { RecruitmentBreadcrumb } from "./recruitment-breadcrumb"
import { StatusBadge } from "./status-badge"

export function JobDetailClient() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null)
  const [activeTab, setActiveTab] = useState("info")

  const fetchJob = useCallback(async (jobId: number) => {
    try {
      setLoading(true)
      const jobData = await recruitmentAPI.getJobPostingById(jobId)
      setJob(jobData)
      
      // Fetch question set if needed
      if (jobData.questionSetId) {
        try {
          const response = await questionAPI.getQuestionSets({ page: 0, limit: 100 })
          const set = response.data.find(s => s.setId === jobData.questionSetId)
          setQuestionSet(set || null)
        } catch (error) {
          console.error("Error fetching question set:", error)
        }
      }
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab === 'applications') {
      setActiveTab('applications')
    }
  }, [])

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
      {/* Breadcrumbs */}
      <RecruitmentBreadcrumb items={[
        { label: "Danh sách việc làm", href: "/recruitment/jobs" },
        { label: job.title }
      ]} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/recruitment/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{job.title}</h1>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="applications">
            Ứng tuyển
            {job.applicationCount !== undefined && job.applicationCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {job.applicationCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
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

          {/* Test & Assessment */}
          {job.isTest && (
            <Card>
              <CardHeader>
                <CardTitle>Kiểm tra và Đánh giá</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Yêu cầu kiểm tra:</span>
                    <Badge variant="default">Có</Badge>
                  </div>
                  {questionSet && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Bộ câu hỏi:</span>
                      <Badge variant="secondary">{questionSet.title}</Badge>
                    </div>
                  )}
                  {job.quantityQuestion && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Số câu hỏi:</span>
                      <Badge variant="secondary">{job.quantityQuestion} câu</Badge>
                    </div>
                  )}
                  {job.minScore !== null && job.minScore !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Điểm tối thiểu:</span>
                      <Badge variant="secondary">{job.minScore}/10</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
                    <StatusBadge status={job.status} type="job" />
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
              <Card hidden={job.status === "closed"}>
                <CardHeader>
                  <CardTitle>Trạng thái</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2">
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
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <JobApplicationsList jobId={job.jobPostingId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
