"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Trash2, Calendar, MapPin, DollarSign, ChevronLeft, ChevronRight, Users } from "lucide-react"
import Link from "next/link"
import { recruitmentAPI, JobPosting, GetJobPostingsParams, GetJobPostingsResponse } from "@/lib/api/recruitment"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { StatusBadge } from "../shared/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

export function JobsListClient() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>("all")
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<number | null>(null)
  const router = useRouter()

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      const params: GetJobPostingsParams = {
        page: currentPage,
        limit: pageSize,
        keyword: searchTerm || undefined,
        status: statusFilter !== "all" ? (statusFilter as "draft" | "published" | "closed") : undefined,
        employmentType: employmentTypeFilter !== "all" ? employmentTypeFilter : undefined,
        experienceLevel: experienceLevelFilter !== "all" ? experienceLevelFilter : undefined,
        sortBy: "createdAt",
        sortOrder: "DESC"
      }
      
      const response: GetJobPostingsResponse = await recruitmentAPI.getJobPostings(params)
      setJobs(response.data)
      setTotalPages(response.totalPages)
      setTotal(response.total)
    } catch (error) {
      toast.error("Không thể tải danh sách việc làm")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, employmentTypeFilter, experienceLevelFilter, currentPage, pageSize, searchTerm])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSearch = () => {
    setCurrentPage(0) // Reset to first page when searching
    fetchJobs()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFilterChange = () => {
    setCurrentPage(0) // Reset to first page when filtering
    fetchJobs()
  }


  const formatSalary = (min: string, max: string) => {
    const minNum = parseFloat(min).toLocaleString();
    const maxNum = parseFloat(max).toLocaleString();
    return `${minNum} - ${maxNum} VND`;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const openDeleteDialog = (jobId: number) => {
    setJobToDelete(jobId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete) return
    
    try {
      await recruitmentAPI.deleteJobPosting(jobToDelete)
      toast.success("Đã xóa vị trí tuyển dụng")
      fetchJobs()
    } catch (error) {
      toast.error("Không thể xóa vị trí tuyển dụng")
    } finally {
      setJobToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-end justify-end">
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
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm vị trí..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Tìm kiếm
              </Button>
            </div>
            
            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value)
                  handleFilterChange()
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Đang tuyển</SelectItem>
                    <SelectItem value="closed">Đã đóng</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại việc làm</label>
                <Select value={employmentTypeFilter} onValueChange={(value) => {
                  setEmploymentTypeFilter(value)
                  handleFilterChange()
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Loại việc làm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="full-time">Toàn thời gian</SelectItem>
                    <SelectItem value="part-time">Bán thời gian</SelectItem>
                    <SelectItem value="contract">Hợp đồng</SelectItem>
                    <SelectItem value="internship">Thực tập</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Mức độ kinh nghiệm</label>
                <Select value={experienceLevelFilter} onValueChange={(value) => {
                  setExperienceLevelFilter(value)
                  handleFilterChange()
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mức độ kinh nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="entry">Mới tốt nghiệp</SelectItem>
                    <SelectItem value="junior">Junior (1-3 năm)</SelectItem>
                    <SelectItem value="mid">Mid-level (3-5 năm)</SelectItem>
                    <SelectItem value="senior">Senior (5+ năm)</SelectItem>
                    <SelectItem value="lead">Lead/Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách vị trí</CardTitle>
              <CardDescription>
                Hiển thị {jobs.length} trong tổng số {total} kết quả
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Hiển thị:</span>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(value) => setPageSize(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {/* Table header skeleton */}
              <div className="flex gap-4 border-b pb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                  <Skeleton key={i} className="h-4 flex-1" />
                ))}
              </div>
              {/* Table rows skeleton */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-center py-3 border-b">
                  <Skeleton className="h-4 w-8" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon="briefcase"
              title="Không tìm thấy vị trí tuyển dụng"
              description={searchTerm ? "Thử tìm kiếm với từ khóa khác." : "Tạo vị trí tuyển dụng đầu tiên để bắt đầu."}
              action={{
                label: "Tạo vị trí mới",
                onClick: () => router.push("/recruitment/jobs/create")
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Loại việc làm</TableHead>
                  <TableHead>Kinh nghiệm</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Mức lương</TableHead>
                  <TableHead>Hạn nộp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ứng tuyển</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow 
                    className="cursor-pointer table-row-hover" 
                    onClick={() => router.push(`/recruitment/jobs/detail/${job.jobPostingId}`)} 
                    key={job.jobPostingId}
                  >
                    <TableCell>
                      {job.jobPostingId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.description.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {job.employmentType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {job.experienceLevel}
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.departmentId}
                    </TableCell>
                     <TableCell>
                       <div className="flex items-center text-sm text-muted-foreground">
                         <MapPin className="mr-1 h-3 w-3" />
                         {job.location || "N/A"}
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center text-sm">
                         <DollarSign className="mr-1 h-3 w-3 text-muted-foreground" />
                         {formatSalary(job.salaryMin, job.salaryMax)}
                       </div>
                     </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(job.applicationDeadline)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} type="job" />
                    </TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/recruitment/jobs/detail/${job.jobPostingId}?tab=applications`)
                        }}
                      >
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {job.applicationCount || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteDialog(job.jobPostingId)
                          }}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Trang {currentPage + 1} của {totalPages}
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + Math.max(0, currentPage - 2)
                    if (pageNum >= totalPages) return null
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum + 1}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa vị trí tuyển dụng"
        description="Bạn có chắc chắn muốn xóa vị trí tuyển dụng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={handleDeleteJob}
        variant="danger"
      />
    </div>
  )
}
