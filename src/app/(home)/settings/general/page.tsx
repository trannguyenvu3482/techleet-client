"use client"

import { PageWrapper } from "@/components/layout/page-wrapper"

export default function GeneralSettingsPage() {
  return (
    <PageWrapper title="Cấu hình chung">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cấu hình chung</h1>
          <p className="text-muted-foreground">
            Quản lý cấu hình chung của hệ thống
          </p>
        </div>
        <div className="bg-muted/50 min-h-[400px] rounded-xl p-6">
          <p className="text-center text-muted-foreground">
            Cấu hình chung sẽ được hiển thị ở đây
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
