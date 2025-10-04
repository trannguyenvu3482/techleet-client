"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { recruitmentAPI, type Interview } from "@/lib/api";
import { companyAPI, type Headquarter } from "@/lib/api/company";
import { employeeAPI } from "@/lib/api/employees";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: { interview: Interview };
  backgroundColor?: string;
  borderColor?: string;
};

function getStatusColor(status: Interview["status"]) {
  switch (status) {
    case "scheduled":
      return { bg: "#2563eb", border: "#1d4ed8" };
    case "completed":
      return { bg: "#16a34a", border: "#15803d" };
    case "cancelled":
      return { bg: "#dc2626", border: "#b91c1c" };
    case "rescheduled":
      return { bg: "#f59e0b", border: "#d97706" };
    default:
      return { bg: "#6b7280", border: "#4b5563" };
  }
}

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
});

export default function InterviewCalendarClient() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDefaults, setFormDefaults] = useState<{ start?: string; end?: string } | undefined>();
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recruitmentAPI.getInterviews({ limit: 500, sortBy: "scheduledAt", sortOrder: "ASC" });
      const mapped: CalendarEvent[] = res.data.map((iv: any) => {
        const start = iv.scheduled_at;
        const endDate = dayjs(iv.scheduled_at).add(iv.duration_minutes || 30, "minutes");
        const { bg, border } = getStatusColor(iv.status);
        const title = `Interview #${iv.interview_id} ${iv.meeting_link ? " • Online" : iv.location ? " • Offline" : ""}`;
        return {
          id: String(iv.interview_id),
          title,
          start,
          end: endDate.toISOString(),
          extendedProps: { 
            interview: {
              interviewId: iv.interview_id,
              applicationId: iv.job_id, 
              interviewerUserId: iv.interviewer_ids?.[0] || 0,
              scheduledAt: iv.scheduled_at,
              duration: iv.duration_minutes,
              location: iv.location,
              meetingUrl: iv.meeting_link,
              status: iv.status,
              createdAt: iv.createdAt,
              updatedAt: iv.updatedAt,
              candidate_id: iv.candidate_id,
              job_id: iv.job_id,
              interviewer_ids: iv.interviewer_ids,
            }
          },
          backgroundColor: bg,
          borderColor: border,
        };
      });
      setEvents(mapped);
    } catch (e) {
      console.log(e);
      toast.error("Không thể tải lịch phỏng vấn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    
    // Listen for interview creation events
    const handleInterviewCreated = () => {
      loadEvents();
    };
    
    window.addEventListener('interview-created', handleInterviewCreated);
    return () => {
      window.removeEventListener('interview-created', handleInterviewCreated);
    };
  }, [loadEvents]);

  const handleSelect = useCallback((arg: DateSelectArg) => {
    setFormDefaults({ start: dayjs(arg.startStr).toISOString(), end: dayjs(arg.endStr).toISOString() });
    setIsFormOpen(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const id = Number(clickInfo.event.id);
    setSelectedInterviewId(id);
  }, []);

  const onCreatedOrUpdated = useCallback(() => {
    setIsFormOpen(false);
    setSelectedInterviewId(null);
    setEditingInterview(null);
    loadEvents();
  }, [loadEvents]);

  const onDelete = useCallback(async (id: number) => {
    try {
      await recruitmentAPI.deleteInterview(id);
      toast.success("Đã xoá cuộc phỏng vấn");
      onCreatedOrUpdated();
    } catch (e) {
      toast.error("Xoá thất bại");
    }
  }, [onCreatedOrUpdated]);

  const headerToolbar = useMemo(
    () => ({
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    }),
    []
  );

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lịch phỏng vấn</CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsFormOpen(true)}>Tạo lịch</Button>
            <Button variant="secondary" onClick={loadEvents} disabled={loading}>Làm mới</Button>
          </div>
        </CardHeader>
        <CardContent>
          <FullCalendar
            ref={calendarRef as never}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            selectable
            selectMirror
            headerToolbar={headerToolbar}
            events={events}
            eventClick={handleEventClick}
            select={handleSelect}
            height="auto"
            timeZone="Asia/Ho_Chi_Minh"
          />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingInterview(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingInterview ? "Cập nhật cuộc phỏng vấn" : "Tạo cuộc phỏng vấn"}</DialogTitle>
          </DialogHeader>
          <InterviewForm
            defaults={formDefaults}
            interview={editingInterview ?? undefined}
            onCancel={() => setIsFormOpen(false)}
            onSuccess={onCreatedOrUpdated}
          />
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedInterviewId} onOpenChange={(open) => !open && setSelectedInterviewId(null)}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Chi tiết cuộc phỏng vấn</SheetTitle>
          </SheetHeader>
          {selectedInterviewId && (
            <InterviewDetail
              interviewId={selectedInterviewId}
              onEdit={(iv) => {
                setFormDefaults({ start: iv.scheduledAt });
                setEditingInterview(iv);
                setIsFormOpen(true);
              }}
              onDelete={() => onDelete(selectedInterviewId)}
              onUpdated={onCreatedOrUpdated}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

type InterviewFormProps = {
  defaults?: { start?: string; end?: string };
  interview?: Interview;
  onCancel: () => void;
  onSuccess: () => void;
};

function InterviewForm({ defaults, interview, onCancel, onSuccess }: InterviewFormProps) {
  const [candidates, setCandidates] = useState<Array<{candidateId: number; firstName: string; lastName: string}>>([]);
  const [jobs, setJobs] = useState<Array<{jobPostingId: number; title: string}>>([]);
  const [interviewers, setInterviewers] = useState<Array<{employeeId: number; firstName: string; lastName: string}>>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  // Generate meeting link
  const generateMeetingLink = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `https://meet.jit.si/${randomId}`;
  };

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors }, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateId: 0,
      jobId: 0,
      scheduledAt: defaults?.start || new Date().toISOString(),
      durationMinutes: 60,
      interviewerIds: [],
      interviewType: "online" as const,
    },
  });

  const interviewerIds = watch("interviewerIds");
  const interviewType = watch("interviewType");

  // Load data
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

  // Populate form when editing
  useEffect(() => {
    if (interview) {
      setValue("candidateId", (interview as any).candidate_id || 0);
      setValue("jobId", (interview as any).job_id || 0);
      setValue("interviewerIds", (interview as any).interviewer_ids || []);
      setValue("scheduledAt", interview.scheduledAt);
      setValue("durationMinutes", interview.duration);
      setValue("interviewType", interview.meetingUrl ? "online" : "offline");
      setValue("location", interview.location || "");
    }
  }, [interview, setValue]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const interviewData = {
        candidate_id: data.candidateId,
        job_id: data.jobId,
        interviewer_ids: data.interviewerIds,
        scheduled_at: data.scheduledAt,
        duration_minutes: data.durationMinutes,
        meeting_link: data.interviewType === "online" ? (interview?.meetingUrl || generateMeetingLink()) : "",
        location: data.interviewType === "offline" ? data.location : "",
        status: interview?.status || "scheduled" as const,
      };

      if (interview) {
        // Update existing interview
        await recruitmentAPI.updateInterview(interview.interviewId, interviewData);
        toast.success("Đã cập nhật lịch phỏng vấn");
      } else {
        // Create new interview
        await recruitmentAPI.createInterview(interviewData);
        toast.success("Đã tạo lịch phỏng vấn");
      }
      
      reset();
      onSuccess();
    } catch (e: any) {
      const errorMsg = e.message || (interview ? "Cập nhật thất bại" : "Tạo lịch thất bại");
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
          <Select onValueChange={(value) => setValue("candidateId", Number(value))}>
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
          <Select onValueChange={(value) => setValue("jobId", Number(value))}>
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
          <Select onValueChange={(value) => setValue("interviewType", value as "online" | "offline")}>
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
              <Select onValueChange={(value) => setValue("location", value)}>
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

function Row({ label, value,renderComponent }: { label: string; value?: string | number | null,renderComponent?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 items-start py-2">
      <div className="text-sm text-muted-foreground col-span-1">{label}</div>
      {!renderComponent ? <div className="col-span-2 break-words">{value ?? "-"}</div> : renderComponent}
      
    </div>
  );
}

// Type for API response
interface InterviewApiResponse {
  interview_id: number;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string;
  location: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  candidate: {
    candidate_id: number;
    first_name: string;
    last_name: string;
  };
  job: {
    job_id: number;
    title: string;
  };
  interviewers: Array<{
    employeeId: number;
    firstName: string;
    lastName: string;
  }>;
}

function InterviewDetail({ interviewId, onEdit, onDelete, onUpdated }: { interviewId: number; onEdit: (iv: Interview) => void; onDelete: () => void; onUpdated: () => void; }) {
  const [interview, setInterview] = useState<InterviewApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recruitmentAPI.getInterviewById(interviewId);
      setInterview(data as unknown as InterviewApiResponse);
    } catch (e) {
      toast.error("Không tải được chi tiết");
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (status: Interview["status"]) => {
    if (!interview) return;
    try {
      await recruitmentAPI.updateInterview(interview.interview_id, { status });
      toast.success("Đã cập nhật trạng thái");
      onUpdated();
      load();
    } catch (e) {
      toast.error("Cập nhật thất bại");
    }
  };

  if (loading) {
    return <div className="p-4">Đang tải...</div>;
  }
  if (!interview) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-lg">Interview #{interview.interview_id}</div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            // Convert API response to Interview type for editing
            const interviewForEdit: any = {
              interviewId: interview.interview_id,
              applicationId: 0, // Not available in API response
              interviewerUserId: interview.interviewers[0]?.employeeId || 0,
              scheduledAt: interview.scheduled_at,
              duration: interview.duration_minutes,
              location: interview.location,
              meetingUrl: interview.meeting_link,
              status: interview.status,
              createdAt: "",
              updatedAt: "",
              candidate_id: interview.candidate.candidate_id,
              job_id: interview.job.job_id,
              interviewer_ids: interview.interviewers.map(i => i.employeeId),
            };
            onEdit(interviewForEdit);
          }}>Sửa</Button>
          <Button variant="destructive" onClick={onDelete}>Xóa</Button>
        </div>
      </div>
      <Separator />
      <div>
        <Row label="Ứng viên" value={interview.candidate ? `${interview.candidate.first_name} ${interview.candidate.last_name}` : "-"} renderComponent={interview.candidate ? (
          <a 
            href={`/recruitment/candidate/detail/${interview.candidate.candidate_id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {interview.candidate.first_name} {interview.candidate.last_name}
          </a>
        ) : "-"} />
        <Row label="Công việc" value={interview.job ? interview.job.title : "-"} renderComponent={interview.job ? (
          <a 
            href={`/recruitment/jobs/detail/${interview.job.job_id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {interview.job.title}
          </a>
        ) : "-"} />
        <Row label="Thời gian" value={dayjs(interview.scheduled_at).format("DD/MM/YYYY HH:mm")} />
        <Row label="Thời lượng" value={`${interview.duration_minutes} phút`} />
        <Row label="Địa điểm" value={interview.location || "-"} />
        <Row label="Meeting URL" value={interview.meeting_link || "-"} renderComponent={interview.meeting_link ? (
          <a 
            href={interview.meeting_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {interview.meeting_link}
          </a>
        ) : "-"} />
        <Row label="Trạng thái" value={interview.status} />
        <Row label="Người phỏng vấn" value={interview.interviewers ? interview.interviewers.map(i => `${i.firstName} ${i.lastName}`).join(", ") : "-"} />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={() => updateStatus("scheduled")} variant="outline">Đặt lịch</Button>
        <Button onClick={() => updateStatus("completed")} variant="outline">Hoàn thành</Button>
        <Button onClick={() => updateStatus("cancelled")} variant="outline">Hủy</Button>
        <Button onClick={() => updateStatus("rescheduled")} variant="outline">Dời lịch</Button>
      </div>
    </div>
  );
}