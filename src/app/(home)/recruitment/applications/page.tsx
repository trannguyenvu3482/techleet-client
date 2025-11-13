"use client"

import { ApplicationsClient } from "@/components/recruitment/applications-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function ApplicationsPage() {
  return (
    <PageWrapper title="Đơn ứng tuyển">
      <ApplicationsClient />
    </PageWrapper>
  )
}

