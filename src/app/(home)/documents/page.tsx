"use client"

import { DocumentClient } from "@/components/documents/document-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function DocumentsPage() {
  return (
    <PageWrapper title="Quản lý tài liệu">
      <DocumentClient />
    </PageWrapper>
  )
}
