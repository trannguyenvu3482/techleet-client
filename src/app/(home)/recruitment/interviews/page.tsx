import { Metadata } from "next";
import InterviewCalendarClient from "@/components/recruitment/interview-calendar-client";

export const metadata: Metadata = {
  title: "Interview Calendar",
};

export default function Page() {
  return <InterviewCalendarClient />;
}


