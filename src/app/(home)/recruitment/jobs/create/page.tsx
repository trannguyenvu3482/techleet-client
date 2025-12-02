"use client"

import { JobForm } from "@/components/recruitment/jobs/job-form"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function JobCreatePage() {
  return (
    <PageWrapper title="Tạo vị trí tuyển dụng">
      <JobForm mode="create" />
    </PageWrapper>
  )
}
