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
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { recruitmentAPI, CreateJobPostingRequest, questionAPI, QuestionSet } from "@/lib/api/recruitment"
import { companyAPI, Headquarter, Department, Position } from "@/lib/api/company"
import { toast } from "sonner"
import { PageContext } from "@/components/chatbot/chatbot-types"
import { useChatbotPageContext } from "@/components/chatbot/chatbot-page-context"
import { setGlobalFormFillHandler } from "@/components/chatbot/chatbot-with-context"
import { Sparkles } from "lucide-react"

export function JobCreateClient() {
  const router = useRouter()
  const { setPageContext } = useChatbotPageContext()
  const [saving, setSaving] = useState(false)
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(false)
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [showQuestionSetDialog, setShowQuestionSetDialog] = useState(false)
  const [newQuestionSetName, setNewQuestionSetName] = useState("")
  const [newQuestionSetDescription, setNewQuestionSetDescription] = useState("")
  const [showFormFillDialog, setShowFormFillDialog] = useState(false)
  const [pendingFormFillData, setPendingFormFillData] = useState<any>(null)
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
    headquarterId: "",
    departmentId: "",
    positionId: "",
    isTest: false,
    questionSetId: "",
    quantityQuestion: "10",
    minScore: ""
  })

  const fetchInitialData = async () => {
    try {
      setLoadingData(true)
      const [headquartersRes, departmentsRes] = await Promise.all([
        companyAPI.getHeadquarters({ limit: 100, isActive: true }),
        companyAPI.getDepartments({ limit: 100, isActive: true })
      ])
      setHeadquarters(headquartersRes.data)
      setDepartments(departmentsRes.data)
    } catch (error) {
      console.error("Error fetching initial data:", error)
      toast.error("Không thể tải dữ liệu ban đầu")
    } finally {
      setLoadingData(false)
    }
  }

  const fetchPositionsByDepartment = async (departmentId: number) => {
    try {
      const positionsRes = await companyAPI.getPositionsByDepartment(departmentId)
      setPositions(positionsRes)
    } catch (error) {
      console.error("Error fetching positions:", error)
      toast.error("Không thể tải danh sách vị trí")
    }
  }

  const fetchQuestionSets = async () => {
    try {
      setLoadingQuestionSets(true)
      const response = await questionAPI.getQuestionSets({ limit: 100 })
      setQuestionSets(response.data)
    } catch (error) {
      console.error("Error fetching question sets:", error)
      toast.error("Không thể tải danh sách bộ câu hỏi")
    } finally {
      setLoadingQuestionSets(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getFormContext = useCallback((): PageContext => {
    return {
      page: 'job-create',
      formData: {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        vacancies: formData.vacancies,
        departmentId: formData.departmentId,
        positionId: formData.positionId,
        headquarterId: formData.headquarterId,
      }
    }
  }, [formData])

  const handleFormFillFromAI = useCallback((data: any) => {
    // Validate data structure before showing error
    if (!data) {
      return // Silently return if no data
    }

    // Check if data has the expected structure
    if (!data.generatedFields || typeof data.generatedFields !== 'object') {
      // Only show error if we expected valid data but got invalid structure
      // This prevents spamming when callback is called with undefined/null
      if (data && Object.keys(data).length > 0) {
        console.warn('Invalid AI data structure:', data)
        toast.error("Dữ liệu từ AI không hợp lệ")
      }
      return
    }

    // Prevent duplicate dialogs
    if (showFormFillDialog) {
      return
    }

    setPendingFormFillData(data)
    setShowFormFillDialog(true)
  }, [showFormFillDialog])

  useEffect(() => {
    fetchQuestionSets()
    fetchInitialData()
  }, [])

  // Update page context when form data changes
  useEffect(() => {
    const context = getFormContext()
    setPageContext(context)
    setGlobalFormFillHandler(handleFormFillFromAI)
    return () => {
      setPageContext(undefined)
      setGlobalFormFillHandler(undefined)
    }
  }, [getFormContext, setPageContext, handleFormFillFromAI])

  useEffect(() => {
    if (formData.departmentId) {
      fetchPositionsByDepartment(Number(formData.departmentId))
    } else {
      setPositions([])
      setFormData(prev => ({ ...prev, positionId: "" }))
    }
  }, [formData.departmentId])

  const confirmFormFill = () => {
    if (!pendingFormFillData || !pendingFormFillData.generatedFields) {
      return
    }

    const generated = pendingFormFillData.generatedFields
    const suggestions = pendingFormFillData.suggestions || {}

    // Fill form with generated data
    setFormData(prev => ({
      ...prev,
      title: generated.title || prev.title,
      description: generated.description || prev.description,
      requirements: generated.requirements || prev.requirements,
      benefits: generated.benefits || prev.benefits,
      employmentType: generated.employmentType || prev.employmentType,
      experienceLevel: generated.experienceLevel || prev.experienceLevel,
      salaryMin: generated.salaryMin ? generated.salaryMin.toString() : prev.salaryMin,
      salaryMax: generated.salaryMax ? generated.salaryMax.toString() : prev.salaryMax,
      vacancies: generated.vacancies ? generated.vacancies.toString() : prev.vacancies,
      departmentId: suggestions.departmentId ? suggestions.departmentId.toString() : prev.departmentId,
      positionId: suggestions.positionId ? suggestions.positionId.toString() : prev.positionId,
      headquarterId: suggestions.headquarterId ? suggestions.headquarterId.toString() : prev.headquarterId,
    }))

    setShowFormFillDialog(false)
    setPendingFormFillData(null)
    toast.success("Đã điền thông tin vào form. Vui lòng kiểm tra và bổ sung các thông tin còn thiếu.")
  }

  const handleCreateQuestionSet = async () => {
    try {
      await questionAPI.createQuestionSet({
        title: newQuestionSetName,
        description: newQuestionSetDescription
      })
      setNewQuestionSetName("")
      setNewQuestionSetDescription("")
      setShowQuestionSetDialog(false)
      toast.success("Tạo bộ câu hỏi thành công!")
      await fetchQuestionSets()
    } catch (error: any) {
      console.error("Error creating question set:", error)
      const errorMessages = error?.response?.data?.message || error?.message
      
      // Handle array of errors (validation errors)
      if (Array.isArray(errorMessages)) {
        errorMessages.forEach((msg: string) => {
          toast.error(msg)
        })
      } else if (errorMessages) {
        toast.error(errorMessages)
      } else {
        toast.error("Không thể tạo bộ câu hỏi. Vui lòng thử lại!")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that questionSetId is selected when isTest is true
    if (formData.isTest && !formData.questionSetId) {
      toast.error("Vui lòng chọn bộ câu hỏi khi bật yêu cầu kiểm tra!")
      return
    }

    try {
      setSaving(true)
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
        location: headquarters.find(h => h.headquarterId.toString() === formData.headquarterId)?.address || "",
        departmentId: Number(formData.departmentId),
        positionId: Number(formData.positionId),
        hiringManagerId: 0, // Deprecated - not used
        isTest: formData.isTest,
        questionSetId: formData.questionSetId ? Number(formData.questionSetId) : undefined,
        quantityQuestion: formData.quantityQuestion ? Number(formData.quantityQuestion) : undefined,
        minScore: formData.minScore ? Number(formData.minScore) : undefined
      }

      const newJob = await recruitmentAPI.createJobPosting(createData)
      toast.success("Tạo vị trí tuyển dụng thành công!")
      router.push(`/recruitment/jobs/detail/${newJob.jobPostingId}`)
    } catch (error: any) {
      console.error("Error creating job:", error)
      const errorMessages = error?.response?.data?.message || error?.message
      
      // Handle array of errors (validation errors)
      if (Array.isArray(errorMessages)) {
        errorMessages.forEach((msg: string) => {
          toast.error(msg)
        })
      } else if (errorMessages) {
        toast.error(errorMessages)
      } else {
        toast.error("Không thể tạo vị trí tuyển dụng. Vui lòng thử lại!")
      }
    } finally {
      setSaving(false)
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Tạo vị trí tuyển dụng mới</h1>
            <p className="text-muted-foreground">
              Tạo một vị trí tuyển dụng mới cho công ty
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Open chatbot - this will be handled by the global chatbot
            // We'll add a note that user can use the chatbot button
            toast.info("Sử dụng nút chatbot ở góc dưới bên phải để tạo job với AI")
          }}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Tạo với AI
        </Button>
      </div>

      {loadingData ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
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
                  rows={6}
                  className="resize-none break-words overflow-wrap-anywhere"
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
                  className="resize-none break-words overflow-wrap-anywhere"
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
                 <Label htmlFor="headquarterId">Chi nhánh làm việc *</Label>
                 <Select 
                   value={formData.headquarterId} 
                   onValueChange={(value) => handleInputChange("headquarterId", value)}
                   disabled={loadingData}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder={loadingData ? "Đang tải..." : "Chọn chi nhánh"} />
                   </SelectTrigger>
                   <SelectContent>
                     {headquarters.length === 0 ? (
                       <div className="p-2 text-center text-sm text-muted-foreground">
                         {loadingData ? "Đang tải..." : "Chưa có chi nhánh"}
                       </div>
                     ) : (
                       headquarters.map((hq) => (
                         <SelectItem key={hq.headquarterId} value={hq.headquarterId.toString()}>
                           <div className="flex flex-col">
                             <span className="font-medium">{hq.headquarterName}</span>
                             <span className="text-xs text-muted-foreground">{hq.address}, {hq.city}</span>
                           </div>
                         </SelectItem>
                       ))
                     )}
                   </SelectContent>
                 </Select>
                 {formData.headquarterId && (
                   <p className="text-xs text-muted-foreground">
                     {headquarters.find(h => h.headquarterId.toString() === formData.headquarterId)?.address}
                   </p>
                 )}
               </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tổ chức</CardTitle>
              <CardDescription>
                Phòng ban, vị trí và chi nhánh làm việc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Phòng ban *</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(value) => handleInputChange("departmentId", value)}
                  disabled={loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Đang tải..." : "Chọn phòng ban"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        {loadingData ? "Đang tải..." : "Chưa có phòng ban"}
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="questionSetId">Bộ câu hỏi *</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => router.push("/recruitment/questions")}
                      >
                        Tạo bộ câu hỏi mới
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
          <Link href="/recruitment/jobs">
            <Button variant="outline" type="button">
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Tạo vị trí
              </>
            )}
          </Button>
        </div>
      </form>
      )}

      {/* Form Fill Confirmation Dialog */}
      <Dialog open={showFormFillDialog} onOpenChange={setShowFormFillDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xác nhận điền thông tin vào form</DialogTitle>
            <DialogDescription>
              AI đã tạo nội dung cho các field sau. Bạn có muốn điền vào form không?
            </DialogDescription>
          </DialogHeader>
          {pendingFormFillData && pendingFormFillData.generatedFields && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Các field sẽ được điền:</h4>
                <div className="space-y-2 text-sm">
                  {pendingFormFillData.generatedFields.title && (
                    <div>
                      <span className="font-medium">Tiêu đề: </span>
                      <span className="text-muted-foreground">{pendingFormFillData.generatedFields.title}</span>
                    </div>
                  )}
                  {pendingFormFillData.generatedFields.description && (
                    <div>
                      <span className="font-medium">Mô tả: </span>
                      <span className="text-muted-foreground line-clamp-2">{pendingFormFillData.generatedFields.description}</span>
                    </div>
                  )}
                  {pendingFormFillData.generatedFields.requirements && (
                    <div>
                      <span className="font-medium">Yêu cầu: </span>
                      <span className="text-muted-foreground line-clamp-2">{pendingFormFillData.generatedFields.requirements}</span>
                    </div>
                  )}
                  {pendingFormFillData.generatedFields.benefits && (
                    <div>
                      <span className="font-medium">Phúc lợi: </span>
                      <span className="text-muted-foreground line-clamp-2">{pendingFormFillData.generatedFields.benefits}</span>
                    </div>
                  )}
                  {pendingFormFillData.generatedFields.employmentType && (
                    <div>
                      <span className="font-medium">Loại việc làm: </span>
                      <span className="text-muted-foreground">{pendingFormFillData.generatedFields.employmentType}</span>
                    </div>
                  )}
                  {pendingFormFillData.generatedFields.experienceLevel && (
                    <div>
                      <span className="font-medium">Mức độ kinh nghiệm: </span>
                      <span className="text-muted-foreground">{pendingFormFillData.generatedFields.experienceLevel}</span>
                    </div>
                  )}
                </div>
              </div>
              {pendingFormFillData.missingFields && pendingFormFillData.missingFields.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <h4 className="font-semibold text-sm text-yellow-600">Các field cần bổ sung:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {pendingFormFillData.missingFields.map((field: string) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormFillDialog(false)}>
              Hủy
            </Button>
            <Button onClick={confirmFormFill}>
              Điền vào form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page context is set via useChatbotPageContext hook */}
    </div>
  )
}
