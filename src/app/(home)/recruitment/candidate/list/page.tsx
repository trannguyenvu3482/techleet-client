"use client"

import { CandidateListClient } from "@/components/recruitment/candidate-list-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function CandidateListPage() {
  return (
    <PageWrapper title="Danh sách ứng viên">
      <CandidateListClient />
    </PageWrapper>
  )
}
