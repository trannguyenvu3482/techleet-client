"use client"

import { EmployeeManagement } from "@/components/employees/employee-management"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function EmployeesPage() {
  return (
    <PageWrapper title="Quản lý nhân sự">
      <EmployeeManagement />
    </PageWrapper>
  )
}
