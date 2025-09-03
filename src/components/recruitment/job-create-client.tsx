"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { recruitmentAPI, CreateJobPostingRequest } from "@/lib/api/recruitment"

export function JobCreateClient() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    minSalary: "",
    maxSalary: "",
    employmentType: "",
    experienceLevel: "",
    benefits: "",
    applicationDeadline: "",
    status: "draft" as "draft" | "published",
    departmentId: "",
    positionId: "",
    headquarterId: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const createData: CreateJobPostingRequest = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        minSalary: Number(formData.minSalary),
        maxSalary: Number(formData.maxSalary),
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        benefits: formData.benefits,
        applicationDeadline: formData.applicationDeadline,
        status: formData.status,
        departmentId: Number(formData.departmentId),
        positionId: Number(formData.positionId),
        headquarterId: Number(formData.headquarterId)
      }

      const newJob = await recruitmentAPI.createJobPosting(createData)
      router.push(`/recruitment/jobs/detail/${newJob.jobPostingId}`)
    } catch (error) {
      console.error("Error creating job:", error)
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
                  <Label htmlFor="minSalary">Lương tối thiểu *</Label>
                  <Input
                    id="minSalary"
                    type="number"
                    value={formData.minSalary}
                    onChange={(e) => handleInputChange("minSalary", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSalary">Lương tối đa *</Label>
                  <Input
                    id="maxSalary"
                    type="number"
                    value={formData.maxSalary}
                    onChange={(e) => handleInputChange("maxSalary", e.target.value)}
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
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value: "draft" | "published") => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Đang tuyển</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="space-y-2">
                <Label htmlFor="headquarterId">Địa điểm *</Label>
                <Select value={formData.headquarterId} onValueChange={(value) => handleInputChange("headquarterId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Hà Nội</SelectItem>
                    <SelectItem value="2">TP. Hồ Chí Minh</SelectItem>
                    <SelectItem value="3">Đà Nẵng</SelectItem>
                    <SelectItem value="4">Cần Thơ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
    </div>
  )
}
