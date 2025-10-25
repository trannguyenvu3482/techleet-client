"use client"

import { PositionClient } from "@/components/company/position-client"
import { PageWrapper } from "@/components/layout/page-wrapper"

export default function PositionsPage() {
  return (
    <PageWrapper title="Position Management">
      <PositionClient />
    </PageWrapper>
  )
}
