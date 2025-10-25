"use client"

import { JobManagementClient } from "@/components/recruitment/job-management-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function JobsPage() {
  return (
    <PageWrapper title="Quản lý tuyển dụng">
      <JobManagementClient />
    </PageWrapper>
  )
}
