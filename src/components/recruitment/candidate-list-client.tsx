"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowUpDown,
  Search,
  Users,
  Calendar,
  Star,
  Mail
} from "lucide-react"
import { recruitmentAPI, JobPosting, examinationAPI } from "@/lib/api/recruitment"
import Link from "next/link"

interface CandidateListItem {
  candidateId: number;
  fullname: string;
  email: string;
  status: string;
  createdAt: string;
  overscore: number | null;
  applicationId?: number;
  jobTitle?: string;
}

export function CandidateListClient() {
  const searchParams = useSearchParams()
  const [candidates, setCandidates] = useState<CandidateListItem[]>([])
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [jobIdFilter, setJobIdFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"createdAt" | "overscore">("overscore")
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC")
  const [currentJobIsTest, setCurrentJobIsTest] = useState<boolean>(false)
  const [applicationsWithExams, setApplicationsWithExams] = useState<Record<number, boolean>>({})
  
  // Get jobId from URL params or search
  const urlJobId = searchParams.get("jobId")
  console.log("urlJobId",urlJobId)
  const isJobSpecific = !!urlJobId || (jobIdFilter && jobIdFilter !== "all")

  useEffect(() => {
    if (urlJobId) {
      setJobIdFilter(urlJobId)
    } else {
      setJobIdFilter("all")
    }
  }, [urlJobId])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Mock data for testing when API is not available
      const mockCandidates: CandidateListItem[] = [
        {
          candidateId: 1,
          fullname: "Nguyễn Văn An",
          email: "nguyenvanan@email.com",
          status: "screening",
          createdAt: "2024-01-15T10:30:00Z",
          overscore: 85,
          applicationId: 101,
          jobTitle: "Frontend Developer"
        },
        {
          candidateId: 2,
          fullname: "Trần Thị Bình",
          email: "tranthibinh@email.com",
          status: "interviewing",
          createdAt: "2024-01-14T14:20:00Z",
          overscore: 92,
          applicationId: 102,
          jobTitle: "Backend Developer"
        },
        {
          candidateId: 3,
          fullname: "Lê Văn Cường",
          email: "levancuong@email.com",
          status: "submitted",
          createdAt: "2024-01-16T09:15:00Z",
          overscore: null,
          applicationId: 103,
          jobTitle: "Full Stack Developer"
        },
        {
          candidateId: 4,
          fullname: "Phạm Thị Dung",
          email: "phamthidung@email.com",
          status: "offer",
          createdAt: "2024-01-13T16:45:00Z",
          overscore: 78,
          applicationId: 104,
          jobTitle: "UI/UX Designer"
        },
        {
          candidateId: 5,
          fullname: "Hoàng Văn Em",
          email: "hoangvanem@email.com",
          status: "rejected",
          createdAt: "2024-01-12T11:30:00Z",
          overscore: 45,
          applicationId: 105,
          jobTitle: "DevOps Engineer"
        },
        {
          candidateId: 6,
          fullname: "Võ Thị Phương",
          email: "vothiphuong@email.com",
          status: "hired",
          createdAt: "2024-01-11T08:20:00Z",
          overscore: 95,
          applicationId: 106,
          jobTitle: "Product Manager"
        },
        {
          candidateId: 7,
          fullname: "Đỗ Minh Tuấn",
          email: "dominhtuan@email.com",
          status: "withdrawn",
          createdAt: "2024-01-10T15:45:00Z",
          overscore: 60,
          applicationId: 107,
          jobTitle: "Data Analyst"
        },
        {
          candidateId: 8,
          fullname: "Bùi Thị Lan",
          email: "buithilan@email.com",
          status: "active",
          createdAt: "2024-01-09T12:30:00Z",
          overscore: null,
          applicationId: undefined,
          jobTitle: undefined
        },
        {
          candidateId: 9,
          fullname: "Nguyễn Đức Minh",
          email: "nguyenducminh@email.com",
          status: "inactive",
          createdAt: "2024-01-08T09:15:00Z",
          overscore: null,
          applicationId: undefined,
          jobTitle: undefined
        }
      ]

      const mockJobs: JobPosting[] = [
        {
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
          skills: "React, TypeScript, JavaScript",
          minExperience: 3,
          maxExperience: 5,
          educationLevel: "Bachelor",
          departmentId: 1,
          positionId: 1,
          hiringManagerId: 1,
          salaryRange: "15-25M VND",
          isJobActive: true,
          daysUntilDeadline: 30,
          applicationCount: 15,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z"
        },
        {
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
          skills: "Node.js, Python, PostgreSQL",
          minExperience: 2,
          maxExperience: 6,
          educationLevel: "Bachelor",
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
      ]

      // Fetch real data from API if jobId is specified
      let realCandidates: CandidateListItem[] = []
      console.log("isJobSpecific",isJobSpecific)
      if (isJobSpecific) {
        try {
          const jobId = urlJobId || (jobIdFilter !== "all" ? jobIdFilter : null)
          console.log("jobId",jobId)
          if (jobId) {
            // Fetch job detail to detect isTest
            try {
              const jobData = await recruitmentAPI.getJobPostingById(Number(jobId))
              setCurrentJobIsTest(!!jobData.isTest)
            } catch (e) {
              console.error("Error fetching job detail:", e)
              setCurrentJobIsTest(false)
            }
            const response = await recruitmentAPI.getApplicationsByJobId(Number(jobId))
            console.log("response",response)
            
            if (response) {
              console.log("response",response)
              realCandidates = response.data.map((app) => ({
                candidateId: app.candidateId,
                fullname: `${app.firstName} ${app.lastName}`,
                email: app.email,
                status: app.status,
                createdAt: app.createdAt,
                overscore: app.score,
                applicationId: app.applicationId,
                jobTitle: undefined // Will be filled by job filter logic
              }))

              // Fetch exams for these applications (to toggle action button)
              try {
                const uniqueAppIds = Array.from(new Set(realCandidates.map(c => c.applicationId).filter(Boolean))) as number[]
                const results = await Promise.all(uniqueAppIds.map(async (id) => {
                  try {
                    const exams = await examinationAPI.getExaminationsToDo(id)
                    return [id, Array.isArray(exams) && exams.length > 0] as [number, boolean]
                  } catch (e) {
                    console.error("exam fetch error", e)
                    return [id, false] as [number, boolean]
                  }
                }))
                const map: Record<number, boolean> = {}
                results.forEach(([id, has]) => { map[id] = has })
                setApplicationsWithExams(map)
              } catch (e) {
                console.error("error building exam map", e)
                setApplicationsWithExams({})
              }
            }
          }
        } catch (apiError) {
          console.error("Error fetching real API data:", apiError)
          // Continue with mock data only if API fails
        }
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (isJobSpecific) {
        // Filter candidates by job if jobId is provided
        const jobId = urlJobId || (jobIdFilter !== "all" ? jobIdFilter : null)
        const filteredMockCandidates = jobId 
          ? mockCandidates.filter(c => c.jobTitle?.toLowerCase().includes(jobId === "1" ? "frontend" : "backend"))
          : mockCandidates
        
        // Combine mock data with real data (mock first, then real)
        const combinedCandidates = [...filteredMockCandidates, ...realCandidates]
        
        setCandidates(combinedCandidates)
        setJobs(mockJobs)
      } else {
        // Show all candidates without overscore for general view
        const generalMockCandidates = mockCandidates.map(candidate => ({
          ...candidate,
          overscore: null,
          applicationId: undefined,
          jobTitle: undefined,
          // Keep original status for display
        }))
        
        // Combine mock data with real data for general view (also remove overscore from real data)
        const generalRealCandidates = realCandidates.map(candidate => ({
          ...candidate,
          overscore: null,
          applicationId: undefined,
          jobTitle: undefined,
        }))
        
        const combinedCandidates = [...generalMockCandidates, ...generalRealCandidates]
        
        setCandidates(combinedCandidates)
        setJobs(mockJobs)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      // Fallback to empty array
      setCandidates([])
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [isJobSpecific, urlJobId, jobIdFilter])

  useEffect(() => {
    fetchData()
    fetchJobs()
  }, [sortBy, sortOrder, jobIdFilter, fetchData])

  const fetchJobs = async () => {
    try {
      // Mock jobs data is already set in fetchData
      // This function is kept for consistency but doesn't need to do anything
      // since mock data is handled in fetchData
    } catch (error) {
      console.error("Error fetching jobs:", error)
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
      case "active":
        return <Badge variant="default">Hoạt động</Badge>
      case "inactive":
        return <Badge variant="outline">Không hoạt động</Badge>
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

  const handleSort = (field: "createdAt" | "overscore") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
    } else {
      setSortBy(field)
      setSortOrder("DESC")
    }
  }

  const handleJobFilter = (jobId: string) => {
    setJobIdFilter(jobId)
    if (jobId && jobId !== "all") {
      // Update URL with jobId parameter
      const url = new URL(window.location.href)
      url.searchParams.set("jobId", jobId)
      window.history.pushState({}, "", url.toString())
    } else {
      // Remove jobId parameter
      const url = new URL(window.location.href)
      url.searchParams.delete("jobId")
      window.history.pushState({}, "", url.toString())
    }
  }

  const handleRowClick = (candidate: CandidateListItem) => {
    const url = `/recruitment/candidate/detail/${candidate.candidateId}${candidate.applicationId ? `?applicationId=${candidate.applicationId}&jobId=${jobIdFilter}` : ''}`
    window.location.href = url
  }

  const filteredCandidates = candidates.filter(candidate =>
    candidate.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isJobSpecific ? "Ứng viên theo vị trí" : "Danh sách ứng viên"}
          </h1>
          <p className="text-muted-foreground">
            {isJobSpecific 
              ? "Danh sách ứng viên đã ứng tuyển cho vị trí cụ thể"
              : "Quản lý tất cả ứng viên trong hệ thống"
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng ứng viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã sàng lọc</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.overscore !== null).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.overscore === null).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={jobIdFilter} onValueChange={handleJobFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Lọc theo vị trí tuyển dụng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ứng viên</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.jobPostingId} value={job.jobPostingId.toString()}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: "createdAt" | "overscore") => setSortBy(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                {isJobSpecific && <SelectItem value="overscore">Điểm số</SelectItem>}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOrder === "ASC" ? "Tăng dần" : "Giảm dần"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách ứng viên</CardTitle>
          <CardDescription>
            {filteredCandidates.length} ứng viên được tìm thấy
            {isJobSpecific && " cho vị trí này"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Họ tên
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Trạng thái</TableHead>
                {isJobSpecific && (
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("overscore")}
                  >
                    <div className="flex items-center gap-2">
                      Điểm số
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                <TableHead>Ngày tạo</TableHead>
                {isJobSpecific && currentJobIsTest && <TableHead>Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isJobSpecific ? (currentJobIsTest ? 7 : 6) : 5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      Không tìm thấy ứng viên nào
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow 
                    key={candidate.candidateId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(candidate)}
                  >
                    <TableCell className="font-medium">
                      {candidate.candidateId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {candidate.fullname}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {candidate.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(candidate.status)}
                    </TableCell>
                    {isJobSpecific && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className={candidate.overscore === null ? "text-muted-foreground" : ""}>
                            {formatScore(candidate.overscore)}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(candidate.createdAt)}
                      </div>
                    </TableCell>
                    {isJobSpecific && currentJobIsTest && (
                      <TableCell>
                        {candidate.applicationId ? (
                          applicationsWithExams[candidate.applicationId] ? (
                            <Link href={`/recruitment/candidate/exams?applicationId=${candidate.applicationId}`} onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="outline">
                                Bài thi
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-muted-foreground text-sm">Chưa có bài thi</span>
                          )
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
