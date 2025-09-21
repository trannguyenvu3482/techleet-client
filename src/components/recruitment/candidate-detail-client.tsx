"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  FileText,
  Star,
  Award,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Save,
  X,
  Building,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { recruitmentAPI, Application, JobPosting, Candidate } from "@/lib/api/recruitment"

interface CandidateDetailData extends Candidate {
  applications?: Application[];
  currentApplication?: Application;
  jobTitle?: string;
  overscore?: number | null;
}

export function CandidateDetailClient() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [candidate, setCandidate] = useState<CandidateDetailData | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)

  // Get applicationId from URL params if available
  const applicationId = searchParams.get("applicationId")
  const candidateId = Number(params.candidateId)

  useEffect(() => {
    if (candidateId) {
      fetchData()
    }
  }, [candidateId, applicationId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch candidate details
      const candidateData = await recruitmentAPI.getCandidateById(candidateId)
      
      // Fetch applications for this candidate
      const applicationsData = await recruitmentAPI.getApplications({
        candidateId: candidateId
      })
      
      setApplications(applicationsData.data)
      
      // Find current application if applicationId is provided
      let currentApplication: Application | undefined
      if (applicationId) {
        currentApplication = applicationsData.data.find(app => 
          app.applicationId === Number(applicationId)
        )
      }
      
      // Transform candidate data
      const transformedCandidate: CandidateDetailData = {
        ...candidateData,
        applications: applicationsData.data,
        currentApplication,
        jobTitle: currentApplication?.jobPosting?.title,
        overscore: currentApplication?.score || null
      }
      
      setCandidate(transformedCandidate)
      if (currentApplication) {
        setNewStatus(currentApplication.applicationStatus)
        setSelectedApplicationId(currentApplication.applicationId)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      router.push("/recruitment/candidate/list")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="secondary">Đã nộp</Badge>
      case "screening":
        return <Badge variant="default">Đang sàng lọc</Badge>
      case "interviewing":
        return <Badge variant="default">Phỏng vấn</Badge>
      case "offer":
        return <Badge variant="default">Đề nghị</Badge>
      case "hired":
        return <Badge variant="default">Đã tuyển</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      case "withdrawn":
        return <Badge variant="outline">Rút lui</Badge>
      case "new":
        return <Badge variant="secondary">Mới</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatSalary = (salary: number | undefined) => {
    if (!salary) return "N/A"
    return new Intl.NumberFormat("vi-VN").format(salary) + " VND"
  }

  const getScoreColor = (score: number | null | undefined) => {
    if (!score) return "text-muted-foreground"
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const handleStatusUpdate = async () => {
    if (!selectedApplicationId || !newStatus) return
    
    try {
      await recruitmentAPI.updateApplication(selectedApplicationId, {
        applicationStatus: newStatus as any
      })
      setIsEditingStatus(false)
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingStatus(false)
    if (candidate?.currentApplication) {
      setNewStatus(candidate.currentApplication.applicationStatus)
    }
  }

  const handleApplicationSelect = (applicationId: number) => {
    const application = applications.find(app => app.applicationId === applicationId)
    if (application) {
      setSelectedApplicationId(applicationId)
      setNewStatus(application.applicationStatus)
      // Update URL with selected application
      const url = new URL(window.location.href)
      url.searchParams.set("applicationId", applicationId.toString())
      window.history.pushState({}, "", url.toString())
      fetchData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không tìm thấy thông tin ứng viên</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/recruitment/candidate/list">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {candidate.fullName || `${candidate.firstName} ${candidate.lastName}`}
            </h1>
            <p className="text-muted-foreground">
              Chi tiết ứng viên
              {candidate.jobTitle && ` - ${candidate.jobTitle}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {candidate.resumeUrl && (
            <Button 
              variant="outline"
              onClick={() => window.open(candidate.resumeUrl, '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Tải CV
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => window.open(candidate.resumeUrl, '_blank')}
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem CV
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Email:</strong> {candidate.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Số điện thoại:</strong> {candidate.phoneNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Địa chỉ:</strong> {candidate.address || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Ngày sinh:</strong> {candidate.birthDate ? formatDate(candidate.birthDate) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Giới tính:</strong> {candidate.gender === true ? "Nam" : candidate.gender === false ? "Nữ" : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Ngày đăng ký:</strong> {formatDate(candidate.createdAt)}
                  </span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="space-y-2">
                {candidate.linkedinUrl && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                
                {candidate.githubUrl && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}
                
                {candidate.portfolioUrl && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Portfolio
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Thông tin nghề nghiệp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Kinh nghiệm:</strong> {candidate.yearsOfExperience || 0} năm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Công ty hiện tại:</strong> {candidate.currentCompany || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Vị trí hiện tại:</strong> {candidate.currentJobTitle || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Mức lương mong muốn:</strong> {formatSalary(candidate.expectedSalary)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Loại công việc:</strong> {candidate.preferredEmploymentType || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Làm việc từ xa:</strong> {candidate.availableForRemote ? "Có" : "Không"}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {candidate.skills && (
                <div>
                  <h4 className="font-semibold mb-2">Kỹ năng</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.split(',').map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Programming Languages */}
              {candidate.programmingLanguages && (
                <div>
                  <h4 className="font-semibold mb-2">Ngôn ngữ lập trình</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.programmingLanguages.split(',').map((lang, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {lang.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {candidate.summary && (
                <div>
                  <h4 className="font-semibold mb-2">Tóm tắt</h4>
                  <p className="text-sm text-muted-foreground">{candidate.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Thông tin học vấn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Trình độ:</strong> {candidate.educationLevel || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Chuyên ngành:</strong> {candidate.fieldOfStudy || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Trường:</strong> {candidate.university || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Năm tốt nghiệp:</strong> {candidate.graduationYear || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application History */}
          {applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lịch sử ứng tuyển
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div 
                      key={application.applicationId}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedApplicationId === application.applicationId 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleApplicationSelect(application.applicationId)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{application.jobPosting?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Ngày nộp: {formatDate(application.appliedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(application.applicationStatus)}
                          {application.score && (
                            <div className={`flex items-center gap-1 ${getScoreColor(application.score)}`}>
                              <Star className="h-4 w-4" />
                              <span className="text-sm font-medium">{Math.round(application.score)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {application.coverLetter && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {application.coverLetter}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Quản lý trạng thái CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.currentApplication ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trạng thái hiện tại</span>
                    {getStatusBadge(candidate.currentApplication.applicationStatus)}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cập nhật trạng thái</label>
                    {isEditingStatus ? (
                      <div className="space-y-2">
                        <Select 
                          value={newStatus} 
                          onValueChange={setNewStatus}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="submitted">Đã nộp</SelectItem>
                            <SelectItem value="screening">Đang sàng lọc</SelectItem>
                            <SelectItem value="interviewing">Phỏng vấn</SelectItem>
                            <SelectItem value="offer">Đề nghị</SelectItem>
                            <SelectItem value="hired">Đã tuyển</SelectItem>
                            <SelectItem value="rejected">Từ chối</SelectItem>
                            <SelectItem value="withdrawn">Rút lui</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleStatusUpdate}>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="mr-2 h-4 w-4" />
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setIsEditingStatus(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa trạng thái
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Chọn một đơn ứng tuyển để quản lý trạng thái
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Info */}
          {candidate.currentApplication && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn ứng tuyển</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">ID đơn ứng tuyển</span>
                  <span className="text-sm font-medium">#{candidate.currentApplication.applicationId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ngày nộp</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(candidate.currentApplication.appliedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cập nhật lần cuối</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(candidate.currentApplication.updatedAt)}
                  </span>
                </div>
                {candidate.overscore && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Điểm tổng thể</span>
                    <span className={`text-sm font-medium ${getScoreColor(candidate.overscore)}`}>
                      {Math.round(candidate.overscore)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Lên lịch phỏng vấn
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Gửi email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Thêm ghi chú
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
