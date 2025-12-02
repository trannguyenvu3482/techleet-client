"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./rich-text-editor";
import { CvPreview } from "./cv-preview";
import { ScreeningScores } from "./screening-scores";
import { CandidateInfo } from "./candidate-info";
import { ApproveOfferDialog } from "./approve-offer-dialog";
import { RejectApplicationDialog } from "./reject-application-dialog";
import { recruitmentAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";

interface InterviewNotesData {
  interview: {
    interview_id: number;
    scheduled_at: string;
    duration_minutes: number;
    meeting_link: string;
    location: string;
    status: string;
    notes: string | null;
  };
  application: {
    application_id: number;
    resume_url: string | null;
    screening_score: number | null;
    screening_status: string | null;
  };
  candidate: {
    candidate_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    years_of_experience: number | null;
    skills: string | null;
    summary: string | null;
  };
  job: {
    job_id: number;
    title: string;
  };
  interviewers: Array<{
    employeeId: number;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

interface InterviewNotesPageProps {
  interviewId: number;
}

export function InterviewNotesPage({ interviewId }: InterviewNotesPageProps) {
  const router = useRouter();
  const [data, setData] = useState<InterviewNotesData | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingLinkOpened, setMeetingLinkOpened] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const notesData = await recruitmentAPI.getInterviewNotesData(interviewId);
        setData(notesData);

        // Fetch application to get status
        try {
          const application = await recruitmentAPI.getApplicationById(notesData.application.application_id);
          setApplicationStatus(application.application.status || null);
        } catch (err) {
          console.error("Failed to fetch application status:", err);
        }

        // Auto-open meeting link for online interviews
        if (notesData.interview.meeting_link && !meetingLinkOpened) {
          window.open(notesData.interview.meeting_link, '_blank');
          setMeetingLinkOpened(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load interview data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [interviewId, meetingLinkOpened]);

  const handleNotesChange = async (notes: string) => {
    try {
      await recruitmentAPI.updateInterviewNotes(interviewId, notes);
    } catch (err) {
      console.error("Failed to save notes:", err);
      toast.error("Failed to save notes");
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!data) return;
    try {
      await recruitmentAPI.updateInterview(interviewId, { status: 'completed' });
      toast.success("Đã đánh dấu interview hoàn thành");
      const notesData = await recruitmentAPI.getInterviewNotesData(interviewId);
      setData(notesData);
      
      // Refresh application status
      try {
        const application = await recruitmentAPI.getApplicationById(data.application.application_id);
        setApplicationStatus(application.application.status || null);
      } catch (err) {
        console.error("Failed to refresh application status:", err);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(errorMessage);
    }
  };

  const handleSuccess = async () => {
    if (data) {
      try {
        const application = await recruitmentAPI.getApplicationById(data.application.application_id);
        setApplicationStatus(application.application.status || null);
      } catch (err) {
        console.error("Failed to refresh application status:", err);
      }
    }
  };

  const canApproveReject = 
    data && 
    data.interview.status === 'completed' && 
    applicationStatus === 'interviewing';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading interview data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg text-destructive">{error || "Failed to load interview data"}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const isOnline = !!data.interview.meeting_link;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.back()} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">
                  Interview Notes - {data.candidate.first_name} {data.candidate.last_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {data.job.title} • {dayjs(data.interview.scheduled_at).format("DD/MM/YYYY HH:mm")} • {data.interview.duration_minutes} minutes
                  {isOnline ? " • Online" : data.interview.location ? ` • ${data.interview.location}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data.interview.status !== 'completed' && (
                <Button
                  onClick={handleMarkAsCompleted}
                  variant="default"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Đánh dấu hoàn thành
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column: Rich Text Editor */}
          <div className="flex flex-col">
            <div className="bg-card border rounded-lg flex-1 flex flex-col">
              <div className="border-b px-4 py-3">
                <h2 className="font-semibold">Interview Notes</h2>
                <p className="text-sm text-muted-foreground">Take notes during the interview</p>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <RichTextEditor
                  initialContent={data.interview.notes || ""}
                  onSave={handleNotesChange}
                />
              </div>
            </div>
          </div>

          {/* Right Column: CV Preview, Scores, Candidate Info */}
          <div className="flex flex-col gap-6">
            {/* Candidate Info */}
            <CandidateInfo candidate={data.candidate} />

            {/* Approve/Reject Section */}
            {canApproveReject && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Quyết định sau phỏng vấn</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setApproveDialogOpen(true)}
                    className="flex-1"
                    variant="default"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Duyệt
                  </Button>
                  <Button
                    onClick={() => setRejectDialogOpen(true)}
                    className="flex-1"
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </Button>
                </div>
              </div>
            )}

            {/* Screening Scores */}
            {data.application.screening_score !== null && (
              <ScreeningScores
                overallScore={data.application.screening_score}
                status={data.application.screening_status}
              />
            )}

            {/* CV Preview */}
            {data.application.resume_url && (
              <CvPreview resumeUrl={data.application.resume_url} />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {data && (
        <>
          <ApproveOfferDialog
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            applicationId={data.application.application_id}
            onSuccess={handleSuccess}
          />
          <RejectApplicationDialog
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            applicationId={data.application.application_id}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  );
}

