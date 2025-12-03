"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { recruitmentAPI, CreateJobPostingRequest, UpdateJobPostingRequest, JobPosting, questionAPI, QuestionSet } from "@/lib/api/recruitment"
import { companyAPI, Headquarter, Department, Position } from "@/lib/api/company"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface JobFormProps {
  mode: "create" | "edit"
  jobId?: number
}

interface FormData {
  title: string
  description: string
  requirements: string
  benefits: string
  salaryMin: string
  salaryMax: string
  vacancies: string
  employmentType: string
  experienceLevel: string
  applicationDeadline: string
  headquarterId: string
  departmentId: string
  positionId: string
  location: string
  status: string
  isTest: boolean
  questionSetId: string
  quantityQuestion: string
  minScore: string
}

const initialFormData: FormData = {
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
  headquarterId: "",
  departmentId: "",
  positionId: "",
  location: "",
  status: "draft",
  isTest: false,
  questionSetId: "",
  quantityQuestion: "10",
  minScore: ""
}

export function JobForm({ mode, jobId }: JobFormProps) {
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  
  // Reference data
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(false)
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  
  // Form state
  const [formData, setFormData] = useState<FormData>(initialFormData)

  // Fetch initial reference data
  const fetchReferenceData = useCallback(async () => {
    try {
      setLoadingData(true)
      const [headquartersRes, departmentsRes, questionSetsRes] = await Promise.all([
        companyAPI.getHeadquarters({ limit: 100, isActive: true }),
        companyAPI.getDepartments({ limit: 100, isActive: true }),
        questionAPI.getQuestionSets({ limit: 100 })
      ])
      setHeadquarters(headquartersRes.data)
      setDepartments(departmentsRes.data)
      setQuestionSets(questionSetsRes.data)
    } catch (error) {
      console.error("Error fetching reference data:", error)
      toast.error("Không thể tải dữ liệu tham chiếu")
    } finally {
      setLoadingData(false)
    }
  }, [])

  // Fetch positions when department changes
  const fetchPositionsByDepartment = useCallback(async (departmentId: number) => {
    try {
      console.log('fetchPositionsByDepartment called with departmentId:', departmentId)
      const positionsRes = await companyAPI.getPositionsByDepartment(departmentId)
      console.log('Positions received:', positionsRes)
      setPositions(positionsRes)
    } catch (error) {
      console.error("Error fetching positions:", error)
      setPositions([])
    }
  }, [])

  // Fetch job data for edit mode
  const fetchJob = useCallback(async (id: number) => {
    try {
      setLoading(true)
      const jobData = await recruitmentAPI.getJobPostingById(id)
      setJob(jobData)
      
      // Find headquarter by matching address
      const matchingHq = headquarters.find(h => h.address === jobData.location)
      
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
        headquarterId: matchingHq ? matchingHq.headquarterId.toString() : "",
        departmentId: jobData.departmentId.toString(),
        positionId: jobData.positionId.toString(),
        location: jobData.location,
        status: jobData.status,
        isTest: jobData.isTest || false,
        questionSetId: jobData.questionSetId?.toString() || "",
        quantityQuestion: jobData.quantityQuestion?.toString() || "10",
        minScore: jobData.minScore?.toString() || ""
      })
      
      // Load positions for the department
      if (jobData.departmentId) {
        await fetchPositionsByDepartment(jobData.departmentId)
      }
    } catch (error) {
      console.error("Error fetching job:", error)
      toast.error("Không thể tải thông tin vị trí tuyển dụng")
      router.push("/recruitment/jobs")
    } finally {
      setLoading(false)
    }
  }, [router, headquarters, fetchPositionsByDepartment])

  // Initial data loading
  useEffect(() => {
    fetchReferenceData()
  }, [fetchReferenceData])

  // Load job data after reference data is loaded (edit mode)
  useEffect(() => {
    if (mode === "edit" && jobId && !loadingData && headquarters.length > 0) {
      fetchJob(jobId)
    }
  }, [mode, jobId, loadingData, headquarters, fetchJob])

  // Fetch positions when department changes
  useEffect(() => {
    if (formData.departmentId) {
      fetchPositionsByDepartment(Number(formData.departmentId))
    } else {
      setPositions([])
      if (mode === "create") {
        setFormData(prev => ({ ...prev, positionId: "" }))
      }
    }
  }, [formData.departmentId, fetchPositionsByDepartment, mode])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.isTest && !formData.questionSetId) {
      toast.error("Vui lòng chọn bộ câu hỏi khi bật yêu cầu kiểm tra!")
      return
    }

    try {
      setSaving(true)
      
      const location = headquarters.find(h => h.headquarterId.toString() === formData.headquarterId)?.address || formData.location || ""
      
      if (mode === "create") {
        const createData: CreateJobPostingRequest = {
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
          location,
          departmentId: Number(formData.departmentId),
          positionId: Number(formData.positionId),
          hiringManagerId: 0,
          isTest: formData.isTest,
          questionSetId: formData.questionSetId ? Number(formData.questionSetId) : undefined,
          quantityQuestion: formData.quantityQuestion ? Number(formData.quantityQuestion) : undefined,
          minScore: formData.minScore ? Number(formData.minScore) : undefined
        }

        const newJob = await recruitmentAPI.createJobPosting(createData)
        toast.success("Tạo vị trí tuyển dụng thành công!")
        router.push(`/recruitment/jobs/detail/${newJob.jobPostingId}`)
      } else if (job) {
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
          location,
          departmentId: Number(formData.departmentId),
          positionId: Number(formData.positionId),
          hiringManagerId: 0,
          status: formData.status,
          isTest: formData.isTest,
          questionSetId: formData.questionSetId ? Number(formData.questionSetId) : undefined,
          quantityQuestion: formData.quantityQuestion ? Number(formData.quantityQuestion) : undefined,
          minScore: formData.minScore ? Number(formData.minScore) : undefined
        }

        await recruitmentAPI.updateJobPosting(job.jobPostingId, updateData)
        toast.success("Cập nhật vị trí tuyển dụng thành công!")
        router.push(`/recruitment/jobs/detail/${job.jobPostingId}`)
      }
    } catch (error: any) {
      console.error("Error saving job:", error)
      const errorMessages = error?.response?.data?.message || error?.message
      
      if (Array.isArray(errorMessages)) {
        errorMessages.forEach((msg: string) => toast.error(msg))
      } else if (errorMessages) {
        toast.error(errorMessages)
      } else {
        toast.error(mode === "create" 
          ? "Không thể tạo vị trí tuyển dụng. Vui lòng thử lại!"
          : "Không thể cập nhật vị trí tuyển dụng. Vui lòng thử lại!"
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const backUrl = mode === "create" 
    ? "/recruitment/jobs" 
    : `/recruitment/jobs/detail/${jobId}`

  // Loading skeleton
  if (loading || loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backUrl}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "create" ? "Tạo vị trí tuyển dụng mới" : "Chỉnh sửa vị trí tuyển dụng"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "create" 
                ? "Tạo một vị trí tuyển dụng mới cho công ty"
                : "Cập nhật thông tin vị trí tuyển dụng"
              }
            </p>
          </div>
        </div>
        {mode === "create" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Sử dụng nút chatbot ở góc dưới bên phải để tạo job với AI")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Tạo với AI
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Thông tin chính của vị trí tuyển dụng</CardDescription>
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
                  rows={6}
                  className="resize-none"
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
                  rows={6}
                  className="resize-none"
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
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Chi tiết vị trí</CardTitle>
              <CardDescription>Thông tin về lương, loại việc làm và thời hạn</CardDescription>
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
                <Label htmlFor="headquarterId">Chi nhánh làm việc *</Label>
                <Select 
                  value={formData.headquarterId} 
                  onValueChange={(value) => handleInputChange("headquarterId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    {headquarters.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Chưa có chi nhánh
                      </div>
                    ) : (
                      headquarters.map((hq) => (
                        <SelectItem key={hq.headquarterId} value={hq.headquarterId.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{hq.headquarterName}</span>
                            <span className="text-xs text-muted-foreground">{hq.address}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Thông tin tổ chức</CardTitle>
              <CardDescription>Phòng ban và vị trí</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Phòng ban *</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(value) => handleInputChange("departmentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Chưa có phòng ban
                      </div>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.departmentId} value={dept.departmentId.toString()}>
                          {dept.departmentName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="positionId">Vị trí *</Label>
                <Select 
                  value={formData.positionId} 
                  onValueChange={(value) => handleInputChange("positionId", value)}
                  disabled={!formData.departmentId || positions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !formData.departmentId 
                          ? "Chọn phòng ban trước" 
                          : positions.length === 0 
                            ? "Không có vị trí" 
                            : "Chọn vị trí"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        {!formData.departmentId ? "Vui lòng chọn phòng ban trước" : "Không có vị trí trong phòng ban này"}
                      </div>
                    ) : (
                      positions.map((pos) => (
                        <SelectItem key={pos.positionId} value={pos.positionId.toString()}>
                          {pos.positionName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Test & Assessment */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Kiểm tra và Đánh giá</CardTitle>
              <CardDescription>Cấu hình kiểm tra và bộ câu hỏi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTest"
                  checked={formData.isTest}
                  onCheckedChange={(checked) => handleInputChange("isTest", checked === true)}
                />
                <Label htmlFor="isTest" className="cursor-pointer">
                  Yêu cầu kiểm tra (Test required)
                </Label>
              </div>

              {formData.isTest && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="questionSetId">Bộ câu hỏi *</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => router.push("/recruitment/questions")}
                      >
                        Quản lý bộ câu hỏi
                      </Button>
                    </div>
                    <Select
                      value={formData.questionSetId}
                      onValueChange={(value) => handleInputChange("questionSetId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bộ câu hỏi" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionSets.length === 0 ? (
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
          <Link href={backUrl}>
            <Button variant="outline" type="button">
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Đang tạo..." : "Đang lưu..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === "create" ? "Tạo vị trí" : "Lưu thay đổi"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

