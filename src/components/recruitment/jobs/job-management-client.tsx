"use client"

import { Button } from "@/components/ui/button"
import { TestTube, Plus } from "lucide-react"
import Link from "next/link"
import { JobManagementUnified } from "./job-management-unified"
import { RecruitmentBreadcrumb } from "../shared/recruitment-breadcrumb"

export function JobManagementClient() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <RecruitmentBreadcrumb items={[
        { label: "Danh sách việc làm" }
      ]} />

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý tuyển dụng</h1>
          <p className="text-muted-foreground">
            Quản lý các vị trí tuyển dụng và ứng viên
          </p>
        </div>
        <div className="flex items-center gap-2">

          <Link href="/recruitment/jobs/create">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Tạo vị trí mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Unified View - Main Content */}
      <JobManagementUnified />
    </div>
  )
}
