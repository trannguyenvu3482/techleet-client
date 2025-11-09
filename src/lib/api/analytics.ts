import { api } from "./client";

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalCandidates: number;
  totalInterviews: number;
  interviewsThisWeek: number;
  recentApplications: number;
  recentCandidates: number;
  totalEmployees: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface JobStatusBreakdown extends StatusBreakdown {
  status: 'draft' | 'published' | 'closed';
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface DepartmentStats {
  departmentId: number;
  departmentName: string;
  jobCount: number;
  applicationCount: number;
  interviewCount: number;
}

export interface HiringFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  period: string;
  totalJobs: number;
  totalApplications: number;
  totalCandidates: number;
  totalInterviews: number;
  recentJobs: number;
  recentApplications: number;
  recentCandidates: number;
  jobStatusBreakdown: JobStatusBreakdown[];
  applicationStatusBreakdown: StatusBreakdown[];
  topDepartments: DepartmentStats[];
}

export interface ActivityItem {
  type: 'application' | 'interview' | 'job' | 'candidate';
  title: string;
  description: string;
  timestamp: string;
  entityId?: number;
}

export interface GetAnalyticsParams {
  period?: '7d' | '30d' | '90d' | '1y' | 'all';
  departmentId?: number;
  jobId?: number;
}

export const analyticsAPI = {
  async getDashboardStats(params?: GetAnalyticsParams): Promise<DashboardStats> {
    return api.get<DashboardStats>('/api/v1/recruitment-service/analytics/dashboard/stats', params);
  },

  async getSummary(params?: GetAnalyticsParams): Promise<AnalyticsSummary> {
    return api.get<AnalyticsSummary>('/api/v1/recruitment-service/analytics/dashboard/summary', params);
  },

  async getTrends(params?: GetAnalyticsParams & { type?: 'applications' | 'jobs' | 'candidates' | 'interviews' }): Promise<TrendData[]> {
    return api.get<TrendData[]>('/api/v1/recruitment-service/analytics/dashboard/trends', params);
  },

  async getDepartmentStats(params?: GetAnalyticsParams): Promise<DepartmentStats[]> {
    return api.get<DepartmentStats[]>('/api/v1/recruitment-service/analytics/dashboard/departments', params);
  },

  async getHiringFunnel(params?: GetAnalyticsParams): Promise<HiringFunnelData[]> {
    return api.get<HiringFunnelData[]>('/api/v1/recruitment-service/analytics/dashboard/funnel', params);
  },

  async getRecentActivity(limit?: number): Promise<ActivityItem[]> {
    return api.get<ActivityItem[]>('/api/v1/recruitment-service/analytics/dashboard/activity', { limit });
  },
};

