import type { Interview, Application } from "@/lib/api";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: { interview: Interview };
  backgroundColor?: string;
  borderColor?: string;
};

export interface InterviewApiResponse {
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

export type InterviewFormDefaults = {
  start?: string;
  end?: string;
  application?: Application;
};

export type InterviewFormProps = {
  defaults?: InterviewFormDefaults;
  interview?: Interview;
  onCancel: () => void;
  onSuccess: () => void;
};
