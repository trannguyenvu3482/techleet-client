"use client"

import { useParams } from "next/navigation"
import { JobForm } from "@/components/recruitment/jobs/job-form"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function JobEditPage() {
  const params = useParams()
  const jobId = Number(params.id)

  return (
    <PageWrapper title="Chỉnh sửa vị trí tuyển dụng">
      <JobForm mode="edit" jobId={jobId} />
    </PageWrapper>
  )
}
