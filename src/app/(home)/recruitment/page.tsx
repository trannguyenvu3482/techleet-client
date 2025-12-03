"use client"

import { RecruitmentDashboardClient } from "@/components/recruitment/dashboard/recruitment-dashboard-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function RecruitmentDashboardPage() {
  return (
    <PageWrapper title="Recruitment Dashboard">
      <RecruitmentDashboardClient />
    </PageWrapper>
  )
}

