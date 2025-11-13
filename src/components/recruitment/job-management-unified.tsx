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
} from "lucide-react";
import Link from "next/link";
import {
  recruitmentAPI,
  JobPosting,
  GetJobPostingsParams,
} from "@/lib/api/recruitment";
import { JobApplicationsList } from "./job-applications-list";
import { toast } from "sonner";
import { StatusBadge } from "./status-badge";

export function JobManagementUnified() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"info" | "applications">("info");

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
  }, [searchTerm, statusFilter, selectedJob]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobSelect = (job: JobPosting) => {
    setSelectedJob(job);
    setActiveTab("info");
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vị trí tuyển dụng này?")) return;

    try {
      await recruitmentAPI.deleteJobPosting(jobId);
      if (selectedJob?.jobPostingId === jobId) {
        const remainingJobs = jobs.filter((j) => j.jobPostingId !== jobId);
        setSelectedJob(remainingJobs.length > 0 ? remainingJobs[0] : null);
      }
      fetchJobs();
      toast.success("Đã xóa vị trí tuyển dụng");
    } catch (error) {
      toast.error("Không thể xóa vị trí tuyển dụng");
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

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-250px)] gap-4">
      {/* Left Sidebar - Jobs List */}
      <div className="w-full lg:w-1/3 flex flex-col border-r-0 lg:border-r pr-0 lg:pr-4 pb-4 lg:pb-0 border-b lg:border-b-0">
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
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không tìm thấy việc làm nào
              </div>
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
                  <CardContent className="">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-xs line-clamp-2 flex-1 leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex-shrink-0">
                        <StatusBadge status={job.status} type="job" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
            <div className="flex items-start justify-between flex-shrink-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{selectedJob.title}</h1>
                  <StatusBadge status={selectedJob.status} type="job" />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedJob.location || "N/A"}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedJob.applicationCount || 0} ứng tuyển
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/recruitment/jobs/edit/${selectedJob.jobPostingId}`}
                >
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteJob(selectedJob.jobPostingId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
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
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Phòng ban:</strong>{" "}
                            {selectedJob.departmentId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Vị trí:</strong> {selectedJob.positionId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Địa điểm:</strong>{" "}
                            {selectedJob.location || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Mức lương:</strong>{" "}
                            {formatSalary(
                              selectedJob.salaryMin,
                              selectedJob.salaryMax
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Hạn nộp:</strong>{" "}
                            {formatDate(selectedJob.applicationDeadline)}
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
    </div>
  );
}
