"use client"

import { DepartmentClient } from "@/components/company/department-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function DepartmentsPage() {
  return (
    <PageWrapper title="Department Management">
      <DepartmentClient />
    </PageWrapper>
  )
}
