"use client"

import { HeadquarterClient } from "@/components/company/headquarter-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function HeadquartersPage() {
  return (
    <PageWrapper title="Headquarters Management">
      <HeadquarterClient />
    </PageWrapper>
  )
}
