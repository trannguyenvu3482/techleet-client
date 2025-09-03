"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Eye, Calendar, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import { recruitmentAPI, JobPosting } from "@/lib/api/recruitment"

export function JobsListClient() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchJobs()
  }, [statusFilter])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      const response = await recruitmentAPI.getJobPostings(params)
      setJobs(response.data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Nháp</Badge>
      case "published":
        return <Badge variant="default">Đang tuyển</Badge>
      case "closed":
        return <Badge variant="destructive">Đã đóng</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatSalary = (min: number, max: number) => {
    return `${min.toLocaleString()} - ${max.toLocaleString()} VND`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const handleDeleteJob = async (jobId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa vị trí tuyển dụng này?")) {
      try {
        await recruitmentAPI.deleteJobPosting(jobId)
        fetchJobs()
      } catch (error) {
        console.error("Error deleting job:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách vị trí tuyển dụng</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả các vị trí tuyển dụng với các trạng thái khác nhau
          </p>
        </div>
        <Link href="/recruitment/jobs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo vị trí mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm kiếm và lọc vị trí tuyển dụng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="published">Đang tuyển</SelectItem>
                <SelectItem value="closed">Đã đóng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách vị trí</CardTitle>
          <CardDescription>
            {filteredJobs.length} vị trí được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Đang tải...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Không tìm thấy vị trí tuyển dụng nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Mức lương</TableHead>
                  <TableHead>Hạn nộp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.jobPostingId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.employmentType} • {job.experienceLevel}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.department?.departmentName || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {job.headquarter?.city || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <DollarSign className="mr-1 h-3 w-3 text-muted-foreground" />
                        {formatSalary(job.minSalary, job.maxSalary)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(job.applicationDeadline)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(job.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/recruitment/jobs/detail/${job.jobPostingId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/recruitment/jobs/edit/${job.jobPostingId}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteJob(job.jobPostingId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
