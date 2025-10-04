"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Interview, recruitmentAPI } from "@/lib/api";
import { companyAPI, type Headquarter } from "@/lib/api/company";
import { employeeAPI } from "@/lib/api/employees";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";

const formSchema = z.object({
  candidateId: z.number().int().positive(),
  jobId: z.number().int().positive(),
  interviewerIds: z.array(z.number()).min(1, "Chọn ít nhất 1 người phỏng vấn"),
  scheduledAt: z.string().min(1),
  durationMinutes: z.preprocess((val) => {
    if (typeof val === "string") return parseInt(val, 10);
    return val;
  }, z.number().int().min(15).max(480)),
  interviewType: z.enum(["online", "offline"]),
  location: z.string().optional(),
}).refine((data) => {
  if (data.interviewType === "offline") {
    return data.location && data.location.trim().length > 0;
  }
  return true;
}, {
  message: "Địa điểm không được để trống khi chọn phỏng vấn offline",
  path: ["location"],
}).refine((data) => {
  const scheduledTime = new Date(data.scheduledAt);
  const now = new Date();
  return scheduledTime > now;
}, {
  message: "Không thể đặt lịch phỏng vấn trong quá khứ",
  path: ["scheduledAt"],
});

interface CreateInterviewModalProps {
  candidateId: number;
  trigger?: React.ReactNode;
}

export default function CreateInterviewModal({ candidateId, trigger }: CreateInterviewModalProps) {
  const [open, setOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [existingInterview, setExistingInterview] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [candidates, setCandidates] = useState<Array<{candidateId: number; firstName: string; lastName: string}>>([]);
  const [jobs, setJobs] = useState<Array<{jobPostingId: number; title: string}>>([]);
  const [interviewers, setInterviewers] = useState<Array<{employeeId: number; firstName: string; lastName: string}>>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <Calendar className="h-4 w-4" />
      Lên lịch phỏng vấn
    </Button>
  );

  // Generate meeting link
  const generateMeetingLink = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `https://meet.jit.si/${randomId}`;
  };

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors }, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateId: candidateId,
      jobId: 0,
      scheduledAt: new Date().toISOString(),
      durationMinutes: 60,
      interviewerIds: [],
      interviewType: "online" as const,
    },
  });

  const interviewerIds = watch("interviewerIds");
  const interviewType = watch("interviewType");

  // Check for existing interview when modal opens
  useEffect(() => {
    if (!open) return;
    
    const checkExistingInterview = async () => {
      try {
        const interviewData = await recruitmentAPI.getInterviewByCandidateId(candidateId);
        if (interviewData) {
            setExistingInterview(interviewData);
            setIsEditMode(true);
        } else {
          setExistingInterview(null);
          setIsEditMode(false);
        }
      } catch (error) {
        console.log("Error checking existing interview:", error);
        setExistingInterview(null);
        setIsEditMode(false);
      }
    };

    checkExistingInterview();
  }, [open, candidateId]);

  // Load data and populate form
  useEffect(() => {
    if (!open) return;
    
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [candidatesRes, jobsRes, employeesRes, headersRes] = await Promise.all([
          recruitmentAPI.getCandidates({ limit: 100 }),
          recruitmentAPI.getJobPostings({ limit: 100, status: "published" }),
          employeeAPI.getEmployees({ limit: 100, isActive: true }),
          companyAPI.getHeadquarters({ limit: 100, isActive: true }),
        ]);

        setCandidates(candidatesRes.data);
        setJobs(jobsRes.data);
        setInterviewers(employeesRes.data);
        setHeadquarters(headersRes.data);

        // Populate form if editing existing interview
        if (existingInterview) {
          setValue("candidateId", existingInterview.candidate_id || candidateId);
          setValue("jobId", existingInterview.job_id || 0);
          setValue("interviewerIds", existingInterview.interviewer_ids || []);
          setValue("scheduledAt", existingInterview.scheduled_at);
          setValue("durationMinutes", existingInterview.duration_minutes);
          setValue("interviewType", existingInterview.meeting_link ? "online" : "offline");
          setValue("location", existingInterview.location || "");
        }
      } catch (error) {
        console.log(error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [open, existingInterview, candidateId, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const interviewData = {
        candidate_id: data.candidateId,
        job_id: data.jobId,
        interviewer_ids: data.interviewerIds,
        scheduled_at: data.scheduledAt,
        duration_minutes: data.durationMinutes,
        meeting_link: data.interviewType === "online" ? (existingInterview?.meeting_link || generateMeetingLink()) : "",
        location: data.interviewType === "offline" ? data.location : "",
        status: existingInterview?.status || "scheduled" as const,
      };

      if (isEditMode && existingInterview) {
        // Update existing interview
        await recruitmentAPI.updateInterview(existingInterview.interview_id, interviewData);
        toast.success("Đã cập nhật lịch phỏng vấn");
      } else {
        // Create new interview
        await recruitmentAPI.createInterview(interviewData);
        toast.success("Đã tạo lịch phỏng vấn");
      }
      
      reset();
      setOpen(false);
      
      // Emit event to refresh calendar if it exists
      window.dispatchEvent(new CustomEvent('interview-created'));
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : (isEditMode ? "Cập nhật lịch thất bại" : "Tạo lịch thất bại");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Chỉnh sửa lịch phỏng vấn" : "Tạo lịch phỏng vấn"}</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="p-4 text-center">Đang tải dữ liệu...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Ứng viên *</Label>
                <Select 
                   onValueChange={(value) => setValue("candidateId", Number(value))}
                  defaultValue={String(candidateId)}
                  disabled={isEditMode}
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
              </div>

              <div>
                <Label>Công việc *</Label>
                <Select 
                  onValueChange={(value) => setValue("jobId", Number(value))}
                  defaultValue={existingInterview ? String(existingInterview.job_id) : undefined}
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
                <Input type="number" {...register("durationMinutes")} placeholder="60" min="15" max="480"/>
                {errors.durationMinutes && <p className="text-sm text-red-500">{errors.durationMinutes.message}</p>}
              </div>

              <div>
                <Label>Hình thức phỏng vấn *</Label>
                <Select 
                  onValueChange={(value) => setValue("interviewType", value as "online" | "offline")}
                  defaultValue={existingInterview ? (existingInterview.meeting_link ? "online" : "offline") : undefined}
                >
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
                  <Select 
                    onValueChange={(value) => setValue("location", value)}
                    defaultValue={existingInterview?.location || undefined}
                  >
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
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Huỷ</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isEditMode ? "Cập nhật" : "Lưu"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}