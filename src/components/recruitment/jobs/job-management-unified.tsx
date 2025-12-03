"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Briefcase,
  Edit,
  Trash2,
  X,
  ChevronRight,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";
import {
  recruitmentAPI,
  JobPosting,
  GetJobPostingsParams,
} from "@/lib/api/recruitment";
import { companyAPI, Department, Position } from "@/lib/api/company";
import { JobApplicationsList } from "./applications/job-applications-list";
import { toast } from "sonner";
import { StatusBadge } from "../shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function JobManagementUnified() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>("all");
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"info" | "applications">("info");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Map<number, string>>(new Map());
  const [positions, setPositions] = useState<Map<number, string>>(new Map());

  const fetchDepartmentsAndPositions = useCallback(async () => {
    try {
      const [deptsResponse, positionsResponse] = await Promise.all([
        companyAPI.getDepartments({ page: 0, limit: 100 }),
        companyAPI.getPositions({ page: 0, limit: 100 })
      ]);

      const deptMap = new Map<number, string>();
      (deptsResponse.data || []).forEach((dept) => {
        deptMap.set(dept.departmentId, dept.departmentName);
      });
      setDepartments(deptMap);

      const posMap = new Map<number, string>();
      (positionsResponse.data || []).forEach((pos) => {
        posMap.set(pos.positionId, pos.positionName);
      });
      setPositions(posMap);
    } catch (error) {
      console.error("Error fetching departments and positions:", error);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params: GetJobPostingsParams = {
        page: 0,
        limit: 100,
        keyword: searchTerm || undefined,
        status:
          statusFilter !== "all"
            ? (statusFilter as "draft" | "published" | "closed")
            : undefined,
        employmentType: employmentTypeFilter !== "all" ? employmentTypeFilter : undefined,
        experienceLevel: experienceLevelFilter !== "all" ? experienceLevelFilter : undefined,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };

      const response = await recruitmentAPI.getJobPostings(params);
      setJobs(response.data);

      if (response.data.length > 0 && !selectedJob) {
        setSelectedJob(response.data[0]);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách việc làm");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, employmentTypeFilter, experienceLevelFilter, selectedJob]);

  useEffect(() => {
    fetchDepartmentsAndPositions();
  }, [fetchDepartmentsAndPositions]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobSelect = (job: JobPosting) => {
    setSelectedJob(job);
    setActiveTab("info");
  };

  const openDeleteDialog = (jobId: number) => {
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await recruitmentAPI.deleteJobPosting(jobToDelete);
      if (selectedJob?.jobPostingId === jobToDelete) {
        const remainingJobs = jobs.filter((j) => j.jobPostingId !== jobToDelete);
        setSelectedJob(remainingJobs.length > 0 ? remainingJobs[0] : null);
      }
      fetchJobs();
      toast.success("Đã xóa vị trí tuyển dụng");
    } catch (error) {
      toast.error("Không thể xóa vị trí tuyển dụng");
    } finally {
      setJobToDelete(null);
    }
  };


  const formatSalary = (min: string, max: string) => {
    const minNum = parseFloat(min).toLocaleString();
    const maxNum = parseFloat(max).toLocaleString();
    return `${minNum} - ${maxNum} VND`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "full-time": "Toàn thời gian",
      "part-time": "Bán thời gian",
      "contract": "Hợp đồng",
      "internship": "Thực tập",
    };
    return labels[type] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      "entry": "Mới tốt nghiệp",
      "junior": "Junior (1-3 năm)",
      "mid": "Mid-level (3-5 năm)",
      "senior": "Senior (5+ năm)",
      "lead": "Lead/Manager",
    };
    return labels[level] || level;
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesEmploymentType = employmentTypeFilter === "all" || job.employmentType === employmentTypeFilter;
    const matchesExperienceLevel = experienceLevelFilter === "all" || job.experienceLevel === experienceLevelFilter;

    return matchesSearch && matchesStatus && matchesEmploymentType && matchesExperienceLevel;
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-250px)] gap-4">
      {/* Left Sidebar - Jobs List */}
      <div className="w-full lg:w-1/3 flex flex-col border-r-0 lg:border-r pr-0 lg:pr-4 pb-4 lg:pb-0 border-b lg:border-b-0 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Danh sách việc làm</h2>
          <Link href="/recruitment/jobs/create">
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchJobs()}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            fetchJobs();
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="published">Đang tuyển</SelectItem>
              <SelectItem value="closed">Đã đóng</SelectItem>
            </SelectContent>
          </Select>
          <Select value={employmentTypeFilter} onValueChange={(value) => {
            setEmploymentTypeFilter(value);
            fetchJobs();
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
          <Select value={experienceLevelFilter} onValueChange={(value) => {
            setExperienceLevelFilter(value);
            fetchJobs();
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Kinh nghiệm" />
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

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-3">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <EmptyState
                icon="briefcase"
                title="Không tìm thấy việc làm"
                description="Tạo vị trí tuyển dụng mới để bắt đầu."
                size="sm"
              />
            ) : (
              filteredJobs.map((job) => (
                <Card
                  key={job.jobPostingId}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedJob?.jobPostingId === job.jobPostingId
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => handleJobSelect(job)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-xs line-clamp-2 flex-1 leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex-shrink-0">
                        <StatusBadge status={job.status} type="job" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{job.applicationCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[90px]">
                          {job.location || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(job.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Job Detail */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedJob ? (
          <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
            {/* Job Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold break-words">{selectedJob.title}</h1>
                  <StatusBadge status={selectedJob.status} type="job" />
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{selectedJob.location || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{getEmploymentTypeLabel(selectedJob.employmentType)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{getExperienceLevelLabel(selectedJob.experienceLevel)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{selectedJob.applicationCount || 0} ứng tuyển</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/recruitment/jobs/edit/${selectedJob.jobPostingId}`}
                >
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Chỉnh sửa</span>
                    <span className="sm:hidden">Sửa</span>
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(selectedJob.jobPostingId)}
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Xóa</span>
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "info" | "applications")
              }
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <TabsList className="flex-shrink-0">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="applications">
                  Ứng tuyển
                  {selectedJob.applicationCount !== undefined &&
                    selectedJob.applicationCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedJob.applicationCount}
                      </Badge>
                    )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-4 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Thông tin tổng quan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Phòng ban:</strong>{" "}
                            {departments.get(selectedJob.departmentId) || `ID: ${selectedJob.departmentId}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Vị trí:</strong>{" "}
                            {positions.get(selectedJob.positionId) || `ID: ${selectedJob.positionId}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Địa điểm:</strong>{" "}
                            {selectedJob.location || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Mức lương:</strong>{" "}
                            {formatSalary(
                              selectedJob.salaryMin,
                              selectedJob.salaryMax
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Loại việc làm:</strong>{" "}
                            {getEmploymentTypeLabel(selectedJob.employmentType)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Kinh nghiệm:</strong>{" "}
                            {getExperienceLevelLabel(selectedJob.experienceLevel)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Hạn nộp:</strong>{" "}
                            {formatDate(selectedJob.applicationDeadline)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Số lượng tuyển:</strong>{" "}
                            {selectedJob.vacancies || "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Mô tả công việc</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">
                          {selectedJob.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Yêu cầu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">
                          {selectedJob.requirements}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Phúc lợi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">
                          {selectedJob.benefits}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="applications"
                className="flex-1 overflow-y-auto min-h-0"
              >
                <JobApplicationsList jobId={selectedJob.jobPostingId} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Chọn một vị trí tuyển dụng để xem chi tiết
              </p>
            </div>
          </div>
        )}
      </div>

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
  );
}
