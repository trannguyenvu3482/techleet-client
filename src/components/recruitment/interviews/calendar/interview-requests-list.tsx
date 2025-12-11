"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recruitmentAPI, type Application } from "@/lib/api";
import dayjs from "dayjs";
import {
  Calendar,
  User,
  Briefcase,
  Clock,
  Award,
  Mail,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function InterviewRequestsList({
  onScheduleClick,
}: {
  onScheduleClick: (application: Application) => void;
}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<
    Array<{ jobPostingId: number; title: string }>
  >([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<
    Set<number>
  >(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await recruitmentAPI.getInterviewRequests({
          limit: 1000,
        });
        const uniqueJobs = new Map<
          number,
          { jobPostingId: number; title: string }
        >();

        response.data.forEach((app) => {
          if (app.jobPosting) {
            uniqueJobs.set(app.jobPosting.jobPostingId, {
              jobPostingId: app.jobPosting.jobPostingId,
              title: app.jobPosting.title,
            });
          }
        });

        setJobs(Array.from(uniqueJobs.values()));
      } catch (error) {
        console.error("Failed to load jobs:", error);
      }
    };

    loadJobs();
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await recruitmentAPI.getInterviewRequests({
        page,
        limit,
        jobPostingId: selectedJobId || undefined,
      });
      setApplications(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch interview requests:", error);
      toast.error("Không thể tải danh sách yêu cầu phỏng vấn");
    } finally {
      setLoading(false);
    }
  }, [page, selectedJobId]);

  useEffect(() => {
    fetchRequests();
    setSelectedApplicationIds(new Set());
  }, [fetchRequests]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchRequests();
    };
    window.addEventListener("interview-requests-refresh", handleRefresh);
    return () =>
      window.removeEventListener("interview-requests-refresh", handleRefresh);
  }, [fetchRequests]);

  const handleSelectAll = () => {
    if (selectedApplicationIds.size === applications.length) {
      setSelectedApplicationIds(new Set());
    } else {
      setSelectedApplicationIds(
        new Set(applications.map((app) => app.applicationId))
      );
    }
  };

  const handleSelectApplication = (applicationId: number) => {
    const newSelection = new Set(selectedApplicationIds);
    if (newSelection.has(applicationId)) {
      newSelection.delete(applicationId);
    } else {
      newSelection.add(applicationId);
    }
    setSelectedApplicationIds(newSelection);
  };

  const handleScheduleSelected = () => {
    if (selectedApplicationIds.size === 0) {
      toast.error("Vui lòng chọn ít nhất một ứng viên");
      return;
    }

    if (selectedApplicationIds.size === 1) {
      const application = applications.find(
        (app) => app.applicationId === Array.from(selectedApplicationIds)[0]
      );
      if (application) {
        onScheduleClick(application);
      }
    } else {
      const firstApplication = applications.find(
        (app) => app.applicationId === Array.from(selectedApplicationIds)[0]
      );
      if (firstApplication) {
        onScheduleClick(firstApplication);
      }
    }
  };

  const getScreeningScore = (application: Application): number | undefined => {
    const score = application.screeningScore ?? (application as any).score;
    if (score === null || score === undefined) return undefined;
    const numScore = typeof score === "string" ? parseFloat(score) : score;
    return isNaN(numScore) ? undefined : numScore;
  };

  const getScreeningScoreColor = (score?: number) => {
    if (!score && score !== 0) return "bg-gray-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getScreeningScoreLabel = (score?: number) => {
    if (!score && score !== 0) return "Chưa có điểm";
    if (score >= 80) return "Xuất sắc";
    if (score >= 70) return "Tốt";
    if (score >= 60) return "Khá";
    return "Trung bình";
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-1">Yêu cầu phỏng vấn</CardTitle>
              <p className="text-sm text-muted-foreground">
                Chọn vị trí và ứng viên để lên lịch phỏng vấn
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {total} ứng viên
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full sm:w-auto">
              <Label className="text-sm font-medium mb-2 block">
                Chọn vị trí
              </Label>
              <Select
                value={selectedJobId ? String(selectedJobId) : "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedJobId(null);
                  } else {
                    setSelectedJobId(Number(value));
                  }
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả vị trí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vị trí</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem
                      key={job.jobPostingId}
                      value={String(job.jobPostingId)}
                    >
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedApplicationIds.size > 0 && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Badge variant="secondary" className="text-base px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Đã chọn: {selectedApplicationIds.size}
                </Badge>
                <Button onClick={handleScheduleSelected} size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Lên lịch cho {selectedApplicationIds.size} ứng viên
                </Button>
              </div>
            )}
          </div>

          {applications.length > 0 && (
            <div className="flex items-center gap-3 pt-2 pb-3 border-t">
              <Checkbox
                checked={
                  selectedApplicationIds.size === applications.length &&
                  applications.length > 0
                }
                onCheckedChange={handleSelectAll}
                id="select-all"
              />
              <Label
                htmlFor="select-all"
                className="cursor-pointer text-sm font-medium text-muted-foreground"
              >
                Chọn tất cả ({applications.length} ứng viên)
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">
                Đang tải danh sách ứng viên...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có ứng viên</h3>
              <p className="text-muted-foreground max-w-md">
                {selectedJobId === null
                  ? "Không có ứng viên nào cần lên lịch phỏng vấn"
                  : "Không có ứng viên nào cần lên lịch phỏng vấn cho vị trí này"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => {
            const screeningScore = getScreeningScore(application);
            return (
              <div
                key={application.applicationId}
                className={`group relative rounded-lg border transition-all hover:bg-muted/50 p-3 ${
                  selectedApplicationIds.has(application.applicationId)
                    ? "border-primary bg-primary/5 hover:bg-primary/10"
                    : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <Checkbox
                      checked={selectedApplicationIds.has(
                        application.applicationId
                      )}
                      onCheckedChange={() =>
                        handleSelectApplication(application.applicationId)
                      }
                      id={`select-${application.applicationId}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0 items-center">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label
                        htmlFor={`select-${application.applicationId}`}
                        className="font-medium text-sm truncate hover:text-primary cursor-pointer"
                      >
                        {application.candidate
                          ? `${application.candidate.firstName} ${application.candidate.lastName}`
                          : "Ứng viên"}
                      </label>

                      <div className="flex items-center gap-2">
                        {screeningScore !== undefined &&
                          screeningScore !== null &&
                          typeof screeningScore === "number" &&
                          !isNaN(screeningScore) && (
                            <ScoreIndicator
                              variant="circular"
                              score={screeningScore}
                              size="sm"
                              showLabel={false}
                            />
                          )}
                        <Button
                          onClick={() => onScheduleClick(application)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Lên lịch"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="truncate max-w-[300px]">
                        {application.jobPosting?.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {total > limit && (
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Trước
              </Button>
              <span className="text-xs text-muted-foreground font-medium">
                Trang {page + 1} / {Math.ceil(total / limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= total}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
