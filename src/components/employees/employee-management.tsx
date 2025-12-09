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
  return (
    <div className="flex-1 min-w-0">
       <EmployeeClient />
    </div>
  )
}

