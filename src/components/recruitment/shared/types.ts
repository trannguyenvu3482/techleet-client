// Shared types for recruitment module

export interface CertificateFile {
  id: string
  name: string
  url: string
  type: 'image' | 'document' | 'excel' | 'pdf' | 'other'
  size: string
  uploadDate: string
}

export interface CandidateDetailData {
  candidateId: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth?: string
  address?: string
  city?: string
  postalCode?: string
  education?: string
  workExperience?: string
  skills?: string
  certifications?: string
  portfolioUrl?: string
  linkedinUrl?: string
  resumeUrl?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  // Extended fields
  birthDate?: string
  gender?: boolean
  githubUrl?: string
  status?: string
  appliedDate?: string
  summary?: string
  yearsOfExperience?: number
  currentJobTitle?: string
  currentCompany?: string
  educationLevel?: string
  fieldOfStudy?: string
  university?: string
  graduationYear?: number
  programmingLanguages?: string
  expectedSalary?: number
  preferredEmploymentType?: string
  availableForRemote?: boolean
  availableStartDate?: string
  source?: string
  certificates?: CertificateFile[]
  // Application related
  applications?: any[]
  currentApplication?: any
  jobTitle?: string
  overscore?: number | null
  candidateFiles?: any[]
}

// Utility functions
export const safeValue = (value: unknown, defaultValue: string = "-"): string => {
  if (value === null || value === undefined || value === "") {
    return defaultValue
  }
  return String(value)
}

export const formatDate = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleDateString("vi-VN")
}

export const formatSalary = (salary: number | undefined): string => {
  if (!salary) return "N/A"
  return new Intl.NumberFormat("vi-VN").format(salary) + " VND"
}

export const formatFileSize = (sizeInBytes: string): string => {
  const bytes = parseInt(sizeInBytes)
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

