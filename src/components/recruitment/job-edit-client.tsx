"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { recruitmentAPI, JobPosting, UpdateJobPostingRequest, questionAPI, QuestionSet } from "@/lib/api/recruitment"
import { toast } from "sonner"

export function JobEditClient() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    salaryMin: "",
    salaryMax: "",
    vacancies: "",
    employmentType: "",
    experienceLevel: "",
    applicationDeadline: "",
    location: "",
    departmentId: "",
    positionId: "",
    hiringManagerId: "",
    status: "",
    isTest: false,
    questionSetId: "",
    quantityQuestion: "10",
    minScore: ""
  })

  const fetchJob = useCallback(async (jobId: number) => {
    try {
      setLoading(true)
      const jobData = await recruitmentAPI.getJobPostingById(jobId)
      setJob(jobData)
      setFormData({
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        vacancies: jobData.vacancies.toString(),
        employmentType: jobData.employmentType,
        experienceLevel: jobData.experienceLevel,
        applicationDeadline: jobData.applicationDeadline.split('T')[0],
        location: jobData.location,
        departmentId: jobData.departmentId.toString(),
        positionId: jobData.positionId.toString(),
        hiringManagerId: jobData.hiringManagerId.toString(),
        status: jobData.status,
        isTest: jobData.isTest || false,
        questionSetId: jobData.questionSetId?.toString() || "",
        quantityQuestion: jobData.quantityQuestion?.toString() || "10",
        minScore: jobData.minScore?.toString() || ""
      })
    } catch (error) {
      console.error("Error fetching job:", error)
      toast.error("Không thể tải thông tin vị trí tuyển dụng")
      router.push("/recruitment/jobs")
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchQuestionSets = async () => {
    try {
      setLoadingQuestionSets(true)
      const response = await questionAPI.getQuestionSets({ page: 0, limit: 100 })
      setQuestionSets(response.data)
    } catch (error) {
      console.error("Error fetching question sets:", error)
      toast.error("Không thể tải danh sách bộ câu hỏi")
    } finally {
      setLoadingQuestionSets(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchJob(Number(params.id))
    }
    fetchQuestionSets()
  }, [params.id, fetchJob])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job) return

    // Validate that questionSetId is selected when isTest is true
    if (formData.isTest && !formData.questionSetId) {
      toast.error("Vui lòng chọn bộ câu hỏi khi bật yêu cầu kiểm tra!")
      return
    }

    try {
      setSaving(true)
      const updateData: UpdateJobPostingRequest = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
        vacancies: Number(formData.vacancies),
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        applicationDeadline: formData.applicationDeadline,
        location: formData.location,
        departmentId: Number(formData.departmentId),
        positionId: Number(formData.positionId),
        hiringManagerId: Number(formData.hiringManagerId),
        status: formData.status,
        isTest: formData.isTest,
        questionSetId: formData.questionSetId ? Number(formData.questionSetId) : undefined,
        quantityQuestion: formData.quantityQuestion ? Number(formData.quantityQuestion) : undefined,
        minScore: formData.minScore ? Number(formData.minScore) : undefined
      }

      await recruitmentAPI.updateJobPosting(job.jobPostingId, updateData)
      toast.success("Cập nhật vị trí tuyển dụng thành công!")
      router.push(`/recruitment/jobs/detail/${job.jobPostingId}`)
    } catch (error: any) {
      console.error("Error updating job:", error)
      const errorMessages = error?.response?.data?.message || error?.message
      
      // Handle array of errors (validation errors)
      if (Array.isArray(errorMessages)) {
        errorMessages.forEach((msg: string) => {
          toast.error(msg)
        })
      } else if (errorMessages) {
        toast.error(errorMessages)
      } else {
        toast.error("Không thể cập nhật vị trí tuyển dụng. Vui lòng thử lại!")
      }
    } finally {
      setSaving(false)
    }
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
          <Link href={`/recruitment/jobs/detail/${job.jobPostingId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa vị trí tuyển dụng</h1>
            <p className="text-muted-foreground">
              Cập nhật thông tin vị trí tuyển dụng
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Thông tin chính của vị trí tuyển dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề vị trí *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nhập tiêu đề vị trí"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả công việc *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Mô tả chi tiết công việc"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Yêu cầu *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder="Yêu cầu về kỹ năng, kinh nghiệm"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Phúc lợi</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange("benefits", e.target.value)}
                  placeholder="Phúc lợi và đãi ngộ"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết vị trí</CardTitle>
              <CardDescription>
                Thông tin về lương, loại việc làm và thời hạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                   <Label htmlFor="salaryMin">Lương tối thiểu *</Label>
                   <Input
                     id="salaryMin"
                     type="number"
                     value={formData.salaryMin}
                     onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                     placeholder="0"
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="salaryMax">Lương tối đa *</Label>
                   <Input
                     id="salaryMax"
                     type="number"
                     value={formData.salaryMax}
                     onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                     placeholder="0"
                     required
                   />
                 </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Loại việc làm *</Label>
                <Select value={formData.employmentType} onValueChange={(value) => handleInputChange("employmentType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại việc làm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Toàn thời gian</SelectItem>
                    <SelectItem value="part-time">Bán thời gian</SelectItem>
                    <SelectItem value="contract">Hợp đồng</SelectItem>
                    <SelectItem value="internship">Thực tập</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Mức độ kinh nghiệm *</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange("experienceLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mức độ kinh nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Mới tốt nghiệp</SelectItem>
                    <SelectItem value="junior">Junior (1-3 năm)</SelectItem>
                    <SelectItem value="mid">Mid-level (3-5 năm)</SelectItem>
                    <SelectItem value="senior">Senior (5+ năm)</SelectItem>
                    <SelectItem value="lead">Lead/Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                             <div className="space-y-2">
                 <Label htmlFor="vacancies">Số lượng tuyển *</Label>
                 <Input
                   id="vacancies"
                   type="number"
                   value={formData.vacancies}
                   onChange={(e) => handleInputChange("vacancies", e.target.value)}
                   placeholder="1"
                   required
                 />
              </div>

              <div className="space-y-2">
                 <Label htmlFor="applicationDeadline">Hạn nộp hồ sơ *</Label>
                 <Input
                   id="applicationDeadline"
                   type="date"
                   value={formData.applicationDeadline}
                   onChange={(e) => handleInputChange("applicationDeadline", e.target.value)}
                   required
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="location">Địa điểm *</Label>
                 <Input
                   id="location"
                   value={formData.location}
                   onChange={(e) => handleInputChange("location", e.target.value)}
                   placeholder="Nhập địa điểm làm việc"
                   required
                 />
               </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tổ chức</CardTitle>
              <CardDescription>
                Phòng ban, vị trí và địa điểm làm việc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Phòng ban *</Label>
                <Select value={formData.departmentId} onValueChange={(value) => handleInputChange("departmentId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Phòng Kỹ thuật</SelectItem>
                    <SelectItem value="2">Phòng Nhân sự</SelectItem>
                    <SelectItem value="3">Phòng Marketing</SelectItem>
                    <SelectItem value="4">Phòng Kinh doanh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="positionId">Vị trí *</Label>
                <Select value={formData.positionId} onValueChange={(value) => handleInputChange("positionId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Software Engineer</SelectItem>
                    <SelectItem value="2">Product Manager</SelectItem>
                    <SelectItem value="3">UI/UX Designer</SelectItem>
                    <SelectItem value="4">Data Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="hiringManagerId">Người quản lý tuyển dụng *</Label>
                <Select value={formData.hiringManagerId} onValueChange={(value) => handleInputChange("hiringManagerId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người quản lý" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Manager 1</SelectItem>
                    <SelectItem value="2">Manager 2</SelectItem>
                    <SelectItem value="3">Manager 3</SelectItem>
                    <SelectItem value="4">Manager 4</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="closed">Đã đóng</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
            </CardContent>
          </Card>

          {/* Test & Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Kiểm tra và Đánh giá</CardTitle>
              <CardDescription>
                Cấu hình kiểm tra và bộ câu hỏi cho vị trí tuyển dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTest"
                  checked={formData.isTest}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTest: checked === true }))}
                />
                <Label htmlFor="isTest" className="cursor-pointer">
                  Yêu cầu kiểm tra (Test required)
                </Label>
              </div>

              {formData.isTest && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="questionSetId">Bộ câu hỏi *</Label>
                    <Select
                      value={formData.questionSetId}
                      onValueChange={(value) => handleInputChange("questionSetId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bộ câu hỏi" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingQuestionSets ? (
                          <div className="p-2 text-center">Đang tải...</div>
                        ) : questionSets.length === 0 ? (
                          <div className="p-2 text-center">Chưa có bộ câu hỏi</div>
                        ) : (
                          questionSets.map((set) => (
                            <SelectItem key={set.setId} value={set.setId.toString()}>
                              {set.title} {set.description && `- ${set.description}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantityQuestion">Số câu hỏi *</Label>
                    <Input
                      id="quantityQuestion"
                      type="number"
                      value={formData.quantityQuestion}
                      onChange={(e) => handleInputChange("quantityQuestion", e.target.value)}
                      placeholder="10"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minScore">Điểm tối thiểu (0-10)</Label>
                    <Input
                      id="minScore"
                      type="number"
                      value={formData.minScore}
                      onChange={(e) => handleInputChange("minScore", e.target.value)}
                      placeholder="7"
                      min="0"
                      max="10"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Link href={`/recruitment/jobs/detail/${job.jobPostingId}`}>
            <Button variant="outline" type="button">
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
