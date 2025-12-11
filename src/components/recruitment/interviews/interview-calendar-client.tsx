"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
import { Bell, RefreshCw } from "lucide-react";
import { InterviewForm } from "./calendar/interview-form";
import { InterviewDetail } from "./calendar/interview-detail";
import { InterviewRequestsList } from "./calendar/interview-requests-list";
import { getStatusColor } from "./calendar/utils";
import type { CalendarEvent } from "./calendar/types";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

// Status legend configuration
const STATUS_LEGEND = [
  { status: "scheduled", label: "Đã lên lịch", color: "bg-blue-500" },
  { status: "in_progress", label: "Đang diễn ra", color: "bg-amber-500" },
  { status: "completed", label: "Hoàn thành", color: "bg-green-500" },
  { status: "cancelled", label: "Đã hủy", color: "bg-red-500" },
];

export default function InterviewCalendarClient() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDefaults, setFormDefaults] = useState<{ start?: string; end?: string; application?: Application } | undefined>();
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [requestsCount, setRequestsCount] = useState(0);
  const [requestsSheetOpen, setRequestsSheetOpen] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recruitmentAPI.getInterviews({ limit: 500, sortBy: "scheduledAt", sortOrder: "ASC" });
      const mapped: CalendarEvent[] = res.data.map((iv: any) => {
        const start = iv.scheduled_at || iv.scheduledAt;
        const duration = iv.duration_minutes || iv.duration || 30;
        const endDate = dayjs(start).add(duration, "minutes");
        const { bg, border } = getStatusColor(iv.status);
        const interviewId = iv.interview_id || iv.interviewId;
        const title = `#${interviewId} ${iv.meeting_link || iv.meetingUrl ? "• Online" : iv.location ? "• Offline" : ""}`;
        return {
          id: String(interviewId),
          title,
          start,
          end: endDate.toISOString(),
          extendedProps: { 
            interview: {
              interviewId,
              applicationId: iv.job_id || 0, 
              interviewerUserId: (iv.interviewer_ids && Array.isArray(iv.interviewer_ids) ? iv.interviewer_ids[0] : 0) || iv.interviewerUserId || 0,
              scheduledAt: start,
              duration,
              location: iv.location,
              meetingUrl: iv.meeting_link || iv.meetingUrl,
              status: iv.status,
              createdAt: iv.createdAt || "",
              updatedAt: iv.updatedAt || "",
              candidate_id: iv.candidate_id || 0,
              job_id: iv.job_id || 0,
              interviewer_ids: (iv.interviewer_ids && Array.isArray(iv.interviewer_ids) ? iv.interviewer_ids : []) as number[],
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

  const loadRequestsCount = useCallback(async () => {
    try {
      const response = await recruitmentAPI.getInterviewRequests({ limit: 100 });
      setRequestsCount(response.data.length);
    } catch (e) {
      console.error("Error loading requests count:", e);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    loadRequestsCount();
    
    const handleInterviewCreated = () => {
      loadEvents();
      loadRequestsCount();
    };
    
    const handleRequestsRefresh = () => {
      loadRequestsCount();
    };
    
    window.addEventListener('interview-created', handleInterviewCreated);
    window.addEventListener('interview-requests-refresh', handleRequestsRefresh);
    return () => {
      window.removeEventListener('interview-created', handleInterviewCreated);
      window.removeEventListener('interview-requests-refresh', handleRequestsRefresh);
    };
  }, [loadEvents, loadRequestsCount]);

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
    setRequestsSheetOpen(false);
    loadEvents();
    loadRequestsCount();
  }, [loadEvents, loadRequestsCount]);

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
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Lịch phỏng vấn</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Kéo thả để thay đổi lịch, click để xem chi tiết
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Requests Badge/Button */}
            <Sheet open={requestsSheetOpen} onOpenChange={setRequestsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4 mr-2" />
                  Yêu cầu phỏng vấn
                  {requestsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                    >
                      {requestsCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Yêu cầu phỏng vấn ({requestsCount})</SheetTitle>
                </SheetHeader>
                <div className="m-4">
                  <InterviewRequestsList
                    onScheduleClick={(application) => {
                      setFormDefaults({ application });
                      setIsFormOpen(true);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={loadEvents} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="">
          {/* Status Legend */}
          <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
            {STATUS_LEGEND.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Calendar or Loading */}
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-64" />
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Chưa có lịch phỏng vấn"
              description="Lịch phỏng vấn sẽ xuất hiện ở đây khi bạn lên lịch cho ứng viên."
              size="lg"
            />
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
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
                  eventClassNames="cursor-pointer transition-opacity hover:opacity-80"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Interview Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { 
        setIsFormOpen(open); 
        if (!open) {
          setEditingInterview(null);
          setFormDefaults(undefined);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
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
              window.dispatchEvent(new Event('interview-requests-refresh'));
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Interview Detail Sheet */}
      <Sheet open={!!selectedInterviewId} onOpenChange={(open) => !open && setSelectedInterviewId(null)}>
        <SheetContent className="w-full sm:max-w-3xl mx-4">
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
                  setSelectedInterviewId(null);
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
