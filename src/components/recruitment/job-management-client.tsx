"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TestTube } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { JobsListClient } from "./jobs-list-client"

export function JobManagementClient() {
  const [activeTab, setActiveTab] = useState("jobs")

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý tuyển dụng</h1>
          <p className="text-muted-foreground">
            Quản lý các vị trí tuyển dụng và kiểm thử hệ thống CV screening
          </p>
        </div>
        
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Danh sách việc làm</TabsTrigger>
          <TabsTrigger value="testing">Kiểm thử CV</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kiểm thử hệ thống CV Screening</CardTitle>
              <CardDescription>
                Thử nghiệm và đánh giá hiệu quả của AI trong việc screening CV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TestTube className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Sử dụng công cụ kiểm thử chuyên biệt để đánh giá CV
                </p>
                <Link href="/recruitment/jobs/cv-testing">
                  <Button>
                    Mở công cụ kiểm thử CV
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
