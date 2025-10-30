import dayjs from "dayjs";
import { z } from "zod";
import type { Interview } from "@/lib/api";

export function getStatusColor(status: Interview["status"]) {
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

export const interviewFormSchema = z.object({
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
  const scheduledTime = dayjs(data.scheduledAt);
  const now = dayjs();
  return scheduledTime.isAfter(now);
}, {
  message: "Không thể đặt lịch phỏng vấn trong quá khứ",
  path: ["scheduledAt"],
});

export function generateMeetingLink(): string {
  const randomId = Math.random().toString(36).substring(2, 15);
  return `https://meet.jit.si/${randomId}`;
}
