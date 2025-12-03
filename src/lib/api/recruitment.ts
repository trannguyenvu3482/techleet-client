import dayjs from "dayjs";
import { api } from "./client";
import { PaginatedResponse } from "@/types/api";

// Job Posting Types
export interface JobPosting {
  jobPostingId: number;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin: string;
  salaryMax: string;
  vacancies: number;
  applicationDeadline: string;
  status: "draft" | "published" | "closed";
  location: string;
  employmentType: string;
  experienceLevel: string;
  departmentId: number;
  positionId: number;
  hiringManagerId: number;
  salaryRange: string;
  isJobActive: boolean;
  daysUntilDeadline: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
  isTest?: boolean;
  questionSetId?: number;
  quantityQuestion?: number;
  minScore?: number;
}

export interface CreateJobPostingRequest {
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin: number;
  salaryMax: number;
  vacancies: number;
  applicationDeadline: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  departmentId: number;
  positionId: number;
  hiringManagerId: number;
  isTest?: boolean;
  questionSetId?: number;
  quantityQuestion?: number;
  minScore?: number;
  skills?: string;
  minExperience?: number;
  maxExperience?: number;
  educationLevel?: string;
}

export interface UpdateJobPostingRequest {
  title?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  vacancies?: number;
  applicationDeadline?: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  departmentId?: number;
  positionId?: number;
  hiringManagerId?: number;
  status?: string;
  isTest?: boolean;
  questionSetId?: number;
  quantityQuestion?: number;
  minScore?: number;
}

export interface GetJobPostingsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: "draft" | "published" | "closed";
  departmentId?: number;
  positionId?: number;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface GetJobPostingsResponse {
  data: JobPosting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Candidate Types
export interface Candidate {
  candidateId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  education?: string;
  workExperience?: string;
  skills?: string;
  certifications?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  education?: string;
  workExperience?: string;
  skills?: string;
  certifications?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
}

export interface UpdateCandidateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  education?: string;
  workExperience?: string;
  skills?: string;
  certifications?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
}

