"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { recruitmentAPI, type Interview, type Application } from "@/lib/api";
import type { EventClickArg, EventDropArg } from "@fullcalendar/core";
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
import type { CalendarEvent } from "./interview-calendar/types";

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

  const handleEventResize = useCallback(async (resizeInfo: any) => {
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
                  
                  const scheduledTime = dayjs((interviewData as any).scheduled_at);
                  const now = dayjs();
                  
                  if (scheduledTime.isBefore(now)) {
                    toast.error("Không thể chỉnh sửa lịch phỏng vấn đã diễn ra");
                    return;
                  }
                  
                  const apiData = interviewData as any;
                  const interviewForEdit: any = {
                    interviewId: apiData.interview_id,
                    applicationId: 0,
                    interviewerUserId: apiData.interviewers[0]?.employeeId || 0,
                    scheduledAt: apiData.scheduled_at,
                    duration: apiData.duration_minutes,
                    location: apiData.location,
                    meetingUrl: apiData.meeting_link,
                    status: apiData.status,
                    createdAt: "",
                    updatedAt: "",
                    candidate_id: apiData.candidate.candidate_id,
                    job_id: apiData.job.job_id,
                    interviewer_ids: apiData.interviewers.map((i: any) => i.employeeId),
                  };
                  
                  setFormDefaults({ start: apiData.scheduled_at });
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