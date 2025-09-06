"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, TestTube, BarChart3, Settings, Plus } from "lucide-react"
import Link from "next/link"
import { JobsListClient } from "./jobs-list-client"

export function JobManagementClient() {
  const [activeTab, setActiveTab] = useState("overview")

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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vị trí đang tuyển</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 từ tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CV đã xử lý</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              +15% so với tuần trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm TB CV</CardTitle>
            <Badge variant="secondary" className="h-4 w-4 text-muted-foreground">AI</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73.2</div>
            <p className="text-xs text-muted-foreground">
              Điểm trung bình AI scoring
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hiệu năng hệ thống</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.2s</div>
            <p className="text-xs text-muted-foreground">
              Thời gian xử lý TB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="jobs">Danh sách việc làm</TabsTrigger>
          <TabsTrigger value="testing">Kiểm thử CV</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Truy cập nhanh</CardTitle>
                <CardDescription>
                  Các công cụ thường dùng trong quản lý tuyển dụng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/recruitment/jobs/cv-testing">
                  <Button variant="outline" className="w-full justify-start">
                    <TestTube className="mr-2 h-4 w-4" />
                    Kiểm thử CV Screening
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Báo cáo tuyển dụng
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Cấu hình AI Scoring
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê hôm nay</CardTitle>
                <CardDescription>
                  Hoạt động tuyển dụng trong 24h qua
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CV mới nhận</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CV đã xử lý</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ứng viên tiềm năng</span>
                  <Badge variant="default">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phỏng vấn được đặt</span>
                  <Badge variant="outline">2</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích và báo cáo</CardTitle>
              <CardDescription>
                Thống kê chi tiết về hiệu quả tuyển dụng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Biểu đồ và báo cáo phân tích sẽ được hiển thị ở đây
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
