"use client"

import { PageWrapper } from "@/components/layout/page-wrapper"
import CandidateExamsClient from "@/components/recruitment/candidates/exams/candidate-exams-client"

export default function CandidateExamsPage() {
  return (
    <PageWrapper title="Bài thi ứng viên">
      <CandidateExamsClient />
    </PageWrapper>
  )
}


