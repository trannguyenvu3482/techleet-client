"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { recruitmentAPI, type Interview } from "@/lib/api";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import type { InterviewApiResponse } from "./types";

function Row({ label, value, renderComponent }: { label: string; value?: string | number | null; renderComponent?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 items-start py-2">
      <div className="text-sm text-muted-foreground col-span-1">{label}</div>
      {!renderComponent ? (
        <div className="col-span-2 break-words">{value ?? "-"}</div>
      ) : (
        <div className="col-span-2">{renderComponent}</div>
      )}
    </div>
  );
}

export function InterviewDetail({ 
  interviewId, 
  onEdit, 
  onDelete, 
  onUpdated 
}: { 
  interviewId: number; 
  onEdit: (interviewId: number) => void; 
  onDelete: () => void; 
  onUpdated: () => void; 
}) {
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

  useEffect(() => { 
    load(); 
  }, [load]);

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
          <Button variant="secondary" onClick={() => onEdit(interview.interview_id)}>Sửa</Button>
          <Button variant="destructive" onClick={onDelete}>Xóa</Button>
        </div>
      </div>
      <Separator />
      <div>
        <Row 
          label="Ứng viên" 
          value={interview.candidate ? `${interview.candidate.first_name} ${interview.candidate.last_name}` : "-"} 
          renderComponent={interview.candidate ? (
            <a 
              href={`/recruitment/candidate/detail/${interview.candidate.candidate_id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {interview.candidate.first_name} {interview.candidate.last_name}
            </a>
          ) : undefined} 
        />
        <Row 
          label="Công việc" 
          value={interview.job ? interview.job.title : "-"} 
          renderComponent={interview.job ? (
            <a 
              href={`/recruitment/jobs/detail/${interview.job.job_id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {interview.job.title}
            </a>
          ) : undefined} 
        />
        <Row label="Thời gian" value={dayjs(interview.scheduled_at).format("DD/MM/YYYY HH:mm")} />
        <Row label="Thời lượng" value={`${interview.duration_minutes} phút`} />
        <Row label="Địa điểm" value={interview.location || "-"} />
        <Row 
          label="Meeting URL" 
          value={interview.meeting_link || "-"} 
          renderComponent={interview.meeting_link ? (
            <a 
              href={interview.meeting_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {interview.meeting_link}
            </a>
          ) : undefined} 
        />
        <Row label="Trạng thái" value={interview.status} />
        <Row label="Người phỏng vấn" value={interview.interviewers ? interview.interviewers.map(i => `${i.firstName} ${i.lastName}`).join(", ") : "-"} />
      </div>
      
      {/* Mark as Completed Button */}
      {interview.status !== 'completed' && (
        <div className="pt-4 border-t">
          <Button
            onClick={() => updateStatus('completed')}
            className="w-full"
            variant="default"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Đánh dấu đã hoàn thành
          </Button>
        </div>
      )}
    </div>
  );
}
