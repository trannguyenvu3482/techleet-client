"use client"

import { JobEditClient } from "@/components/recruitment/job-edit-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function JobEditPage() {
  return (
    <PageWrapper title="Chỉnh sửa vị trí tuyển dụng">
      <JobEditClient />
    </PageWrapper>
  )
}
