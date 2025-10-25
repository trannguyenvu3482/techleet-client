"use client"

import { JobCreateClient } from "@/components/recruitment/job-create-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function JobCreatePage() {
  return (
    <PageWrapper title="Tạo vị trí tuyển dụng">
      <JobCreateClient />
    </PageWrapper>
  )
}
