"use client"

import { CandidateDetailClient } from "@/components/recruitment/candidates/detail/candidate-detail-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function CandidateDetailPage() {
  return (
    <PageWrapper title="Chi tiết ứng viên">
      <CandidateDetailClient />
    </PageWrapper>
  )
}
