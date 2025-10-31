"use client";

import { InterviewNotesPage } from "@/components/recruitment/interview-notes/interview-notes-page";

export default function InterviewNotesRoute({
  params,
}: {
  params: { interviewId: string };
}) {
  const interviewId = parseInt(params.interviewId);
  
  if (isNaN(interviewId)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Invalid interview ID</p>
      </div>
    );
  }

  return <InterviewNotesPage interviewId={interviewId} />;
}

