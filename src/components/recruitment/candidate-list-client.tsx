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
import { Checkbox } from "@/components/ui/checkbox"
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
  Mail,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react"
import { recruitmentAPI, JobPosting, examinationAPI } from "@/lib/api/recruitment"
import { RecruitmentBreadcrumb } from "@/components/recruitment/recruitment-breadcrumb"
import { CandidateQuickPreview } from "@/components/recruitment/candidate-quick-preview"
import { StatusBadge } from "@/components/recruitment/status-badge"
import { toast } from "sonner"
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
  const [applicationsWithExams, setApplicationsWithExams] = useState<Record<number, 'pending' | 'completed' | null>>({})
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [previewCandidateId, setPreviewCandidateId] = useState<number | null>(null)
  const [previewApplicationId, setPreviewApplicationId] = useState<number | null>(null)
  
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
        
      ]

      const mockJobs: JobPosting[] = [
        
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
                    if (Array.isArray(exams) && exams.length > 0) {
                      const exam = exams[0] // Lấy exam đầu tiên
                      const status = exam.status
                      if (status === 'pending') {
                        return [id, 'pending'] as [number, 'pending']
                      } else if (status === 'completed') {
                        return [id, 'completed'] as [number, 'completed']
                      }
                      return [id, null] as [number, null]
                    }
                    return [id, null] as [number, null]
                  } catch (e) {
                    console.error("exam fetch error", e)
                    return [id, null] as [number, null]
                  }
                }))
                const map: Record<number, 'pending' | 'completed' | null> = {}
                results.forEach(([id, status]) => { map[id] = status })
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

  const handleRowClick = (candidate: CandidateListItem, event?: React.MouseEvent) => {
    // Check if click is on checkbox or action button
    if (event) {
      const target = event.target as HTMLElement
      if (target.closest('input[type="checkbox"]') || target.closest('button') || target.closest('a')) {
        return
      }
    }
    
    // Open quick preview instead of navigating
    setPreviewCandidateId(candidate.candidateId)
    if (candidate.applicationId) {
      setPreviewApplicationId(candidate.applicationId)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(filteredCandidates.map(c => c.candidateId))
    } else {
      setSelectedCandidates([])
    }
  }

  const handleSelectCandidate = (candidateId: number, checked: boolean) => {
    if (checked) {
      setSelectedCandidates([...selectedCandidates, candidateId])
    } else {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedCandidates.length === 0) return
    
    const candidatesWithApplications = filteredCandidates.filter(c => 
      selectedCandidates.includes(c.candidateId) && c.applicationId
    )
    
    if (candidatesWithApplications.length === 0) {
      toast.error("Không có ứng viên nào có đơn ứng tuyển để duyệt")
      return
    }
    
    if (!confirm(`Bạn có chắc chắn muốn duyệt ${candidatesWithApplications.length} ứng tuyển?`)) return

    try {
      await Promise.all(
        candidatesWithApplications.map(c =>
          recruitmentAPI.updateApplication(c.applicationId!, { applicationStatus: "interview" })
        )
      )
      toast.success(`Đã duyệt ${candidatesWithApplications.length} ứng tuyển`)
      setSelectedCandidates([])
      fetchData()
    } catch (error) {
      console.error("Error bulk approving:", error)
      toast.error("Không thể duyệt một số ứng tuyển")
    }
  }

  const handleBulkReject = async () => {
    if (selectedCandidates.length === 0) return
    
    const candidatesWithApplications = filteredCandidates.filter(c => 
      selectedCandidates.includes(c.candidateId) && c.applicationId
    )
    
    if (candidatesWithApplications.length === 0) {
      toast.error("Không có ứng viên nào có đơn ứng tuyển để từ chối")
      return
    }
    
    if (!confirm(`Bạn có chắc chắn muốn từ chối ${candidatesWithApplications.length} ứng tuyển?`)) return

    try {
      await Promise.all(
        candidatesWithApplications.map(c =>
          recruitmentAPI.updateApplication(c.applicationId!, { applicationStatus: "rejected" })
        )
      )
      toast.success(`Đã từ chối ${candidatesWithApplications.length} ứng tuyển`)
      setSelectedCandidates([])
      fetchData()
    } catch (error) {
      console.error("Error bulk rejecting:", error)
      toast.error("Không thể từ chối một số ứng tuyển")
    }
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

  const breadcrumbItems = isJobSpecific 
    ? [
        { label: "Danh sách việc làm", href: "/recruitment/jobs" },
        { label: "Ứng viên theo vị trí" }
      ]
    : [
        { label: "Danh sách ứng viên" }
      ]

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <RecruitmentBreadcrumb items={breadcrumbItems} />

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
        {selectedCandidates.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkApprove}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Duyệt ({selectedCandidates.length})
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkReject}>
              <XCircle className="mr-2 h-4 w-4" />
              Từ chối ({selectedCandidates.length})
            </Button>
          </div>
        )}
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
          <div className="flex items-center justify-between">
            <div>
          <CardTitle>Danh sách ứng viên</CardTitle>
          <CardDescription>
            {filteredCandidates.length} ứng viên được tìm thấy
            {isJobSpecific && " cho vị trí này"}
          </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="mr-2 h-4 w-4" />
                Bảng
              </Button>
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("card")}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Card
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
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
                  <TableCell colSpan={isJobSpecific ? (currentJobIsTest ? 8 : 7) : 6} className="text-center py-8">
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
                    onClick={(e) => handleRowClick(candidate, e)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.candidateId)}
                        onCheckedChange={(checked) => handleSelectCandidate(candidate.candidateId, checked as boolean)}
                      />
                    </TableCell>
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
                      <StatusBadge status={candidate.status} type="candidate" />
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
                          applicationsWithExams[candidate.applicationId] === 'pending' ? (
                            <span className="text-muted-foreground text-sm">Chưa làm bài</span>
                          ) : applicationsWithExams[candidate.applicationId] === 'completed' ? (
                            <Link href={`/recruitment/candidate/exams?applicationId=${candidate.applicationId}`} onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="outline">
                                Đã làm bài
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
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
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredCandidates.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Không tìm thấy ứng viên nào
                </div>
              ) : (
                filteredCandidates.map((candidate) => (
                  <Card
                    key={candidate.candidateId}
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-primary relative"
                    onClick={(e) => handleRowClick(candidate, e)}
                  >
                    <div 
                      className="absolute top-4 right-4 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.candidateId)}
                        onCheckedChange={(checked) => handleSelectCandidate(candidate.candidateId, checked as boolean)}
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 overflow-hidden">
                        <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold">
                              {candidate.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <CardTitle className="text-base truncate">
                              {candidate.fullname}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1 min-w-0 overflow-hidden">
                              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-muted-foreground truncate min-w-0">
                                {candidate.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <StatusBadge status={candidate.status} type="candidate" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {isJobSpecific && candidate.overscore !== null && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">
                              Điểm: {formatScore(candidate.overscore)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Tạo: {formatDate(candidate.createdAt)}</span>
                        </div>
                        {isJobSpecific && currentJobIsTest && candidate.applicationId && (
                          <div className="pt-2 border-t">
                            {applicationsWithExams[candidate.applicationId] === 'pending' ? (
                              <span className="text-muted-foreground text-sm">Chưa làm bài</span>
                            ) : applicationsWithExams[candidate.applicationId] === 'completed' ? (
                              <Link 
                                href={`/recruitment/candidate/exams?applicationId=${candidate.applicationId}`} 
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button size="sm" variant="outline" className="w-full">
                                  Đã làm bài
                                </Button>
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Preview */}
      {previewCandidateId && (
        <CandidateQuickPreview
          candidateId={previewCandidateId}
          applicationId={previewApplicationId || undefined}
          open={!!previewCandidateId}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewCandidateId(null)
              setPreviewApplicationId(null)
            }
          }}
        />
      )}
    </div>
  )
}
