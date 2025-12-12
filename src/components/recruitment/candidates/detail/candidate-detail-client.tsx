"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Clock,
  Edit,
  Save,
  X,
  Building,
  DollarSign,
  Image,
  File,
  FileSpreadsheet,
  FileType,
  CheckCircle2,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { recruitmentAPI, Application, Candidate, CandidateFile } from "@/lib/api/recruitment"
import CreateInterviewModal from "@/app/(home)/recruitment/candidate/detail/[candidateId]/create-interview-modal"
import { ApproveOfferDialog } from "../../interviews/notes/approve-offer-dialog"
import { RejectApplicationDialog } from "../../interviews/notes/reject-application-dialog"
import { RecruitmentBreadcrumb } from "../../shared/recruitment-breadcrumb"
import { StatusBadge } from "../../shared/status-badge"
import { ScoreIndicator } from "@/components/ui/score-indicator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"

interface CertificateFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'excel' | 'pdf' | 'other';
  size: string;
  uploadDate: string;
}

interface ApiCandidateResponse extends Candidate {
  university?: string;
  yearsOfExperience?: number;
  skills?: string;
  summary?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  programmingLanguages?: string;
  expectedSalary?: number;
  preferredEmploymentType?: string;
  availableForRemote?: boolean;
  availableStartDate?: string;
  source?: string;
  gender?: string;
  status?: string;
  appliedDate?: string;
  birthDate?: string;
  githubUrl?: string;
}

interface ApiApplicationResponse {
  applicationId: number;
  candidateId: number;
  jobPostingId: number;
  coverLetter?: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  appliedDate: string;
  updatedAt: string;
  score: number | null;
}

interface CandidateDetailData extends Candidate {
  applications?: Application[];
  currentApplication?: Application;
  jobTitle?: string;
  overscore?: number | null;
  // Additional fields from candidate entity
  birthDate?: string;
  gender?: boolean;
  githubUrl?: string;
  status?: string;
  appliedDate?: string;
  summary?: string;
  yearsOfExperience?: number;
  currentJobTitle?: string;
  currentCompany?: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  university?: string;
  graduationYear?: number;
  programmingLanguages?: string;
  expectedSalary?: number;
  preferredEmploymentType?: string;
  availableForRemote?: boolean;
  availableStartDate?: string;
  source?: string;
  certificates?: CertificateFile[];
  candidateFiles?: CandidateFile[];
}

