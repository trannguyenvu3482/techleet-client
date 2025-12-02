"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Edit, Trash2, ArrowLeft, Calendar, MapPin, DollarSign, Building, Users, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { recruitmentAPI, JobPosting, questionAPI, QuestionSet, Interview } from "@/lib/api/recruitment"
import { JobApplicationsList } from "./applications/job-applications-list"
import { RecruitmentBreadcrumb } from "../shared/recruitment-breadcrumb"
import { StatusBadge } from "../shared/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"

export function JobDetailClient() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null)
  const [activeTab, setActiveTab] = useState("info")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loadingInterviews, setLoadingInterviews] = useState(false)

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
      toast.error("Không thể tải thông tin vị trí tuyển dụng")
      router.push("/recruitment/jobs")
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchInterviews = useCallback(async (jobId: number) => {
    try {
      setLoadingInterviews(true)
      // Get all interviews and filter by job_id client-side
      const response = await recruitmentAPI.getInterviews({ limit: 500 })
      const jobInterviews = response.data.filter(
        (interview: any) => interview.job_id === jobId || interview.jobId === jobId
      )
      setInterviews(jobInterviews)
    } catch (error) {
      console.error("Error fetching interviews:", error)
      setInterviews([])
    } finally {
      setLoadingInterviews(false)
    }
  }, [])

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
    } else if (tab === 'interviews') {
      setActiveTab('interviews')
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'interviews' && params.id) {
      fetchInterviews(Number(params.id))
    }
  }, [activeTab, params.id, fetchInterviews])

  const handleDeleteJob = async () => {
    if (!job) return
    
    try {
      await recruitmentAPI.deleteJobPosting(job.jobPostingId)
      toast.success("Đã xóa vị trí tuyển dụng")
      router.push("/recruitment/jobs")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Không thể xóa vị trí tuyển dụng")
    }
  }

  const formatSalary = (min: string, max: string) => {
    const minNum = parseFloat(min).toLocaleString()
    const maxNum = parseFloat(max).toLocaleString()
    return `${minNum} - ${maxNum} VND`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon="briefcase"
          title="Không tìm thấy vị trí tuyển dụng"
          description="Vị trí tuyển dụng không tồn tại hoặc đã bị xóa."
          action={{
            label: "Quay lại danh sách",
            onClick: () => router.push("/recruitment/jobs")
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{job.title}</h1>
              <StatusBadge status={job.status} type="job" />
            </div>
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
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
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
          <TabsTrigger value="interviews">
            Phỏng vấn
            {interviews.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {interviews.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Job Overview */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Thông tin tổng quan
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
              <Card className="card-hover">
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
              <Card className="card-hover">
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
              <Card className="card-hover">
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
                <Card className="card-hover">
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
              <Card className="card-hover">
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
              <Card hidden={job.status === "closed"} className="card-hover">
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
                          toast.success("Đã xuất bản vị trí tuyển dụng")
                          fetchJob(job.jobPostingId)
                        } catch (error) {
                          console.error("Error publishing job:", error)
                          toast.error("Không thể xuất bản")
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
                          toast.success("Đã đóng tuyển dụng")
                          fetchJob(job.jobPostingId)
                        } catch (error) {
                          console.error("Error closing job:", error)
                          toast.error("Không thể đóng tuyển dụng")
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

        <TabsContent value="interviews" className="space-y-6">
          {loadingInterviews ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Chưa có lịch phỏng vấn"
              description="Lịch phỏng vấn sẽ xuất hiện ở đây khi bạn lên lịch cho ứng viên."
            />
          ) : (
            <div className="space-y-4">
              {interviews.map((interview: any) => {
                const interviewId = interview.interview_id || interview.interviewId
                const scheduledAt = interview.scheduled_at || interview.scheduledAt
                const duration = interview.duration_minutes || interview.duration
                return (
                  <Card key={interviewId} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Phỏng vấn #{interviewId}
                            </span>
                            <StatusBadge status={interview.status} type="application" />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDateTime(scheduledAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {duration} phút
                            </div>
                            {interview.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {interview.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <Link href={`/recruitment/interviews/${interviewId}/notes`}>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Ghi chú
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa vị trí tuyển dụng"
        description="Bạn có chắc chắn muốn xóa vị trí tuyển dụng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={handleDeleteJob}
        variant="danger"
      />
    </div>
  )
}