export interface GetCandidatesParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  keyword?: string;
  city?: string;
  skills?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface GetCandidatesResponse {
  data: Candidate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Application Types
export interface Application {
  applicationId: number;
  candidateId: number;
  jobPostingId: number;
  coverLetter?: string;
  applicationStatus:
    | "pending"
    | "reviewing"
    | "interview"
    | "rejected"
    | "accepted";
  status?:
    | "submitted"
    | "screening"
    | "screening_passed"
    | "screening_failed"
    | "interviewing"
    | "offer"
    | "hired"
    | "rejected"
    | "withdrawn";
  appliedAt: string;
  updatedAt: string;
  candidate?: Candidate;
  jobPosting?: JobPosting;
  score?: number;
  screeningScore?: number;
  screeningStatus?: string;
  screeningCompletedAt?: string;
  daysSinceApplied?: number;
}

export interface CreateApplicationRequest {
  candidateId: number;
  jobPostingId: number;
  coverLetter?: string;
}

export interface UpdateApplicationRequest {
  applicationStatus?:
    | "pending"
    | "reviewing"
    | "interview"
    | "rejected"
    | "accepted";
  coverLetter?: string;
}

export interface GetApplicationsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  jobPostingId?: number;
  candidateId?: number;
  applicationStatus?:
    | "pending"
    | "reviewing"
    | "interview"
    | "rejected"
    | "accepted";
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface GetApplicationsResponse {
  data: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Examination Types
export interface Examination {
  examinationId: number;
  applicationId: number;
  sourceSetId?: number;
  status?: string;
  submittedAt?: string | null;
  totalScore?: number | null;
  createdAt?: string;
  updatedAt?: string;
  examQuestions?: ExamQuestion[];
  [key: string]: unknown;
}

export interface ExamQuestion {
  examinationQuestionId: number;
  examinationId: number;
  questionId: number;
  answerText?: string | null;
  score?: number | null;
  reason?: string | null;
  question?: {
    questionId: number;
    content: string;
    sampleAnswer?: string;
    difficulty: string;
    createdAt?: string;
    updatedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ExaminationDetail extends Examination {
  questions?: unknown[];
}

export const examinationAPI = {
  async getExaminationsToDo(applicationId: number): Promise<Examination[]> {
    const res = await api.get(
      `api/v1/recruitment-service/question/examinations/todo/${applicationId}`
    );
    console.log("Raw API response:", res);
    // Response is already an array, return directly
    if (Array.isArray(res)) {
      return res;
    }
    // If wrapped in a data property
    const data = (res as any).data;
    return Array.isArray(data) ? data : [];
  },

  async getExaminationDetail(
    examinationId: number
  ): Promise<ExaminationDetail> {
    const res = await api.get(
      `api/v1/recruitment-service/question/examinations/${examinationId}`
    );
    console.log("Raw API response for examination:", res);
    // The response might already be the data object, or nested in a data property
    const data = (res as any).data || res;
    return data as ExaminationDetail;
  },

  async updateExamScore(
    examQuestionId: number,
    score: number,
    reason?: string
  ): Promise<void> {
    await api.put(
      `api/v1/recruitment-service/question/examinations/score/${examQuestionId}`,
      { score, reason }
    );
  },

  async submitExamination(
    examinationId: number,
    answers: Record<string, { answerText: string }>
  ): Promise<void> {
    await api.post(
      `api/v1/recruitment-service/question/examinations/${examinationId}/submit`,
      { answers }
    );
  },

  async revaluateExamination(
    examinationId: number
  ): Promise<ExaminationDetail> {
    return api.post(
      `api/v1/recruitment-service/question/examinations/${examinationId}/revaluate`
    );
  },
};

// Interview Types
export interface Interview {
  interviewId: number;
  applicationId: number;
  candidate_id: number;
  interviewerUserId: number;
  scheduledAt: string;
  duration: number;
  job_id: number;
  location?: string;
  scheduled_at?: string;
  meetingUrl?: string;
  notes?: string;
  feedback?: string;
  rating?: number;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  createdAt: string;
  updatedAt: string;
  application?: Application;
  interviewer?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateInterviewRequest {
  candidate_id: number;
  job_id: number;
  interviewer_ids: number[];
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  status?: string;
}

export interface UpdateInterviewRequest {
  candidate_id?: number;
  job_id?: number;
  interviewer_ids?: number[];
  scheduled_at?: string;
  duration_minutes?: number;
  meeting_link?: string;
  location?: string;
  status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
  scores?: number[];
  comments?: string[];
}

export interface GetInterviewsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  applicationId?: number;
  interviewerUserId?: number;
  status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface GetInterviewsResponse {
  data: Interview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// CV Screening Types
export interface CvTestRequest {
  filePath: string;
  jobPostingId: number;
  mockApplicationId?: number;
  applicationId?: number;
  modelConfig?: "gemini" | "chatgpt" | "deepseek";
}

export interface CvTestResult {
  success: boolean;
  processingTimeMs: number;
  extractedText: string;
  processedData: {
    skills: {
      technical: string[];
      soft: string[];
      languages: string[];
      frameworks: string[];
      tools: string[];
      certifications: string[];
    };
    experienceYears: number;
    education: Array<Record<string, unknown>>;
    workExperience: Array<Record<string, unknown>>;
  };
  scores: {
    overallScore: number;
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
  };
  summary: {
    summary: string;
    highlights: string[];
    concerns: string[];
    fitScore: number;
    recommendation: string;
    skillsAssessment: {
      technicalSkills: string[];
      experienceLevel: string;
      strengthAreas: string[];
      improvementAreas: string[];
    };
  };
  testInfo: {
    filePath: string;
    jobPostingId: string | number;
    mockApplicationId: number;
  };
}

// Candidate File Types
export interface CandidateFile {
  fileId: number;
  originalName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: string;
  fileType: string;
  referenceId: number;
  status: string;
  description: string | null;
  metadata: {
    source: string;
    messageId: string;
    senderEmail: string;
    subject: string;
    downloadToken: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Recruitment Management API
export const recruitmentAPI = {
  // Job Posting Management
  async getJobPostings(
    params: GetJobPostingsParams = {}
  ): Promise<GetJobPostingsResponse> {
    const response = await api.get<PaginatedResponse<JobPosting>>(
      "/api/v1/recruitment-service/job-postings",
      params
    );
    return {
      data: response.data,
      total: response.total,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: Math.ceil(response.total / (params.limit || 10)),
    };
  },

  async getJobPostingById(jobPostingId: number): Promise<JobPosting> {
    return api.get(`/api/v1/recruitment-service/job-postings/${jobPostingId}`);
  },

  async getJobPostingBySlug(slug: string): Promise<JobPosting> {
    return api.get(`/api/v1/recruitment-service/job-postings/slug/${slug}`);
  },

  async createJobPosting(data: CreateJobPostingRequest): Promise<JobPosting> {
    return api.post("/api/v1/recruitment-service/job-postings", data);
  },

  async updateJobPosting(
    jobPostingId: number,
    data: UpdateJobPostingRequest
  ): Promise<JobPosting> {
    return api.patch(
      `/api/v1/recruitment-service/job-postings/${jobPostingId}`,
      data
    );
  },

  async deleteJobPosting(jobPostingId: number): Promise<void> {
    return api.delete(
      `/api/v1/recruitment-service/job-postings/${jobPostingId}`
    );
  },

  async publishJobPosting(jobPostingId: number): Promise<JobPosting> {
    return api.patch(
      `/api/v1/recruitment-service/job-postings/${jobPostingId}/publish`
    );
  },

  async closeJobPosting(jobPostingId: number): Promise<JobPosting> {
    return api.patch(
      `/api/v1/recruitment-service/job-postings/${jobPostingId}/close`
    );
  },

  // Candidate Management
  async getCandidates(
    params: GetCandidatesParams = {}
  ): Promise<GetCandidatesResponse> {
    return api.get("/api/v1/recruitment-service/candidates", params);
  },

  async getCandidateById(candidateId: number): Promise<Candidate> {
    return api.get(`/api/v1/recruitment-service/candidates/${candidateId}`);
  },

  async createCandidate(data: CreateCandidateRequest): Promise<Candidate> {
    return api.post("/api/v1/recruitment-service/candidates", data);
  },

  async updateCandidate(
    candidateId: number,
    data: UpdateCandidateRequest
  ): Promise<Candidate> {
    return api.patch(
      `/api/v1/recruitment-service/candidates/${candidateId}`,
      data
    );
  },

  async deleteCandidate(candidateId: number): Promise<void> {
    return api.delete(`/api/v1/recruitment-service/candidates/${candidateId}`);
  },

  async uploadCandidateResume(
    candidateId: number,
    file: File
  ): Promise<{ resumeUrl: string }> {
    return api.upload(
      `/api/v1/recruitment-service/candidates/${candidateId}/resume`,
      file
    );
  },

  async getCandidateFiles(candidateId: number): Promise<CandidateFile[]> {
    return api.get(
      `/api/v1/recruitment-service/files/candidate/${candidateId}`
    );
  },

  // Application Management
  async getApplications(
    params: GetApplicationsParams = {}
  ): Promise<GetApplicationsResponse> {
    return api.get("/api/v1/recruitment-service/applications", params);
  },

  async getApplicationById(
    applicationId: number
  ): Promise<{ application: Application; candidate: Candidate }> {
    const response = await api.get(`/api/v1/recruitment-service/applications/${applicationId}`);
    // Map screeningScore to score for compatibility
    if (response && response.application) {
      response.application.score = response.application.screeningScore !== undefined 
        ? response.application.screeningScore 
        : response.application.score;
    }
    return response;
  },

  async getApplicationsByJobId(jobId: number): Promise<{
    data: Array<{
      applicationId: number;
      candidateId: number;
      firstName: string;
      lastName: string;
      email: string;
      status: string;
      createdAt: string;
      score: number | null;
    }>;
  }> {
    const response = await api.get(`/api/v1/recruitment-service/applications/job/${jobId}`);
    // Map screeningScore to score for compatibility
    // Backend returns raw data with possible field names: screeningScore, application_screeningScore, or score
    if (response && response.data && Array.isArray(response.data)) {
      response.data = response.data.map((app: any) => {
        // Try multiple possible field names for score
        const score = app.screeningScore !== undefined && app.screeningScore !== null 
          ? app.screeningScore 
          : app.application_screeningScore !== undefined && app.application_screeningScore !== null
          ? app.application_screeningScore
          : app.score !== undefined && app.score !== null
          ? app.score
          : null;
        
        // Try multiple possible field names for candidate info
        // Raw query returns: candidate_firstName, candidate_lastName, candidate_email
        // Or nested: candidate.firstName, candidate.lastName, candidate.email
        const firstName = app.candidate_firstName || app.candidate?.firstName || app.firstName || '';
        const lastName = app.candidate_lastName || app.candidate?.lastName || app.lastName || '';
        const email = app.candidate_email || app.candidate?.email || app.email || '';
        const createdAt = app.application_createdAt || app.application_created_at || app.createdAt || app.created_at || app.appliedDate || app.applied_date || '';
        const applicationId = app.application_applicationId || app.applicationId || app.application_id;
        const candidateId = app.application_candidateId || app.candidateId || app.candidate_id;
        const status = app.application_status || app.status;
        
        return {
          applicationId,
          candidateId,
          firstName,
          lastName,
          email,
          status,
          createdAt,
          score,
        };
      });
    }
    return response;
  },

  async createApplication(
    data: CreateApplicationRequest
  ): Promise<Application> {
    return api.post("/api/v1/recruitment-service/applications", data);
  },

  async updateApplication(
    applicationId: number,
    data: UpdateApplicationRequest
  ): Promise<Application> {
    return api.patch(
      `/api/v1/recruitment-service/applications/${applicationId}`,
      data
    );
  },

  async deleteApplication(applicationId: number): Promise<void> {
    return api.delete(
      `/api/v1/recruitment-service/applications/${applicationId}`
    );
  },

  async approveApplicationAfterInterview(
    applicationId: number,
    data: {
      offeredSalary: number;
      expectedStartDate: string;
      offerExpiryDate?: string;
    }
  ): Promise<Application> {
    return api.post(
      `/api/v1/recruitment-service/applications/${applicationId}/approve`,
      data
    );
  },

  async rejectApplicationAfterInterview(
    applicationId: number,
    data?: {
      rejectionReason?: string;
    }
  ): Promise<Application> {
    return api.post(
      `/api/v1/recruitment-service/applications/${applicationId}/reject`,
      data || {}
    );
  },

  async getInterviewRequests(params?: {
    page?: number;
    limit?: number;
    jobPostingId?: number;
    minScreeningScore?: number;
  }): Promise<GetApplicationsResponse> {
    return api.get("/api/v1/recruitment-service/applications/interview-requests", params);
  },

  // Interview Management
  async getInterviews(
    params: GetInterviewsParams = {}
  ): Promise<GetInterviewsResponse> {
    return api.get("/api/v1/recruitment-service/interview", params);
  },

  async getInterviewById(interviewId: number): Promise<Interview> {
    return api.get(`/api/v1/recruitment-service/interview/${interviewId}`);
  },

  async getInterviewByCandidateId(
    candidateId: number
  ): Promise<Interview | null | undefined> {
    try {
      const result = (await api.get(
        `/api/v1/recruitment-service/interview/candidate/${candidateId}`
      )) as Interview[];
      return result.find((item) => {
        return dayjs().isBefore(item.scheduled_at);
      });
    } catch (error) {
      return null;
    }
  },

  async createInterview(data: CreateInterviewRequest): Promise<Interview> {
    return api.post("/api/v1/recruitment-service/interview", data);
  },

  async updateInterview(
    interviewId: number,
    data: UpdateInterviewRequest
  ): Promise<Interview> {
    return api.put(
      `/api/v1/recruitment-service/interview/${interviewId}`,
      data
    );
  },

  async deleteInterview(interviewId: number): Promise<void> {
    return api.delete(`/api/v1/recruitment-service/interview/${interviewId}`);
  },

  async completeInterview(
    interviewId: number,
    feedback: string,
    rating: number
  ): Promise<Interview> {
    return api.patch(
      `/api/v1/recruitment-service/interviews/${interviewId}/complete`,
      {
        feedback,
        rating,
      }
    );
  },

  async cancelInterview(
    interviewId: number,
    reason?: string
  ): Promise<Interview> {
    return api.patch(
      `/api/v1/recruitment-service/interviews/${interviewId}/cancel`,
      {
        reason,
      }
    );
  },

  async updateInterviewNotes(
    interviewId: number,
    notes: string
  ): Promise<Interview> {
    return api.patch(
      `/api/v1/recruitment-service/interview/${interviewId}/notes`,
      { notes }
    );
  },

  async getInterviewNotesData(interviewId: number): Promise<{
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
  }> {
    return api.get(
      `/api/v1/recruitment-service/interview/${interviewId}/notes-data`
    );
  },

  // CV Screening Management
  async testCvScreening(data: CvTestRequest): Promise<CvTestResult> {
    return api.post(
      "/api/v1/recruitment-service/cv-screening/test-local-cv",
      data
    );
  },

  // Get applications for testing purposes
  async getApplicationsForTesting(): Promise<
    {
      applicationId: number;
      candidateName: string;
      jobTitle: string;
      appliedDate: string;
    }[]
  > {
    const applications = await api.get<GetApplicationsResponse>(
      "/api/v1/recruitment-service/applications",
      { limit: 50 }
    );
    return applications.data.map((app) => ({
      applicationId: app.applicationId,
      candidateName: app.candidate
        ? `${app.candidate.firstName} ${app.candidate.lastName}`
        : "Unknown",
      jobTitle: app.jobPosting?.title || "Unknown Position",
      appliedDate: app.appliedAt,
    }));
  },
};

// Question Types
export interface Question {
  questionId: number;
  content: string;
  sampleAnswer: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  content: string;
  sampleAnswer: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface UpdateQuestionRequest {
  content?: string;
  sampleAnswer?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface QuestionSetItem {
  setItemId: number;
  question: Question;
}

export interface QuestionSet {
  setId: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  questionSetItems?: QuestionSetItem[];
}

export interface CreateQuestionSetRequest {
  title: string;
  description?: string;
}

export interface UpdateQuestionSetRequest {
  title?: string;
  description?: string;
}

export interface GetQuestionsResponse {
  data: Question[];
  total: number;
}

export interface GetQuestionSetsResponse {
  data: QuestionSet[];
  total: number;
}

export const questionAPI = {
  async getQuestions(filter?: {
    page?: number;
    limit?: number;
    text?: string;
    difficulty?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<GetQuestionsResponse> {
    return api.get("/api/v1/recruitment-service/question/questions", filter);
  },

  async createQuestion(data: CreateQuestionRequest): Promise<Question> {
    return api.post("/api/v1/recruitment-service/question/questions", data);
  },

  async updateQuestion(
    questionId: number,
    data: UpdateQuestionRequest
  ): Promise<Question> {
    return api.put(
      `/api/v1/recruitment-service/question/questions/${questionId}`,
      data
    );
  },

  async deleteQuestion(questionId: number): Promise<void> {
    return api.delete(
      `/api/v1/recruitment-service/question/questions/${questionId}`
    );
  },

  async getQuestionSets(filter?: {
    page?: number;
    limit?: number;
    text?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<GetQuestionSetsResponse> {
    return api.get(
      "/api/v1/recruitment-service/question/question-sets",
      filter
    );
  },

  async createQuestionSet(
    data: CreateQuestionSetRequest
  ): Promise<QuestionSet> {
    return api.post("/api/v1/recruitment-service/question/question-sets", data);
  },

  async updateQuestionSet(
    setId: number,
    data: UpdateQuestionSetRequest
  ): Promise<QuestionSet> {
    return api.put(
      `/api/v1/recruitment-service/question/question-sets/${setId}`,
      data
    );
  },

  async deleteQuestionSet(setId: number): Promise<void> {
    return api.delete(
      `/api/v1/recruitment-service/question/question-sets/${setId}`
    );
  },

  async addQuestionToSet(
    setId: number,
    questionId: number
  ): Promise<QuestionSetItem> {
    return api.post(
      `/api/v1/recruitment-service/question/question-sets/${setId}/items/${questionId}`
    );
  },

  async removeQuestionFromSet(itemId: number): Promise<void> {
    return api.delete(
      `/api/v1/recruitment-service/question/question-sets/items/${itemId}`
    );
  },
};
