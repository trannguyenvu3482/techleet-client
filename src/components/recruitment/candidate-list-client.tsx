"use client"

import { useState, useEffect } from "react"
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
  Mail,
  Eye
} from "lucide-react"
import { recruitmentAPI, Application, JobPosting } from "@/lib/api/recruitment"

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
  
  // Get jobId from URL params or search
  const urlJobId = searchParams.get("jobId")
  const isJobSpecific = !!urlJobId || (jobIdFilter && jobIdFilter !== "all")

  useEffect(() => {
    fetchData()
    fetchJobs()
  }, [sortBy, sortOrder, jobIdFilter])

  useEffect(() => {
    if (urlJobId) {
      setJobIdFilter(urlJobId)
    } else {
      setJobIdFilter("all")
    }
  }, [urlJobId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (isJobSpecific) {
        // Fetch applications for specific job
        const jobId = urlJobId || (jobIdFilter !== "all" ? jobIdFilter : null)
        const applicationsData = await recruitmentAPI.getApplications({
          jobPostingId: Number(jobId),
          sortBy: sortBy === "createdAt" ? "appliedAt" : "score",
          sortOrder
        })
        
        // Transform applications to candidate list items
        const transformedCandidates: CandidateListItem[] = applicationsData.data.map(app => ({
          candidateId: app.candidateId,
          fullname: app.candidate ? `${app.candidate.firstName} ${app.candidate.lastName}` : "Unknown",
          email: app.candidate?.email || "",
          status: app.applicationStatus,
          createdAt: app.appliedAt,
          overscore: app.score || null,
          applicationId: app.applicationId,
          jobTitle: app.jobPosting?.title
        }))
        
        setCandidates(transformedCandidates)
      } else {
        // Fetch all candidates
        const candidatesData = await recruitmentAPI.getCandidates({
          sortBy: sortBy === "createdAt" ? "createdAt" : undefined,
          sortOrder
        })
        
        // Transform candidates to list items
        const transformedCandidates: CandidateListItem[] = candidatesData.data.map(candidate => ({
          candidateId: candidate.candidateId,
          fullname: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          status: candidate.isActive ? "active" : "inactive",
          createdAt: candidate.createdAt,
          overscore: null, // Not available for general candidate list
          jobTitle: undefined
        }))
        
        setCandidates(transformedCandidates)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const jobsData = await recruitmentAPI.getJobPostings({ limit: 100 })
      setJobs(jobsData.data)
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
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isJobSpecific ? 6 : 5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      Không tìm thấy ứng viên nào
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.candidateId}>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </Button>
                      </div>
                    </TableCell>
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
