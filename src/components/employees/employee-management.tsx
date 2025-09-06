"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeClient } from "./employee-client"
import { OrganizationalChart } from "@/components/employees/organizational-chart"

export function EmployeeManagement() {
  const [activeMainTab, setActiveMainTab] = React.useState("employee-list")

  return (
    <div className="flex flex-1 flex-col gap-6 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý nhân sự</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin nhân viên và cơ cấu tổ chức công ty
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="flex-1 min-w-0">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="employee-list">Danh sách nhân sự</TabsTrigger>
          <TabsTrigger value="org-structure">Cơ cấu tổ chức</TabsTrigger>
        </TabsList>

        <TabsContent value="employee-list" className="mt-6 space-y-0">
          <EmployeeListTabs />
        </TabsContent>

        <TabsContent value="org-structure" className="mt-6">
          <OrganizationalChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmployeeListTabs() {
  const [activeSubTab, setActiveSubTab] = React.useState("overview")

  return (
    <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="flex-1 min-w-0">
      <div className="border-b">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-start bg-transparent p-0 gap-6">
            <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="salary" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
              Bảng lương và phúc lợi
            </TabsTrigger>
            <TabsTrigger value="tax-insurance" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
              Thuế, bảo hiểm và hạnh chính
            </TabsTrigger>
            <TabsTrigger value="schedule" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
              Lịch làm việc và nghỉ phép
            </TabsTrigger>
            <TabsTrigger value="teams" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
              Teams và quản lý
            </TabsTrigger>
            <TabsTrigger value="it-contact" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
              IT cá nhân và liên lạc
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <div className="mt-6">
        <TabsContent value="overview" className="mt-0">
          <EmployeeClient />
        </TabsContent>

        <TabsContent value="salary" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Bảng lương và phúc lợi sẽ được triển khai</p>
          </div>
        </TabsContent>

        <TabsContent value="tax-insurance" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Thuế, bảo hiểm và hạnh chính sẽ được triển khai</p>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Lịch làm việc và nghỉ phép sẽ được triển khai</p>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Teams và quản lý sẽ được triển khai</p>
          </div>
        </TabsContent>

        <TabsContent value="it-contact" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">IT cá nhân và liên lạc sẽ được triển khai</p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}
