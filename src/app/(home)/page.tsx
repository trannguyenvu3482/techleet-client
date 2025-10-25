"use client"

import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function DashboardPage() {
  return (
    <PageWrapper title="Dashboard" requireAuth={false}>
      <DashboardContent />
    </PageWrapper>
  )
}
