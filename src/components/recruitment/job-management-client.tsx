"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutGrid, Columns } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { JobsListClient } from "./jobs-list-client"
import { JobManagementUnified } from "./job-management-unified"
import { RecruitmentBreadcrumb } from "./recruitment-breadcrumb"

export function JobManagementClient() {
  const [viewMode, setViewMode] = useState<"unified" | "list">("unified")

  return (
    <div className="space-y-6">
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
            <Button
              variant={viewMode === "unified" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("unified")}
            >
              <Columns className="mr-2 h-4 w-4" />
              Unified View
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              List View
            </Button>
          </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {viewMode === "unified" ? (
          <JobManagementUnified />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách vị trí tuyển dụng</CardTitle>
              <CardDescription>
                Quản lý tất cả các vị trí đang tuyển dụng
              </CardDescription>
            </CardHeader>
            <CardContent>
               <JobsListClient/>
            </CardContent>
          </Card>
        )}
              </div>
    </div>
  )
}
