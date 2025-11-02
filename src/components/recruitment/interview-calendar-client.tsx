"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { recruitmentAPI, type Interview, type Application } from "@/lib/api";
import type { EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { InterviewForm } from "./interview-calendar/interview-form";
import { InterviewDetail } from "./interview-calendar/interview-detail";
import { InterviewRequestsList } from "./interview-calendar/interview-requests-list";
import { InterviewRequestsBadge } from "./interview-calendar/interview-requests-badge";
import { getStatusColor } from "./interview-calendar/utils";
import type { CalendarEvent, InterviewApiResponse } from "./interview-calendar/types";

export default function InterviewCalendarClient() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDefaults, setFormDefaults] = useState<{ start?: string; end?: string; application?: Application } | undefined>();
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recruitmentAPI.getInterviews({ limit: 500, sortBy: "scheduledAt", sortOrder: "ASC" });
      const mapped: CalendarEvent[] = res.data.map((iv: any) => {
        const start = iv.scheduled_at || iv.scheduledAt;
        const duration = (iv as any).duration_minutes || iv.duration || 30;
        const endDate = dayjs(start).add(duration, "minutes");
        const { bg, border } = getStatusColor(iv.status);
        const interviewId = (iv as any).interview_id || iv.interviewId;
        const title = `Interview #${interviewId} ${(iv as any).meeting_link || iv.meetingUrl ? " • Online" : iv.location ? " • Offline" : ""}`;
        return {
          id: String(interviewId),
          title,
          start,
          end: endDate.toISOString(),
          extendedProps: { 
            interview: {
              interviewId,
              applicationId: iv.job_id || 0, 
              interviewerUserId: ((iv as any).interviewer_ids && Array.isArray((iv as any).interviewer_ids) ? (iv as any).interviewer_ids[0] : 0) || iv.interviewerUserId || 0,
              scheduledAt: start,
              duration,
              location: iv.location,
              meetingUrl: (iv as any).meeting_link || iv.meetingUrl,
              status: iv.status,
              createdAt: iv.createdAt || "",
              updatedAt: iv.updatedAt || "",
              candidate_id: iv.candidate_id || 0,
              job_id: iv.job_id || 0,
              interviewer_ids: ((iv as any).interviewer_ids && Array.isArray((iv as any).interviewer_ids) ? (iv as any).interviewer_ids : []) as number[],
            }
          },
          backgroundColor: bg,
          borderColor: border,
        };
      });
      setEvents(mapped);
    } catch (e) {
      toast.error("Không thể tải lịch phỏng vấn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    
    const handleInterviewCreated = () => {
      loadEvents();
    };
    
    window.addEventListener('interview-created', handleInterviewCreated);
    return () => {
      window.removeEventListener('interview-created', handleInterviewCreated);
    };
  }, [loadEvents]);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const id = Number(clickInfo.event.id);
    setSelectedInterviewId(id);
  }, []);

  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
    const eventId = Number(dropInfo.event.id);
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end;
    
    if (!newStart || !newEnd) return;
    
    const originalStart = dropInfo.oldEvent.start;
    const now = new Date();
    if (originalStart && originalStart < now) {
      dropInfo.revert();
      toast.error("Không thể cập nhật lịch phỏng vấn đã diễn ra");
      return;
    }
    
    if (newStart < now) {
      dropInfo.revert();
      toast.error("Không thể đặt lịch phỏng vấn trong quá khứ");
      return;
    }
    
    try {
      const durationMinutes = Math.round((newEnd.getTime() - newStart.getTime()) / (1000 * 60));
      
      await recruitmentAPI.updateInterview(eventId, {
        scheduled_at: newStart.toISOString(),
        duration_minutes: durationMinutes,
      });
      
      toast.success("Đã cập nhật lịch phỏng vấn");
      loadEvents();
    } catch (e) {
      dropInfo.revert();
      toast.error("Cập nhật lịch thất bại");
    }
  }, [loadEvents]);

  const handleEventResize = useCallback(async (resizeInfo: EventResizeDoneArg) => {
    const eventId = Number(resizeInfo.event.id);
    const newStart = resizeInfo.event.start;
    const newEnd = resizeInfo.event.end;
    
    if (!newStart || !newEnd) return;
    
    const originalStart = resizeInfo.oldEvent.start;
    const now = new Date();
    if (originalStart && originalStart < now) {
      resizeInfo.revert();
      toast.error("Không thể cập nhật lịch phỏng vấn đã diễn ra");
      return;
    }
    
    if (newStart < now) {
      resizeInfo.revert();
      toast.error("Không thể đặt lịch phỏng vấn trong quá khứ");
      return;
    }
    
    try {
      const durationMinutes = Math.round((newEnd.getTime() - newStart.getTime()) / (1000 * 60));
      
      await recruitmentAPI.updateInterview(eventId, {
        duration_minutes: durationMinutes,
      });
      
      toast.success("Đã cập nhật thời lượng phỏng vấn");
      loadEvents();
    } catch (e) {
      resizeInfo.revert();
      toast.error("Cập nhật thời lượng thất bại");
    }
  }, [loadEvents]);

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Lịch phỏng vấn</TabsTrigger>
          <TabsTrigger value="requests">
            Yêu cầu phỏng vấn
            <InterviewRequestsBadge />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lịch phỏng vấn</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={loadEvents} disabled={loading}>Làm mới</Button>
              </div>
            </CardHeader>
            <CardContent>
              <FullCalendar
                ref={calendarRef as never}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={false}
                selectMirror={false}
                editable={true}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                headerToolbar={headerToolbar}
                events={events}
                eventClick={handleEventClick}
                height="auto"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <InterviewRequestsList
            onScheduleClick={(application) => {
              setFormDefaults({ application });
              setIsFormOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={(open) => { 
        setIsFormOpen(open); 
        if (!open) {
          setEditingInterview(null);
          setFormDefaults(undefined);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInterview ? "Cập nhật cuộc phỏng vấn" : "Tạo cuộc phỏng vấn"}</DialogTitle>
          </DialogHeader>
          <InterviewForm
            defaults={formDefaults}
            interview={editingInterview ?? undefined}
            onCancel={() => {
              setIsFormOpen(false);
              setFormDefaults(undefined);
            }}
            onSuccess={() => {
              onCreatedOrUpdated();
              if (activeTab === "requests") {
                window.dispatchEvent(new Event('interview-requests-refresh'));
              }
            }}
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
              onEdit={async (interviewId) => {
                try {
                  const interviewData = await recruitmentAPI.getInterviewById(interviewId);
                  
                  const scheduledTime = dayjs(interviewData.scheduled_at || interviewData.scheduledAt);
                  const now = dayjs();
                  
                  if (scheduledTime.isBefore(now)) {
                    toast.error("Không thể chỉnh sửa lịch phỏng vấn đã diễn ra");
                    return;
                  }
                  
                  const apiData = interviewData as any;
                  const interviewForEdit: Interview = {
                    interviewId: Number(apiData.interview_id || apiData.interviewId || 0),
                    applicationId: 0,
                    interviewerUserId: Number((apiData.interviewers && Array.isArray(apiData.interviewers) && apiData.interviewers.length > 0) ? apiData.interviewers[0].employeeId : 0),
                    scheduledAt: String(apiData.scheduled_at || apiData.scheduledAt || ""),
                    duration: Number(apiData.duration_minutes || apiData.duration || 60),
                    location: apiData.location as string | undefined,
                    meetingUrl: apiData.meeting_link || apiData.meetingUrl,
                    status: apiData.status,
                    createdAt: String(apiData.createdAt || ""),
                    updatedAt: String(apiData.updatedAt || ""),
                    candidate_id: Number((apiData.candidate && apiData.candidate.candidate_id) || apiData.candidate_id || 0),
                    job_id: Number((apiData.job && apiData.job.job_id) || apiData.job_id || 0),
                  };
                  
                  setFormDefaults({ start: interviewData.scheduled_at || interviewData.scheduledAt });
                  setEditingInterview(interviewForEdit);
                  setIsFormOpen(true);
                } catch (e) {
                  toast.error("Không thể tải dữ liệu để chỉnh sửa");
                }
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