"use client"

import { DocumentCategoryClient } from "@/components/documents/document-category-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function OnboardingDocumentsPage() {
  return (
    <PageWrapper title="Tài liệu Onboarding">
      <DocumentCategoryClient 
        categoryType="onboarding"
        title="Tài liệu Quy trình Onboarding"
        description="Quản lý tài liệu hướng dẫn và quy trình đón nhận nhân viên mới"
      />
    </PageWrapper>
  )
}
