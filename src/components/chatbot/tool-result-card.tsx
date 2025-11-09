"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  User, 
  FileText, 
  Calendar, 
  BarChart3, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ToolResultCardProps {
  toolName: string;
  result: any;
  className?: string;
}

export function ToolResultCard({ toolName, result, className }: ToolResultCardProps) {
  if (!result || !result.data) {
    return null;
  }

  const data = result.data;
  const success = result.success;

  if (!success) {
    return (
      <Card className={cn("mt-2 border-red-200 dark:border-red-800", className)}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{result.error || 'Error'}</span>
          </div>
          {result.message && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-1">{result.message}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  switch (toolName) {
    case 'job_posting_tool':
      return <JobPostingResultCard data={data} className={className} />;
    case 'application_tool':
      return <ApplicationResultCard data={data} className={className} />;
    case 'candidate_tool':
      return <CandidateResultCard data={data} className={className} />;
    case 'interview_tool':
      return <InterviewResultCard data={data} className={className} />;
    case 'analytics_tool':
      return <AnalyticsResultCard data={data} className={className} />;
    default:
      return <GenericResultCard data={data} result={result} className={className} />;
  }
}

function JobPostingResultCard({ data, className }: { data: any; className?: string }) {
  if (data.jobs && Array.isArray(data.jobs)) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Postings ({data.total || data.jobs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.jobs.slice(0, 5).map((job: any) => (
            <div key={job.jobPostingId} className="p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{job.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {job.description?.substring(0, 60)}...
                  </div>
                </div>
                <Badge variant={job.status === 'published' ? 'default' : 'secondary'} className="ml-2 shrink-0">
                  {job.status}
                </Badge>
              </div>
              {job.jobPostingId && (
                <Link href={`/recruitment/jobs/detail/${job.jobPostingId}`}>
                  <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs">
                    View Details
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
          {data.jobs.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{data.jobs.length - 5} more job postings
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (data.jobPostingId) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Posting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="font-medium text-sm">{data.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{data.description?.substring(0, 100)}...</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={data.status === 'published' ? 'default' : 'secondary'}>
                {data.status}
              </Badge>
              {data.location && (
                <span className="text-xs text-muted-foreground">{data.location}</span>
              )}
            </div>
            {data.jobPostingId && (
              <Link href={`/recruitment/jobs/detail/${data.jobPostingId}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  View Details
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function ApplicationResultCard({ data, className }: { data: any; className?: string }) {
  if (data.applications && Array.isArray(data.applications)) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Applications ({data.totalApplications || data.applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.applications.slice(0, 5).map((app: any) => (
            <div key={app.id || app.applicationId} className="p-2 border rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {app.candidate?.name || `${app.candidate?.firstName} ${app.candidate?.lastName}` || 'Unknown'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {app.jobTitle || app.jobPosting?.title || 'Unknown Job'}
                  </div>
                </div>
                <Badge variant={app.status === 'hired' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="ml-2 shrink-0">
                  {app.status}
                </Badge>
              </div>
            </div>
          ))}
          {data.applications.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{data.applications.length - 5} more applications
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (data.applicationId) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="font-medium text-sm">
                {data.candidate?.name || `${data.candidate?.firstName} ${data.candidate?.lastName}` || 'Unknown'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {data.jobPosting?.title || 'Unknown Job'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={data.status === 'hired' ? 'default' : data.status === 'rejected' ? 'destructive' : 'secondary'}>
                {data.status}
              </Badge>
              {data.score !== null && data.score !== undefined && (
                <span className="text-xs text-muted-foreground">Score: {data.score}%</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function CandidateResultCard({ data, className }: { data: any; className?: string }) {
  if (data.candidates && Array.isArray(data.candidates)) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Candidates ({data.total || data.candidates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.candidates.slice(0, 5).map((candidate: any) => (
            <div key={candidate.candidateId} className="p-2 border rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {candidate.firstName} {candidate.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{candidate.email}</div>
                </div>
                {candidate.candidateId && (
                  <Link href={`/recruitment/candidate/detail/${candidate.candidateId}`}>
                    <Button variant="ghost" size="sm" className="ml-2 h-6 text-xs">
                      View
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
          {data.candidates.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{data.candidates.length - 5} more candidates
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (data.candidateId) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Candidate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="font-medium text-sm">
                {data.firstName} {data.lastName}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{data.email}</div>
            </div>
            {data.candidateId && (
              <Link href={`/recruitment/candidate/detail/${data.candidateId}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  View Details
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function InterviewResultCard({ data, className }: { data: any; className?: string }) {
  if (data.interviews && Array.isArray(data.interviews)) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Interviews ({data.total || data.interviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.interviews.slice(0, 5).map((interview: any) => (
            <div key={interview.interviewId} className="p-2 border rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {interview.candidate?.name || 'Unknown'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(interview.scheduledAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <Badge variant={interview.status === 'completed' ? 'default' : 'secondary'} className="ml-2 shrink-0">
                  {interview.status}
                </Badge>
              </div>
            </div>
          ))}
          {data.interviews.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{data.interviews.length - 5} more interviews
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (data.interviewId) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="font-medium text-sm">
                {data.candidate?.name || 'Unknown'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(data.scheduledAt).toLocaleString('vi-VN')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={data.status === 'completed' ? 'default' : 'secondary'}>
                {data.status}
              </Badge>
              {data.location && (
                <span className="text-xs text-muted-foreground">{data.location}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function AnalyticsResultCard({ data, className }: { data: any; className?: string }) {
  if (data.overview) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 border rounded-md">
              <div className="text-xs text-muted-foreground">Total Jobs</div>
              <div className="text-lg font-semibold">{data.overview.totalJobs || 0}</div>
            </div>
            <div className="p-2 border rounded-md">
              <div className="text-xs text-muted-foreground">Applications</div>
              <div className="text-lg font-semibold">{data.overview.totalApplications || 0}</div>
            </div>
            <div className="p-2 border rounded-md">
              <div className="text-xs text-muted-foreground">Candidates</div>
              <div className="text-lg font-semibold">{data.overview.totalCandidates || 0}</div>
            </div>
            <div className="p-2 border rounded-md">
              <div className="text-xs text-muted-foreground">Interviews</div>
              <div className="text-lg font-semibold">{data.overview.totalInterviews || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.funnel) {
    return (
      <Card className={cn("mt-2", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Hiring Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Applications</span>
              <span className="text-sm font-semibold">{data.funnel.applications || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Screening</span>
              <span className="text-sm font-semibold">{data.funnel.screening || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Interviewing</span>
              <span className="text-sm font-semibold">{data.funnel.interviewing || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Offer</span>
              <span className="text-sm font-semibold">{data.funnel.offer || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Hired</span>
              <span className="text-sm font-semibold text-green-600">{data.funnel.hired || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function GenericResultCard({ data, result, className }: { data: any; result: any; className?: string }) {
  return (
    <Card className={cn("mt-2", className)}>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {result.message && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">{result.message}</span>
            </div>
          )}
          {data && typeof data === 'object' && (
            <div className="text-xs text-muted-foreground">
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