export function CandidateDetailClient() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [candidate, setCandidate] = useState<CandidateDetailData | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [candidateFiles, setCandidateFiles] = useState<CandidateFile[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)
  const [hasFutureInterview, setHasFutureInterview] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [currentApplicationStatus, setCurrentApplicationStatus] = useState<string | null>(null)

  // Get applicationId from URL params if available
  const applicationId = searchParams.get("applicationId")
  const candidateId = Number(params.candidateId)

  // Ensure newStatus is synced when candidate data loads
  useEffect(() => {
    if (candidate?.currentApplication) {
      setNewStatus(candidate.currentApplication.applicationStatus)
    }
  }, [candidate])

  // Helper function to handle null/undefined values
  const safeValue = (value: unknown, defaultValue: string = "-"): string => {
    if (value === null || value === undefined || value === "") {
      return defaultValue;
    }
    return String(value);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      if (applicationId) {
        try {
          const response = await recruitmentAPI.getApplicationById(Number(applicationId))
          
          if (response) {
            const {candidate:apiCandidate, application} = response as unknown as {candidate: ApiCandidateResponse, application: ApiApplicationResponse}
            
            // Transform API data to match our interface
            const transformedCandidate: CandidateDetailData = {
              candidateId: apiCandidate.candidateId,
              firstName: safeValue(apiCandidate.firstName),
              lastName: safeValue(apiCandidate.lastName),
              email: safeValue(apiCandidate.email),
              phoneNumber: safeValue(apiCandidate.phoneNumber),
              address: "Hồ Chí Minh",//safeValue(apiCandidate.address)
              city: "-", // Not in API response
              postalCode: "-", // Not in API response
              education: safeValue(apiCandidate.university || apiCandidate.education),
              workExperience: `${safeValue(apiCandidate.yearsOfExperience)} năm kinh nghiệm`,
              skills: (() => {
                if (!apiCandidate.skills) return "-";
                try {
                  const parsed = JSON.parse(apiCandidate.skills);
                  return Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
                } catch {
                  return apiCandidate.skills;
                }
              })(),
              certifications: "-", // Not in API response
              portfolioUrl: safeValue(apiCandidate.portfolioUrl),
              linkedinUrl: safeValue(apiCandidate.linkedinUrl),
              resumeUrl: safeValue(apiCandidate.resumeUrl),
              createdAt: apiCandidate.createdAt,
              updatedAt: apiCandidate.updatedAt,
              isActive: apiCandidate.isActive,
              // Additional fields from candidate entity
              birthDate: safeValue(apiCandidate.birthDate),
              gender: apiCandidate.gender === "Male" ? true : apiCandidate.gender === "Female" ? false : undefined,
              githubUrl: safeValue(apiCandidate.githubUrl),
              status: safeValue(apiCandidate.status),
              appliedDate: safeValue(apiCandidate.appliedDate),
              summary: safeValue(apiCandidate.summary),
              yearsOfExperience: apiCandidate.yearsOfExperience || 0,
              currentJobTitle: safeValue(apiCandidate.currentJobTitle),
              currentCompany: safeValue(apiCandidate.currentCompany),
              educationLevel: safeValue(apiCandidate.educationLevel),
              fieldOfStudy: safeValue(apiCandidate.fieldOfStudy),
              university: safeValue(apiCandidate.university),
              graduationYear: apiCandidate.graduationYear || undefined,
              programmingLanguages: (() => {
                if (!apiCandidate.programmingLanguages) return "-";
                try {
                  const parsed = JSON.parse(apiCandidate.programmingLanguages);
                  return Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
                } catch {
                  return apiCandidate.programmingLanguages;
                }
              })(),
              expectedSalary: apiCandidate.expectedSalary || undefined,
              preferredEmploymentType: safeValue(apiCandidate.preferredEmploymentType),
              availableForRemote: apiCandidate.availableForRemote,
              availableStartDate: safeValue(apiCandidate.availableStartDate),
              source: safeValue(apiCandidate.source),
              applications: [],
              currentApplication: undefined,
              jobTitle: undefined,
              overscore: application.score || null,
              certificates: [] // Not in API response
            }

            // Create application object
            const transformedApplication: Application = {
              applicationId: application.applicationId,
              candidateId: application.candidateId,
              jobPostingId: application.jobPostingId,
              coverLetter: safeValue(application.coverLetter),
              applicationStatus: application.status === "approved" ? "accepted" : application.status as "pending" | "reviewing" | "interview" | "rejected" | "accepted",
              appliedAt: application.appliedDate,
              updatedAt: application.updatedAt,
              score: application.score || undefined,
              candidate: transformedCandidate,
              jobPosting: undefined, // Not in API response
              aiSummary: (application as any).aiSummary,
              keyHighlights: (application as any).keyHighlights,
              concerns: (application as any).concerns
            }

            console.log("transformedApplication", transformedApplication)

            setApplications([transformedApplication])
            setCandidate({
              ...transformedCandidate,
              applications: [transformedApplication],
              currentApplication: transformedApplication,
              jobTitle: undefined, // Will be filled when job data is available
              overscore: application.score || undefined
            })
            
            setNewStatus(application.status)
            setSelectedApplicationId(application.applicationId)
            setCurrentApplicationStatus(application.status)
            
            // Fetch candidate files
            try {
              const files = await recruitmentAPI.getCandidateFiles(apiCandidate.candidateId)
              setCandidateFiles(files)
            } catch (fileError) {
              console.error("Error fetching candidate files:", fileError)
              setCandidateFiles([])
            }
            
            return // Exit early if API call successful
          }
        } catch (apiError) {
          console.error("Error fetching real API data:", apiError)
          // Continue with mock data if API fails
        }
      }
      
      // Try to fetch candidate by ID if no applicationId provided
      try {
        const apiCandidate = await recruitmentAPI.getCandidateById(candidateId)
        
        if (apiCandidate) {
          // Transform API data to match our interface
          const transformedCandidate: CandidateDetailData = {
            candidateId: apiCandidate.candidateId,
            firstName: safeValue(apiCandidate.firstName),
            lastName: safeValue(apiCandidate.lastName),
            email: safeValue(apiCandidate.email),
            phoneNumber: safeValue(apiCandidate.phoneNumber),
            address: safeValue(apiCandidate.address),
            city: safeValue(apiCandidate.city),
            postalCode: safeValue(apiCandidate.postalCode),
            education: safeValue(apiCandidate.education),
            workExperience: safeValue(apiCandidate.workExperience),
            skills: safeValue(apiCandidate.skills),
            certifications: safeValue(apiCandidate.certifications),
            portfolioUrl: safeValue(apiCandidate.portfolioUrl),
            linkedinUrl: safeValue(apiCandidate.linkedinUrl),
            resumeUrl: safeValue(apiCandidate.resumeUrl),
            createdAt: apiCandidate.createdAt,
            updatedAt: apiCandidate.updatedAt,
            isActive: apiCandidate.isActive,
            // Additional fields - try to get from extended API response
            birthDate: safeValue((apiCandidate as any).birthDate || apiCandidate.dateOfBirth),
            gender: (apiCandidate as any).gender === "Male" ? true : (apiCandidate as any).gender === "Female" ? false : undefined,
            githubUrl: safeValue((apiCandidate as any).githubUrl),
            status: safeValue((apiCandidate as any).status),
            appliedDate: safeValue((apiCandidate as any).appliedDate),
            summary: safeValue((apiCandidate as any).summary),
            yearsOfExperience: (apiCandidate as any).yearsOfExperience || 0,
            currentJobTitle: safeValue((apiCandidate as any).currentJobTitle),
            currentCompany: safeValue((apiCandidate as any).currentCompany),
            educationLevel: safeValue((apiCandidate as any).educationLevel),
            fieldOfStudy: safeValue((apiCandidate as any).fieldOfStudy),
            university: safeValue((apiCandidate as any).university),
            graduationYear: (apiCandidate as any).graduationYear || undefined,
            programmingLanguages: (apiCandidate as any).programmingLanguages ? (typeof (apiCandidate as any).programmingLanguages === 'string' ? (apiCandidate as any).programmingLanguages : JSON.parse((apiCandidate as any).programmingLanguages).join(", ")) : "-",
            expectedSalary: (apiCandidate as any).expectedSalary || undefined,
            preferredEmploymentType: safeValue((apiCandidate as any).preferredEmploymentType),
            availableForRemote: (apiCandidate as any).availableForRemote,
            availableStartDate: safeValue((apiCandidate as any).availableStartDate),
            source: safeValue((apiCandidate as any).source),
            applications: [],
            currentApplication: undefined,
            jobTitle: undefined,
            overscore: null,
            certificates: []
          }
          
          // Fetch applications for this candidate
          try {
            const applicationsResponse = await recruitmentAPI.getApplications({ 
              page: 0, 
              limit: 100,
              candidateId: candidateId
            })
            
            const candidateApplications: Application[] = (applicationsResponse.data || []).map((app: any) => ({
              applicationId: app.applicationId,
              candidateId: app.candidateId,
              jobPostingId: app.jobPostingId,
              coverLetter: safeValue(app.coverLetter),
              applicationStatus: app.status === "approved" ? "accepted" : app.status as "pending" | "reviewing" | "interview" | "rejected" | "accepted",
              appliedAt: app.appliedDate || app.createdAt,
              updatedAt: app.updatedAt,
              score: app.screeningScore || app.score || undefined,
              candidate: transformedCandidate,
              jobPosting: app.jobPosting || undefined,
              aiSummary: app.aiSummary,
              keyHighlights: app.keyHighlights,
              concerns: app.concerns
            }))
            
            setApplications(candidateApplications)
            
            // Find current application if applicationId is provided
            let currentApplication: Application | undefined
            if (applicationId) {
              currentApplication = candidateApplications.find(app => 
                app.applicationId === Number(applicationId)
              )
            } else if (candidateApplications.length > 0) {
              // Default to first application
              currentApplication = candidateApplications[0]
            }
            
            // Fetch candidate files
            try {
              const files = await recruitmentAPI.getCandidateFiles(candidateId)
              setCandidateFiles(files)
            } catch (fileError) {
              console.error("Error fetching candidate files:", fileError)
              setCandidateFiles([])
            }
            
            setCandidate({
              ...transformedCandidate,
              applications: candidateApplications,
              currentApplication,
              jobTitle: currentApplication?.jobPosting?.title,
              overscore: currentApplication?.score || null
            })
            
            if (currentApplication) {
              setNewStatus(currentApplication.applicationStatus)
              setSelectedApplicationId(currentApplication.applicationId)
              setCurrentApplicationStatus(currentApplication.applicationStatus)
            }
            
            // Check if candidate has future interview
            try {
              const interviewData = await recruitmentAPI.getInterviewByCandidateId(candidateId);
              if (interviewData) {
                const scheduledTime = new Date(interviewData.scheduledAt);
                const now = new Date();
                setHasFutureInterview(scheduledTime > now);
              } else {
                setHasFutureInterview(false);
              }
            } catch (error) {
              console.log("Error checking future interview:", error);
              setHasFutureInterview(false);
            }
            
            return // Exit early if API call successful
          } catch (appError) {
            console.error("Error fetching applications:", appError)
            // Continue with candidate data only
            setApplications([])
            setCandidate(transformedCandidate)
            setCandidateFiles([])
            return
          }
        }
      } catch (candidateError) {
        console.error("Error fetching candidate by ID:", candidateError)
        // Continue to fallback mock data if API fails
      }
      
      // Fallback to mock data only if all API calls fail
      const mockCandidate: CandidateDetailData = {
        candidateId: candidateId,
        firstName: "Nguyễn Văn",
        lastName: "An",
        email: "nguyenvanan@email.com",
        phoneNumber: "0123456789",
        dateOfBirth: "1995-03-15",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        city: "Ho Chi Minh City",
        postalCode: "700000",
        education: "Đại học Bách Khoa TP.HCM",
        workExperience: "3 năm kinh nghiệm phát triển web",
        skills: "React, TypeScript, JavaScript, Node.js, MongoDB",
        certifications: "AWS Certified Developer",
        portfolioUrl: "https://portfolio.example.com",
        linkedinUrl: "https://linkedin.com/in/nguyenvanan",
        resumeUrl: "https://example.com/cv/nguyenvanan.pdf",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        isActive: true,
        // Additional fields from candidate entity
        birthDate: "1995-03-15",
        gender: true,
        githubUrl: "https://github.com/nguyenvanan",
        status: "active",
        appliedDate: "2024-01-01",
        summary: "Frontend developer với 3 năm kinh nghiệm, chuyên về React và TypeScript. Có khả năng làm việc độc lập và teamwork hiệu quả.",
        yearsOfExperience: 3,
        currentJobTitle: "Frontend Developer",
        currentCompany: "TechCorp Vietnam",
        educationLevel: "Bachelor",
        fieldOfStudy: "Computer Science",
        university: "Đại học Bách Khoa TP.HCM",
        graduationYear: 2017,
        programmingLanguages: "JavaScript, TypeScript, Python, Java",
        expectedSalary: 25000000,
        preferredEmploymentType: "Full-time",
        availableForRemote: true,
        availableStartDate: "2024-02-01",
        source: "LinkedIn",
        applications: [],
        currentApplication: undefined,
        jobTitle: undefined,
        overscore: null,
        certificates: []
      }

      const mockApplications: Application[] = [
        {
          applicationId: 101,
          candidateId: candidateId,
          jobPostingId: 1,
          coverLetter: "Tôi rất quan tâm đến vị trí Frontend Developer tại công ty. Với 3 năm kinh nghiệm trong lĩnh vực phát triển web, tôi tin rằng mình có thể đóng góp tích cực cho đội ngũ.",
          applicationStatus: "reviewing",
          appliedAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          score: 85,
          candidate: mockCandidate,
          jobPosting: {
            jobPostingId: 1,
            title: "Frontend Developer",
            description: "React, TypeScript developer",
            requirements: "3+ years experience",
            benefits: "Competitive salary",
            salaryMin: "15000000",
            salaryMax: "25000000",
            vacancies: 2,
            applicationDeadline: "2024-02-15",
            status: "published",
            location: "Ho Chi Minh City",
            employmentType: "Full-time",
            experienceLevel: "Mid-level",
            departmentId: 1,
            positionId: 1,
            hiringManagerId: 1,
            salaryRange: "15-25M VND",
            isJobActive: true,
            daysUntilDeadline: 30,
            applicationCount: 15,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          }
        },
        {
          applicationId: 102,
          candidateId: candidateId,
          jobPostingId: 2,
          coverLetter: "Tôi quan tâm đến vị trí Backend Developer. Có kinh nghiệm với Node.js và Python.",
          applicationStatus: "interview",
          appliedAt: "2024-01-14T14:20:00Z",
          updatedAt: "2024-01-14T14:20:00Z",
          score: 92,
          candidate: mockCandidate,
          jobPosting: {
            jobPostingId: 2,
            title: "Backend Developer",
            description: "Node.js, Python developer",
            requirements: "2+ years experience",
            benefits: "Flexible working",
            salaryMin: "18000000",
            salaryMax: "30000000",
            vacancies: 1,
            applicationDeadline: "2024-02-20",
            status: "published",
            location: "Ha Noi",
            employmentType: "Full-time",
            experienceLevel: "Senior",
            departmentId: 2,
            positionId: 2,
            hiringManagerId: 2,
            salaryRange: "18-30M VND",
            isJobActive: true,
            daysUntilDeadline: 35,
            applicationCount: 8,
            createdAt: "2024-01-02T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z"
          }
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setApplications(mockApplications)
      
      // Find current application if applicationId is provided
      let currentApplication: Application | undefined
      if (applicationId) {
        currentApplication = mockApplications.find(app => 
          app.applicationId === Number(applicationId)
        )
      } else {
        // Default to first application
        currentApplication = mockApplications[0]
      }
      
      // Transform candidate data
      const transformedCandidate: CandidateDetailData = {
        ...mockCandidate,
        applications: mockApplications,
        currentApplication,
        jobTitle: currentApplication?.jobPosting?.title,
        overscore: currentApplication?.score || null
      }
      
      setCandidate(transformedCandidate)
      if (currentApplication) {
        setNewStatus(currentApplication.applicationStatus)
        setSelectedApplicationId(currentApplication.applicationId)
      }
      
      // Set empty candidate files for mock data
      setCandidateFiles([])
      
      // Check if candidate has future interview
      try {
        const interviewData = await recruitmentAPI.getInterviewByCandidateId(candidateId);
        if (interviewData) {
          const scheduledTime = new Date(interviewData.scheduledAt);
          const now = new Date();
          setHasFutureInterview(scheduledTime > now);
        } else {
          setHasFutureInterview(false);
        }
      } catch (error) {
        console.log("Error checking future interview:", error);
        setHasFutureInterview(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      router.push("/recruitment/candidate/list")
    } finally {
      setLoading(false)
    }
  }, [candidateId, applicationId, router])

  useEffect(() => {
    if (candidateId) {
      fetchData()
    }
  }, [candidateId, applicationId, fetchData])


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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image className="h-5 w-5 text-blue-500" />
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case 'document':
        return <File className="h-5 w-5 text-blue-600" />
      default:
        return <FileType className="h-5 w-5 text-gray-500" />
    }
  }

  const getFileIconFromMimeType = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
    // eslint-disable-next-line jsx-a11y/alt-text
    if (mimeType.includes('image')) return <Image className="h-5 w-5 text-blue-500" />
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    if (mimeType.includes('word') || mimeType.includes('document')) return <File className="h-5 w-5 text-blue-600" />
    return <FileType className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (sizeInBytes: string) => {
    const bytes = parseInt(sizeInBytes)
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileClick = (file: CertificateFile) => {
    // Open file in new tab
    console.log("https://techleet.me/api/v1/recruitment-service/" + file.url)
    window.open("https://techleet.me/api/v1/recruitment-service/" + file.url, '_blank')
  }

  const handleFileDownload = (file: CertificateFile, event: React.MouseEvent) => {
    console.log("https://techleet.me/api/v1/recruitment-service/" + file)

    event.stopPropagation()
    // Trigger download
    const link = document.createElement('a')
    link.href = "https://techleet.me/api/v1/recruitment-service/" + file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCandidateFileClick = (file: CandidateFile) => {
    // Open file in new tab
    window.open("https://techleet.me/api/v1/recruitment-service/" + file.fileUrl, '_blank')
  }


  const handleStatusUpdate = async () => {
    if (!selectedApplicationId || !newStatus) return
    
    try {
      await recruitmentAPI.updateApplication(selectedApplicationId, {
        applicationStatus: newStatus === "approved" ? "accepted" : newStatus as "pending" | "reviewing" | "interview" | "rejected" | "accepted"
      })
      setIsEditingStatus(false)
      toast.success("Đã cập nhật trạng thái ứng viên")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Không thể cập nhật trạng thái")
    }
  }

  const handleCancelEdit = () => {
    setIsEditingStatus(false)
    if (candidate?.currentApplication) {
      setNewStatus(candidate.currentApplication.applicationStatus)
    }
  }

  const handleSuccess = async () => {
    await fetchData()
  }

  const canApproveReject = 
    currentApplicationStatus === 'interviewing' && 
    selectedApplicationId !== null

  const handleApplicationSelect = (applicationId: number) => {
    const application = applications.find(app => app.applicationId === applicationId)
    if (application) {
      setSelectedApplicationId(applicationId)
      setNewStatus(application.applicationStatus)
      setCurrentApplicationStatus(application.applicationStatus)
      // Update URL with selected application
      const url = new URL(window.location.href)
      url.searchParams.set("applicationId", applicationId.toString())
      window.history.pushState({}, "", url.toString())
      fetchData()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-4 w-64" />
        
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main content skeletons */}
          <div className="md:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar skeletons */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon="users"
          title="Không tìm thấy ứng viên"
          description="Ứng viên không tồn tại hoặc đã bị xóa khỏi hệ thống."
          action={{
            label: "Quay lại danh sách",
            onClick: () => router.push("/recruitment/candidate/list")
          }}
        />
      </div>
    )
  }

  const jobId = searchParams.get("jobId")
  const breadcrumbItems = [
    { label: "Danh sách ứng viên", href: "/recruitment/candidate/list" },
    ...(jobId ? [{ label: "Ứng viên theo vị trí", href: `/recruitment/candidate/list?jobId=${jobId}` }] : []),
    { label: `${candidate.firstName} ${candidate.lastName}` },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <RecruitmentBreadcrumb items={breadcrumbItems} />

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/recruitment/candidate/list${jobId ? `?jobId=${jobId}` : ""}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          {(applicationId || candidate.currentApplication?.applicationId) && (
            <Link href={`/recruitment/candidate/exams?applicationId=${applicationId || candidate.currentApplication?.applicationId}`}>
              <Button size="sm" variant="secondary">
                <Eye className="mr-2 h-4 w-4" />
                Xem bài thi
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {`${candidate.firstName} ${candidate.lastName}`}
            </h1>
            <p className="text-muted-foreground">
              Chi tiết ứng viên
              {candidate.jobTitle && ` - ${candidate.jobTitle}`}
            </p>
          </div>
        </div>
        
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="card-hover">
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
                    <strong>Địa chỉ:</strong> {safeValue(candidate.address)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Ngày sinh:</strong> {candidate.birthDate ? formatDate(candidate.birthDate) : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Giới tính:</strong> {candidate.gender === true ? "Nam" : candidate.gender === false ? "Nữ" : "-"}
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
                  {/* Use optional chaining and strict checks for rendering */}
                  {candidate.linkedinUrl && candidate.linkedinUrl !== "-" && (
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
                  
                  {candidate.githubUrl && candidate.githubUrl !== "-" && (
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
                  
                  {candidate.portfolioUrl && candidate.portfolioUrl !== "-" && (
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
          <Card className="card-hover">
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
                    <strong>Công ty hiện tại:</strong> {safeValue(candidate.currentCompany)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Vị trí hiện tại:</strong> {safeValue(candidate.currentJobTitle)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Mức lương mong muốn:</strong> {candidate.expectedSalary ? formatSalary(candidate.expectedSalary) : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Loại công việc:</strong> {safeValue(candidate.preferredEmploymentType)}
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
          <Card className="card-hover">
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
                    <strong>Trình độ:</strong> {safeValue(candidate.educationLevel)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Chuyên ngành:</strong> {safeValue(candidate.fieldOfStudy)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Trường:</strong> {safeValue(candidate.university)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Năm tốt nghiệp:</strong> {candidate.graduationYear ? candidate.graduationYear.toString() : "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificates & Documents - Using real data from API */}
          {candidateFiles && candidateFiles.length > 0 && (
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Chứng chỉ & Tài liệu
                </CardTitle>
                <CardDescription>
                  Danh sách các chứng chỉ và tài liệu đã nộp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Horizontal scrollable file list */}
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                      {candidateFiles.map((file) => (
                        <div
                          key={file.fileId}
                          className="flex-shrink-0 w-64 border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                          onClick={() => handleCandidateFileClick(file)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {getFileIconFromMimeType(file.mimeType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate" title={file.originalName}>
                                {file.originalName}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(file.fileSize)}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(file.createdAt)}
                                </span>
                              </div>
                              {file.metadata?.subject && (
                                <div className="text-xs text-muted-foreground mt-1 truncate" title={file.metadata.subject}>
                                  Subject: {file.metadata.subject}
                                </div>
                              )}
                              <div className="flex items-end gap-2 mt-2 justify-end  ">
                                {/* <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs"
                                  onClick={(e) => handleCandidateFileDownload(file, e)}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Tải
                                </Button> */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => handleCandidateFileClick(file)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Xem
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* File type summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    {Object.entries(candidateFiles.reduce((acc, file) => {
                      const type = file.mimeType.split('/')[0]
                      acc[type] = (acc[type] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)).map(([type, count]) => (
                      <div key={type} className="text-center">
                        <div className="flex justify-center mb-2">
                          {type === 'application' ? (
                            <FileText className="h-5 w-5 text-red-500" />
                          ) : type === 'image' ? (
                            // eslint-disable-next-line jsx-a11y/alt-text
                            <Image className="h-5 w-5 text-blue-500" />
                          ) : (
                            <FileType className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="text-sm font-medium">{count} file</div>
                        <div className="text-xs text-muted-foreground capitalize">{type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application History */}
          {applications.length > 0 && (
            <Card className="card-hover">
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
                          <StatusBadge status={application.applicationStatus} type="application" />
                          {application.score !== undefined && (
                            <ScoreIndicator 
                              score={application.score} 
                              size="sm" 
                              showLabel={false}
                            />
                          )}
                        </div>
                      </div>
                      {application.coverLetter && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {application.coverLetter}
                        </p>
                      )}

                      {/* AI Screening Insights */}
                      {(application.aiSummary || (application.keyHighlights && application.keyHighlights.length > 0) || (application.concerns && application.concerns.length > 0)) && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="text-sm font-semibold mb-2">AI Screening Insights</h5>
                          
                          {application.aiSummary && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">AI Summary</p>
                              <p className="text-sm italic text-muted-foreground">{application.aiSummary}</p>
                            </div>
                          )}

                          {application.keyHighlights && application.keyHighlights.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-green-600 mb-1">Key Highlights</p>
                              <ul className="text-sm space-y-1">
                                {application.keyHighlights.map((highlight, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span className="text-muted-foreground">{highlight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {application.concerns && application.concerns.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-red-600 mb-1">Concerns</p>
                              <ul className="text-sm space-y-1">
                                {application.concerns.map((concern, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                    <span className="text-muted-foreground">{concern}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
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
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Quản lý trạng thái CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.currentApplication ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trạng thái hiện tại</span>
                    <StatusBadge status={candidate.currentApplication.applicationStatus} type="application" />
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

                  {/* Approve/Reject Section */}
                  {canApproveReject && !isEditingStatus && (
                    <div className="pt-4 border-t">
                      <label className="text-sm font-medium mb-2 block">Quyết định sau phỏng vấn</label>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setApproveDialogOpen(true)}
                          className="flex-1"
                          variant="default"
                          size="sm"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Duyệt
                        </Button>
                        <Button
                          onClick={() => setRejectDialogOpen(true)}
                          className="flex-1"
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  )}
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
                {candidate.overscore !== undefined && candidate.overscore !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Điểm tổng thể</span>
                    <ScoreIndicator 
                      score={candidate.overscore} 
                      size="sm" 
                      showLabel={false}
                    />
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
              <CreateInterviewModal 
                candidateId={candidate.candidateId} 
                trigger={
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {hasFutureInterview ? "Chỉnh sửa lịch phỏng vấn" : "Lên lịch phỏng vấn"}
                  </Button>
                }
              />
              {/* Removed redundant buttons as requested
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Gửi email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Thêm ghi chú
              </Button>
              */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve/Reject Dialogs */}
      {selectedApplicationId && (
        <>
          <ApproveOfferDialog
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            applicationId={selectedApplicationId}
            onSuccess={handleSuccess}
          />
          <RejectApplicationDialog
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            applicationId={selectedApplicationId}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  )
}
