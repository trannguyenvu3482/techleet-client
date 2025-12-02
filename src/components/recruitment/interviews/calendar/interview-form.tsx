"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recruitmentAPI, type Application, type Interview } from "@/lib/api";
import { companyAPI, type Headquarter } from "@/lib/api/company";
import { employeeAPI } from "@/lib/api/employees";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { generateMeetingLink, interviewFormSchema } from "./utils";
import type { InterviewFormProps } from "./types";

export function InterviewForm({ defaults, interview, onCancel, onSuccess }: InterviewFormProps) {
  const [candidates, setCandidates] = useState<Array<{candidateId: number; firstName: string; lastName: string}>>([]);
  const [jobs, setJobs] = useState<Array<{jobPostingId: number; title: string}>>([]);
  const [interviewers, setInterviewers] = useState<Array<{employeeId: number; firstName: string; lastName: string}>>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors }, reset } = useForm({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      candidateId: defaults?.application?.candidateId || interview?.candidate_id || 0,
      jobId: defaults?.application?.jobPostingId || interview?.job_id || 0,
      scheduledAt: defaults?.start ? dayjs(defaults.start).toISOString() : interview?.scheduledAt || new Date().toISOString(),
      durationMinutes: interview?.duration || 60,
      interviewerIds: (interview && 'interviewer_ids' in interview ? interview.interviewer_ids : []) as number[] || [],
      interviewType: interview?.meetingUrl ? "online" as const : "online" as const,
    },
  });

  const interviewerIds = watch("interviewerIds");
  const interviewType = watch("interviewType");

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [candidatesRes, jobsRes, employeesRes, headquartersRes] = await Promise.all([
          recruitmentAPI.getCandidates({ limit: 100 }),
          recruitmentAPI.getJobPostings({ limit: 100, status: "published" }),
          employeeAPI.getEmployees({ limit: 100, isActive: true }),
          companyAPI.getHeadquarters({ limit: 100, isActive: true }),
        ]);

        setCandidates(candidatesRes.data);
        setJobs(jobsRes.data);
        setInterviewers(employeesRes.data);
        setHeadquarters(headquartersRes.data);
      } catch (e) {
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (defaults?.application) {
      setValue("candidateId", defaults.application.candidateId);
      setValue("jobId", defaults.application.jobPostingId);
      setValue("scheduledAt", defaults.start || dayjs().add(3, 'days').hour(10).minute(0).toISOString());
    } else if (interview) {
      setValue("candidateId", interview.candidate_id || 0);
      setValue("jobId", interview.job_id || 0);
      setValue("interviewerIds", ('interviewer_ids' in interview ? interview.interviewer_ids : []) as number[] || []);
      setValue("scheduledAt", interview.scheduledAt);
      setValue("durationMinutes", interview.duration);
      setValue("interviewType", interview.meetingUrl ? "online" : "offline");
      setValue("location", interview.location || "");
    }
  }, [interview, defaults, setValue]);

  const onSubmit = async (data: z.infer<typeof interviewFormSchema>) => {
    try {
      const scheduledTime = dayjs(data.scheduledAt);
      const now = dayjs();
      
      if (scheduledTime.isBefore(now)) {
        toast.error("Không thể đặt lịch phỏng vấn trong quá khứ");
        return;
      }
      
      const interviewData = {
        candidate_id: data.candidateId,
        job_id: data.jobId,
        interviewer_ids: data.interviewerIds,
        scheduled_at: scheduledTime.toISOString(),
        duration_minutes: data.durationMinutes,
        meeting_link: data.interviewType === "online" ? (interview?.meetingUrl || generateMeetingLink()) : "",
        location: data.interviewType === "offline" ? data.location : "",
        status: interview?.status || "scheduled" as const,
      };

      if (interview) {
        const currentScheduledTime = dayjs(interview.scheduledAt);
        if (currentScheduledTime.isBefore(now)) {
          toast.error("Không thể cập nhật lịch phỏng vấn đã diễn ra");
          return;
        }
        
        await recruitmentAPI.updateInterview(interview.interviewId, interviewData);
        toast.success("Đã cập nhật lịch phỏng vấn");
      } else {
        await recruitmentAPI.createInterview(interviewData);
        toast.success("Đã tạo lịch phỏng vấn");
      }
      
      reset();
      onSuccess();
    } catch (e) {
      const errorMsg = (e instanceof Error ? e.message : String(e)) || (interview ? "Cập nhật thất bại" : "Tạo lịch thất bại");
      toast.error(errorMsg);
    }
  };

  const addInterviewer = (employeeId: number) => {
    if (!interviewerIds.includes(employeeId)) {
      setValue("interviewerIds", [...interviewerIds, employeeId]);
    }
  };

  const removeInterviewer = (employeeId: number) => {
    setValue("interviewerIds", interviewerIds.filter(id => id !== employeeId));
  };

  if (loadingData) {
    return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Ứng viên *</Label>
          <Select 
            value={defaults?.application ? String(defaults.application.candidateId) : (candidates.find(candidate => candidate.candidateId === watch("candidateId"))?.candidateId ? String(watch("candidateId")) : undefined)}
            onValueChange={(value) => setValue("candidateId", Number(value))}
            disabled={!!defaults?.application}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn ứng viên" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((candidate) => (
                <SelectItem key={candidate.candidateId} value={String(candidate.candidateId)}>
                  {candidate.firstName} {candidate.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.candidateId && <p className="text-sm text-red-500">{errors.candidateId.message}</p>}
          {defaults?.application && (
            <p className="text-xs text-muted-foreground mt-1">
              {defaults.application.candidate ? `${defaults.application.candidate.firstName} ${defaults.application.candidate.lastName}` : "Đã được chọn từ application"}
            </p>
          )}
        </div>

        <div>
          <Label>Công việc *</Label>
          <Select 
            value={defaults?.application ? String(defaults.application.jobPostingId) : (jobs.find(job => job.jobPostingId === watch("jobId"))?.jobPostingId ? String(watch("jobId")) : undefined)} 
            onValueChange={(value) => setValue("jobId", Number(value))}
            disabled={!!defaults?.application}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn công việc" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.jobPostingId} value={String(job.jobPostingId)}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.jobId && <p className="text-sm text-red-500">{errors.jobId.message}</p>}
          {defaults?.application && (
            <p className="text-xs text-muted-foreground mt-1">
              {defaults.application.jobPosting?.title || "Đã được chọn từ application"}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label>Người phỏng vấn *</Label>
          <div className="space-y-2">
            <Select onValueChange={(value) => addInterviewer(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Thêm người phỏng vấn..." />
              </SelectTrigger>
              <SelectContent>
                {interviewers.filter(emp => !interviewerIds.includes(emp.employeeId)).map((interviewer) => (
                  <SelectItem key={interviewer.employeeId} value={String(interviewer.employeeId)}>
                    {interviewer.firstName} {interviewer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {interviewerIds.map((id) => {
                const interviewer = interviewers.find(emp => emp.employeeId === id);
                return interviewer ? (
                  <div key={id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {interviewer.firstName} {interviewer.lastName}
                    <button
                      type="button"
                      onClick={() => removeInterviewer(id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
            {errors.interviewerIds && <p className="text-sm text-red-500">{errors.interviewerIds.message}</p>}
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label>Thời gian *</Label>
          <Input 
            type="datetime-local" 
            {...register("scheduledAt")}
            value={dayjs(watch("scheduledAt")).format("YYYY-MM-DDTHH:mm")}
            onChange={(e) => setValue("scheduledAt", dayjs(e.target.value).toISOString())}
          />
          {errors.scheduledAt && <p className="text-sm text-red-500">{errors.scheduledAt.message}</p>}
        </div>

        <div>
          <Label>Thời lượng (phút) *</Label>
          <Input 
            type="number" 
            {...register("durationMinutes")} 
            placeholder="60" 
            min="15" 
            max="480"
          />
          {errors.durationMinutes && <p className="text-sm text-red-500">{errors.durationMinutes.message}</p>}
        </div>

        <div>
          <Label>Hình thức phỏng vấn *</Label>
          <Select defaultValue={interview?.location ? "offline" : "online"} onValueChange={(value) => setValue("interviewType", value as "online" | "offline")}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn hình thức" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online (Meeting)</SelectItem>
              <SelectItem value="offline">Offline (Tại văn phòng)</SelectItem>
            </SelectContent>
          </Select>
          {errors.interviewType && <p className="text-sm text-red-500">{errors.interviewType.message}</p>}
        </div>

        {interviewType === "offline" && (
          <div>
            <Label>Địa điểm *</Label>
            <Select defaultValue={interview?.location} onValueChange={(value) => setValue("location", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn địa điểm" />
              </SelectTrigger>
              <SelectContent>
                {headquarters.map((hq) => (
                  <SelectItem key={hq.headquarterId} value={hq.headquarterName}>
                    {hq.headquarterName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-3 rounded text-blue-800 text-sm">
        <strong>Lưu ý:</strong> 
        {interviewType === "online" 
          ? " Link meeting sẽ được tự động tạo sau khi lưu." 
          : " Hãy đảm bảo địa điểm đã được chọn cho buổi phỏng vấn offline."}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Huỷ</Button>
        <Button type="submit" disabled={isSubmitting}>Lưu</Button>
      </div>
    </form>
  );
}
