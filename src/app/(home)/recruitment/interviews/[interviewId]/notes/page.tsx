import { InterviewNotesPage } from "@/components/recruitment/interview-notes/interview-notes-page";

interface InterviewNotesPageProps {
  params: Promise<{
    interviewId: string;
  }>;
}

export default async function InterviewNotesRoute({
  params,
}: InterviewNotesPageProps) {
  const { interviewId } = await params;
  const interviewIdNum = parseInt(interviewId);
  
  if (isNaN(interviewIdNum)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Invalid interview ID</p>
      </div>
    );
  }

  return <InterviewNotesPage interviewId={interviewIdNum} />;
}

